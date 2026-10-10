# 公開前の判断と検証

Phase 20Dでは、ライセンス同梱、配布物検査、deployment設計を整備しています。Project LICENSEの権利者と公開判断は未確定です。公開完了を示す文書ではありません。

## 第三者ライセンスの配布

`THIRD_PARTY_NOTICES.md`を正本とし、Vite build pluginが通常build／Pages buildのdistへ同じ内容で出力します。画面末尾の「第三者ライセンス」はViteのbase URLを使い、通常は`/THIRD_PARTY_NOTICES.md`、Pagesでは`/css-color-lab/THIRD_PARTY_NOTICES.md`へリンクします。Markdown原文を配布し、必要な著作権表示とpermission本文を保持します。

| 方法                    | 評価                                                                        |
| ----------------------- | --------------------------------------------------------------------------- |
| public配下へ手動複製    | 正本と二重管理になり、不一致を招く                                          |
| Nodeでbuild後copy       | 追加依存なしで実装できるが、bundle生成中のmodule確認には別の処理が必要      |
| Vite pluginで正本をemit | 追加依存なし。生成中のmodule照合とnotice出力を同じbuildで実施できるため採用 |

Pluginはlockfile、installed packageのversion・MIT metadata、ライセンス原文、noticeのversion表を照合します。Runtime依存8 packageとVite／Rolldownのhelperを対象にし、未確認packageやvirtual moduleが出力chunkに現れた場合は失敗します。Rolldown付属のthird-party license原文も同梱します。Tree shakingで配布されないproduction依存のnoticeも保持します。

`npm run audit:dist`と`npm run audit:dist -- --pages`は、index、JS、CSS、notice、base URL、notice本文の一致、リンクURL、許可file、代表的なcredential・email・ローカルpathを検査します。Source map、hidden file、環境設定、Git資料、想定外のファイルやsymlinkは許可しません。依存更新時は両buildと検査を再実行し、新しい依存の条件を人が確認してから検査対象を更新します。Scanで未知の秘密情報や権利関係すべてを保証することはできません。

MITのcopyright／permission条件を、Apache-2.0、MPL-2.0、CC-BY-4.0の条件へ流用しません。TypeScript、Lightning CSS、caniuse-liteは今回のbrowser moduleに含まれていません。将来実際に同梱される場合は、その原文・NOTICE・source提供・attribution条件を別途確認します。[MIT原文](https://opensource.org/license/mit)

## Project LICENSEの判断

Project sourceへMITを適用する意向はありますが、copyright holderは所有者が確定します。候補は実名、活動名・ハンドルネーム（例：guardiancrow）、その他の権利者表記です。Git author／committerだけを根拠に決定しません。外部由来のsourceや素材への権利、共同著作者の有無、対象年も確認します。

確定後、次工程でMIT原文の`LICENSE`へ承認された年・権利者表記を入れ、package metadataへ`"license": "MIT"`を追加し、READMEを更新します。それまではLICENSEもMIT metadataも追加しません。第三者noticeはProject自体へlicenseを付与するものではありません。

## Release version

| 候補                          | 利点・注意点                                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1.0.0を維持し後続commitを公開 | アプリ完成版のversionを維持できる。既存v1.0.0 tagと公開siteのsourceが一致しないため、公開SHAを明示する必要がある |
| 1.0.1として公開               | 配布notice・hosting対応の修正を完成版から区別し、package、tag、site、Releaseのsourceを揃えやすい                 |

公開準備後の版を識別しやすいため1.0.1を推奨候補としますが、今回versionは変更しません。配布修正を互換性のあるbug fixと扱うならpatch releaseと整合します。公開仕様の機能追加と定義する場合はversion方針を再評価します。[Semantic Versioning](https://semver.org/)

既存の`v1.0.0-rc.1`と`v1.0.0`は保存します。1.0.0を維持する場合も既存tagを後続commitへ移動しません。新規tag／GitHub Releaseは所有者の最終判断後に作成します。`private: true`はnpm publish抑制のため維持します。

## Dependabotと承認順序

既存のruntime minor／patch、tooling minor／patch、Vitest major更新PRは、現在のlockfileを使う公開準備と分けてreviewします。取得した更新内容だけから公開前の必須更新とは判断していません。Security alertsの確認は別途必要です。Vitest majorは移行と検証を別工程にし、TypeScript major更新の既存ignoreを維持します。Mergeした場合はlicenseと配布物監査をやり直します。

1. 今回の差分・検証結果をreviewし、所有者がcommit／private repositoryへpushする。
2. 対象commitのremote CI成功を確認する。
3. 権利者表記・年・MIT適用対象を確定し、LICENSEとmetadataを反映して再検証する。
4. Release versionと公開SHAを確定し、全公開対象refs、PR履歴、source、配布物を再監査する。
5. Repositoryをpublicにするか、privateを維持して対応プランを使うかを判断する。個人Pagesのsiteは公開配信として承認する。
6. [Deployment設計](deployment-plan.md)に沿ってworkflowとSettingsをreviewし、初回公開を明示的に承認して手動deployする。
7. 公開siteを確認し、承認されたversionのtag／Releaseを作成する。

Public化がFree Pagesの前提となる場合は、deployより先にPublic化を承認・実施します。Private維持の場合は対応プランを確認します。いずれもPRや通常pushだけで初回公開しません。
