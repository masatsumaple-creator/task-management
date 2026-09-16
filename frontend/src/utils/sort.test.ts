import { describe, expect, it } from "vitest";
import { sortCards } from "./sort";
import type { Card } from "../types/card";

function makeCard(overrides: Partial<Card>): Card {
  return {
    id: 0,
    listId: 1,
    listTitle: "To Do",
    title: "card",
    priority: "medium",
    dueDate: null,
    position: 0,
    ...overrides,
  };
}

describe("sortCards", () => {
  it("sorts by priority from high to low", () => {
    const cards = [
      makeCard({ id: 1, priority: "low" }),
      makeCard({ id: 2, priority: "high" }),
      makeCard({ id: 3, priority: "medium" }),
    ];
    expect(sortCards(cards, "priority").map((c) => c.id)).toEqual([2, 3, 1]);
  });

  it("sorts by due date from nearest to farthest, with unset dates last", () => {
    const cards = [
      makeCard({ id: 1, dueDate: "2026-09-23" }),
      makeCard({ id: 2, dueDate: null }),
      makeCard({ id: 3, dueDate: "2026-09-10" }),
      makeCard({ id: 4, dueDate: "2026-09-18" }),
    ];
    expect(sortCards(cards, "dueDate").map((c) => c.id)).toEqual([3, 4, 1, 2]);
  });
});
