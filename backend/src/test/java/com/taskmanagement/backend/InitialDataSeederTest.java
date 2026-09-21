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
import com.taskmanagement.backend.entity.Card;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.repository.BoardRepository;
import com.taskmanagement.backend.repository.CardRepository;
import com.taskmanagement.backend.repository.TaskListRepository;

/**
 * DB接続なしで、シーダーが投入する内容（初期リスト / サンプルカード / 既存データありの場合）を確認する。
 */
class InitialDataSeederTest {

	private BoardRepository boardRepository;
	private TaskListRepository taskListRepository;
	private CardRepository cardRepository;

	@BeforeEach
	void setUp() {
		boardRepository = mock(BoardRepository.class);
		taskListRepository = mock(TaskListRepository.class);
		cardRepository = mock(CardRepository.class);
		when(boardRepository.save(any(Board.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(taskListRepository.save(any(TaskList.class))).thenAnswer(invocation -> invocation.getArgument(0));
	}

	private InitialDataSeeder seeder(boolean sampleCards) {
		return new InitialDataSeeder(boardRepository, taskListRepository, cardRepository, sampleCards);
	}

	@Test
	void emptyDatabaseGetsInitialListsWithoutCardsByDefault() {
		when(boardRepository.count()).thenReturn(0L);

		seeder(false).run();

		verify(boardRepository, times(1)).save(any(Board.class));
		verify(taskListRepository, times(3)).save(any(TaskList.class));
		verify(cardRepository, never()).save(any(Card.class));
	}

	@Test
	void sampleCardsAreSeededOnlyWhenEnabled() {
		when(boardRepository.count()).thenReturn(0L);

		seeder(true).run();

		verify(taskListRepository, times(3)).save(any(TaskList.class));
		verify(cardRepository, times(7)).save(any(Card.class));
	}

	@Test
	void existingDataIsLeftUntouched() {
		when(boardRepository.count()).thenReturn(1L);

		seeder(true).run();

		verify(boardRepository, never()).save(any(Board.class));
		verify(taskListRepository, never()).save(any(TaskList.class));
		verify(cardRepository, never()).save(any(Card.class));
	}
}
