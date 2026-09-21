package com.taskmanagement.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * リスト名更新API（PUT /api/lists/{id}）のリクエスト形式。
 */
public record ListUpdateRequest(
		@NotBlank @Size(max = 255) String title
) {
}
