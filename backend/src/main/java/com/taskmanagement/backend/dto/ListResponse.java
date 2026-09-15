package com.taskmanagement.backend.dto;

import com.taskmanagement.backend.entity.TaskList;

/**
 * リスト一覧取得API（GET /api/lists）のレスポンス形式。
 */
public record ListResponse(
		Long id,
		Long boardId,
		String title,
		int position
) {

	public static ListResponse from(TaskList list) {
		return new ListResponse(
				list.getId(),
				list.getBoard().getId(),
				list.getTitle(),
				list.getPosition()
		);
	}
}
