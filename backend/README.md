# バックエンド（Spring Boot）

タスクボードアプリのバックエンド。[技術スタック](../docs/requirements/tech-stack.md)に基づき、Java / Spring Boot / Gradle / Spring Data JPA で構成する。

Board / List / Task のJPAエンティティ・リポジトリと、Task / List に対するREST APIを実装済み。

## API

| メソッド | パス | 内容 |
| --- | --- | --- |
| GET | `/api/lists` | リスト一覧取得（position順） |
| POST | `/api/lists` | リスト新規登録（末尾に追加） |
| PUT | `/api/lists/{id}` | リスト名の更新 |
| DELETE | `/api/lists/{id}` | リスト削除（物理削除。リスト内のタスクも削除し、残りのリストのpositionを詰め直す） |
| GET | `/api/tasks` | タスク検索（`keyword` / `priority` / `listId` で絞り込み） |
| GET | `/api/tasks/{id}` | タスク単体取得 |
| POST | `/api/tasks` | タスク新規登録 |
| PUT | `/api/tasks/{id}` | タスク更新（タイトル・優先度・期日） |
| PATCH | `/api/tasks/{id}/position` | タスクのドラッグ&ドロップ移動（リスト間移動を含む） |
| PUT | `/api/tasks/reorder` | リスト内タスクの一括並べ替え |
| DELETE | `/api/tasks/{id}` | タスク削除（物理削除） |

## 前提

- JDK 17

## 起動方法

事前にPostgreSQLコンテナを起動しておく（[データベース](#データベース)を参照）。

```bash
# Linux / macOS / Git Bash
./gradlew bootRun

# Windows (コマンドプロンプト / PowerShell)
gradlew.bat bootRun
```

起動後、`http://localhost:8080` でアプリが待受する。

## 疎通確認

```bash
curl http://localhost:8080/api/hello
# => {"message":"Hello from Spring Boot backend"}
```

## テスト実行

```bash
./gradlew test
```

## データベース

デフォルトではPostgreSQLを使用する。事前にDockerコンテナを起動しておくこと（詳細は[ルートのREADME/docker-compose.yml](../docker-compose.yml)を参照）。

```bash
# リポジトリルートで実行
docker compose up -d db
```

- 接続先: `jdbc:postgresql://localhost:5432/taskboard`（`docker-compose.yml` と対応）
- ユーザー名 / パスワードは `.env`（`.env.example` をコピーして作成）で設定する
- 接続情報は環境変数 `SPRING_DATASOURCE_URL` / `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` でも上書き可能（[application.properties](src/main/resources/application.properties)）

Dockerを使わずに素早く疎通確認したい場合は、`h2` プロファイルでインメモリDB起動もできる（アプリ終了時にデータは消える）。

```bash
./gradlew bootRun --args='--spring.profiles.active=h2'
```

- H2コンソール: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:taskboard`
- ユーザー名: `sa` / パスワード: なし

## 初期データ

DBが空（`boards` が0件）の状態で起動すると、[InitialDataSeeder](src/main/java/com/taskmanagement/backend/config/InitialDataSeeder.java) がボード「マイボード」と初期リスト（To Do / 進行中 / 完了）を作成する。既にデータがある場合は何もしない。

- サンプルタスク（動作確認用の7件）は、`app.seed.sample-tasks=true` のときだけ投入する。既定（PostgreSQL）では投入しない。
- `h2` プロファイルでは `application-h2.properties` で `true` にしているため、サンプルタスクつきで起動する。環境変数 `APP_SEED_SAMPLE_TASKS=false` で無効にできる。

## 今後の予定

- Board（ボード）に対するREST APIの実装（現状は単一ボード運用のため未着手）
- タスク作成・更新時のバリデーションエラーをフォーマットする共通例外ハンドラ（`@ControllerAdvice`）の導入

詳細は[要件定義書](../docs/requirements.md)・[データモデル](../docs/requirements/data-model.md)を参照。
