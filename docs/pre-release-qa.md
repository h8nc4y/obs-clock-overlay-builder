# Pre-release QA Notes

最終更新: 2026/05/18 20:44:13 JST

## Summary

公開前QAとして、ローカル自動検証、Browser視覚確認、`/api/defaults` の静的化判断、CI/Cloudflare公開前の残判断を整理した。

## Local Automated Checks

次の検証はローカルで成功した。

- `npm run lint`
- `npm run typecheck`
- `npm run format:check`
- `npm run test`（18 tests）
- `npm run build`
- `npm run http:smoke`
- `npm run cf:dry-run`
- `git diff --check`

`npm run cf:dry-run` は `wrangler deploy --dry-run --env staging` までで、実際のCloudflare deployは実行していない。

## Release Preflight After PR #7

PR #7 merge後の公開前release候補は、次の少数コマンドで再現する。

```bash
npm run release:check
npm run release:http-smoke
```

`npm run release:check` は次を順に実行する。

- `npm run lint`
- `npm run typecheck`
- `npm run format:check`
- `npm run test`
- `npm run build`
- `npm run cf:dry-run`
- `git diff --check`

`npm run release:http-smoke` は一時的に `npm run dev` を起動し、`/`、`/clock/`、`/clock`、`/api/defaults` を確認してから終了する。
staging/production URLは次で確認する。

```bash
SMOKE_BASE_URL=https://<deploy-url> npm run release:remote-smoke
```

`npm run release:remote-smoke` は `/`、`/clock/`、`/clock`、`/api/defaults` のstatus、`Content-Type`、`/api/defaults` の `Cache-Control: no-store` とJSON bodyを確認する。

OBS実機確認はCodexでは完了扱いにしない。確認結果は [manual-qa.md](manual-qa.md) の `OBS実機確認` 記録欄に記入し、Issue #1へ転記する。

## Cloudflare Staging Verification Plan

staging deployに進む前に確認すること:

- `wrangler whoami` でCloudflareへログイン済みである。
- `wrangler.jsonc` のstaging対象が `obs-clock-overlay-builder-staging` である。
- `assets.directory` が `./dist`、`assets.binding` が `ASSETS`、`html_handling` が `auto-trailing-slash`、`not_found_handling` が `none` である。
- `npm run cf:dry-run` が成功している。
- paid plan変更、Workers AI、AI Gateway、R2、D1、KV、Queues、Durable Objects、Workflows、Hyperdriveを要求されない。

staging deploy後に確認すること:

- staging URLを記録する。
- `/` が200で編集画面を表示する。
- `/clock/` が200で時計専用画面を表示する。
- `/clock` が200で時計専用画面へ到達する。
- `/api/defaults` が200で `{"timezone":null,"country":null,"source":"static"}` を返す。
- `/api/defaults` の `Content-Type` が `application/json; charset=utf-8` を含む。
- `/api/defaults` の `Cache-Control` が `no-store` を含む。
- rollback pathとして、Cloudflareの直近Worker versionへ戻す、または直前のgit commitを再デプロイできることを記録する。

production deployは、OBS実機確認が未完了の間は実行しない。

## Cloudflare Staging Result

実施日時: 2026/05/18 20:49:28 JST

staging deploy:

- command: `npm run deploy:staging`
- worker: `obs-clock-overlay-builder-staging`
- URL: `https://obs-clock-overlay-builder-staging.h8nc4y.workers.dev`
- Current Version ID: `c9387fc1-fbb9-466b-b68c-f4adcd31d6a4`
- binding: `env.ASSETS` のみ
- paid plan変更、有料binding、Workers AI、AI Gateway、R2、D1、KV、Queues、Durable Objects、Workflows、Hyperdrive要求: なし

staging HTTP smoke:

