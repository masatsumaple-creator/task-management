import type { Card } from "../types/card";
import CardItem from "./CardItem";

export interface ColumnData {
  listId: number;
  listTitle: string;
  cards: Card[];
}

interface Props {
  column: ColumnData;
}

export default function Column({ column }: Props) {
  return (
    <section className="column">
      <h2 className="column__title">{column.listTitle}</h2>
      <ul className="column__cards">
        {column.cards.map((card) => (
          <CardItem key={card.id} card={card} />
        ))}
      </ul>
    </section>
  );
}
