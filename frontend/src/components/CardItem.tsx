import type { Card } from "../types/card";
import { isOverdue } from "../utils/date";

interface Props {
  card: Card;
}

export default function CardItem({ card }: Props) {
  const overdue = isOverdue(card.dueDate);

  return (
    <li className={`card-item priority-${card.priority}`}>
      <div className="card-item__title">{card.title}</div>
      <div className={`card-item__due${overdue ? " card-item__due--overdue" : ""}`}>
        期限: {card.dueDate ?? "--"}
        {overdue && " (期限超過)"}
      </div>
    </li>
  );
}
