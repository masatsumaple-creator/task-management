package com.taskmanagement.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taskmanagement.backend.entity.Board;
import com.taskmanagement.backend.entity.TaskList;

public interface TaskListRepository extends JpaRepository<TaskList, Long> {

	List<TaskList> findAllByOrderByPositionAsc();

	/** 新規リストを末尾に追加する際の position 算出に使う。 */
	long countByBoard(Board board);
}
