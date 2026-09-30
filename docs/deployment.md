# AWSデプロイ手順

このプロジェクトをAWS上にデプロイするための構成・手順をまとめる。TerraformでIaC(Infrastructure as Code)として管理し、AWSマネジメントコンソールの手動操作は初回のIAMユーザー作成のみに限定する。

## 前提・方針

- 個人利用・認証なしの学習用アプリであり、不特定多数への公開は想定しない。
- スクール課題としての実施のため、基本はコスト最小構成とするが、学習目的でDBのみ本物のAWS RDSを利用する。
- ALB、NAT Gateway、ECS/App Runner等、他の常時課金が発生するマネージドサービスは使わない。

## 構成

フロントエンド・バックエンドはEC2インスタンス1台の上でDocker Composeにより動かし、DBはRDS(PostgreSQL)に分離している。

```
自分のPC(許可したグローバルIPのみ) → EC2 t3.micro(Elastic IP)
                                       └ docker compose
                                           ├ frontend(nginx): 静的ファイル配信 + /api/ をbackendへプロキシ
                                           └ backend(Spring Boot)
                                                 │ 5432番(EC2のセキュリティグループのみ許可)
                                                 ▼
                                           RDS for PostgreSQL(db.t4g.micro, publicly_accessible=false)
```

- **アクセス制限(Web)**: セキュリティグループで80番ポートを自分のグローバルIPのみに許可。全世界公開はしない。
- **アクセス制限(DB)**: RDSは`publicly_accessible=false`。RDS用セキュリティグループはEC2のセキュリティグループからの5432番のみ許可。VPCは既存のデフォルトVPC・デフォルト(パブリック)サブネットを使うが、NAT Gatewayは使わずRDS側の設定のみで外部到達を遮断している。
- **サーバーへのログイン**: SSHではなくAWS Systems Manager (SSM) Session Managerを使用。22番ポートは開放しない。
- **DBパスワード**: Terraformの`random_password`で生成し、SSM Parameter Store(SecureString)経由でEC2に配布。リポジトリにもコンテナイメージにも平文では残さない。
- **コスト監視**: AWS Budgetsで月$1を超えたらメール通知する設定を入れている(RDS追加後は目安月$13〜15程度となり、閾値はすぐ超過するが意図的にそのまま運用している)。

## ディレクトリ構成

| パス | 役割 |
| --- | --- |
| `infra/main.tf` | EC2、RDS、セキュリティグループ、IAMロール(SSM用)、Elastic IP、予算アラート、DBパスワード(random_password + SSM Parameter)の定義 |
| `infra/variables.tf` | リージョン、インスタンスタイプ、許可IP、通知先メール等の変数定義 |
| `infra/outputs.tf` | apply後に表示されるアプリURL・インスタンスID・RDSエンドポイント |
| `infra/user_data.sh.tftpl` | EC2初回起動時に実行されるスクリプト(スワップ追加、Docker導入、リポジトリclone、SSMからDBパスワード取得、`docker compose up`) |
| `infra/terraform.tfvars` | 実際の値(自分のIP、通知先メール)。**gitignore対象、リポジトリには含まれない** |
| `infra/terraform.tfvars.example` | `terraform.tfvars`のひな形 |
| `backend/Dockerfile` | Spring Bootのビルド・実行用イメージ |
| `frontend/Dockerfile` | Reactのビルド + nginxでの配信用イメージ |
| `frontend/nginx.conf` | `/api/`をbackendコンテナへプロキシする設定 |
| `docker-compose.prod.yml` | EC2上で2コンテナ(frontend/backend)を起動する構成。DBはRDSに分離済み |

## AWSアカウントとの認証設定

1. IAMで管理者権限を持つCLI専用ユーザーを作成(コンソールログインは許可しない)し、アクセスキーを発行。
2. ローカルで `aws configure` を実行し、アクセスキー・シークレットキー・リージョン(`ap-northeast-1`)・出力形式(`json`)を設定。
3. `aws sts get-caller-identity` でアカウントID・ユーザーARNが返ることを確認。

Terraformはこのローカルの認証情報(`~/.aws/credentials`)をそのまま利用する。

## 操作コマンド

`infra/` ディレクトリで実行する。

```powershell
# 初回のみ: プロバイダのダウンロード等
terraform init

# 変更内容の確認(ドライラン、何も作成・変更されない)
terraform plan

# 実際にAWS上へ反映(課金対象のリソースが作成される)
terraform apply

# 使い終わったら全リソースを削除
terraform destroy
```

`terraform.tfvars` に以下を設定しておく必要がある(値は各自の環境に合わせる)。

```hcl
my_ip_cidr   = "<自分のグローバルIP>/32"
budget_email = "<通知先メールアドレス>"
```

## 現在の状態

