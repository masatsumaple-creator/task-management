# データモデル

[← 要件定義書に戻る](../requirements.md)

## 現在のデータモデル（localStorage / JSON）

状態はひとつのJSONオブジェクトとして保持し、`localStorage` のキー `task-board-state-v1` に文字列化して保存する。

```json
{
  "lists": [
    {
      "id": "string (一意なID)",
      "title": "string",
      "cards": [
        {
          "id": "string (一意なID)",
          "title": "string",
          "priority": "high | medium | low",
          "dueDate": "string (YYYY-MM-DD、未設定は空文字)"
        }
      ]
    }
  ]
}
```

リスト・カードの並び順は配列の並び順そのものが表す。IDは追加時に生成し、削除・移動時にも変更しない。ボードは1つのみで、ボード自体をIDで管理する概念は持たない。

`priority` はカードの優先度を3段階（`high` / `medium` / `low`）で表し、カード作成時は既定値として `medium` を設定する。`dueDate` はカードの期限日で、未入力の場合は空文字を保持する。期限日が本日より過去の場合、画面上は期限超過として強調表示する。

## DB移行を見据えたER図（将来構成）

将来、`localStorage` から実際のデータベース（RDB）へ移行し、サーバー経由で運用することを見据えた場合のテーブル構成を以下に示す。現行スコープ（単一ボード・単一ユーザー・ログインなし）に合わせた最小構成とし、`boards` テーブルもあらかじめ用意することで、[拡張候補](roadmap.md)にある複数ボード対応への移行時にテーブル追加なしで対応できるようにする。

```mermaid
erDiagram
  BOARDS ||--o{ LISTS : "所属する"
  LISTS ||--o{ CARDS : "所属する"

  BOARDS {
    string id PK
    string title
    datetime created_at
    datetime updated_at
  }
  LISTS {
    string id PK
    string board_id FK
    string title
    int position
    datetime created_at
    datetime updated_at
  }
  CARDS {
    string id PK
    string list_id FK
    string title
    string priority "high, medium, low"
    date due_date "null許容"
    int position
    datetime created_at
    datetime updated_at
  }
```

**現行モデルとの主な差分**

- `position`（並び順）列を明示的に追加する。現行はJSON配列の並び順がそのまま順序を表すが、RDBのテーブル行には順序の保証がないため、順序を保持する列が別途必要になる。
- `created_at` / `updated_at` を追加する。DB運用では作成・更新日時の記録が一般的なため、現行モデルにはない項目として加える。
- `boards` テーブルを新設する。現行は暗黙的に「ボードは1つ」だが、DBでは明示的な行として管理する。ただし本バージョンのスコープでは1ユーザー1ボード運用とし、`users` テーブルやログイン機能の追加は行わない（[拡張候補](roadmap.md)で別途検討）。
- ER図上のカーディナリティは「1つのボードは0件以上のリストを持つ／1つのリストは0件以上のカードを持つ」（`||--o{`）という1対多の関係を表す。

---

[← 要件定義書に戻る](../requirements.md)
