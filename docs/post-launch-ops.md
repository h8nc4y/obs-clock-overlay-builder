# Post-launch Operations

production公開後の確認、費用リスク、rollback、公開後backlogを分けて扱うための運用メモです。

## Current Production

- production URL: `https://obs-clock-overlay-builder.h8nc4y.workers.dev`
- Cloudflare worker: `obs-clock-overlay-builder`
- latest recorded production version after post-launch hardening: `01775440-ed7c-4679-8813-a2ef8a9fc78c`
- latest recorded staging version after post-launch hardening: `daf5fce0-86f8-4af9-8ae9-f1a7f033fac3`
- v0.1.0 launch production version: `6894fb0e-86f1-431e-9770-06a3966a4997`
- v0.1.0 launch rollback candidate observed: `dc40f3d8-681a-4d5d-bdc4-d5ae29197084`
- GitHub release: `v0.1.0`
- backlog issue: https://github.com/h8nc4y/obs-clock-overlay-builder/issues/10
- v0.1.1 backlog: [v0.1.1-backlog.md](v0.1.1-backlog.md)
- manual billing check issue: https://github.com/h8nc4y/obs-clock-overlay-builder/issues/12

## Post-launch Hardening Deployment

2026/05/21にPR #13の内容をstagingとproductionへ反映しました。

- PR: https://github.com/h8nc4y/obs-clock-overlay-builder/pull/13
- merge commit: `d0a518fd654279e3cfae98188749386c0cbc7d98`
- staging Version ID: `daf5fce0-86f8-4af9-8ae9-f1a7f033fac3`
- production Version ID: `01775440-ed7c-4679-8813-a2ef8a9fc78c`
- uploaded assets: `/index.html`, `/assets/css/styles.css`
- binding: `env.ASSETS` のみ
- staging remote smoke: pass
- production remote smoke: pass
- production Browser check: `/` は390px、768px、1280px相当で横スクロールなし、色スウォッチ最小36px、Console error/warningなし。`/clock/` は透明背景、編集UIなし、Console error/warningなし。

## Local Release Check

通常のproduction確認前後は次を実行します。

```bash
npm run release:check
npm run release:http-smoke
SMOKE_BASE_URL=https://obs-clock-overlay-builder.h8nc4y.workers.dev npm run release:remote-smoke
```

`release:check` は `lint`、`typecheck`、`format:check`、`test`、`build`、`cf:dry-run`、`git diff --check` をまとめて実行します。

## GitHub Actions And Cost

現状:

- `.github/workflows/` は存在しません。
- `gh workflow list` は空です。
- `gh run list --limit 20` は空です。
- repository はprivateです。
- 現在の状態では、pushやPRでGitHub Actionsは起動しません。

公式docs上、public repository の標準GitHub-hosted runnerは無料ですが、private repository はプランごとの無料枠を超えるとrepository ownerへ課金されます。Actions billing APIは、この環境の `gh` token では `user` scope不足により確認できませんでした。

2026/05/26にIssue #12の人間確認コメントで、GitHub billing dashboard上のActions利用状況、無料枠、上限設定、budget/alert確認は完了扱いになりました。支払い方法の詳細、数値、個人情報はrepo docsへ記録しません。

CIを追加する前に維持すること:

- GitHub billing画面でActionsの無料枠、支出上限、支払い方法を再確認する。
- 最初に追加するworkflowは `workflow_dispatch` のみにする。
- `push` / `pull_request` triggerは、支出上限確認後に追加する。
- larger runner、自動artifact大量保存、外部有料サービス呼び出しは使わない。
- 次回確認タイミング: GitHub Actions workflowを追加する前、`push` / `pull_request` triggerを追加する前、またはGitHub plan/billing設定を変更した後。

tracking issue: https://github.com/h8nc4y/obs-clock-overlay-builder/issues/12

## Cloudflare Static Assets And Cost

現状:

- `wrangler.jsonc` のproduction worker名は `obs-clock-overlay-builder` です。
- `assets.binding` は `ASSETS` のみです。
- D1、KV、R2、Queues、Durable Objects、Workflows、Hyperdrive、Workers AI、AI Gateway bindingはありません。
- `npx wrangler deploy --dry-run --env production` では `env.ASSETS` のみが表示されます。
- `run_worker_first` は使っていません。

公式docs上、Static Assetsに一致したリクエストは無料・無制限で、Worker scriptを呼ぶリクエストはWorkers pricingの対象です。Free planのWorker script requestは1日100,000 requestが目安です。

2026/05/26にIssue #12の人間確認コメントで、Cloudflare dashboard上のWorkers & Pages usage、Spend limit / Alert、有料plan変更なし、有料binding未使用の確認は完了扱いになりました。usage数値、契約詳細、account識別子、支払い情報はrepo docsへ記録しません。

Cloudflare運用で維持すること:

