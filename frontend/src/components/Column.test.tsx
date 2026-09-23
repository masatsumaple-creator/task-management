import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Column, { type ColumnData } from "./Column";

const column: ColumnData = { listId: 7, listTitle: "To Do", tasks: [] };

function renderColumn(overrides: { onRename?: () => void; onDelete?: () => void } = {}) {
  const onRename = overrides.onRename ?? vi.fn();
  const onDelete = overrides.onDelete ?? vi.fn();
  render(
    <Column
      column={column}
      onTaskClick={vi.fn()}
      draggingTaskId={null}
      dropTarget={null}
      onDragStartTask={vi.fn()}
      onDragEnd={vi.fn()}
      onDragOverColumn={vi.fn()}
      onDrop={vi.fn()}
      onRename={onRename}
      onDelete={onDelete}
    />
  );
  return { onRename, onDelete };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Column", () => {
  it("renames the list with the trimmed title on blur", () => {
    const { onRename } = renderColumn();
    const input = screen.getByLabelText("リスト名");
    fireEvent.change(input, { target: { value: "  Doing  " } });
    fireEvent.blur(input);
    expect(onRename).toHaveBeenCalledWith(7, "Doing");
  });

  it("does not rename when the title is blank or unchanged", () => {
    const { onRename } = renderColumn();
    const input = screen.getByLabelText("リスト名");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.blur(input);
    expect(onRename).not.toHaveBeenCalled();
    expect(input).toHaveValue("To Do");
  });

  it("reverts the title on Escape", () => {
    const { onRename } = renderColumn();
    const input = screen.getByLabelText("リスト名");
    fireEvent.change(input, { target: { value: "Changed" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(onRename).not.toHaveBeenCalled();
    expect(input).toHaveValue("To Do");
  });

  it("deletes the list only after confirmation", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const { onDelete } = renderColumn();
    const button = screen.getByRole("button", { name: /削除/ });

    fireEvent.click(button);
    expect(onDelete).not.toHaveBeenCalled();

    confirm.mockReturnValue(true);
    fireEvent.click(button);
    expect(onDelete).toHaveBeenCalledWith(7);
  });
});
