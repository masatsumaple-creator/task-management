package com.taskmanagement.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.taskmanagement.backend.dto.CardCreateRequest;
import com.taskmanagement.backend.dto.CardResponse;
import com.taskmanagement.backend.entity.Card;
import com.taskmanagement.backend.entity.Priority;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.repository.CardRepository;
import com.taskmanagement.backend.repository.CardSpecifications;
import com.taskmanagement.backend.repository.TaskListRepository;

import jakarta.validation.Valid;

/**
 * カード（タスク）のAPI。
 * 一覧取得・検索・単体取得・登録を提供する。更新・削除は未実装。
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
}
