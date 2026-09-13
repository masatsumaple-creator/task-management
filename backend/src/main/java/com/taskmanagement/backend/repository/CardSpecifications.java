package com.taskmanagement.backend.repository;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.taskmanagement.backend.entity.Card;
import com.taskmanagement.backend.entity.Priority;

/**
 * {@link com.taskmanagement.backend.controller.CardController} の検索条件（キーワード・優先度・リストID）を
 * 動的に組み立てるための {@link Specification} 集。値が未指定の条件はSQLに含めない。
 */
public final class CardSpecifications {

	private CardSpecifications() {
	}

	public static Specification<Card> titleContains(String keyword) {
		if (!StringUtils.hasText(keyword)) {
			return null;
		}
		String pattern = "%" + keyword.toLowerCase() + "%";
		return (root, query, cb) -> cb.like(cb.lower(root.get("title")), pattern);
	}

	public static Specification<Card> hasPriority(Priority priority) {
		if (priority == null) {
			return null;
		}
		return (root, query, cb) -> cb.equal(root.get("priority"), priority);
	}

	public static Specification<Card> inList(Long listId) {
		if (listId == null) {
			return null;
		}
		return (root, query, cb) -> cb.equal(root.get("list").get("id"), listId);
	}

	/** null になった条件（未指定）を除外しつつ AND 結合する。 */
	@SafeVarargs
	public static Specification<Card> and(Specification<Card>... specs) {
		Specification<Card> combined = Specification.where(null);
		for (Specification<Card> spec : specs) {
			if (spec != null) {
				combined = combined.and(spec);
			}
		}
		return combined;
	}
}
