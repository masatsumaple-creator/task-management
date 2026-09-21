package com.taskmanagement.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * リスト登録API（POST /api/lists）のリクエスト形式。
 * position は末尾に自動採番するため受け取らない。
 */
public record ListCreateRequest(
		@NotBlank @Size(max = 255) String title
) {
}
