import type { Card } from "../types/card";
import { isOverdue } from "../utils/date";

interface Props {
  card: Card;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  dragging?: boolean;
}

export default function CardItem({ card, onClick, onDragStart, dragging }: Props) {
  const overdue = isOverdue(card.dueDate);

  return (
    <div
      className={`card-item priority-${card.priority}${dragging ? " card-item--dragging" : ""}`}
      draggable={onDragStart != null}
      onDragStart={onDragStart}
      onClick={onClick}
    >
      <div className="card-item__title">{card.title}</div>
      <div className={`card-item__due${overdue ? " card-item__due--overdue" : ""}`}>
        期限: {card.dueDate ?? "--"}
        {overdue && " (期限超過)"}
      </div>
    </div>
  );
}
