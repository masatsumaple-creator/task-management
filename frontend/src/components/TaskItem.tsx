import type { Task } from "../types/task";
import { isOverdue } from "../utils/date";

interface Props {
  task: Task;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  dragging?: boolean;
}

export default function TaskItem({ task, onClick, onDragStart, dragging }: Props) {
  const overdue = isOverdue(task.dueDate);

  return (
    <div
      className={`task-item priority-${task.priority}${dragging ? " task-item--dragging" : ""}`}
      draggable={onDragStart != null}
      onDragStart={onDragStart}
      onClick={onClick}
    >
      <div className="task-item__title">{task.title}</div>
      <div className={`task-item__due${overdue ? " task-item__due--overdue" : ""}`}>
        期限: {task.dueDate ?? "--"}
        {overdue && " (期限超過)"}
      </div>
    </div>
  );
}
