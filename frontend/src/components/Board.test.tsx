import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Board from "./Board";
import type { Card } from "../types/card";
import type { TaskList } from "../types/list";

const lists: TaskList[] = [
  { id: 1, boardId: 1, title: "To Do", position: 0 },
  { id: 2, boardId: 1, title: "完了", position: 1 },
];

function card(id: number, listId: number, position: number): Card {
  return {
    id,
    listId,
    listTitle: "",
    title: `card-${id}`,
    priority: "medium",
    dueDate: null,
    position,
  };
}

function renderBoard(cards: Card[], boardLists: TaskList[] = lists) {
  render(
    <Board
      lists={boardLists}
      cards={cards}
      loading={false}
      error={null}
      onRetry={vi.fn()}
      onCardClick={vi.fn()}
      onMoveCard={vi.fn()}
      onAddList={vi.fn().mockResolvedValue(true)}
      onRenameList={vi.fn()}
      onDeleteList={vi.fn()}
    />
  );
}

describe("Board", () => {
  it("shows a column for every list, including lists without cards", () => {
    renderBoard([card(1, 1, 0)]);
    const titles = screen.getAllByLabelText("リスト名").map((el) => (el as HTMLInputElement).value);
    expect(titles).toEqual(["To Do", "完了"]);
  });

  it("orders the cards of a list by position", () => {
    renderBoard([card(1, 1, 1), card(2, 1, 0)]);
    const cardTitles = screen.getAllByText(/^card-/).map((el) => el.textContent);
    expect(cardTitles).toEqual(["card-2", "card-1"]);
  });

  it("still offers adding a list when there are no lists", () => {
    renderBoard([], []);
    expect(screen.getByRole("button", { name: "+ リストを追加" })).toBeInTheDocument();
  });
});
