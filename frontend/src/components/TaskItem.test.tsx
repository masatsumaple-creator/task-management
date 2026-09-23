import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TaskItem from "./TaskItem";
import type { Task } from "../types/task";

const baseTask: Task = {
  id: 1,
  listId: 1,
  listTitle: "To Do",
  title: "サンプルタスク",
  priority: "high",
  dueDate: null,
  position: 0,
};

describe("TaskItem", () => {
  it("renders the title and due date", () => {
    render(<TaskItem task={{ ...baseTask, dueDate: "2999-01-01" }} />);
    expect(screen.getByText("サンプルタスク")).toBeInTheDocument();
    expect(screen.getByText(/2999-01-01/)).toBeInTheDocument();
  });

  it("applies the priority class", () => {
    const { container } = render(<TaskItem task={{ ...baseTask, priority: "low" }} />);
    expect(container.querySelector(".priority-low")).not.toBeNull();
  });

  it("marks a past due date as overdue", () => {
    render(<TaskItem task={{ ...baseTask, dueDate: "2000-01-01" }} />);
    expect(screen.getByText(/期限超過/)).toBeInTheDocument();
  });

  it("does not mark a future due date as overdue", () => {
    render(<TaskItem task={{ ...baseTask, dueDate: "2999-01-01" }} />);
    expect(screen.queryByText(/期限超過/)).toBeNull();
  });
});
