package com.taskmanagement.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.taskmanagement.backend.entity.Card;

/**
 * {@link JpaSpecificationExecutor} を組み合わせることで、
 * キーワード・優先度・所属リストなどの検索条件を動的に組み立てられるようにする。
 */
public interface CardRepository extends JpaRepository<Card, Long>, JpaSpecificationExecutor<Card> {
}
