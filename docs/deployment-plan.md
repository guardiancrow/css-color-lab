# GitHub Pages公開設計

2026-10-10時点でRepositoryはPublic、GitHub Pagesは公開済みで、Firefox・Edgeの実サイトQAを完了しています。[手動deployment workflow](../.github/workflows/pages.yml)はPhase 20G-Aで実装しました。以下の「初回公開の前提」は初回公開前の設計記録です。以後の更新も承認済みfull SHAの手動デプロイで行い、正式リリースの確認順序は[Public Release Checklist](public-release-checklist.md)に従います。

## 公開範囲と契約プラン

個人repositoryのProject Pagesを想定し、URLは`https://guardiancrow.github.io/css-color-lab/`です。Pages buildはbase `/css-color-lab/`、HashRouterを使います。Learnは`#/`、Playgroundは`#/playground`です。

所有者の決定に基づき、GitHub FreeでPublic repositoryとPublic Pagesを採用しています。初回公開では履歴・PR／Actions・公開ファイルの監査、対象SHAのCI成功、所有者の明示的承認を経てPublicへ変更し、その後deployしました。[GitHub Pagesの利用条件](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)

Repositoryがprivateでも、この個人Project Pagesのサイトは公開配信として扱います。Enterprise Cloudのorganization向けアクセス制御を、個人repositoryへ適用できると想定しません。[Pagesサイトの公開範囲](https://docs.github.com/en/enterprise-cloud%40latest/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site)

## 初回公開の前提

1. 確定済みのMIT、Copyright (c) 2026 guardiancrow、自作部分への適用、version 1.0.1、Public repository／Public Pagesの方針が対象SHAに反映されていることを確認する。
2. Privateのままworkflowをreviewし、所有者が別工程でcommit／pushする。初回は`workflow_dispatch`だけをtriggerとし、pushやPRから起動しない。
3. Workflow追加後の新しいfull SHAについて差分、権限、trigger、checkout、upload内容を再監査し、そのSHAのremote CI成功を確認する。Phase 20Fの監査結果は当時の確定SHAに対するもので、新commitへ自動適用しない。公開対象SHAが変わった場合も再確認する。
4. 所有者がSettingsの確認を完了し、公開対象のfull commit SHA、Public化、Pages設定、artifact upload、初回deployを明示的に承認する。
5. 承認後にrepositoryをPublicへ変更し、Settings → PagesでSourceをGitHub Actionsへ設定する。
6. `github-pages` environmentを設定し、deployment branchをmasterに限定する。Freeのpublic repositoryではrequired reviewersを利用できる。自己承認禁止を使う場合は、dispatchした所有者以外の承認者を用意する。所有者だけをreviewerに指定し自己承認を禁止するとdeployを承認できない。所有者の承認記録と手動dispatchを採用する場合は、自動強制されるreview gateとは区別する。
7. 所有者がActionsからmasterを選び、承認済みSHAを入力して手動実行する。SiteのHTTP応答、routing、notice、keyboard操作を確認する。

`configure-pages`の`enablement`は既定の`false`を維持し、Settings操作を自動化しません。PATや新規secretsは不要です。[configure-pages inputs](https://github.com/actions/configure-pages/blob/v6.0.0/action.yml)

## Workflowとjobの契約

Workflowは手動入力`release_sha`を必須とし、40桁の小文字hexであることをcheckout前に検査します。入力はshell本文へ直接展開せずenvから読みます。両jobの条件でeventが`workflow_dispatch`、branchが`refs/heads/master`、repositoryが`guardiancrow/css-color-lab`、visibilityがPublicであることを確認します。Privateの間はbuild／upload／deploy jobを起動しません。

Build対象は入力SHAに固定し、masterから到達可能であることを確認します。履歴確認用checkoutは`fetch-depth: 0`、`persist-credentials: false`とし、checkout後のHEADも入力と照合します。検査が失敗するとnpm実行やuploadへ進みません。承認済みの過去SHAを使ったrollbackも可能です。Gitによる到達性の検査は所有者の公開承認やremote CI確認を代替しないため、実行前に対象SHAの承認記録を確認します。

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

2026-10-10に公式latest release、tagのGit参照、action.ymlを再確認し、次の値を手動workflowに固定しました。Node 24対応のActionsをGitHub-hosted Ubuntu runnerで使用します。既存CIのsetup-nodeは変更していません。

| Action                        | Stable version | Full commit SHA                            |
| ----------------------------- | -------------- | ------------------------------------------ |
| actions/checkout              | v7.0.1         | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| actions/setup-node            | v7.1.0         | `949feb2413d6458794dcd2491c4babbbce0c15c1` |
| actions/configure-pages       | v6.0.0         | `45bfe0192ca1faeb007ade9deae92b16b8254a0d` |
| actions/upload-pages-artifact | v5.0.0         | `fc324d3547104276b827a68afc52ff2a11cc49c9` |
| actions/deploy-pages          | v5.0.1         | `368f82528645a54fb793d4d04e342629a3f51346` |

根拠は各公式release：[checkout](https://github.com/actions/checkout/releases/tag/v7.0.1)、[setup-node](https://github.com/actions/setup-node/releases/tag/v7.1.0)、[configure-pages](https://github.com/actions/configure-pages/releases/tag/v6.0.0)、[upload-pages-artifact](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0)、[deploy-pages](https://github.com/actions/deploy-pages/releases/tag/v5.0.1)です。

## Rollbackと公開停止

公開後に問題があれば、最後に検証済みのmaster上のSHAを、同じ手動承認手順で再build・再deployします。旧tagを移動せず、必要なsource修正は通常の後続commitで行います。Rebaseやforce pushは使いません。初回公開後も自動push deploymentへの移行は別の承認事項です。

公開停止は、先にdeployment workflowを無効化し、Settings → PagesのUnpublish操作を行います。Workflowを再実行すると再公開されるため、停止中は実行しません。Repositoryのvisibility変更だけを停止手段にしません。[公式unpublish手順](https://docs.github.com/en/pages/getting-started-with-github-pages/unpublishing-a-github-pages-site)

Public化後のclone、第三者の保存物、cacheを回収できるとは想定しません。Credential流出の場合は公開停止だけで解決せず、該当credentialの失効・更新を先に行います。
