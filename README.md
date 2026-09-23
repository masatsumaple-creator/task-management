# タスクボード（Task Board）

Trello風の「リスト × タスク」形式で、個人のタスクを素早く整理できるシンプルなかんばんボードアプリ。

Java / Spring Boot / PostgreSQL のAPIと、React + Vite のSPAで構成する。リストの一覧・追加・名称編集・削除、タスクの検索・絞り込み・並び替え・作成・編集・削除・ドラッグ&ドロップ移動に対応済み。主要なバージョンは[docs/requirements/tech-stack.md](docs/requirements/tech-stack.md)を参照。

## 構成

```
backend/    Spring Boot API（http://localhost:8080）
frontend/   React + Vite フロントエンド（http://localhost:5173）
docker-compose.yml   PostgreSQL（db サービス、localhost:5432）
```

## 前提

- JDK 17
- Node.js（Vite 8 / React 19 に対応するバージョン。npmの `package-lock.json` は `lockfileVersion 3` = npm 9以降を想定）
- Docker（PostgreSQLをコンテナで起動する場合）

## セットアップ・起動手順

1. 環境変数ファイルを用意する
   ```bash
   cp .env.example .env
   ```
2. PostgreSQLを起動する（リポジトリルートで実行）
   ```bash
   docker compose up -d db
   ```
3. バックエンドを起動する（`backend/` ディレクトリで実行）
   ```bash
   ./gradlew bootRun
   ```
   起動後、`http://localhost:8080` で待受する。詳細・疎通確認・H2プロファイルでの起動方法は [backend/README.md](backend/README.md) を参照。
4. フロントエンドの依存関係をインストールし、開発サーバーを起動する（`frontend/` ディレクトリで実行）
   ```bash
   npm install
   cp .env.example .env.local   # 必要に応じて VITE_API_BASE_URL を編集
   npm run dev
   ```
   起動後、`http://localhost:5173` でアクセスできる。詳細は [frontend/README.md](frontend/README.md) を参照。

## ポートについて

各サーバーのデフォルトポート（バックエンド 8080 / フロントエンド 5173 / PostgreSQL 5432）は固定運用とする。ポート競合時の対処方針は [CLAUDE.md](CLAUDE.md) を参照。

## テスト

```bash
# バックエンド（backend/ ディレクトリ）
./gradlew test

# フロントエンド（frontend/ ディレクトリ）
npm test
```

## ドキュメント

| ドキュメント | 内容 |
| --- | --- |
| [要件定義書](docs/requirements.md) | 目的・想定ユーザー・スコープ・機能要件のサマリー |
| [非機能要件](docs/requirements/non-functional.md) | 実行環境・対応ブラウザ、セキュリティ、アクセシビリティ、対応デバイス・画面幅、障害時の挙動 |
| [画面構成](docs/requirements/screens.md) | ワイヤーフレーム、操作フロー図 |
| [データモデル](docs/requirements/data-model.md) | DBのER図（boards / lists / tasks） |
| [制約・前提条件 / 今後の拡張候補](docs/requirements/roadmap.md) | データ保存範囲の制約、優先度付き拡張候補一覧 |
| [技術スタック](docs/requirements/tech-stack.md) | 採用する技術スタックとバージョン一覧 |
| [改訂履歴](docs/requirements/changelog.md) | バージョンごとの変更内容 |
| [backend/README.md](backend/README.md) | バックエンドの起動・疎通確認・DB接続設定 |
| [frontend/README.md](frontend/README.md) | フロントエンドの起動・テスト・既知の制約 |
| [CLAUDE.md](CLAUDE.md) | このリポジトリでClaude Codeが作業する際の規約（デフォルトポート運用など） |

機能を追加・変更する際は、対象コードと合わせて [docs/requirements.md](docs/requirements.md) および各詳細ドキュメントのスコープ・要件も更新する。
