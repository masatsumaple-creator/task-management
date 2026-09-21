package com.taskmanagement.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanagement.backend.dto.ListCreateRequest;
import com.taskmanagement.backend.dto.ListResponse;
import com.taskmanagement.backend.dto.ListUpdateRequest;
import com.taskmanagement.backend.entity.Board;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.repository.BoardRepository;
import com.taskmanagement.backend.repository.CardRepository;
import com.taskmanagement.backend.repository.TaskListRepository;

import jakarta.validation.Valid;

/**
 * リストのAPI。
 * 一覧取得・登録・名称更新・削除（物理削除）を提供する。
 */
@RestController
public class TaskListController {

	private final TaskListRepository taskListRepository;
	private final BoardRepository boardRepository;
	private final CardRepository cardRepository;

	public TaskListController(
			TaskListRepository taskListRepository,
			BoardRepository boardRepository,
			CardRepository cardRepository
	) {
		this.taskListRepository = taskListRepository;
		this.boardRepository = boardRepository;
		this.cardRepository = cardRepository;
	}

	/** リスト一覧を position 順に取得する。 */
	@GetMapping("/api/lists")
	public List<ListResponse> findAll() {
		return taskListRepository.findAllByOrderByPositionAsc().stream()
				.map(ListResponse::from)
				.toList();
	}

	/**
	 * リストを新規登録する。所属ボードは現行スコープの1ボード
	 * （存在しない場合は作成する）とし、position は末尾（現在の件数）に自動採番する。
	 */
	@PostMapping("/api/lists")
	@Transactional
	public ResponseEntity<ListResponse> create(@RequestBody @Valid ListCreateRequest request) {
		Board board = boardRepository.findFirstByOrderByIdAsc()
				.orElseGet(() -> boardRepository.save(new Board("マイボード")));

		int position = (int) taskListRepository.countByBoard(board);
		TaskList saved = taskListRepository.save(new TaskList(board, request.title().trim(), position));

		return ResponseEntity.status(HttpStatus.CREATED).body(ListResponse.from(saved));
	}

	/** リスト名を更新する。対象リストが存在しない場合は404を返す。 */
	@PutMapping("/api/lists/{id}")
	public ResponseEntity<ListResponse> update(@PathVariable Long id, @RequestBody @Valid ListUpdateRequest request) {
		TaskList list = taskListRepository.findById(id).orElse(null);
		if (list == null) {
			return ResponseEntity.notFound().build();
		}

		list.setTitle(request.title().trim());
		TaskList saved = taskListRepository.save(list);

		return ResponseEntity.ok(ListResponse.from(saved));
	}

	/**
	 * リストを物理削除する。リスト内のカードもすべて削除し、残りのリストの position を詰め直す。
	 * 対象リストが存在しない場合は404を返す。
	 */
	@DeleteMapping("/api/lists/{id}")
	@Transactional
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		TaskList list = taskListRepository.findById(id).orElse(null);
		if (list == null) {
			return ResponseEntity.notFound().build();
		}

		cardRepository.deleteByList(list);
		taskListRepository.delete(list);

		List<TaskList> remaining = taskListRepository.findAllByOrderByPositionAsc();
		for (int i = 0; i < remaining.size(); i++) {
			remaining.get(i).setPosition(i);
		}

		return ResponseEntity.noContent().build();
	}
}
