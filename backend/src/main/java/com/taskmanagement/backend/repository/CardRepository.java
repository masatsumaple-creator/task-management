package com.taskmanagement.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.taskmanagement.backend.entity.Card;
import com.taskmanagement.backend.entity.TaskList;

/**
 * {@link JpaSpecificationExecutor} を組み合わせることで、
 * キーワード・優先度・所属リストなどの検索条件を動的に組み立てられるようにする。
 */
public interface CardRepository extends JpaRepository<Card, Long>, JpaSpecificationExecutor<Card> {

	/** 新規カードを末尾に追加する際の position 算出に使う。 */
	long countByList(TaskList list);

	/** カード移動時の position 再採番に使う。position 昇順で返す。 */
	List<Card> findByListOrderByPositionAsc(TaskList list);
}
