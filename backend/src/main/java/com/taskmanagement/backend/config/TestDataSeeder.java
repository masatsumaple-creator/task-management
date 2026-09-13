package com.taskmanagement.backend.config;

import java.time.LocalDate;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.taskmanagement.backend.entity.Board;
import com.taskmanagement.backend.entity.Card;
import com.taskmanagement.backend.entity.Priority;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.repository.BoardRepository;
import com.taskmanagement.backend.repository.CardRepository;
import com.taskmanagement.backend.repository.TaskListRepository;

/**
 * READ API（{@link com.taskmanagement.backend.controller.CardController}）の動作確認用に、
 * 起動時にPostgreSQLへテストデータを投入する。
 * 既にデータが存在する場合（{@code boards} が1件以上ある場合）は何もしない。
 */
@Component
public class TestDataSeeder implements CommandLineRunner {

	private final BoardRepository boardRepository;
	private final TaskListRepository taskListRepository;
	private final CardRepository cardRepository;

	public TestDataSeeder(
			BoardRepository boardRepository,
			TaskListRepository taskListRepository,
			CardRepository cardRepository
	) {
		this.boardRepository = boardRepository;
		this.taskListRepository = taskListRepository;
		this.cardRepository = cardRepository;
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

		LocalDate today = LocalDate.now();

		cardRepository.save(new Card(todo, "要件定義書のレビュー", Priority.HIGH, today.plusDays(2), 0));
		cardRepository.save(new Card(todo, "READ APIの実装", Priority.HIGH, today.minusDays(1), 1));
		cardRepository.save(new Card(todo, "テストデータの洗い出し", Priority.MEDIUM, null, 2));

		cardRepository.save(new Card(inProgress, "PostgreSQL環境構築", Priority.MEDIUM, today.plusDays(5), 0));
		cardRepository.save(new Card(inProgress, "エンティティ設計", Priority.LOW, today.plusDays(10), 1));

		cardRepository.save(new Card(done, "Spring Bootプロジェクト作成", Priority.MEDIUM, today.minusDays(7), 0));
		cardRepository.save(new Card(done, "Docker Compose設定", Priority.LOW, today.minusDays(3), 1));
	}
}
