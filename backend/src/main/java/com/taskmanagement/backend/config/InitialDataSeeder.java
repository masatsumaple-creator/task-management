package com.taskmanagement.backend.config;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.taskmanagement.backend.entity.Board;
import com.taskmanagement.backend.entity.Priority;
import com.taskmanagement.backend.entity.Task;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.repository.BoardRepository;
import com.taskmanagement.backend.repository.TaskListRepository;
import com.taskmanagement.backend.repository.TaskRepository;

/**
 * 起動時にDBが空（{@code boards} が0件）の場合のみ、初期データを投入する。
 * 既にデータが存在する場合は何もしない。
 *
 * <ul>
 *   <li>常に投入: ボード「マイボード」と、初期リスト（To Do / 進行中 / 完了）</li>
 *   <li>{@code app.seed.sample-tasks=true} の場合のみ: 動作確認用のサンプルタスク
 *       （Dockerなしで試す {@code h2} プロファイルで有効。PostgreSQLの既定では投入しない）</li>
 * </ul>
 */
@Component
public class InitialDataSeeder implements CommandLineRunner {

	private final BoardRepository boardRepository;
	private final TaskListRepository taskListRepository;
	private final TaskRepository taskRepository;
	private final boolean sampleTasks;

	public InitialDataSeeder(
			BoardRepository boardRepository,
			TaskListRepository taskListRepository,
			TaskRepository taskRepository,
			@Value("${app.seed.sample-tasks:false}") boolean sampleTasks
	) {
		this.boardRepository = boardRepository;
		this.taskListRepository = taskListRepository;
		this.taskRepository = taskRepository;
		this.sampleTasks = sampleTasks;
	}

	@Override
	public void run(String... args) {
		if (boardRepository.count() > 0) {
			return;
		}

		Board board = boardRepository.save(new Board("マイボード"));

		TaskList todo = taskListRepository.save(new TaskList(board, "To Do", 0));
		TaskList inProgress = taskListRepository.save(new TaskList(board, "進行中", 1));
		TaskList done = taskListRepository.save(new TaskList(board, "完了", 2));

		if (sampleTasks) {
			seedSampleTasks(todo, inProgress, done);
		}
	}

	private void seedSampleTasks(TaskList todo, TaskList inProgress, TaskList done) {
		LocalDate today = LocalDate.now();

		taskRepository.save(new Task(todo, "要件定義書のレビュー", Priority.HIGH, today.plusDays(2), 0));
		taskRepository.save(new Task(todo, "READ APIの実装", Priority.HIGH, today.minusDays(1), 1));
		taskRepository.save(new Task(todo, "テストデータの洗い出し", Priority.MEDIUM, null, 2));

		taskRepository.save(new Task(inProgress, "PostgreSQL環境構築", Priority.MEDIUM, today.plusDays(5), 0));
		taskRepository.save(new Task(inProgress, "エンティティ設計", Priority.LOW, today.plusDays(10), 1));

		taskRepository.save(new Task(done, "Spring Bootプロジェクト作成", Priority.MEDIUM, today.minusDays(7), 0));
		taskRepository.save(new Task(done, "Docker Compose設定", Priority.LOW, today.minusDays(3), 1));
	}
}
