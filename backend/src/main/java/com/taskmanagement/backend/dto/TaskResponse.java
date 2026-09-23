package com.taskmanagement.backend.dto;

import java.time.LocalDate;

import com.taskmanagement.backend.entity.Priority;
import com.taskmanagement.backend.entity.Task;

/**
 * タスク読み取りAPIのレスポンス形式。
 * フロントエンドの現行モデル（{@code docs/requirements/data-model.md}）に合わせたフィールド構成。
 */
public record TaskResponse(
		Long id,
		Long listId,
		String listTitle,
		String title,
		Priority priority,
		LocalDate dueDate,
		int position
) {

	public static TaskResponse from(Task task) {
		return new TaskResponse(
				task.getId(),
				task.getList().getId(),
				task.getList().getTitle(),
				task.getTitle(),
				task.getPriority(),
				task.getDueDate(),
				task.getPosition()
		);
	}
}