- `SMOKE_BASE_URL=https://obs-clock-overlay-builder-staging.h8nc4y.workers.dev npm run release:remote-smoke`
- `/`: 200、`Content-Type: text/html`
- `/clock/`: 200、`Content-Type: text/html`
- `/clock`: 200、`Content-Type: text/html`
- `/api/defaults`: 200、`Content-Type: application/json; charset=utf-8`
- `/api/defaults`: `Cache-Control: no-store`
- `/api/defaults`: `{"timezone":null,"country":null,"source":"static"}`

staging Browser smoke:

- `/`: `時計オーバーレイURLビルダー` を表示、Console error/warning 0件。
- `/clock/`: `OBS Clock Overlay` を表示、`body` は `margin: 0px`、`overflow: hidden`、背景は透明、Console error/warning 0件。

redirect / rewrite:

- `/clock` は200で時計専用HTMLへ到達した。Cloudflare Static Assets の `html_handling: auto-trailing-slash` と `_redirects` 互換設定のどちらでも、利用者は `/clock` から時計画面へ到達できる。

rollback path:

- `npx wrangler versions list --env staging` と `npx wrangler deployments list --env staging` でversion/deployment一覧を確認済み。
- 直前versionとして `f8152e51-fc91-4647-8219-78777ac226c6` が見える。
- 問題があればCloudflareの直近Worker versionへrollbackするか、直前のgit commitを再デプロイする。

production判断:

- OBS実機確認が未完了のため、production deployは実行しない。
- productionへ進む条件は、OBS実機確認の記録欄をIssue #1へ転記し、透明背景、毎秒更新、表示/非表示後の復帰、URL再貼り付け再現、文字切れが合格していること。

production承認文言:

```text
OBS実機確認が完了し、Issue #1に結果を記録済みです。Cloudflare Freeまたは既存契約内で、obs-clock-overlay-builder の production deploy を許可します。paid plan変更、Workers AI、AI Gateway、R2、D1、KV、Queues、Durable Objects、Workflows、Hyperdrive、secret送信は禁止します。
```

## Browser QA

対象: `http://127.0.0.1:4173/`

Browserで確認した結果:

- `/` は `時計オーバーレイURLビルダー` を表示し、1280x720で横スクロールなし。
- テンプレート8種（Minimal Clear、Milk Tea、Pastel Pop、Soda、Sakura、Night Studio、Neon HUD、Mono Compact）がライブプレビューへ反映され、推奨幅・高さも更新された。
- 背景確認の `透過チェッカー`、`明るい背景`、`暗い背景`、`任意色` が切り替わった。
- 生成URLは `/clock/?c=...` 形式で、URLインポート後に `設定を読み込みました。` を表示した。
- `/clock/?c=...` は時計だけを表示し、編集UIは出ない。`body` は `margin: 0px`、`overflow: hidden`、背景は透明。
- `/clock/` は時計だけを表示し、デフォルト状態の背景は透明。
- `/clock` も時計だけを表示した。
- `/clock/?tz=UTC&hour12=1&seconds=0&date=1&weekday=1&font=Poppins&theme=soda` は `template-soda`、ラベル右、12時間表示、秒なし、日付・曜日表示で復元された。
- `/api/defaults` は `{"timezone":null,"country":null,"source":"static"}` を返した。
- Browser Console の error/warning は0件。

OBS実機でのブラウザソース確認は未実施。OBS側では、生成URLをブラウザソースURLへ貼り、推奨幅・高さを入力し、透明背景、表示/非表示後の次tick、カスタムCSSの影響を確認する。

## OBS実機確認 Plan

OBS実機確認は [docs/manual-qa.md](manual-qa.md) の `OBS実機確認` に沿って実施する。

確認するURL:

- ローカル確認: `http://localhost:4173/clock/?c=...`
- Cloudflare公開後: `https://<production-url>/clock/?c=...`

OBSで入れる設定:

- URL: 編集画面でコピーした生成URL。
- 幅: 編集画面の推奨幅。切れる場合は20pxから80px追加。
- 高さ: 編集画面の推奨高さ。切れる場合は20pxから80px追加。
- 背景: OBS側で白背景やカスタムCSSを追加しない。

