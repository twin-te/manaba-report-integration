# Repository

外部サービスと連携するためのプログラムが設置される

# 新しい外部サービスの追加

`Repository` クラスを継承し、必要なメソッドを実装する。
詳細はソースコードのコメントを参照。

実装したクラスを `repositoryManager.ts` の `repositories` に追加する。

## 実装上の注意
- chrome のストレージを使う場合は、`this.writeChromeStorage`、`this.readChromeStorage` を使用すること。（レポジトリごとにプレフィックスがつく）
- パブリックキーも含め、可換なキーはハードコーディングせず、極力 `src/config/config.json` に記述し、インポートすること。

## 動作確認
`yarn build` を実行すると`dist`にファイルが吐かれるので、chromeでそのディレクトリを読み込むと試用できる。
作成したレポジトリがポップアップ内のサービス一覧に表示されるはず。