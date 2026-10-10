# Public Release Checklist

2026-10-10時点でRepositoryはPublic、[GitHub Pages](https://guardiancrow.github.io/css-color-lab/)は公開済みで、Firefox・Edgeの実サイトQAを完了しています。以下は公開後の更新と正式リリースの確認手順です。この文書は操作の承認を代替しません。

| 項目                 | 現状とリリース時の確認                                                                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project LICENSE      | 自作ソースコード・教材・ドキュメント・UIへMITを適用。[LICENSE](../LICENSE)とpackage metadataへ反映済み                                             |
| MIT copyright holder | 所有者の確定事項：Copyright (c) 2026 guardiancrow                                                                                                  |
| Third-party notices  | [Notice](../THIRD_PARTY_NOTICES.md)を両buildへ同梱し、原文・version・moduleを照合済み。依存更新後と公開直前に再検査する                            |
| GitHub Pages         | base `/css-color-lab/`とHashRouterで公開済み。更新は承認済みfull SHAの手動deployと実サイトQAで確認する                                             |
| Public visibility    | GitHub FreeのPublic repositoryとPublic Pagesを使用                                                                                                 |
| Release version      | package／lockfileは1.0.1。正式リリースのtag・Releaseは下記手順で対象SHAと照合し、既存tagは維持する                                                 |
| GitHub Actions       | 新しい対象commitのCI成功とPages deployment成功を個別に確認する                                                                                     |
| Dependabot           | npm通常version updatesは上限0、Actionsは5。Security updates ONを維持し、未解決alertsとnpm auditを再確認する                                        |
| 最終privacy scan     | 公開対象refs、commit / tag metadata、messages、全reachable blobsを再検査し、credential・個人用メール・旧identity・絶対ローカルパスの混入を確認する |

## ReviewからCI確認まで

1. ローカル差分と追加ファイルをreviewし、[Development Notes](development.md)の品質検証を実行する。
2. 所有者が承認済みの公開用noreply identityを確認してcommitする。
3. originへpushし、新しいfull SHAを確定してActionsタブでそのcommitの`CI / Quality checks`の成功を確認する。
4. Pull RequestのCIとDependabotの設定・実行ログを確認する。
5. 新SHAの差分・配布物・securityへの影響を確認する。過去Phaseの監査やCI成功を新SHAへ自動適用しない。新たなrefsやPR／Actionsの変更があれば該当範囲を再監査する。

GitHub上のCI実行結果はpush後に確認します。ローカルの品質検証が成功していても、remote CIの成功としては扱いません。

## Pages更新の承認前

- [Manual QA](manual-qa.md)で通常構成とPages構成のrouting、reload、fragment、skip link、asset取得を確認する。
- 生成したdistを監査し、secret、個人用メール、絶対ローカルパス、source map、Git metadata、テストや監査資料が配信対象に含まれないことを確認する。
- RepositoryとPagesがどちらもPublicであることを確認する。
- 正本のLICENSEとThird-party Noticesが両buildへ完全一致で含まれ、別々のリンクから到達できることを確認する。
- 確定済みのCopyright (c) 2026 guardiancrow、MIT適用範囲、version 1.0.1が公開対象SHAに反映されていることを確認する。
- 既存deployment workflowの固定SHA、最小権限、`github-pages` environmentのmaster制限と承認制約を維持する。更新も承認済みfull SHAで手動実行する。

## v1.0.1 tag／GitHub Release

1. 文書差分のreview、所有者のcommit／push、新full SHAのCI成功確認を完了する。
2. 所有者が承認した新SHAで既存Pages workflowをmasterから手動実行する。配布物監査、upload、deployの成功と入力SHA・build対象SHAの一致を確認する。
3. 公開URLでFirefox・Edgeのrouting、reload、fragment、skip link、LICENSE／Notices、Console／Networkを確認する。
4. Tag／Release作成の承認後、検証済みの新full SHAへannotated tag `v1.0.1`を作成する。Tag messageは`v1.0.1`、identityは既存の承認済みGitHub noreplyを使用する。既存tagを変更せず、force操作は行わない。
5. `v1.0.1`だけをoriginへpushし、GitHub上のtagが指すcommitを新SHAと照合する。Annotated tag objectのSHAと対象commitのSHAを区別する。
6. GitHubのReleasesで既存tag `v1.0.1`を選び、review済みの日本語Release Notesを掲載する。自動生成本文は無確認で採用しない。Prereleaseを選択せず正式Releaseとして公開する。[GitHub公式手順](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
7. Tagの対象commit、Releaseのtagが指すcommit、master、Pagesのbuild対象SHAが一致することを最終確認する。途中でmasterが進んだ場合は対象を再確定し、検証をやり直す。

独自のbinary artifactはReleaseへ追加しません。GitHubが提供するsource archiveはtagのソースであり、build済みPages配布物ではありません。既存`v1.0.0-rc.1`／`v1.0.0`は保持し、npm publishやhistory rewriteは行いません。

## 初回公開前の記録

Phase 20EではPagesの有効化、deployment workflowの追加、artifact upload、Public化、commit / push、tag / Release作成を行わない。LICENSEとnoticeは両buildへ同梱する。既存CIのcontents readを維持し、今回のremote結果はpush後に確認する。Phase 20Dの基準は36 files・268 tests、Phase 20Eは既存268件と追加8件を検証する。

公開手順とenvironmentの条件は[Deployment設計](deployment-plan.md)、確定済みのlicenseとversionは[Release Readiness](release-readiness.md)を参照する。承認済みのcommitを手動deployする方式を採り、初回にpush triggerを設定しない。