- [x] AWS CLI / Terraformのインストール
- [x] IAMユーザー作成・認証設定・動作確認
- [x] Dockerfile / docker-compose.prod.yml / Terraformコードの作成、`main`へのマージ
- [x] `terraform plan` による内容確認(作成予定7リソース、エラーなし)
- [x] `terraform apply` の実行(EC2・Elastic IP等7リソースを作成済み)
- [x] EC2上でのアプリ起動確認(自分のPCから`http://<Elastic IP>`へアクセスし、フロント・API双方200 OKを確認)
- [x] DBをEC2上のコンテナからRDS(PostgreSQL)へ移行(PR #21)。EC2からのみ接続可能な設定で`apply`・動作確認済み
- [ ] 課題提出後の `terraform destroy` によるリソース削除

デプロイ済みのURLは `terraform output app_url`、RDSのエンドポイントは `terraform output rds_endpoint` で確認できる。

## RDS移行後の動作確認結果

| テスト | 結果 |
|---|---|
| バックエンドのログ(HikariPool) | RDSエンドポイントへの接続を確立 |
| フロント・API疎通(`http://<Elastic IP>/`、`/api/tasks`) | 200 OK |
| EC2ホストから`psql`でRDSへ直接接続 | 成功。`boards` / `lists` / `tasks` テーブルを確認(Hibernateの`ddl-auto=update`により自動作成) |
| 自分のPCからRDSエンドポイントの5432番へ接続 | 失敗(タイムアウト)。想定通り外部から到達不可 |

## デプロイ時に見つかった不具合と対応

実際に`terraform apply`してEC2上でアプリを動かす過程で、ローカル開発では気づかなかった不具合が2件見つかった。

1. **`docker compose build`がbuildxを要求して失敗**: EC2にbuildxプラグインを入れていないため。`DOCKER_BUILDKIT=0` / `COMPOSE_DOCKER_CLI_BUILD=0` を設定し、classicビルダーを使うよう`infra/user_data.sh.tftpl`を修正(PR #17)。
2. **`backend/gradlew`の`CLASSPATH`代入行が破損**: 標準のGradle wrapperスクリプトと異なり、エスケープ文字(`\"`)が値にそのまま混入していた。`java`に渡るクラスパスが不正な文字列になり、`Could not find or load main class org.gradle.wrapper.GradleWrapperMain`でビルドが失敗していた。標準の記述`CLASSPATH=$APP_HOME/gradle/wrapper/gradle-wrapper.jar`に戻して解消(PR #18)。ローカルのDockerコンテナ(`eclipse-temurin:17-jdk`)で`./gradlew --version`を実行するとクリーンな環境で再現・検証できる。

## EC2上での再デプロイ手順(コード変更後)

`main`にマージ済みの最新コードをEC2に反映する場合、インスタンスを作り直さずSSM経由で更新できる。

```powershell
aws ssm send-command --instance-ids <instance_id> --document-name "AWS-RunShellScript" --parameters '{"commands":[
  "cd /opt/app",
  "git fetch origin",
  "git reset --hard origin/main",
  "export DOCKER_BUILDKIT=0",
  "export COMPOSE_DOCKER_CLI_BUILD=0",
  "docker compose -f docker-compose.prod.yml up -d --build"
]}' --timeout-seconds 900

# 完了確認
aws ssm get-command-invocation --command-id <command_id> --instance-id <instance_id>
```

Dockerの旧イメージ層がキャッシュされて変更が反映されないことがあるため、コード修正を反映したのにビルド結果が変わらない場合は `docker compose build --no-cache` を挟む。

## 注意点

- 無料枠の条件はAWSアカウントの作成時期によって異なる(2025年7月以降作成のアカウントは期間限定のクレジット制)。Billingコンソールの「Free Tier」ページで自分のアカウントの条件を確認すること。
- RDS(`db.t4g.micro` + 20GB gp3)追加後は、EC2単体構成時より確実にコストが増える(目安月$13〜15程度、東京リージョン・Single-AZ)。クレジット制なので動かした分だけ消費される。
- Budgetsの閾値($1)は据え置いているため、RDS稼働中はほぼ常に通知が届く状態になる。これは意図した運用であり、実際の請求上限を止めるものではない点に注意。
- Elastic IPはインスタンス起動中は無料枠内だが、インスタンスを停止したまま放置すると課金対象になるため、使い終わったら `terraform destroy` するか再アタッチすること。
- RDSは`terraform destroy`で削除可能(`skip_final_snapshot = true`のためスナップショット課金は発生しない)。一時停止したいだけなら`aws rds stop-db-instance`も使えるが、最大7日間で自動再開し、停止中もストレージ分の課金は残る。完全に$0にしたい場合は`destroy`が確実。
- `terraform.tfvars` にはグローバルIPやメールアドレスが含まれるため、リポジトリにコミットしない(`.gitignore`で除外済み)。

## 関連PR

- #17, #18: EC2上での初回デプロイ時に見つかった不具合修正(buildx、gradlewのCLASSPATH破損)
- #20: DBをEC2ホストのlocalhostのみに公開(RDS移行前の暫定対応)
- #21: DBをEC2上のコンテナからRDSへ移行
