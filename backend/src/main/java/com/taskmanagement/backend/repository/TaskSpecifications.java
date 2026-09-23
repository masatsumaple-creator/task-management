package com.taskmanagement.backend.repository;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.taskmanagement.backend.entity.Priority;
import com.taskmanagement.backend.entity.Task;

/**
 * {@link com.taskmanagement.backend.controller.TaskController} の検索条件（キーワード・優先度・リストID）を
 * 動的に組み立てるための {@link Specification} 集。値が未指定の条件はSQLに含めない。
 */
public final class TaskSpecifications {

	private TaskSpecifications() {
	}

	public static Specification<Task> titleContains(String keyword) {
		if (!StringUtils.hasText(keyword)) {
			return null;
		}
		String pattern = "%" + keyword.toLowerCase() + "%";
		return (root, query, cb) -> cb.like(cb.lower(root.get("title")), pattern);
	}

	public static Specification<Task> hasPriority(Priority priority) {
		if (priority == null) {
			return null;
		}
		return (root, query, cb) -> cb.equal(root.get("priority"), priority);
	}

	public static Specification<Task> inList(Long listId) {
		if (listId == null) {
			return null;
		}
		return (root, query, cb) -> cb.equal(root.get("list").get("id"), listId);
	}

	/** null になった条件（未指定）を除外しつつ AND 結合する。 */
	@SafeVarargs
	public static Specification<Task> and(Specification<Task>... specs) {
		Specification<Task> combined = Specification.where(null);
		for (Specification<Task> spec : specs) {
			if (spec != null) {
				combined = combined.and(spec);
			}
		}
		return combined;
	}
}
