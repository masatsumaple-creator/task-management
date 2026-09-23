import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Board from "./Board";
import type { Task } from "../types/task";
import type { TaskList } from "../types/list";

const lists: TaskList[] = [
  { id: 1, boardId: 1, title: "To Do", position: 0 },
  { id: 2, boardId: 1, title: "完了", position: 1 },
];

function task(id: number, listId: number, position: number): Task {
  return {
    id,
    listId,
    listTitle: "",
    title: `task-${id}`,
    priority: "medium",
    dueDate: null,
    position,
  };
}

function renderBoard(tasks: Task[], boardLists: TaskList[] = lists) {
  render(
    <Board
      lists={boardLists}
      tasks={tasks}
      loading={false}
      error={null}
      onRetry={vi.fn()}
      onTaskClick={vi.fn()}
      onMoveTask={vi.fn()}
      onAddList={vi.fn().mockResolvedValue(true)}
      onRenameList={vi.fn()}
      onDeleteList={vi.fn()}
    />
  );
}

describe("Board", () => {
  it("shows a column for every list, including lists without tasks", () => {
    renderBoard([task(1, 1, 0)]);
    const titles = screen.getAllByLabelText("リスト名").map((el) => (el as HTMLInputElement).value);
    expect(titles).toEqual(["To Do", "完了"]);
  });

  it("orders the tasks of a list by position", () => {
    renderBoard([task(1, 1, 1), task(2, 1, 0)]);
    const taskTitles = screen.getAllByText(/^task-/).map((el) => el.textContent);
    expect(taskTitles).toEqual(["task-2", "task-1"]);
  });

  it("still offers adding a list when there are no lists", () => {
    renderBoard([], []);
    expect(screen.getByRole("button", { name: "+ リストを追加" })).toBeInTheDocument();
  });
});
