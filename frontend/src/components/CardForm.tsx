import { useState } from "react";
import type { Priority } from "../types/card";
import type { TaskList } from "../types/list";
import { createCard } from "../api/cards";

interface Props {
  lists: TaskList[];
  onCreated: () => void;
}

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
];

export default function CardForm({ lists, onCreated }: Props) {
  const [selectedListId, setListId] = useState("");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 登録先が未選択、または選択中のリストが削除された場合は、先頭のリストを選ぶ。
  const listId = lists.some((list) => String(list.id) === selectedListId)
    ? selectedListId
    : lists.length > 0
      ? String(lists[0].id)
      : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!listId) {
      setError("リストを選択してください。");
      return;
    }
    if (!title.trim()) {
      setError("タイトルを入力してください。");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createCard({
        listId: Number(listId),
        title: title.trim(),
        priority,
        dueDate: dueDate || undefined,
      });
      setTitle("");
      setDueDate("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card-form" onSubmit={handleSubmit}>
      <select
        value={listId}
        onChange={(e) => setListId(e.target.value)}
        aria-label="登録先リスト"
      >
        {lists.length === 0 && <option value="">リストがありません</option>}
        {lists.map((list) => (
          <option key={list.id} value={list.id}>
            {list.title}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="タイトル"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
        aria-label="優先度"
      >
        {PRIORITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            優先度: {opt.label}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        aria-label="期日"
      />
      <button type="submit" disabled={submitting}>
        {submitting ? "登録中..." : "登録"}
      </button>
      {error && <p className="card-form__error">{error}</p>}
    </form>
  );
}
