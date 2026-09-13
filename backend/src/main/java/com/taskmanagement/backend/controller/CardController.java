package com.taskmanagement.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanagement.backend.dto.CardResponse;
import com.taskmanagement.backend.entity.Priority;
import com.taskmanagement.backend.repository.CardRepository;
import com.taskmanagement.backend.repository.CardSpecifications;

/**
 * カード（タスク）の読み取り専用API。
 * 作成・更新・削除は未実装で、一覧取得・検索・単体取得のみを提供する。
 */
@RestController
public class CardController {

	private final CardRepository cardRepository;

	public CardController(CardRepository cardRepository) {
		this.cardRepository = cardRepository;
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
}
