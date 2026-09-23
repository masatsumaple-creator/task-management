package com.taskmanagement.backend.dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

/**
 * タスク並び替えAPI（PUT /api/tasks/reorder）のリクエスト形式。
 * taskIds は listId 内の全タスクIDを、新しい並び順どおりに列挙したもの。
 */
public record TaskReorderRequest(
		@NotNull Long listId,
		@NotEmpty List<Long> taskIds
) {
}
