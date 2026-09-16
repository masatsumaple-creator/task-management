package com.taskmanagement.backend.dto;

import java.time.LocalDate;

import com.taskmanagement.backend.entity.Priority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * カード更新API（PUT /api/cards/{id}）のリクエスト形式。
 * 所属リスト・position の変更はこのAPIでは扱わない（{@link CardMoveRequest} 参照）。
 */
public record CardUpdateRequest(
		@NotBlank String title,
		@NotNull Priority priority,
		LocalDate dueDate
) {
}
