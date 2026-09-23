import { describe, expect, it } from "vitest";
import { sortTasks } from "./sort";
import type { Task } from "../types/task";

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 0,
    listId: 1,
    listTitle: "To Do",
    title: "task",
    priority: "medium",
    dueDate: null,
    position: 0,
    ...overrides,
  };
}

describe("sortTasks", () => {
  it("sorts by priority from high to low", () => {
    const tasks = [
      makeTask({ id: 1, priority: "low" }),
      makeTask({ id: 2, priority: "high" }),
      makeTask({ id: 3, priority: "medium" }),
    ];
    expect(sortTasks(tasks, "priority").map((t) => t.id)).toEqual([2, 3, 1]);
  });

  it("sorts by due date from nearest to farthest, with unset dates last", () => {
    const tasks = [
      makeTask({ id: 1, dueDate: "2026-09-23" }),
      makeTask({ id: 2, dueDate: null }),
      makeTask({ id: 3, dueDate: "2026-09-10" }),
      makeTask({ id: 4, dueDate: "2026-09-18" }),
    ];
    expect(sortTasks(tasks, "dueDate").map((t) => t.id)).toEqual([3, 4, 1, 2]);
  });
});
