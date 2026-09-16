package com.taskmanagement.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * カード移動API（PATCH /api/cards/{id}/position）のリクエスト形式。
 * ドラッグ&ドロップによる、リスト間移動・同一リスト内の並び替えの両方に使う。
 */
public record CardMoveRequest(
		@NotNull Long listId,
		@NotNull @Min(0) Integer position
) {
}
