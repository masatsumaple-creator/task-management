# Task Board Frontend

React + Vite + TypeScript 製のフロントエンド。バックエンド（`../backend`）の `GET /api/cards` 検索APIを呼び出し、検索結果をリスト（列）ごとにグルーピングしたカンバン風ボードとして表示する。

現時点では検索結果の表示のみに対応（カードの作成・編集・削除、ドラッグ&ドロップは未実装）。

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

Vitest + React Testing Library による `CardItem` のコンポーネントテストを実行する。

## 既知の制約

- `GET /api/lists`（またはリスト一覧を返すAPI）が現時点で存在しないため、検索条件に一致するカードが1件もないリストは、ボード上に空の列として表示されない。カードを1件でも持つリストのみが列として現れる。
