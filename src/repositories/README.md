# Repository

外部サービスと連携するためのプログラムが設置される

# 新しい外部サービスの追加

`Repository` クラスを継承し、必要なメソッドを実装する。
詳細はソースコードのコメントを参照。

実装したクラスを `repositoryManager.ts` の `repositories` に追加する。

## 実装上の注意
- chrome のストレージを使う場合は、`this.writeChromeStorage`、`this.readChromeStorage` を使用すること。（レポジトリごとにプレフィックスがつく）
- パブリックキーも含め、可換なキーはハードコーディングせず、極力 `src/config/config.json` に記述し、インポートすること。

## 各種サービスの設定

### Google Calender
WIP

### Trello

1. Trelloにログインする
2. https://trello.com/app-key にアクセスする
    1. 開発者契約に同意してAPI キーを表示する。
    2. 「許可されたオリジン」に `https://gbcijpgbppbphpikpdohpgmpcgdemnai.chromiumapp.org` を追加する
3. config.json の`trello`オブジェクトをセットする
    - `app_name`: なんでも良い
    - `key`: 先ほど取得したAPIキー
    - `scope`: `read,write`

### GitHub Project V2 (beta)

1. GitHub の OAuth App を作成する
    1. GitHub App とは別物なので間違わないこと
    1. 作り方は[OAuthアプリの作成 - GitHub Docs](https://docs.github.com/ja/developers/apps/building-oauth-apps/creating-an-oauth-app) を参照
    1. Device Flow を使用するので
        1. Enable Device Flow をチェック
        1. Authorization callback URL は使用しないので適当な URL で良い
1. config.json のフィールドに GitHub によって発行された `client_id` をセットする
1. config.json の `scope` フィールドに `repo, project` をセットする

## 動作確認
`yarn build` を実行すると`dist`にファイルが吐かれるので、chromeでそのディレクトリを読み込むと試用できる。
作成したレポジトリがポップアップ内のサービス一覧に表示されるはず。
