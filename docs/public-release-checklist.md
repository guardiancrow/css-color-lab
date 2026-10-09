# Public Release Checklist

公開に進む前に、次の判断と確認を完了します。この文書を追加しただけでは、公開・deployment・release作成は実行されません。

| 項目                 | 現状と公開前の確認                                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project LICENSE      | 未設定。採用licenseとcopyright holderをユーザーが確定し、LICENSEとpackage metadataへ反映する                                                       |
| MIT copyright holder | 未確定。Git authorだけを根拠に著作権者を決めない                                                                                                   |
| Third-party notices  | [既存notice](../THIRD_PARTY_NOTICES.md)を、公開時のlockfile・installed license・bundle内容と照合する                                               |
| GitHub Pages         | Hosting方式、公開URL、Vite base、routing / 404対応を決定し、別Phaseで検証する                                                                      |
| Public visibility    | Privateを維持する。最終監査後にユーザーが公開を判断する                                                                                            |
| Release version      | アプリversionは1.0.0。公開準備の変更をどのreleaseへ含めるかと、v1.0.1の要否を決定する。既存tagは維持する                                           |
| GitHub Actions       | 設定をpush後、対象commitとPull RequestのCIが成功することを確認する                                                                                 |
| Dependabot           | Version updatesの設定・ログを確認する。Dependency graph、alerts、security updatesの有効状態はSettingsで確認する                                    |
| 最終privacy scan     | 公開対象refs、commit / tag metadata、messages、全reachable blobsを再検査し、credential・個人用メール・旧identity・絶対ローカルパスの混入を確認する |

## ReviewからCI確認まで

1. ローカル差分と追加ファイルをreviewし、[Development Notes](development.md)の品質検証を実行する。
2. ユーザーが公開用noreply identityを確認してcommitする。推奨messageは`ci: add GitHub Actions and Dependabot configuration`。
3. Private repositoryへpushし、Actionsタブで対象commitの`CI / Quality checks`を確認する。
4. Pull RequestのCIとDependabotの設定・実行ログを確認する。
5. 上表の未決事項を判断し、公開直前のprivacy scanを実施する。

GitHub上のCI実行結果はpush後に確認します。ローカルの品質検証が成功していても、remote CIの成功としては扱いません。
