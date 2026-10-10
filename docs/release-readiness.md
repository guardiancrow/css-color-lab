# 公開前の判断と検証

Phase 20Eでは所有者の確定事項を実装しています。自作部分のMIT License、Copyright (c) 2026 guardiancrow、次の公開予定版1.0.1、GitHub FreeでPublic repositoryとPublic Pagesを採用する方針が確定しました。現在のrepositoryはPrivateで、最終監査・公開承認待ちです。公開・deployment・tag／Release作成は未実施です。

## 第三者ライセンスの配布

`THIRD_PARTY_NOTICES.md`を正本とし、Vite build pluginが通常build／Pages buildのdistへ同じ内容で出力します。画面末尾の「第三者ライセンス」はViteのbase URLを使い、通常は`/THIRD_PARTY_NOTICES.md`、Pagesでは`/css-color-lab/THIRD_PARTY_NOTICES.md`へリンクします。Markdown原文を配布し、必要な著作権表示とpermission本文を保持します。

| 方法                    | 評価                                                                        |
| ----------------------- | --------------------------------------------------------------------------- |
| public配下へ手動複製    | 正本と二重管理になり、不一致を招く                                          |
| Nodeでbuild後copy       | 追加依存なしで実装できるが、bundle生成中のmodule確認には別の処理が必要      |
| Vite pluginで正本をemit | 追加依存なし。生成中のmodule照合とnotice出力を同じbuildで実施できるため採用 |

Pluginはlockfile、installed packageのversion・MIT metadata、ライセンス原文、noticeのversion表を照合します。Runtime依存8 packageとVite／Rolldownのhelperを対象にし、未確認packageやvirtual moduleが出力chunkに現れた場合は失敗します。Rolldown付属のthird-party license原文も同梱します。Tree shakingで配布されないproduction依存のnoticeも保持します。

`npm run audit:dist`と`npm run audit:dist -- --pages`は、index、JS、CSS、LICENSE、notice、base URL、正本との一致、リンクURL、許可file、代表的なcredential・email・ローカルpathを検査します。Source map、hidden file、環境設定、Git資料、想定外のファイルやsymlinkは許可しません。依存更新時は両buildと検査を再実行し、新しい依存の条件を人が確認してから検査対象を更新します。Scanで未知の秘密情報や権利関係すべてを保証することはできません。

MITのcopyright／permission条件を、Apache-2.0、MPL-2.0、CC-BY-4.0の条件へ流用しません。TypeScript、Lightning CSS、caniuse-liteは今回のbrowser moduleに含まれていません。将来実際に同梱される場合は、その原文・NOTICE・source提供・attribution条件を別途確認します。[MIT原文](https://opensource.org/license/mit)

## Project LICENSEの適用

所有者の決定に基づき、自作ソースコード・教材・ドキュメント・UIへMITを適用します。Rootの[LICENSE](../LICENSE)には`Copyright (c) 2026 guardiancrow`と標準のpermission・notice保持条件・免責本文を記載しています。Git identityから権利者を推測したものではありません。[OSI原文](https://opensource.org/license/mit)、[SPDX MIT](https://spdx.org/licenses/MIT.html)と照合しました。

Package metadataは`"license": "MIT"`です。第三者ライブラリや外部由来の著作物には元のライセンスが適用され、Project LICENSEで置き換えません。Third-party noticeは別の文書として維持します。

Vite pluginがrootのLICENSEを正本として両buildへ出力します。配布物では正本と内容が完全一致することを検査し、正本のMIT本文・年・権利者は承認済み本文のSHA-256で照合します（改行と端の空白のみ正規化）。「MITライセンス」のURLは通常`/LICENSE`、Pagesでは`/css-color-lab/LICENSE`です。

## Release version

次の公開予定版は1.0.1に確定し、package.jsonとlockfileのroot metadataを更新しました。依存versionは変更していません。既存v1.0.0はアプリ完成時点、1.0.1はライセンス配布・公開準備を反映した版として区別します。

既存の`v1.0.0-rc.1`と`v1.0.0`は保存します。`v1.0.1` tag／GitHub Releaseは今回作成せず、最終監査と公開後QAの承認に合わせて後続工程で作成します。`private: true`はnpm publish抑制のため維持します。

## Dependabotと承認順序

既存のruntime minor／patch、tooling minor／patch、Vitest major更新PRは、現在のlockfileを使う公開準備と分けてreviewします。取得した更新内容だけから公開前の必須更新とは判断していません。Security alertsの確認は別途必要です。Vitest majorは移行と検証を別工程にし、TypeScript major更新の既存ignoreを維持します。Mergeした場合はlicenseと配布物監査をやり直します。

1. 今回の差分・検証結果をreviewし、所有者がcommit／private repositoryへpushする。
2. 対象commitのremote CI成功を確認する。
3. Phase 20Fで全公開対象refs、PR／Actions履歴、source、配布物を最終監査し、公開対象SHAを確定する。
4. Privateのまま[手動workflow](../.github/workflows/pages.yml)をreviewし、所有者が別工程でcommit／pushする。追加後の新しいfull SHAについて差分・権限・trigger・uploadを再監査し、そのSHAのremote CI成功を確認する。Phase 20Fの合格を新commitへ自動適用しない。
5. Settings確認と新SHAの監査・CI成功後、所有者がPublic化と初回deployを明示的に承認する。承認後にrepositoryをPublicへ変更する。
6. [Deployment設計](deployment-plan.md)に沿ってPagesとgithub-pages environmentを設定し、承認済みfull SHAを指定して手動deployする。GitHub FreeのPrivate状態ではこれらの実設定を行わない。
7. 公開siteを確認し、承認されたversionのtag／Releaseを作成する。

Public化をdeployより先に承認・実施します。Deployは承認済みSHAを指定した手動実行に限り、PRや通常pushだけで初回公開しません。

所有者の確認では、Phase 20Dのmaster CI #38025027169はSuccessです。失敗した#38025249836はDependabot PR #2で、Vite 8.3.3とnoticeの8.2.1の不一致を意図どおり検出した結果です。Phase 20Eへ依存更新を取り込まず、照合を弱めません。Phase 20Eのremote CI結果はcommit／push後に別途確認します。
