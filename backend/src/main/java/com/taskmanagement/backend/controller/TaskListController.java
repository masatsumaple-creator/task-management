package com.taskmanagement.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanagement.backend.dto.ListResponse;
import com.taskmanagement.backend.repository.TaskListRepository;

/**
 * リストの読み取り専用API。
 * カード登録フォームのリスト選択肢などで使用する。
 */
@RestController
public class TaskListController {

	private final TaskListRepository taskListRepository;

	public TaskListController(TaskListRepository taskListRepository) {
		this.taskListRepository = taskListRepository;
	}

	/** リスト一覧を position 順に取得する。 */
	@GetMapping("/api/lists")
	public List<ListResponse> findAll() {
		return taskListRepository.findAllByOrderByPositionAsc().stream()
				.map(ListResponse::from)
				.toList();
	}
}
