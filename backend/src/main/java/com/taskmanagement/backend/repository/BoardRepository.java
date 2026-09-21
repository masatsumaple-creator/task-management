package com.taskmanagement.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taskmanagement.backend.entity.Board;

public interface BoardRepository extends JpaRepository<Board, Long> {

	/** 現行スコープは1ボード運用のため、リスト追加先として最初のボードを返す。 */
	Optional<Board> findFirstByOrderByIdAsc();
}
