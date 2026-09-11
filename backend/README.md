# バックエンド（Spring Boot）

タスクボードアプリのバックエンド。[技術スタック](../docs/requirements/tech-stack.md)に基づき、Java / Spring Boot / Gradle / Spring Data JPA で構成する。

現時点では起動確認用の最小構成のみで、Board / List / Card のAPIは未実装。

## 前提

- JDK 17

## 起動方法

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

デフォルトではH2インメモリDBを使用する（アプリ終了時にデータは消える）。

- H2コンソール: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:taskboard`
- ユーザー名: `sa` / パスワード: なし

将来PostgreSQLへ切り替える際は、[application.properties](src/main/resources/application.properties) 内のH2設定をコメントアウトし、コメントアウトされているPostgreSQL用設定を有効化する。あわせて [build.gradle.kts](build.gradle.kts) の `org.postgresql:postgresql` 依存関係のコメントも解除する。

## 今後の予定

- Board / List / Card のJPAエンティティ・リポジトリの実装
- 各エンティティに対するREST API（Controller / Service層）の実装
- PostgreSQLへの切り替え

詳細は[要件定義書](../docs/requirements.md)・[データモデル](../docs/requirements/data-model.md)を参照。
