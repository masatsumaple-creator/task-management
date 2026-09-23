package com.taskmanagement.backend.dto;

import java.time.LocalDate;

import com.taskmanagement.backend.entity.Priority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * タスク更新API（PUT /api/tasks/{id}）のリクエスト形式。
 * 所属リスト・position の変更はこのAPIでは扱わない（{@link TaskMoveRequest} 参照）。
 */
public record TaskUpdateRequest(
		@NotBlank String title,
		@NotNull Priority priority,
		LocalDate dueDate
) {
}
