import { useState } from "react";

interface Props {
  /** 追加に成功したら true を返す。true のとき入力欄をクリアする。 */
  onAdd: (title: string) => Promise<boolean>;
}

export default function AddListForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      if (await onAdd(trimmed)) setTitle("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="add-list-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="新しいリスト名"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="新しいリスト名"
        maxLength={255}
      />
      <button type="submit" disabled={submitting || !title.trim()}>
        + リストを追加
      </button>
    </form>
  );
}
