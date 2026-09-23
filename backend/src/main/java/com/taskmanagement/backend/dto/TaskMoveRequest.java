package com.taskmanagement.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * タスク移動API（PATCH /api/tasks/{id}/position）のリクエスト形式。
 * ドラッグ&ドロップによる、リスト間移動・同一リスト内の並び替えの両方に使う。
 */
public record TaskMoveRequest(
		@NotNull Long listId,
		@NotNull @Min(0) Integer position
) {
}
