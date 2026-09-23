import { useRef, useState } from "react";
import type { Task } from "../types/task";
import type { DropTarget } from "./Board";
import TaskItem from "./TaskItem";

export interface ColumnData {
  listId: number;
  listTitle: string;
  tasks: Task[];
}

interface Props {
  column: ColumnData;
  onTaskClick: (task: Task) => void;
  draggingTaskId: number | null;
  dropTarget: DropTarget | null;
  onDragStartTask: (taskId: number) => void;
  onDragEnd: () => void;
  onDragOverColumn: (index: number) => void;
  onDrop: () => void;
  onRename: (listId: number, title: string) => void;
  onDelete: (listId: number) => void;
}

export default function Column({
  column,
  onTaskClick,
  draggingTaskId,
  dropTarget,
  onDragStartTask,
  onDragEnd,
  onDragOverColumn,
  onDrop,
  onRename,
  onDelete,
}: Props) {
  const listRef = useRef<HTMLUListElement>(null);
  const [draftTitle, setDraftTitle] = useState(column.listTitle);

  function commitTitle() {
    const trimmed = draftTitle.trim();
    if (!trimmed || trimmed === column.listTitle) {
      setDraftTitle(column.listTitle);
      return;
    }
    onRename(column.listId, trimmed);
  }

  function handleDelete() {
    // 絞り込み中は非表示のタスクも含めて削除されるため、タスク数に関わらず常に確認する。
    if (
      window.confirm(
        `リスト「${column.listTitle}」を削除しますか？リスト内のタスクもすべて削除されます。`
      )
    ) {
      onDelete(column.listId);
    }
  }

  function handleDragStart(taskId: number) {
    return (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(taskId));
      onDragStartTask(taskId);
    };
  }

  function handleDragOver(e: React.DragEvent<HTMLUListElement>) {
    e.preventDefault();
    const index = computeDropIndex(listRef.current, e.clientY, draggingTaskId);
    onDragOverColumn(index);
  }

  function handleDrop(e: React.DragEvent<HTMLUListElement>) {
    e.preventDefault();
    onDrop();
  }

  const showIndicator = dropTarget != null && dropTarget.listId === column.listId;

  return (
    <section className="column">
      <div className="column__header">
        <h2 className="column__title">
          <input
            className="column__title-input"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setDraftTitle(column.listTitle);
                e.currentTarget.blur();
              }
            }}
            aria-label="リスト名"
            maxLength={255}
          />
        </h2>
        <button
          type="button"
          className="column__delete"
          onClick={handleDelete}
          aria-label={`リスト「${column.listTitle}」を削除`}
          title="リストを削除"
        >
          ✕
        </button>
      </div>
      <ul
        className="column__tasks"
        ref={listRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnd={onDragEnd}
      >
        {column.tasks.map((task, index) => (
          <li key={task.id} className="column__task-slot" data-task-id={task.id}>
            {showIndicator && dropTarget!.index === index && <div className="drop-indicator" />}
            <TaskItem
              task={task}
              dragging={task.id === draggingTaskId}
              onClick={() => onTaskClick(task)}
              onDragStart={handleDragStart(task.id)}
            />
          </li>
        ))}
        {showIndicator && dropTarget!.index >= column.tasks.length && (
          <li className="column__task-slot column__task-slot--indicator">
            <div className="drop-indicator" />
          </li>
        )}
      </ul>
    </section>
  );
}

/**
 * ドロップ位置(Y座標)から、タスク同士の中間点を基準に挿入インデックスを求める。
 * ドラッグ中のタスク自身は計算から除外し、挿入先の見た目とインデックスがずれないようにする。
 */
function computeDropIndex(
  list: HTMLUListElement | null,
  clientY: number,
  draggingTaskId: number | null
): number {
  if (!list) return 0;

  const slots = [
    ...list.querySelectorAll<HTMLElement>(
      ":scope > .column__task-slot:not(.column__task-slot--indicator)"
    ),
  ].filter((slot) => Number(slot.dataset.taskId) !== draggingTaskId);

  let index = slots.length;
  for (let i = 0; i < slots.length; i++) {
    const rect = slots[i].getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    if (clientY < midpoint) {
      index = i;
      break;
    }
  }
  return index;
}
