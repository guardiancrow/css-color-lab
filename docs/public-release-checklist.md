# Public Release Checklist

公開に進む前に、次の判断と確認を完了します。この文書を追加しただけでは、公開・deployment・release作成は実行されません。

| 項目                 | 現状と公開前の確認                                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project LICENSE      | 未設定。採用licenseとcopyright holderをユーザーが確定し、LICENSEとpackage metadataへ反映する                                                       |
| MIT copyright holder | 未確定。Git authorだけを根拠に著作権者を決めない                                                                                                   |
| Third-party notices  | [Notice](../THIRD_PARTY_NOTICES.md)を両buildへ同梱し、原文・version・moduleを照合済み。依存更新後と公開直前に再検査する                            |
| GitHub Pages         | Project Pages用baseとHashRouterのlocal buildを準備。公開承認後にdeployment workflow、Pages Settings、公開範囲を確認する                            |
| Public visibility    | Privateを維持する。最終監査後にユーザーが公開を判断する                                                                                            |
| Release version      | アプリversionは1.0.0。公開準備の変更をどのreleaseへ含めるかと、v1.0.1の要否を決定する。既存tagは維持する                                           |
| GitHub Actions       | 設定をpush後、対象commitとPull RequestのCIが成功することを確認する                                                                                 |
| Dependabot           | Version updatesの設定・ログを確認する。Dependency graph、alerts、security updatesの有効状態はSettingsで確認する                                    |
| 最終privacy scan     | 公開対象refs、commit / tag metadata、messages、全reachable blobsを再検査し、credential・個人用メール・旧identity・絶対ローカルパスの混入を確認する |

## ReviewからCI確認まで

1. ローカル差分と追加ファイルをreviewし、[Development Notes](development.md)の品質検証を実行する。
2. ユーザーが公開用noreply identityを確認してcommitする。今回の推奨messageは`chore: finalize public release readiness checks`。
3. Private repositoryへpushし、Actionsタブで対象commitの`CI / Quality checks`を確認する。
4. Pull RequestのCIとDependabotの設定・実行ログを確認する。
5. 上表の未決事項を判断し、公開直前のprivacy scanを実施する。

GitHub上のCI実行結果はpush後に確認します。ローカルの品質検証が成功していても、remote CIの成功としては扱いません。

## Pagesの公開承認前

- [Manual QA](manual-qa.md)で通常構成とPages構成のrouting、reload、fragment、skip link、asset取得を確認する。
- 生成したdistを監査し、secret、個人用メール、絶対ローカルパス、source map、Git metadata、テストや監査資料が配信対象に含まれないことを確認する。
- Private repositoryでもPagesサイトがインターネット上で公開される場合がある。Repository visibilityとサイトの公開範囲を別々に判断する。
- LICENSEとcopyright holderを確定し、公開release versionを決定する。
- 次Phaseでdeployment Actionsの公式version・SHA、最小権限、`github-pages` environmentの承認制約を確認する。初回deployにはユーザーの明示的な承認を必要とする。

Phase 20DではPagesの有効化、deployment workflowの追加、artifact upload、Public化、commit / push、tag / Release作成を行わない。Noticeは両buildへ同梱済みで、CIに配布物監査を追加している。ローカル検証の基準は36 files・268 tests。今回のremote CIはpush後に確認する。

公開手順と契約プラン・environmentの条件は[Deployment設計](deployment-plan.md)、copyright holderとversionの候補は[Release Readiness](release-readiness.md)を参照する。承認済みのcommitを手動deployする方式を採り、初回にpush triggerを設定しない。
