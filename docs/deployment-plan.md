# GitHub Pages公開設計

この文書は次工程の設計です。Deployment workflow、Pages設定、artifact uploadはまだ追加・実行していません。初回公開には所有者の明示的な承認が必要です。

## 公開範囲と契約プラン

個人repositoryのProject Pagesを想定し、URLは`https://guardiancrow.github.io/css-color-lab/`です。Pages buildはbase `/css-color-lab/`、HashRouterを使います。Learnは`#/`、Playgroundは`#/playground`です。

GitHub FreeのPagesはpublic repositoryが対象です。個人のprivate repositoryにはGitHub Proなど対応プランが必要です。契約プランは未確認です。Privateを維持する場合は、Pages対応プランを先に確認します。Publicへ変更する場合は、全履歴・PR・公開ファイルの監査と所有者の承認を先に完了します。[GitHub Pagesの利用条件](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)

Repositoryがprivateでも、この個人Project Pagesのサイトは公開配信として扱います。Enterprise Cloudのorganization向けアクセス制御を、個人repositoryへ適用できると想定しません。[Pagesサイトの公開範囲](https://docs.github.com/en/enterprise-cloud%40latest/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site)

## 初回公開の前提

1. 著作権者、Project LICENSE、version、repositoryとサイトの公開範囲を確定する。
2. 公開予定のcommitと全参照を監査し、そのcommitのremote CI成功を確認する。
3. 所有者が公開対象のfull commit SHAと初回deployを承認する。
4. 次工程でworkflowをreviewし、masterへ反映する。初回は`workflow_dispatch`だけをtriggerとし、pushやPRから起動しない。
5. Settings → PagesでSourceをGitHub Actionsへ設定する。Private維持の場合は契約プランの条件を満たしてから設定する。
6. `github-pages` environmentを設定し、deployment branchをmasterに限定する。利用可能ならrequired reviewersと自己承認禁止を設定する。
7. 所有者がActionsからmasterを選び、承認済みSHAを入力して手動実行する。SiteのHTTP応答、routing、notice、keyboard操作を確認する。

`configure-pages`の`enablement`は既定の`false`を維持し、Settings操作を自動化しません。PATや新規secretsは不要です。[configure-pages inputs](https://github.com/actions/configure-pages/blob/v6.0.0/action.yml)

## Workflowとjobの契約

Workflowは手動入力`release_sha`を必須とし、40桁のSHAであること、eventが`workflow_dispatch`であること、選択branchが`refs/heads/master`であることを検査します。Build対象は入力SHAに固定し、masterから到達可能であることを確認します。履歴確認用checkoutは`fetch-depth: 0`、`persist-credentials: false`とし、checkout後のHEADも入力と照合します。PR event、fork、任意branchからdeployしません。

| Job    | Permissions                                        | 処理                                                                                                 |
| ------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| build  | `contents: read`のみ                               | Node 24、npm ci、format、lint、typecheck、test、通常buildとaudit、Pages buildとaudit、distのみupload |
| deploy | `pages: write`、`id-token: write`、`actions: read` | build成功後、github-pages environmentでconfigure-pagesとdeploy-pagesを実行                           |

Workflow全体は`contents: read`を既定とし、deploy jobで上記権限を明示します。Build jobへ書き込み権限を付与しません。`actions: read`はdeployment artifactの参照に使います。Deploy jobは`needs: build`とenvironment URLを設定し、artifact名`github-pages`をupload／deployで一致させます。Concurrency groupは`pages`、`cancel-in-progress: false`を採用して同時deployを避けます。Secretやtokenをechoしません。[公式custom workflow手順](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[deploy-pages要件](https://github.com/actions/deploy-pages/tree/v5.0.1)

Buildでは次の順で実行します。最後に残るdistはPages用です。Upload対象は`./dist`のみ、hidden filesを含めず、source・node_modules・Git・監査資料はuploadしません。

```bash
npm ci --no-audit --no-fund
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run audit:dist
npm run build:pages
npm run audit:dist -- --pages
```

Environmentの機能にはプラン制約があります。Free／Pro／Teamではrequired reviewersやwait timerはpublic repository向けです。Proでprivate Pagesが使えても、required reviewersが使えるとは限りません。対応するEnterprise機能がない場合は、所有者の承認記録と手動dispatchを初回公開の条件にし、承認gateが自動強制されると記載しません。Workflowを変更できる権限も管理します。[Environmentとプランの条件](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)

## Actions固定値

2026-10-10に公式release tagとGit参照を照合した候補です。正式実装時に安定版、SHA、runner要件を再確認し、tagだけで参照しません。

| Action                        | Stable version | Full commit SHA                            |
| ----------------------------- | -------------- | ------------------------------------------ |
| actions/checkout              | v7.0.1         | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| actions/setup-node            | v7.0.0         | `820762786026740c76f36085b0efc47a31fe5020` |
| actions/configure-pages       | v6.0.0         | `45bfe0192ca1faeb007ade9deae92b16b8254a0d` |
| actions/upload-pages-artifact | v5.0.0         | `fc324d3547104276b827a68afc52ff2a11cc49c9` |
| actions/deploy-pages          | v5.0.1         | `368f82528645a54fb793d4d04e342629a3f51346` |

根拠は各公式release：[checkout](https://github.com/actions/checkout/releases/tag/v7.0.1)、[setup-node](https://github.com/actions/setup-node/releases/tag/v7.0.0)、[configure-pages](https://github.com/actions/configure-pages/releases/tag/v6.0.0)、[upload-pages-artifact](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0)、[deploy-pages](https://github.com/actions/deploy-pages/releases/tag/v5.0.1)です。

## Rollbackと公開停止

公開後に問題があれば、最後に検証済みのmaster上のSHAを、同じ手動承認手順で再build・再deployします。旧tagを移動せず、必要なsource修正は通常の後続commitで行います。Rebaseやforce pushは使いません。初回公開後も自動push deploymentへの移行は別の承認事項です。

公開停止は、先にdeployment workflowを無効化し、Settings → PagesのUnpublish操作を行います。Workflowを再実行すると再公開されるため、停止中は実行しません。Repositoryのvisibility変更だけを停止手段にしません。[公式unpublish手順](https://docs.github.com/en/pages/getting-started-with-github-pages/unpublishing-a-github-pages-site)

Public化後のclone、第三者の保存物、cacheを回収できるとは想定しません。Credential流出の場合は公開停止だけで解決せず、該当credentialの失効・更新を先に行います。
