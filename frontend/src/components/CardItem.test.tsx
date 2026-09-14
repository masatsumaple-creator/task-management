import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CardItem from "./CardItem";
import type { Card } from "../types/card";

const baseCard: Card = {
  id: 1,
  listId: 1,
  listTitle: "To Do",
  title: "サンプルカード",
  priority: "high",
  dueDate: null,
  position: 0,
};

describe("CardItem", () => {
  it("renders the title and due date", () => {
    render(<CardItem card={{ ...baseCard, dueDate: "2999-01-01" }} />);
    expect(screen.getByText("サンプルカード")).toBeInTheDocument();
    expect(screen.getByText(/2999-01-01/)).toBeInTheDocument();
  });

  it("applies the priority class", () => {
    const { container } = render(<CardItem card={{ ...baseCard, priority: "low" }} />);
    expect(container.querySelector(".priority-low")).not.toBeNull();
  });

  it("marks a past due date as overdue", () => {
    render(<CardItem card={{ ...baseCard, dueDate: "2000-01-01" }} />);
    expect(screen.getByText(/期限超過/)).toBeInTheDocument();
  });

  it("does not mark a future due date as overdue", () => {
    render(<CardItem card={{ ...baseCard, dueDate: "2999-01-01" }} />);
    expect(screen.queryByText(/期限超過/)).toBeNull();
  });
});
