# Public Release Checklist

公開に進む前に、次の判断と確認を完了します。この文書を追加しただけでは、公開・deployment・release作成は実行されません。

| 項目                 | 現状と公開前の確認                                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project LICENSE      | 自作ソースコード・教材・ドキュメント・UIへMITを適用。[LICENSE](../LICENSE)とpackage metadataへ反映済み                                             |
| MIT copyright holder | 所有者の確定事項：Copyright (c) 2026 guardiancrow                                                                                                  |
| Third-party notices  | [Notice](../THIRD_PARTY_NOTICES.md)を両buildへ同梱し、原文・version・moduleを照合済み。依存更新後と公開直前に再検査する                            |
| GitHub Pages         | Project Pages用baseとHashRouterのlocal buildを準備。公開承認後にdeployment workflow、Pages Settings、公開範囲を確認する                            |
| Public visibility    | GitHub FreeでPublic repositoryとPublic Pagesを採用する方針が確定。現在はPrivate。最終監査・CI成功・明示的承認後に公開する                          |
| Release version      | 次の公開予定版1.0.1をpackage／lockfileへ反映済み。新規tag／Releaseは未作成。既存tagは維持する                                                      |
| GitHub Actions       | 設定をpush後、対象commitとPull RequestのCIが成功することを確認する                                                                                 |
| Dependabot           | Version updatesの設定・ログを確認する。Dependency graph、alerts、security updatesの有効状態はSettingsで確認する                                    |
| 最終privacy scan     | 公開対象refs、commit / tag metadata、messages、全reachable blobsを再検査し、credential・個人用メール・旧identity・絶対ローカルパスの混入を確認する |

## ReviewからCI確認まで

1. ローカル差分と追加ファイルをreviewし、[Development Notes](development.md)の品質検証を実行する。
2. ユーザーが公開用noreply identityを確認してcommitする。今回の推奨messageは`chore: finalize MIT license and v1.0.1 metadata`。
3. Private repositoryへpushし、Actionsタブで対象commitの`CI / Quality checks`を確認する。
4. Pull RequestのCIとDependabotの設定・実行ログを確認する。
5. Phase 20Fで全公開対象refs、PR／Actions履歴、source、配布物を最終監査し、公開対象SHAと承認記録を確認する。

GitHub上のCI実行結果はpush後に確認します。ローカルの品質検証が成功していても、remote CIの成功としては扱いません。

## Pagesの公開承認前

- [Manual QA](manual-qa.md)で通常構成とPages構成のrouting、reload、fragment、skip link、asset取得を確認する。
- 生成したdistを監査し、secret、個人用メール、絶対ローカルパス、source map、Git metadata、テストや監査資料が配信対象に含まれないことを確認する。
- Private repositoryでもPagesサイトがインターネット上で公開される場合がある。Repository visibilityとサイトの公開範囲を別々に判断する。
- 正本のLICENSEとThird-party Noticesが両buildへ完全一致で含まれ、別々のリンクから到達できることを確認する。
- 確定済みのCopyright (c) 2026 guardiancrow、MIT適用範囲、version 1.0.1が公開対象SHAに反映されていることを確認する。
- 次Phaseでdeployment Actionsの公式version・SHA、最小権限、`github-pages` environmentの承認制約を確認する。初回deployにはユーザーの明示的な承認を必要とする。

Phase 20EではPagesの有効化、deployment workflowの追加、artifact upload、Public化、commit / push、tag / Release作成を行わない。LICENSEとnoticeは両buildへ同梱する。既存CIのcontents readを維持し、今回のremote結果はpush後に確認する。Phase 20Dの基準は36 files・268 tests、Phase 20Eは既存268件と追加8件を検証する。

公開手順とenvironmentの条件は[Deployment設計](deployment-plan.md)、確定済みのlicenseとversionは[Release Readiness](release-readiness.md)を参照する。承認済みのcommitを手動deployする方式を採り、初回にpush triggerを設定しない。
