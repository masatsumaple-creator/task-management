# Task Board Frontend

React + Vite + TypeScript 製のフロントエンド。バックエンド（`../backend`）の `GET /api/tasks` 検索APIと `/api/lists` を呼び出し、リスト（列）ごとにタスクを並べたカンバン風ボードとして表示する。

タスクのキーワード・優先度・所属リストによる検索/絞り込み、優先度・期日による並び替え、作成・編集・削除、ドラッグ&ドロップによる移動（同一リスト内の並べ替え・他リストへの移動）、リストの追加・名称編集（入力欄を直接編集してEnter/フォーカス移動で確定、Escで取消）・削除（確認ダイアログあり。リスト内のタスクも削除される）に対応済み。タスクが0件のリストも空の列として表示され、そこへタスクを移動できる。

## 起動手順

1. PostgreSQLを起動（リポジトリ直下で実行）
   ```
   docker compose up -d db
   ```
2. バックエンドを起動（`backend/` ディレクトリで実行、デフォルトで `http://localhost:8080`）
   ```
   ./gradlew bootRun
   ```
3. フロントエンドの依存関係をインストールし、開発サーバーを起動（このディレクトリで実行、デフォルトで `http://localhost:5173`）
   ```
   npm install
   cp .env.example .env.local   # 必要に応じて VITE_API_BASE_URL を編集
   npm run dev
   ```

バックエンド側には `http://localhost:5173` からのアクセスを許可するCORS設定（`backend/src/main/java/com/taskmanagement/backend/config/CorsConfig.java`）を追加済み。別のオリジンで開発サーバーを動かす場合はそちらも合わせて変更すること。

## テスト

```
npm test
```

Vitest + React Testing Library による `TaskItem` / `Column` / `Board` のコンポーネントテストと、`sort` ユーティリティのテストを実行する。

## 既知の制約

- リストの並び順（position）の変更は未対応（リストの追加は常に末尾）。
- リストの削除確認は、絞り込み中に非表示のタスクも削除対象となるため、タスク数に関わらず常に表示する。
