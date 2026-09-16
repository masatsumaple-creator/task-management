package com.taskmanagement.backend.controller;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.taskmanagement.backend.dto.CardCreateRequest;
import com.taskmanagement.backend.dto.CardMoveRequest;
import com.taskmanagement.backend.dto.CardReorderRequest;
import com.taskmanagement.backend.dto.CardResponse;
import com.taskmanagement.backend.dto.CardUpdateRequest;
import com.taskmanagement.backend.entity.Card;
import com.taskmanagement.backend.entity.Priority;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.repository.CardRepository;
import com.taskmanagement.backend.repository.CardSpecifications;
import com.taskmanagement.backend.repository.TaskListRepository;

import jakarta.validation.Valid;

/**
 * カード（タスク）のAPI。
 * 一覧取得・検索・単体取得・登録・更新・移動を提供する。削除は未実装。
 */
@RestController
public class CardController {

	private final CardRepository cardRepository;
	private final TaskListRepository taskListRepository;

	public CardController(CardRepository cardRepository, TaskListRepository taskListRepository) {
		this.cardRepository = cardRepository;
		this.taskListRepository = taskListRepository;
	}

	/**
	 * カード一覧を取得する。
	 * クエリパラメータで、タイトルの部分一致（keyword）・優先度（priority）・所属リストID（listId）による絞り込みができる。
	 *
	 * 例:
	 *   GET /api/cards
	 *   GET /api/cards?keyword=設計
	 *   GET /api/cards?priority=high
	 *   GET /api/cards?listId=2&priority=medium
	 */
	@GetMapping("/api/cards")
	public List<CardResponse> search(
			@RequestParam(required = false) String keyword,
			@RequestParam(required = false) Priority priority,
			@RequestParam(required = false) Long listId
	) {
		var spec = CardSpecifications.and(
				CardSpecifications.titleContains(keyword),
				CardSpecifications.hasPriority(priority),
				CardSpecifications.inList(listId)
		);
		return cardRepository.findAll(spec).stream()
				.map(CardResponse::from)
				.toList();
	}

	/** カードをIDで1件取得する。存在しない場合は404を返す。 */
	@GetMapping("/api/cards/{id}")
	public ResponseEntity<CardResponse> findById(@PathVariable Long id) {
		return cardRepository.findById(id)
				.map(CardResponse::from)
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}

	/**
	 * カードを新規登録する。position は指定されたリストの末尾（現在の件数）に自動採番する。
	 * listId が存在しない場合は400を返す。
	 */
	@PostMapping("/api/cards")
	public ResponseEntity<CardResponse> create(@RequestBody @Valid CardCreateRequest request) {
		TaskList list = taskListRepository.findById(request.listId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "指定されたリストが存在しません"));

		int position = (int) cardRepository.countByList(list);
		Card card = new Card(list, request.title(), request.priority(), request.dueDate(), position);
		Card saved = cardRepository.save(card);

		return ResponseEntity.status(HttpStatus.CREATED).body(CardResponse.from(saved));
	}

	/**
	 * カードの詳細（タイトル・優先度・期日）を更新する。所属リスト・position の変更は扱わない。
	 * 対象カードが存在しない場合は404を返す。
	 */
	@PutMapping("/api/cards/{id}")
	public ResponseEntity<CardResponse> update(@PathVariable Long id, @RequestBody @Valid CardUpdateRequest request) {
		Card card = cardRepository.findById(id).orElse(null);
		if (card == null) {
			return ResponseEntity.notFound().build();
		}

		card.setTitle(request.title());
		card.setPriority(request.priority());
		card.setDueDate(request.dueDate());
		Card saved = cardRepository.save(card);

		return ResponseEntity.ok(CardResponse.from(saved));
	}

	/**
	 * カードをドラッグ&ドロップで移動する。listId が現在と同じ場合は同一リスト内の並び替え、
	 * 異なる場合はリスト間の移動として扱い、移動元・移動先それぞれの position を詰め直す。
	 * 対象カード・移動先リストが存在しない場合はそれぞれ404・400を返す。
	 */
	@PatchMapping("/api/cards/{id}/position")
	@Transactional
	public ResponseEntity<CardResponse> move(@PathVariable Long id, @RequestBody @Valid CardMoveRequest request) {
		Card card = cardRepository.findById(id).orElse(null);
		if (card == null) {
			return ResponseEntity.notFound().build();
		}

		TaskList targetList = taskListRepository.findById(request.listId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "指定されたリストが存在しません"));

		TaskList sourceList = card.getList();
		boolean sameList = sourceList.getId().equals(targetList.getId());

		if (sameList) {
			List<Card> siblings = cardRepository.findByListOrderByPositionAsc(sourceList);
			siblings.remove(card);
			int insertAt = clamp(request.position(), siblings.size());
			siblings.add(insertAt, card);
			reindex(siblings);
		} else {
			List<Card> sourceSiblings = cardRepository.findByListOrderByPositionAsc(sourceList);
			sourceSiblings.remove(card);
			reindex(sourceSiblings);

			List<Card> targetSiblings = cardRepository.findByListOrderByPositionAsc(targetList);
			int insertAt = clamp(request.position(), targetSiblings.size());
			targetSiblings.add(insertAt, card);
			card.setList(targetList);
			reindex(targetSiblings);
		}

		return ResponseEntity.ok(CardResponse.from(card));
	}

	/**
	 * リスト内のカードを、指定された順序（先頭から新しいposition）に一括で並び替える。
	 * cardIds は listId に属する全カードのIDを過不足なく含んでいる必要があり、
	 * 一致しない場合・listId が存在しない場合は400を返す。
	 */
	@PutMapping("/api/cards/reorder")
	@Transactional
	public ResponseEntity<Void> reorder(@RequestBody @Valid CardReorderRequest request) {
		TaskList list = taskListRepository.findById(request.listId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "指定されたリストが存在しません"));

		List<Card> cards = cardRepository.findByListOrderByPositionAsc(list);
		Map<Long, Card> cardsById = cards.stream().collect(Collectors.toMap(Card::getId, Function.identity()));

		Set<Long> requestedIds = new HashSet<>(request.cardIds());
		if (requestedIds.size() != request.cardIds().size()
				|| !requestedIds.equals(cardsById.keySet())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "指定されたカードIDがリストの内容と一致しません");
		}

		List<Long> cardIds = request.cardIds();
		for (int i = 0; i < cardIds.size(); i++) {
			cardsById.get(cardIds.get(i)).setPosition(i);
		}

		return ResponseEntity.noContent().build();
	}

	private static int clamp(int position, int size) {
		return Math.max(0, Math.min(position, size));
	}

	private static void reindex(List<Card> cards) {
		for (int i = 0; i < cards.size(); i++) {
			cards.get(i).setPosition(i);
		}
	}
}