合格基準:

- 時計だけが表示され、編集UIは出ない。
- 背景が透明で、配信画面上に時計だけが重なる。
- 秒表示ありでは毎秒更新される。
- ソース非表示から再表示後、次tickで現在時刻へ戻る。
- URLを貼り直しても同じ見た目になる。
- 文字切れがない。切れる場合はOBS側の幅・高さを増やせば解消できる。

確認結果は `docs/manual-qa.md` の記録欄を使い、Issue #1へ転記する。

## `/api/defaults` Decision

Workers Static Assets では、`/api/defaults` は動的処理を必要としない静的fallback JSONへ変更した。

理由:

- OBS用 `/clock/` は `/api/defaults` を呼ばず、URLパラメータだけで再現する。
- 編集画面の `候補を確認` ボタンだけが `/api/defaults` を呼ぶ。
- `timezone` / `country` 候補は便利機能であり、必須機能ではない。
- `wrangler.jsonc` の `assets.run_worker_first` を外すことで、`/api/defaults` を含む静的アセットは Worker-first の動的実行を避けられる。
- `_headers` で `/api/defaults` の `Content-Type: application/json; charset=utf-8` と `Cache-Control: no-store` を指定した。

Pages Functions互換の `functions/api/defaults.js` は残している。Cloudflare Pagesで Functions を使う場合は `request.cf` 由来の候補を返せるが、OBS時計表示はこのAPIに依存しない。

## CI Decision

`.github/workflows/` は存在しない。GitHub Actions の自動実行workflowは追加していない。

理由:

- private repository の Actions minutes、無料枠、支出上限が未確認。
- 自動実行の `push` / `pull_request` workflow を追加すると、以後のpushで実行が発生し得る。

最小CI案:

- まず `workflow_dispatch` のみで手動実行に限定する。
- jobは `npm ci`、`npm run lint`、`npm run typecheck`、`npm run format:check`、`npm run test`、`npm run build`、`git diff --check`。
- `push` / `pull_request` trigger は、無料枠と支出上限を確認してから追加する。

## Cloudflare Deploy Decision

Cloudflare staging/production deployは未実施。

理由:

- `npm run cf:dry-run` は成功したが、Cloudflareアカウントの無料枠、Workers契約、支出上限、production URLは未確認。
- 公式ドキュメント上、Static Assets requests は無料・無制限、Workers Free は100,000 requests/dayだが、実アカウント状態はこの作業内で確認していない。
- 今回の変更では `/api/defaults` も静的アセット化し、Worker-first API実行を避けた。
- Cloudflare docsでは、静的アセットに一致したリクエストは無料・無制限で、Worker scriptを呼ぶリクエストはWorkers pricingに従うとされている。`run_worker_first` はFree tier上限到達時に429の原因になり得るため、このリポジトリでは使わない。

承認する場合の推奨文言:

```text
Cloudflare Freeまたは既存契約内で、obs-clock-overlay-builder の staging deploy と production deploy を許可します。paid plan変更、Workers AI、AI Gateway、R2、D1、KV、Queues、Durable Objects、Workflows、Hyperdrive、secret送信は禁止します。
```

費用目安:

- 静的アセット配信のみで無料枠内の場合: 0 JPY想定。
- Workers Paid plan へ切り替えが必要な場合: 5 USD/month、約800 JPY/month（160 JPY/USD、為替未確認）。

参照:

- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare Static Assets billing and limitations: https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/
- Wrangler assets `run_worker_first`: https://developers.cloudflare.com/workers/wrangler/configuration/
- Workers Static Assets headers: https://developers.cloudflare.com/workers/static-assets/headers/

## Cloudflare Deploy Approval Conditions

実deploy前に、次のすべてを人間が確認する。