- Workers & Pages usageでStatic Assets / Worker invocationの使用状況を定期確認する。
- Billing / Spend limit / Alertを再確認する。
- paid plan変更、Workers AI、AI Gateway、R2、D1、KV、Queues、Durable Objects、Workflows、Hyperdriveを有効化していないことを確認する。
- 次回確認タイミング: production deploy前後、Cloudflare設定変更前後、月次の運用確認時、または有料bindingを追加する前。

tracking issue: https://github.com/h8nc4y/obs-clock-overlay-builder/issues/12

## Rollback Runbook

productionが正常な間は、訓練目的でproduction rollbackを実行しません。
rollback前には、必ず直近の `versions list` と `deployments list` で現在のversionを再確認します。

確認コマンド:

```bash
npx wrangler deployments list --env production
npx wrangler versions list --env production
npx wrangler rollback --help
```

障害時のrollback:

```bash
npx wrangler rollback <version-id> --env production --yes
SMOKE_BASE_URL=https://obs-clock-overlay-builder.h8nc4y.workers.dev npm run release:remote-smoke
```

代替復旧:

```bash
git switch master
git pull --ff-only
npm run deploy:production
SMOKE_BASE_URL=https://obs-clock-overlay-builder.h8nc4y.workers.dev npm run release:remote-smoke
```

注意:

- rollbackは選択したversionを100% trafficへ切り替えます。
- Cloudflare connected resourcesはrollbackされません。このrepoは `env.ASSETS` のみなので、D1/KV/R2などの外部resource差分はありません。
- 今回が初回production公開のため、検証済み旧productionへのrollbackではなく、直近versionまたはgit commit再デプロイでの復旧です。
- rollback後は `/`、`/clock/`、`/clock`、`/api/defaults`、`/favicon.ico`、Browser Consoleを確認します。

### Staging Drill Result

2026/05/21にstagingのみでrollback drillを実施しました。productionは切り替えていません。

- staging current before drill: `353281bb-0123-4b0a-943c-d2e5cab0fcfd`
- rollback target: `c9387fc1-fbb9-466b-b68c-f4adcd31d6a4`
- command: `npx wrangler rollback c9387fc1-fbb9-466b-b68c-f4adcd31d6a4 --env staging --yes`
- staging remote smoke after rollback: pass
- restore command: `npx wrangler rollback 353281bb-0123-4b0a-943c-d2e5cab0fcfd --env staging --yes`
- staging remote smoke after restore: pass
- note: Wrangler still displayed rollback prompts, but `--yes` selected the fallback values in non-interactive context.

## Browser Verification Notes

production URLで確認すること:

- `/` が編集画面を表示する。
- `/clock/` が時計専用面を表示し、編集UIが出ない。
- `/clock` が `/clock/` へ到達する。
- `/api/defaults` が `{"timezone":null,"country":null,"source":"static"}` を返す。
- 390px前後、768px前後、1280px以上で横スクロールが出ない。
- Console error/warningとnetwork errorがない。
- スウォッチ、ボタン、select、inputが押しにくくない。

## Font Risk

OBSでのフォント表示は、OBSを動かすPCに同じフォントが入っているかに依存します。

- UIでは日本語表示名を補助として出す場合があります。
- 生成URLには、ブラウザで実際に使うフォント名を保存します。
- 未登録フォントは英語名・内部名で表示されます。
- エイリアス追加時は、実際の `family` / `fullName` / `postscriptName` / `style` を確認してから追加します。

フォントが違って見える場合:

1. OBSを動かすPCに同じフォントが入っているか確認する。
2. 手入力フォント名に、OBS側PCで使える名前を入れる。
3. 生成URLをコピーし直す。
4. それでも違う場合は、標準フォントへ置き換える。

## Codex Project Settings Inventory

- repo-local `AGENTS.md`: project-specific OBS contract、Workers Static Assets方針、post-launch ops、release check surfaceを記録。
- repo-local `CLAUDE.md`: `AGENTS.md` を正として参照。
- repo-local `AGENT.md`: 未導入。
- repo-local `.codex/config.toml`: 未導入。
- global `project_doc_fallback_filenames`: `AGENT.md` と `CLAUDE.md` を含む。repo-local `AGENTS.md` は通常のproject docとして読み込まれる。
- global hook summary: `no_input_wait.py` のPreToolUse hookが設定されている。存在確認はglobal config棚卸しで実施し、repo-local hook追加はしていない。
- GitHub plugin、Cloudflare plugin、Browser plugin: enabled。Cloudflare API MCPはprompt approval設定のため、今回の確認は `gh`、`wrangler`、Browser/Chrome DevTools、公式docsで実施。

## References

- GitHub Actions billing: https://docs.github.com/en/billing/concepts/product-billing/github-actions
- Cloudflare Static Assets billing and limitations: https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/
- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare Workers rollback docs: https://developers.cloudflare.com/workers/configuration/versions-and-deployments/rollbacks/
