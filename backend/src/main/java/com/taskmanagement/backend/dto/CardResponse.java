package com.taskmanagement.backend.dto;

import java.time.LocalDate;

import com.taskmanagement.backend.entity.Card;
import com.taskmanagement.backend.entity.Priority;

/**
 * カード読み取りAPIのレスポンス形式。
 * フロントエンドの現行モデル（{@code docs/requirements/data-model.md}）に合わせたフィールド構成。
 */
public record CardResponse(
		Long id,
		Long listId,
		String listTitle,
		String title,
		Priority priority,
		LocalDate dueDate,
		int position
) {

	public static CardResponse from(Card card) {
		return new CardResponse(
				card.getId(),
				card.getList().getId(),
				card.getList().getTitle(),
				card.getTitle(),
				card.getPriority(),
				card.getDueDate(),
				card.getPosition()
		);
	}
}
