package com.taskmanagement.backend.controller;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.taskmanagement.backend.dto.TaskCreateRequest;
import com.taskmanagement.backend.dto.TaskMoveRequest;
import com.taskmanagement.backend.dto.TaskReorderRequest;
import com.taskmanagement.backend.dto.TaskResponse;
import com.taskmanagement.backend.dto.TaskUpdateRequest;
import com.taskmanagement.backend.entity.Priority;
import com.taskmanagement.backend.entity.Task;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.repository.TaskListRepository;
import com.taskmanagement.backend.repository.TaskRepository;
import com.taskmanagement.backend.repository.TaskSpecifications;

import jakarta.validation.Valid;

/**
 * タスクのAPI。
 * 一覧取得・検索・単体取得・登録・更新・移動・削除（物理削除）を提供する。
 */
@RestController
public class TaskController {

	private final TaskRepository taskRepository;
	private final TaskListRepository taskListRepository;

	public TaskController(TaskRepository taskRepository, TaskListRepository taskListRepository) {
		this.taskRepository = taskRepository;
		this.taskListRepository = taskListRepository;
	}

	/**
	 * タスク一覧を取得する。
	 * クエリパラメータで、タイトルの部分一致（keyword）・優先度（priority）・所属リストID（listId）による絞り込みができる。
	 *
	 * 例:
	 *   GET /api/tasks
	 *   GET /api/tasks?keyword=設計
	 *   GET /api/tasks?priority=high
	 *   GET /api/tasks?listId=2&priority=medium
	 */
	@GetMapping("/api/tasks")
	public List<TaskResponse> search(
			@RequestParam(required = false) String keyword,
			@RequestParam(required = false) Priority priority,
			@RequestParam(required = false) Long listId
	) {
		var spec = TaskSpecifications.and(
				TaskSpecifications.titleContains(keyword),
				TaskSpecifications.hasPriority(priority),
				TaskSpecifications.inList(listId)
		);
		return taskRepository.findAll(spec).stream()
				.map(TaskResponse::from)
				.toList();
	}

	/** タスクをIDで1件取得する。存在しない場合は404を返す。 */
	@GetMapping("/api/tasks/{id}")
	public ResponseEntity<TaskResponse> findById(@PathVariable Long id) {
		return taskRepository.findById(id)
				.map(TaskResponse::from)
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}

	/**
	 * タスクを新規登録する。position は指定されたリストの末尾（現在の件数）に自動採番する。
	 * listId が存在しない場合は400を返す。
	 */
	@PostMapping("/api/tasks")
	public ResponseEntity<TaskResponse> create(@RequestBody @Valid TaskCreateRequest request) {
		TaskList list = taskListRepository.findById(request.listId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "指定されたリストが存在しません"));

		int position = (int) taskRepository.countByList(list);
		Task task = new Task(list, request.title(), request.priority(), request.dueDate(), position);
		Task saved = taskRepository.save(task);

		return ResponseEntity.status(HttpStatus.CREATED).body(TaskResponse.from(saved));
	}

	/**
	 * タスクの詳細（タイトル・優先度・期日）を更新する。所属リスト・position の変更は扱わない。
	 * 対象タスクが存在しない場合は404を返す。
	 */
	@PutMapping("/api/tasks/{id}")
	public ResponseEntity<TaskResponse> update(@PathVariable Long id, @RequestBody @Valid TaskUpdateRequest request) {
		Task task = taskRepository.findById(id).orElse(null);
		if (task == null) {
			return ResponseEntity.notFound().build();
		}

		task.setTitle(request.title());
		task.setPriority(request.priority());
		task.setDueDate(request.dueDate());
		Task saved = taskRepository.save(task);

		return ResponseEntity.ok(TaskResponse.from(saved));
	}

	/**
	 * タスクを物理削除する。削除後、同一リスト内の残りのタスクの position を詰め直す。
	 * 対象タスクが存在しない場合は404を返す。
	 */
	@DeleteMapping("/api/tasks/{id}")
	@Transactional
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		Task task = taskRepository.findById(id).orElse(null);
		if (task == null) {
			return ResponseEntity.notFound().build();
		}

		TaskList list = task.getList();
		taskRepository.delete(task);

		List<Task> siblings = taskRepository.findByListOrderByPositionAsc(list);
		reindex(siblings);

		return ResponseEntity.noContent().build();
	}

	/**
	 * タスクをドラッグ&ドロップで移動する。listId が現在と同じ場合は同一リスト内の並び替え、
	 * 異なる場合はリスト間の移動として扱い、移動元・移動先それぞれの position を詰め直す。
	 * 対象タスク・移動先リストが存在しない場合はそれぞれ404・400を返す。
	 */
	@PatchMapping("/api/tasks/{id}/position")
	@Transactional
	public ResponseEntity<TaskResponse> move(@PathVariable Long id, @RequestBody @Valid TaskMoveRequest request) {
		Task task = taskRepository.findById(id).orElse(null);
		if (task == null) {
			return ResponseEntity.notFound().build();
		}

		TaskList targetList = taskListRepository.findById(request.listId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "指定されたリストが存在しません"));

		TaskList sourceList = task.getList();
		boolean sameList = sourceList.getId().equals(targetList.getId());

		if (sameList) {
			List<Task> siblings = taskRepository.findByListOrderByPositionAsc(sourceList);
			siblings.remove(task);
			int insertAt = clamp(request.position(), siblings.size());
			siblings.add(insertAt, task);
			reindex(siblings);
		} else {
			List<Task> sourceSiblings = taskRepository.findByListOrderByPositionAsc(sourceList);
			sourceSiblings.remove(task);
			reindex(sourceSiblings);

			List<Task> targetSiblings = taskRepository.findByListOrderByPositionAsc(targetList);
			int insertAt = clamp(request.position(), targetSiblings.size());
			targetSiblings.add(insertAt, task);
			task.setList(targetList);
			reindex(targetSiblings);
		}

		return ResponseEntity.ok(TaskResponse.from(task));
	}

	/**
	 * リスト内のタスクを、指定された順序（先頭から新しいposition）に一括で並び替える。
	 * taskIds は listId に属する全タスクのIDを過不足なく含んでいる必要があり、
	 * 一致しない場合・listId が存在しない場合は400を返す。
	 */
	@PutMapping("/api/tasks/reorder")
	@Transactional
	public ResponseEntity<Void> reorder(@RequestBody @Valid TaskReorderRequest request) {
		TaskList list = taskListRepository.findById(request.listId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "指定されたリストが存在しません"));

		List<Task> tasks = taskRepository.findByListOrderByPositionAsc(list);
		Map<Long, Task> tasksById = tasks.stream().collect(Collectors.toMap(Task::getId, Function.identity()));

		Set<Long> requestedIds = new HashSet<>(request.taskIds());
		if (requestedIds.size() != request.taskIds().size()
				|| !requestedIds.equals(tasksById.keySet())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "指定されたタスクIDがリストの内容と一致しません");
		}

		List<Long> taskIds = request.taskIds();
		for (int i = 0; i < taskIds.size(); i++) {
			tasksById.get(taskIds.get(i)).setPosition(i);
		}

		return ResponseEntity.noContent().build();
	}

	private static int clamp(int position, int size) {
		return Math.max(0, Math.min(position, size));
	}

	private static void reindex(List<Task> tasks) {
		for (int i = 0; i < tasks.size(); i++) {
			tasks.get(i).setPosition(i);
		}
	}
}
