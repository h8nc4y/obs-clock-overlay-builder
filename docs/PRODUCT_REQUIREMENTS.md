# PRODUCT_REQUIREMENTS

## Status

This is a lightweight summary of existing product requirements and non-goals for `obs-clock-overlay-builder`.

It consolidates requirements already documented in `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/manual-qa.md`, `docs/post-launch-ops.md`, `docs/v0.1.1-backlog.md`, and the AI review coordination docs. It does not introduce new product scope.

## Product purpose

OBSのブラウザソースで使う時計オーバーレイURLを生成する静的Webアプリです。

編集画面で見た目を調整し、生成された `/clock/?c=...` URLをOBSへ貼ることで、時計だけの透明背景フレンドリーな表示を再現できることが主目的です。

## Primary users

- 日本語話者のOBS利用者、配信者、配信オペレーター。
- このリポジトリを保守し、release check、manual QA、Cloudflare運用を行う人。
- ChatGPT、Claude Code、CodexなどのAI review/implementation workflowに参加するagent。

## Core product contracts

- 生成された `/clock/?c=...` URLがOBS再現性のsource of truthです。
- `/clock/` は時計専用画面として維持します。編集UIを表示せず、透明背景に向いた表示を壊しません。
- 編集画面の `localStorage` は編集補助として使えますが、`/clock/` は `localStorage` に依存してはいけません。
- URL、import入力、label、font値などの未信頼入力はHTMLとして実行してはいけません。
- 未信頼値に対して `innerHTML` などのHTML injectionにつながるsinkを使いません。
- URL/config値は安全な既定値、許可された列挙値、範囲内の数値、検証済みtimezoneへ正規化します。
- 日本語UIと日本語docsは、非プログラマーの日本国内ユーザーにも分かる短く具体的な文言を優先します。

## Functional requirements

- 編集画面で時計テンプレート、色、背景不透明度、角丸、余白、文字サイズ、文字間隔、行間、太さ、影、縁取り、枠線を調整できること。
- 24時間/12時間、秒、日付、曜日、label、label位置をURLへ保存できること。
- 生成URL全体、query string、`c` parameter、JSON、URLエンコード済みJSONから設定をimportできること。
- 壊れた `c`、壊れたJSON、不正timezone、不正色、不正数値は初期値または安全な範囲へ戻すこと。
- PC内フォント読み込みは、対応ブラウザでユーザー操作後だけ実行し、非対応・拒否・空状態では手入力へ案内すること。
- フォント名はOBSを動かすPCに同じfontがある場合だけ同じ表示になります。未インストール時はsystem fallbackを許容します。
- `/clock/` は同一オリジンの `Date` レスポンスヘッダでサーバー時刻へ自動補正し、取得に失敗したときはPCのsystem timeへフォールバックすること(バックエンドは追加しない)。
- `/api/defaults` は公開先の補助情報だけを返します。候補が取れない環境でも、時計表示はURL設定だけで動くこと。

## Deployment and operations requirements

- 新規Cloudflare公開はWorkers with Static Assetsを第一候補にします。
- Cloudflare Pages compatibilityは、`functions/api/defaults.js` が harmless optional fallbackである限り残してよいです。
- `api/defaults` は拡張子なしの静的JSONです。JSON `Content-Type` と `Cache-Control: no-store` は `_headers` によって指定します。
- `/api/defaults` のstatus、JSON body、`Content-Type`、`Cache-Control` はlocal/remote smoke checksで監視します。
- `wrangler.jsonc` では `run_worker_first` を使わず、通常の静的配信は `dist/` のStatic Assetsへ任せます。
- productionが正常な間は、訓練目的だけでproduction rollbackを実行しません。
- GitHub ActionsやCloudflare運用は、費用・無料枠・支出上限の確認を前提にします。

## Validation requirements

- `npm run lint` はESLintではなく、`node --check` によるJavaScript構文チェックです。
- `npm run typecheck` はTypeScript型検査ではなく、主要module importとencode/decode/time formatのsmoke checkです。
- `npm test` はNode testを実行します。`tests/build.test.mjs` がbuildを実行するため、ignore済みの `dist/` をローカル生成することがあります。
- `npm run build` は `dist/` を生成します。
- 通常のrelease preflightは `npm run release:check` と `npm run release:http-smoke` です。
- staging/production確認では `SMOKE_BASE_URL=<deploy-url> npm run release:remote-smoke` を使います。ただし外部URLへのremote smokeやdeployは、現在の作業方針と承認条件に従います。

## Manual QA requirements and limitations

- 自動テストだけでは、実ブラウザ描画、OS font、OBS browser source固有の挙動、透明背景の実見え、文字切れは保証できません。
- OBS実機では、編集画面ではなく生成URLそのものをブラウザソースに貼って確認します。
- 390px前後、768px前後、1280px以上で横スクロール、読みにくさ、押しにくさ、focus/hover state、console/network errorを確認します。
- OBSを動かすPCに同じfontが無い場合、同じURLでも見た目が変わる可能性があります。
- 時計はサーバー時刻(同一オリジンの `Date` ヘッダ)へ自動補正しますが、補正できないオフライン時はsystem timeに従います。秒未満の精度やNTP級の厳密さは保証しません。

## Non-goals

- `localStorage` をOBS時計表示のsource of truthにしません。
- `/clock/` に編集UIや共有UIを混ぜません。
- backend state、authentication、database、paid Cloudflare binding、new paid cloud serviceは、別途承認なしに追加しません。
- Workers AI、AI Gateway、R2、D1、KV、Queues、Durable Objects、Workflows、Hyperdriveなどの有料化し得るbindingを、この要件だけでは追加しません。
- ライセンス確認と `docs/licenses` 記録なしにfont fileを同梱しません。
- GitHub Actionsの支出上限未確認のまま `push` / `pull_request` triggerを追加しません。

## AI review workflow requirements

- Claude Code review findings are advisory.
- ChatGPT is the commander and triage decision-maker.
- Codex implements only ChatGPT-approved tasks.
- Deferred, confirmation-needed, or rejected findings must not be implemented unless ChatGPT later approves them.
- Review coordination docs should distinguish evidence, advisory findings, ChatGPT decisions, and Codex implementation tasks.
