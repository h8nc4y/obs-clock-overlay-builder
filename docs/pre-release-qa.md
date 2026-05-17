# Pre-release QA Notes

最終更新: 2026/05/17 17:21:39 JST

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

承認する場合の推奨文言:

```text
Cloudflare Freeまたは既存契約内で、obs-clock-overlay-builder の staging deploy と production deploy を許可します。paid plan変更、Workers AI、AI Gateway、R2、D1、KV、Queues、Durable Objects、Workflows、Hyperdrive、secret送信は禁止します。
```

費用目安:

- 静的アセット配信のみで無料枠内の場合: 0 JPY想定。
- Workers Paid plan へ切り替えが必要な場合: 5 USD/month、約800 JPY/month（160 JPY/USD、為替未確認）。

参照:

- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Wrangler assets `run_worker_first`: https://developers.cloudflare.com/workers/wrangler/configuration/
- Workers Static Assets headers: https://developers.cloudflare.com/workers/static-assets/headers/

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
