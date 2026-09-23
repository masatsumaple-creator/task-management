package com.taskmanagement.backend;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.taskmanagement.backend.config.InitialDataSeeder;
import com.taskmanagement.backend.entity.Board;
import com.taskmanagement.backend.entity.Task;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.repository.BoardRepository;
import com.taskmanagement.backend.repository.TaskListRepository;
import com.taskmanagement.backend.repository.TaskRepository;

/**
 * DB接続なしで、シーダーが投入する内容（初期リスト / サンプルタスク / 既存データありの場合）を確認する。
 */
class InitialDataSeederTest {

	private BoardRepository boardRepository;
	private TaskListRepository taskListRepository;
	private TaskRepository taskRepository;

	@BeforeEach
	void setUp() {
		boardRepository = mock(BoardRepository.class);
		taskListRepository = mock(TaskListRepository.class);
		taskRepository = mock(TaskRepository.class);
		when(boardRepository.save(any(Board.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(taskListRepository.save(any(TaskList.class))).thenAnswer(invocation -> invocation.getArgument(0));
	}

	private InitialDataSeeder seeder(boolean sampleTasks) {
		return new InitialDataSeeder(boardRepository, taskListRepository, taskRepository, sampleTasks);
	}

	@Test
	void emptyDatabaseGetsInitialListsWithoutTasksByDefault() {
		when(boardRepository.count()).thenReturn(0L);

		seeder(false).run();

		verify(boardRepository, times(1)).save(any(Board.class));
		verify(taskListRepository, times(3)).save(any(TaskList.class));
		verify(taskRepository, never()).save(any(Task.class));
	}

	@Test
	void sampleTasksAreSeededOnlyWhenEnabled() {
		when(boardRepository.count()).thenReturn(0L);

		seeder(true).run();

		verify(taskListRepository, times(3)).save(any(TaskList.class));
		verify(taskRepository, times(7)).save(any(Task.class));
	}

	@Test
	void existingDataIsLeftUntouched() {
		when(boardRepository.count()).thenReturn(1L);

		seeder(true).run();

		verify(boardRepository, never()).save(any(Board.class));
		verify(taskListRepository, never()).save(any(TaskList.class));
		verify(taskRepository, never()).save(any(Task.class));
	}
}
