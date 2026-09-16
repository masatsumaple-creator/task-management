import { useState } from "react";
import type { Card, Priority } from "../types/card";
import { updateCard } from "../api/cards";

interface Props {
  card: Card;
  onClose: () => void;
  onUpdated: () => void;
}

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
];

export default function CardDetailModal({ card, onClose, onUpdated }: Props) {
  const [title, setTitle] = useState(card.title);
  const [priority, setPriority] = useState<Priority>(card.priority);
  const [dueDate, setDueDate] = useState(card.dueDate ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setError("タイトルを入力してください。");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await updateCard(card.id, {
        title: title.trim(),
        priority,
        dueDate: dueDate || undefined,
      });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="カード詳細"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal__title">カード詳細</h2>
        <form className="card-form card-form--modal" onSubmit={handleSubmit}>
          <label className="modal__field">
            タイトル
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="タイトル"
            />
          </label>
          <label className="modal__field">
            優先度
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              aria-label="優先度"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="modal__field">
            期日
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              aria-label="期日"
            />
          </label>
          <div className="modal__actions">
            <button type="button" onClick={onClose} disabled={submitting}>
              キャンセル
            </button>
            <button type="submit" disabled={submitting}>
              {submitting ? "保存中..." : "保存"}
            </button>
          </div>
          {error && <p className="card-form__error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
