package com.taskmanagement.backend.dto;

import java.time.LocalDate;

import com.taskmanagement.backend.entity.Priority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * カード登録API（POST /api/cards）のリクエスト形式。
 * dueDate は任意項目のため未指定を許容する。
 */
public record CardCreateRequest(
		@NotNull Long listId,
		@NotBlank String title,
		@NotNull Priority priority,
		LocalDate dueDate
) {
}