- CloudflareアカウントがFreeまたは既存契約内で、今回のWorkers Static Assets deployに追加支払いが不要。
- Cloudflareの支出上限、課金アラート、または請求管理画面で想定外の課金を防げる状態。
- staging deployとproduction deployの対象が `obs-clock-overlay-builder-staging` と `obs-clock-overlay-builder` で正しい。
- paid plan変更、Workers AI、AI Gateway、R2、D1、KV、Queues、Durable Objects、Workflows、Hyperdriveを使わない。
- secret、token、OAuth credential、実ユーザーデータをdeploy操作で外部送信しない。
- `npm run cf:dry-run` が成功済み。

承認後に実行する最小コマンド:

```bash
npm run deploy:staging
npm run deploy:production
```

deploy後の確認:

- staging URLとproduction URLを記録する。
- `/`、`/clock/`、`/clock`、`/api/defaults` が200で開く。
- `/api/defaults` が静的fallback JSONを返す。
- `/api/defaults` の `Content-Type` が `application/json`。
- Browser Console error/warning がない。
- production URLの生成URLをOBSへ貼り、透明背景と時計更新を確認する。
- 問題があればCloudflareの直近Worker versionへrollbackするか、直前のgit commitを再デプロイする。

## GitHub Actions Decision

GitHub docsでは、private repositoryのGitHub-hosted runnersはプランごとの無料分を超えるとrepository ownerへ課金される。無料枠、支出上限、支払い方法が未確認のため、自動実行される `push` / `pull_request` workflow は追加しない。

追加する場合の最小案:

- `workflow_dispatch` のみ。
- `runs-on: ubuntu-latest`。
- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run format:check`
- `npm run test`
- `npm run build`
- `git diff --check`

`push` / `pull_request` triggerは、無料枠と支出上限を確認してから追加する。

参照:

- GitHub Actions billing: https://docs.github.com/en/billing/concepts/product-billing/github-actions

## Issue #1 Close Conditions

公開する場合:

- OBS実機確認が完了し、結果がIssue #1へ記録されている。
- Cloudflare staging deployが承認済み条件内で完了し、URLと確認結果がIssue #1へ記録されている。
- Cloudflare production deployが承認済み条件内で完了し、production URLと確認結果がIssue #1へ記録されている。
- productionで `/`、`/clock/`、`/clock`、`/api/defaults`、headers、Browser Consoleを確認済み。
- production URLの生成URLをOBSへ貼り、透明背景と時計更新を確認済み。
- rollback pathが記録済み。
- CIを使う場合は、無料枠・支出上限を確認済みで、実行結果が記録済み。CIを使わない場合は、ローカル検証で代替する判断がIssue #1へ記録済み。

公開保留する場合:

- OBS実機確認の結果、公開前に直すべき問題がIssueまたはPRで追跡されている。
- Cloudflare deployを行わない理由が、費用、認証、契約状態、支出上限、または運用判断としてIssue #1へ記録されている。
- 公開保留中もローカル利用に必要な手順、未確認事項、次に再開する条件がIssue #1へ記録されている。
- CIを追加しない場合、その理由がprivate repoの無料枠・支出上限未確認として記録されている。
- Issue #1を閉じる場合は、公開しない判断が明確で、残作業が別Issueへ移っている。

## Remaining Unknowns

- OBS実機でのブラウザソース表示。
- GitHub Actions の無料枠、支出上限、CI実行結果。
- Cloudflare account の契約状態、無料枠消費状況、支出上限。
- staging/production deploy URL。
- production公開後の実ブラウザ表示とrollback実行性。

## Residual Risks

- 実フォントはOBSを動かすPCに依存するため、ローカルBrowserとOBS実機で見た目が変わる可能性がある。
- Cloudflare実deploy後のヘッダー適用、`/clock` handling、production URLは未確認。
- GitHub Actionsを追加する場合、trigger設定次第でprivate repoのActions minutesを消費する可能性がある。
