package com.taskmanagement.backend.dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

/**
 * カード並び替えAPI（PUT /api/cards/reorder）のリクエスト形式。
 * cardIds は listId 内の全カードIDを、新しい並び順どおりに列挙したもの。
 */
public record CardReorderRequest(
		@NotNull Long listId,
		@NotEmpty List<Long> cardIds
) {
}
