# バックエンド（Spring Boot）

タスクボードアプリのバックエンド。[技術スタック](../docs/requirements/tech-stack.md)に基づき、Java / Spring Boot / Gradle / Spring Data JPA で構成する。

Board / List / Card のJPAエンティティ・リポジトリと、Card / List に対するREST APIを実装済み。

## API

| メソッド | パス | 内容 |
| --- | --- | --- |
| GET | `/api/lists` | リスト一覧取得（position順） |
| GET | `/api/cards` | カード検索（`keyword` / `priority` / `listId` で絞り込み） |
| GET | `/api/cards/{id}` | カード単体取得 |
| POST | `/api/cards` | カード新規登録 |
| PUT | `/api/cards/{id}` | カード更新（タイトル・優先度・期日） |
| PATCH | `/api/cards/{id}/position` | カードのドラッグ&ドロップ移動（リスト間移動を含む） |
| PUT | `/api/cards/reorder` | リスト内カードの一括並べ替え |
| DELETE | `/api/cards/{id}` | カード削除（物理削除） |

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

## 今後の予定

- Board（ボード）に対するREST APIの実装（現状は単一ボード運用のため未着手）
- カード作成・更新時のバリデーションエラーをフォーマットする共通例外ハンドラ（`@ControllerAdvice`）の導入

詳細は[要件定義書](../docs/requirements.md)・[データモデル](../docs/requirements/data-model.md)を参照。
