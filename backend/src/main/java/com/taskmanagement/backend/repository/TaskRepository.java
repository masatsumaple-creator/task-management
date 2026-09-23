package com.taskmanagement.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.taskmanagement.backend.entity.Task;
import com.taskmanagement.backend.entity.TaskList;

/**
 * {@link JpaSpecificationExecutor} を組み合わせることで、
 * キーワード・優先度・所属リストなどの検索条件を動的に組み立てられるようにする。
 */
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

	/** 新規タスクを末尾に追加する際の position 算出に使う。 */
	long countByList(TaskList list);

	/** タスク移動時の position 再採番に使う。position 昇順で返す。 */
	List<Task> findByListOrderByPositionAsc(TaskList list);

	/** リスト削除時に、そのリストのタスクをまとめて削除する。呼び出し側でトランザクションを張ること。 */
	void deleteByList(TaskList list);
}
