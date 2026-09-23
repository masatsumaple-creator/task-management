import { useState } from "react";
import type { Task } from "../types/task";
import type { TaskList } from "../types/list";
import AddListForm from "./AddListForm";
import Column, { type ColumnData } from "./Column";

interface Props {
  lists: TaskList[];
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onTaskClick: (task: Task) => void;
  onMoveTask: (taskId: number, listId: number, position: number) => void;
  onAddList: (title: string) => Promise<boolean>;
  onRenameList: (listId: number, title: string) => void;
  onDeleteList: (listId: number) => void;
}

export interface DropTarget {
  listId: number;
  index: number;
}

/**
 * リストごとに、そのリストに属するタスクを position 順に並べて列を組み立てる。
 * タスクが0件のリストも列として表示する（空のリストへもタスクを移動できるようにするため）。
 */
function buildColumns(lists: TaskList[], tasks: Task[]): ColumnData[] {
  return lists.map((list) => ({
    listId: list.id,
    listTitle: list.title,
    tasks: tasks
      .filter((task) => task.listId === list.id)
      .sort((a, b) => a.position - b.position),
  }));
}

export default function Board({
  lists,
  tasks,
  loading,
  error,
  onRetry,
  onTaskClick,
  onMoveTask,
  onAddList,
  onRenameList,
  onDeleteList,
}: Props) {
  const [draggingTaskId, setDraggingTaskId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  if (loading) {
    return <p className="board-status">読み込み中...</p>;
  }
  if (error) {
    return (
      <p className="board-status board-status--error" role="alert">
        {error}
        <button type="button" className="board-status__retry" onClick={onRetry}>
          再試行
        </button>
      </p>
    );
  }

  const columns = buildColumns(lists, tasks);

  function handleDrop() {
    if (draggingTaskId != null && dropTarget != null) {
      onMoveTask(draggingTaskId, dropTarget.listId, dropTarget.index);
    }
    setDraggingTaskId(null);
    setDropTarget(null);
  }

  return (
    <div className="board">
      {columns.map((column) => (
        <Column
          key={column.listId}
          column={column}
          onTaskClick={onTaskClick}
          draggingTaskId={draggingTaskId}
          dropTarget={dropTarget}
          onDragStartTask={setDraggingTaskId}
          onDragEnd={() => {
            setDraggingTaskId(null);
            setDropTarget(null);
          }}
          onDragOverColumn={(index) => setDropTarget({ listId: column.listId, index })}
          onDrop={handleDrop}
          onRename={onRenameList}
          onDelete={onDeleteList}
        />
      ))}
      <AddListForm onAdd={onAddList} />
    </div>
  );
}
