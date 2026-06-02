# CLAUDE_REVIEW

## Status

Claude Code review completed externally and pasted below.

ChatGPT triage has been performed for the first implementation batch and the approved second-batch follow-up scope. Current decisions are recorded in `docs/AI_REVIEW_TRIAGE.md`. Claude findings remain advisory; only ChatGPT-approved items may become Codex implementation tasks.

## Review instructions

Claude Code should review only and should not edit files unless explicitly instructed by the user.

Claude should read `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/REVIEW_BRIEF.md`, and relevant source/test/deployment files before writing findings. Claude findings are advisory. ChatGPT remains the decision-maker for accepting, deferring, or rejecting findings, and Codex must not implement suggestions from this file unless they are later approved in `docs/AI_REVIEW_TRIAGE.md`.

Suggested review focus:

- Preserve the `/clock/?c=...` reproducibility contract.
- Preserve `/clock/` as a transparent, clock-only OBS surface.
- Check URL/import/font/label sanitization and avoidance of `innerHTML`.
- Check that editor `localStorage` remains optional and editor-only.
- Check test coverage for config, rendering, time formatting, build outputs, and deployment assumptions.
- Check Japanese UI/QA/operations documentation for non-programmer clarity.
- Check Cloudflare Workers Static Assets deployment and cost-risk documentation.

## Claude review output

The `ExitPlanMode` tool's own contract is explicit: *"For research tasks where you're gathering information, searching files, reading files or in general trying to understand the codebase — do NOT use this tool."* This is a read-only review producing an advisory report, not an implementation-planning task, so I will deliver the report directly rather than call it. (The MCP servers now appearing — Blender, Desktop Commander, computer-use — are irrelevant to this review.)

Here is the report.

---

# Claude Code Independent Review Report

## 0. Review metadata

- **Review mode:** Read-only
- **Repository:** `011_obs-clock-overlay-builder`（package名 `obs-clock-overlay-builder`、remote `https://github.com/h8nc4y/obs-clock-overlay-builder.git`）
- **Branch observed:** `master`
- **Commit observed:** `b3b900c`（Merge pull request #18 from `h8nc4y/feat/v0-1-1-font-help-usability`）
- **Working tree status summary:** tracked fileに未コミット変更なし。未追跡(`??`)は AI調整/レビュー系docのみ: `docs/AI_REVIEW_TRIAGE.md`, `docs/CHATGPT_HANDOFF.md`, `docs/CLAUDE_REVIEW.md`, `docs/CODEX_TASKS.md`, `docs/DECISION_LOG.md`, `docs/REVIEW_BRIEF.md`。`dist/`, `node_modules/`, `.wrangler/`, screenshotは `.gitignore` 済み。
- **Commands actually run（読み取り専用のみ）:**
  - `git branch --show-current` / `git log --oneline -n 20` / `git status --short` / `git diff --stat HEAD`
  - `ls`/`echo` 系の確認: `favicon.ico` 有無、`.gitignore`、root一覧、`.github` 有無、env/secretファイル探索（`git ls-files | grep`）、`.claude`・`.wrangler` 内容、`git ls-files dist`
  - Read / Glob / Grep tool による各ファイル閲覧と risky-sink / secret パターン検索
  - 注: 最初に試した `git ls-files | Where-Object ... 2>$null` は bash上で `$null` リダイレクトエラーになり失敗。代替として `git status` と Glob を使用。
- **Commands intentionally not run:** `npm install` / `npm update` / `npm run build` / `npm run test`（`tests/build.test.mjs` が `dist/` を書き込むため）/ `npm run dev` / `npm run http:smoke` / `npm run release:http-smoke`（ローカルサーバ起動）/ `npm run format:check`（指示に従い未実行。実装上は読み取り専用）/ `npm run cf:dry-run` / `npm run deploy:staging` / `npm run deploy:production` / `wrangler deploy` / `release:remote-smoke`（外部アクセス）
- **Files/directories inspected:** `README.md`, `AGENTS.md`, `CLAUDE.md`, `package.json`, `wrangler.jsonc`, `_headers`, `_redirects`, `index.html`, `clock/index.html`, `assets/js/{config,time,render,clock,builder,font-names}.js`, `assets/css/styles.css`, `api/defaults`, `functions/api/defaults.js`, `worker/index.js`, `scripts/{build,serve,check-js,format-check,module-smoke,release-check,release-http-smoke,http-smoke,release-remote-smoke}.mjs`, `tests/{config,time,render,font-names,build,ui-static,worker}.test.mjs`, `docs/{manual-qa,pre-release-qa,post-launch-ops,v0.1.1-backlog,licenses/fonts,REVIEW_BRIEF,DECISION_LOG,CHATGPT_HANDOFF,CLAUDE_REVIEW,AI_REVIEW_TRIAGE,CODEX_TASKS}.md`, `.gitignore`
- **Generated/local directories skipped:** `node_modules/`, `dist/`, `.wrangler/`, `.codegraph/`, `.claude/worktrees/`, `*-screenshot.png`（証拠としては不採用）
- **Limitations:** ブラウザ/OBS実行は未実施（指示通り）。実描画、OSフォント解決、透明背景の実見え、実Cloudflare配信ヘッダ、`/clock` の307挙動などは docs記載とコードからの推定であり、実機検証は別途必要。secret値は本報告に一切転記していない。

---

## 1. Executive summary

- **Overall readiness:** 成熟度は高い。v0.1.0 は production公開済みで、release preflight・manual QA・post-launch ops が整備され、依存は `wrangler`（devのみ）でランタイム依存ゼロ。コードは小さく、責務分離・サニタイズ・テストが堅実。**リリースブロッカー級の欠陥は確認されませんでした。**
- **Highest-risk areas:**（いずれも致命ではない）①`builder.js`（最大・DOM密結合の編集UI中核）に自動テストが無く、回帰検知が manual QA 依存。②要件が README/AGENTS/QA/backlog/REVIEW_BRIEF など複数docに分散（単一の正規仕様書が無い）。③`copyText()` フォールバック経路の小バグ。④`/clock/` の影/グロー端クリップ（要視覚確認）。
- **`/clock/?c=...` 契約の保護:** **十分に保護されている**と判断。`/clock/` は `localStorage` を一切参照せず、URL→`decodeConfig`→`normalizeConfig` で再現。clock面は universal な browser API のみ使用（`queryLocalFonts`/clipboard/canvas/Web Share は `builder.js` 側に隔離）。不正入力は安全側へクランプ/フォールバックし、テストも round-trip と不正入力を網羅。
- **Release-blocking:** なし。確認した指摘はすべて backlog / polish / test / docs / 意思決定レベル。
- **ChatGPT判断が要る項目:** AI調整docを commit するか（CL-007）、それらに含まれる Cloudflare Worker version ID 等の運用メタデータの公開可否（CL-007）、要件の単一spec化の要否（CL-006）、`lint`/`typecheck` の名称・実体の扱い（CL-004）、本レビュー findings の MVP閾値。

---

## 2. Findings table

| ID | Category | Title | Severity | Confidence | Evidence files | 放置リスク | Recommended action | Suggested owner |
|---|---|---|---|---|---|---|---|---|
| CL-001 | Implementation | `copyText()` フォールバックが常に `generatedUrl` を選択し、投稿文コピー時に誤った内容をコピー | Low | High | `assets/js/builder.js`（`copyText`, `copyShareText` caller） | clipboard API非対応環境で投稿文の代わりにURLがコピーされ「成功」表示 | フォールバック対象を引数の内容に合わせる | Codex implementation after ChatGPT approval |
| CL-002 | UX/Render | `/clock/` でwidgetがviewport原点に固定され、text-shadow/neonグローが上(左)端でクリップされ得る | Low | Medium | `assets/css/styles.css`（`.clock-page #clockRoot` `place-items:start`、`.clock-widget` text-shadow）、`assets/js/render.js`（`recommendedObsSize` の対称padding） | グロー強めtemplate（Neon HUD等）で見切れ。OBS取り込み前のブラウザ描画段階で発生 | 原点側に余白確保 or 中央寄せ等を視覚確認のうえ検討 | Human manual QA → Codex after approval |
| CL-003 | Implementation | 編集画面 `loadInitialConfig()` が「URL設定==DEFAULT」のとき localStorage を優先 | Info | High | `assets/js/builder.js`（`loadInitialConfig`） | 既定値と完全一致のURLで開くと保存設定が勝つ稀な不一致。clock面は影響なし | URL有無を厳密判定する等の小修正（任意） | Approved / implemented second batch |
| CL-004 | Tooling/Docs | `npm run lint`/`typecheck` が実体は `node --check` 構文検査 / import smoke で、linter/型検査ではない | Info | High | `package.json`、`scripts/check-js.mjs`、`scripts/module-smoke.mjs` | 名称から本物のlint/型検査と誤認し得る | 名称の説明追記、または将来のlint/型導入をbacklog化 | Documentation / ChatGPT decision |
| CL-005 | Test | `assets/js/builder.js`（編集UI中核）に自動テストが無く manual QA 依存 | Medium | High | `tests/*`（builder用テスト無し）、`docs/manual-qa.md` | 編集UIロジック回帰がCIで検知できない | DOM抽出可能な純関数の切り出し＋テスト追加を検討 | Narrow startup test slice implemented; broader scope deferred |
| CL-006 | Requirements/Docs | 要件・非目標が README/AGENTS/QA/backlog/REVIEW_BRIEF等に分散し単一specが無い | Medium | Medium | `README.md`, `AGENTS.md`, `docs/REVIEW_BRIEF.md`, `docs/manual-qa.md`, `docs/v0.1.1-backlog.md` | 将来agent/人の認識齟齬、scope creep | 軽量な正規要件サマリ（or REVIEW_BRIEFを正規化）を検討 | ChatGPT decision / Documentation |
| CL-007 | Ops/Governance | AI調整doc＋ops docが未追跡で、Worker version ID / `*.workers.dev` subdomain / GitHub issueリンクを含む。commit可否と公開時の扱い未決 | Info | High | `git status`（未追跡docs）、`docs/post-launch-ops.md`、`docs/pre-release-qa.md` | 公開repo化時に運用メタデータが露出。版管理外で履歴が残らない | commit方針と公開可否をChatGPTで判断（secretではない旨は確認済み） | ChatGPT decision |
| CL-008 | Deployment | `/api/defaults` の正しい `Content-Type` が `_headers` 依存（拡張子なしファイル） | Low | Medium | `api/defaults`（拡張子なし）、`_headers`、`functions/api/defaults.js` | `_headers` 不適用時にCT不正。ただし `fetch.json()` はCT非依存、clock面は不使用で実害小 | remote-smokeでの継続監視、必要なら明示noteを追加 | Human manual QA / Documentation |
| CL-009 | Test/Tooling | `npm test` が `tests/build.test.mjs` 経由で `dist/` を生成（純読み取りでない） | Info | High | `tests/build.test.mjs`（`spawnSync` build）、`scripts/build.mjs` | 読み取り専用前提のsandbox/CIで副作用 | testが書込む旨を明記（`dist/` はignore済） | Documentation |

---

## 3. Detailed findings

### CL-001: `copyText()` フォールバックが常に `generatedUrl` を選択する

- **Category:** Implementation quality / minor correctness bug
- **Severity:** Low
- **Confidence:** High
- **Evidence:**
  - `assets/js/builder.js`: `copyText(text, statusElement, successMessage)` — `catch` 節で `elements.generatedUrl.focus(); elements.generatedUrl.select(); document.execCommand("copy")` と、**引数 `text` ではなく常に `generatedUrl` を選択**している。
  - `assets/js/builder.js`: 呼び出し元 `copyShareText` → `copyText(elements.shareText.value, elements.urlStatus, "投稿文をコピーしました。")`。
- **What I observed:** `navigator.clipboard.writeText` が成功する環境では引数 `text` を正しくコピーする。しかし失敗時のフォールバックでは投稿文コピーであっても `generatedUrl`（URL欄）を選択してコピーし、成功メッセージ「投稿文をコピーしました。」を表示する。
- **Why it matters:** secure context でない/古いブラウザなど clipboard API 非対応時に、投稿文の代わりにURLがコピーされ、かつ成功と表示されるため利用者が気づけない。
- **放置リスク:** 限定環境での誤コピー。配信前の投稿文準備で意図しないテキストが貼られる軽微なUX不具合。
- **Recommended action:**（命令ではなく候補）フォールバックで「引数 `text` を保持する一時要素を選択する」か、「対象要素を引数で受け取る」設計に変更し、成功判定も実コピー結果に合わせる。
- **Minimal Codex task candidate:** `copyText` のフォールバック対象を引数依存にする小修正＋（可能なら）非対応環境を模した単体テスト。
- **Verification needed:** clipboard API を無効化したブラウザでの手動確認。
- **Notes for ChatGPT triage:** 影響範囲は小。モダンOBS(CEF)/Chromium では正常経路が使われるため実害は限定的。

### CL-002: `/clock/` のwidget原点固定によるshadow/グローのクリップ

- **Category:** UX / rendering（OBS視覚契約）
- **Severity:** Low
- **Confidence:** Medium
- **Evidence:**
  - `assets/css/styles.css`: `.clock-page { overflow: hidden; }`、`.clock-page #clockRoot { place-items: start; margin: 0; }` によりwidgetがviewport左上(0,0)に密着。
  - `assets/css/styles.css`: `.clock-widget { text-shadow: var(--clock-shadow); }`、Neon HUD等は `shadowBlur` 大・`paddingY` 小。
  - `assets/js/render.js`: `recommendedObsSize` は `shadowPad = 32` を上下左右対称に加算（原点固定だと上/左の余白は活かされにくい）。
- **What I observed:** widgetが左上原点に固定されるため、`paddingY < blur` の構成では text-shadow/グローの上端側が `overflow:hidden` で見切れる可能性がある（左端は概ね `paddingX` が大きく余裕あり）。これはOBS取り込み前のブラウザ描画段階で起こる。
- **Why it matters:** グロー主体のtemplate（特にNeon HUD）で見た目が削れ、配信品質に影響し得る。推奨サイズの対称paddingと原点固定の前提がややズレている。
- **放置リスク:** 一部templateで微小な見切れ。致命的ではないが「同じ見た目の再現」を掲げる製品としては気になる箇所。
- **Recommended action:** 原点側に僅かな余白を確保する、または `#clockRoot` の配置/サイズ計測を見直す案を、ブラウザ実描画で確認のうえ検討。
- **Minimal Codex task candidate:** （視覚確認後に）clock面のレイアウト微調整 or 推奨サイズ算出の非対称化。
- **Verification needed:** ブラウザ/OBSでNeon HUD等のグロー上端を実視確認（本レビューはブラウザ未起動のためMedium confidence）。
- **Notes for ChatGPT triage:** 実害の大きさは視覚確認次第。backlog（テンプレ調整, v0.1.1-backlog「後続version候補」）と整合。

### CL-003: 編集画面 `loadInitialConfig()` のURL/localStorage優先順位の端ケース

- **Category:** Implementation quality（編集UIのみ。clock面は無関係）
- **Severity:** Info
- **Confidence:** High
- **Evidence:**
  - `assets/js/builder.js`: `loadInitialConfig()` — `if (window.location.search)` 内で `JSON.stringify(fromUrl) !== JSON.stringify(DEFAULT_CONFIG)` のときのみURL設定を採用し、**一致時は localStorage へフォールスルー**。
- **What I observed:** 既定値と完全一致するURL（例: 既定configをそのまま符号化した `?c=...`）で編集画面を開くと、URLよりlocalStorageの保存設定が優先される。
- **Why it matters:** 編集画面の初期化のみの稀な不一致。`/clock/`（OBS再現）には影響しない（clock面は常にURLのみ）。
- **放置リスク:** ほぼ無視可能。既定一致URLを共有/再オープンする限定状況のみ。
- **Recommended action:** （任意）`c`/flatパラメータの「存在」で判定する等の小修正。実利は小さいため保留も妥当。
- **Minimal Codex task candidate:** `loadInitialConfig` の判定をsearch有無ベースへ変更＋テスト。
- **Verification needed:** 単体テストで再現可能。
- **Notes for ChatGPT triage:** 却下/保留でも問題ない軽微項目。報告は網羅性のため。

### CL-004: `lint`/`typecheck` の名称と実体の乖離

- **Category:** Tooling / Docs（期待値整合）
- **Severity:** Info
- **Confidence:** High
- **Evidence:**
  - `package.json`: `"lint": "node scripts/check-js.mjs"`, `"typecheck": "node scripts/module-smoke.mjs"`。
  - `scripts/check-js.mjs`: `node --check`（構文チェックのみ。未使用変数等は検出せず）。
  - `scripts/module-smoke.mjs`: import + encode/decode + format の smoke（型検査ではない）。
- **What I observed:** 依存ゼロ方針に沿った実用的選択だが、`lint`/`typecheck` という名称は本物のlinter/型検査を想起させる。
- **Why it matters:** 将来のagent/人が「lint/typecheck済＝静的解析十分」と誤認するおそれ。
- **放置リスク:** 品質ゲートの過信。低リスクだが認識齟齬の芽。
- **Recommended action:** docへ「これは構文/import smokeであり linter/型検査ではない」と明記、または将来 ESLint / `tsc --checkJs` 等の導入可否を別途検討（依存追加はコスト/方針判断）。
- **Minimal Codex task candidate:** README/docへの注記（docs-only）。ツール導入は要ChatGPT判断（依存増）。
- **Verification needed:** なし（doc確認のみ）。
- **Notes for ChatGPT triage:** 依存追加は static-first / low-ops 方針と要トレードオフ判断。

### CL-005: `builder.js` の自動テスト不在

- **Category:** Tests
- **Severity:** Medium
- **Confidence:** High
- **Evidence:**
  - `tests/` 配下に `builder` 専用テストが存在しない（`config`/`time`/`render`/`font-names`/`build`/`ui-static`/`worker` のみ）。
  - `assets/js/builder.js`: 最大のモジュール（フォーム束縛、template適用、URL生成/警告、import、share画像、localStorage、CFデフォルト取得等）。
  - `docs/manual-qa.md`: 当該挙動は手動QAで広くカバー。
- **What I observed:** 中核の編集UIロジックがDOM密結合で、回帰検知が manual QA 依存。`render.js` は `FakeElement` ハーネスでテスト済だが builder は未テスト。
- **Why it matters:** URL生成・compactトグル・import・contrast警告などの回帰が自動検知されない。製品の主要導線。
- **放置リスク:** 改修時の見えない回帰、手動QA負荷の増加。
- **Recommended action:** DOM非依存に切り出せる関数（例: share文生成、URL長警告閾値判定、X intent URL組立、preview背景クラス選択など）を純関数化し `node --test` 対象に。フルDOMテストはコスト高のため範囲限定推奨。
- **Minimal Codex task candidate:** builderからの純粋ロジック抽出＋単体テスト（小さく複数タスクに分割可）。
- **Verification needed:** `npm run test`（`dist/` 生成に留意）。
- **Notes for ChatGPT triage:** 価値高・リスク低。ただし「抽出リファクタ」は behavior 不変が前提。scopeを小さく。

### CL-006: 要件の分散と単一正規仕様の不在

- **Category:** Requirements / Docs
- **Severity:** Medium
- **Confidence:** Medium
- **Evidence:**
  - 製品goal/非目標/契約が `README.md`, `AGENTS.md`, `docs/REVIEW_BRIEF.md`, `docs/manual-qa.md`, `docs/v0.1.1-backlog.md`, `docs/DECISION_LOG.md` に分散。`REVIEW_BRIEF.md` が部分的に統合しているが「review context packet」と位置付けられ正規spec扱いではない。
- **What I observed:** 個々のdocは高品質だが、MVP非目標（server時刻補正なし/フォント同梱なし/backend stateなし/有料サービスなし）や契約が一箇所に集約されていない。
- **Why it matters:** 将来のagent/人が前提を取り違えるリスク。`AGENTS.md` は「global policyを正とするdelta」と明記され良いが、製品要件の正は曖昧。
- **放置リスク:** 認識齟齬、scope creep、レビュー基準のブレ。
- **Recommended action:** 軽量な正規要件サマリ（goal/非目標/契約/対象viewport/受入基準）を1ファイルに集約、または `REVIEW_BRIEF.md` を「正規要件」として明確に位置付ける。
- **Minimal Codex task candidate:** docs-only の要件サマリ追加 or REVIEW_BRIEFの役割明記。
- **Verification needed:** なし。
- **Notes for ChatGPT triage:** ガバナンス上「どのdocを正にするか」はChatGPT判断が適切。

### CL-007: 未追跡のAI調整/運用docと運用メタデータの扱い

- **Category:** Ops / Governance / 情報管理
- **Severity:** Info（公開repo化を見据えるとLow〜Medium）
- **Confidence:** High
- **Evidence:**
  - `git status`: `docs/{AI_REVIEW_TRIAGE,CHATGPT_HANDOFF,CLAUDE_REVIEW,CODEX_TASKS,DECISION_LOG,REVIEW_BRIEF}.md` が未追跡。
  - `docs/post-launch-ops.md` / `docs/pre-release-qa.md`: Cloudflare Worker **version ID**（UUID）、`*.h8nc4y.workers.dev` subdomain、GitHub issue/PRリンクを多数記載。
- **What I observed:** これらは **secretではない**（token/key/credential/課金数値/個人情報は記載されておらず、各docは「数値・支払い・account識別子・個人情報を記録しない」と明記し規律も良好）。一方でversion IDやsubdomainは運用メタデータであり、commit可否（版管理外のまま履歴が残らない問題）と、将来の公開可否は未決(`DECISION_LOG.md` の Open decisions, `CHATGPT_HANDOFF.md` の Remaining uncertainties に明記)。
- **Why it matters:** ①これらのガバナンスdocが版管理外だと、運用上の意思決定履歴が追えない。②repoが公開される場合、version ID/subdomain/issueリンクの露出許容範囲を判断しておく必要。
- **放置リスク:** 履歴喪失、または公開時の運用情報露出。
- **Recommended action:** （a）AI調整docを commit するか/`.gitignore` するかをChatGPTで決定。（b）公開を見据える場合は version ID 等の掲載方針を確認（secretではない旨は本レビューで確認済み）。
- **Minimal Codex task candidate:** 方針確定後の commit or ignore 設定（要ChatGPT承認）。
- **Verification needed:** なし（方針判断）。
- **Notes for ChatGPT triage:** 本レビューは findings を docs に書き込んでいない（governance遵守）。commit判断はChatGPT領域。

### CL-008: `/api/defaults` の `Content-Type` が `_headers` 依存

- **Category:** Deployment / robustness
- **Severity:** Low
- **Confidence:** Medium
- **Evidence:**
  - `api/defaults`: 拡張子なしの静的JSONファイル（`{"timezone":null,"country":null,"source":"static"}`）。
  - `_headers`: `/api/defaults` に `Content-Type: application/json; charset=utf-8` と `Cache-Control: no-store` を付与。
  - `docs/pre-release-qa.md` / `docs/post-launch-ops.md`: production remote-smoke でCT/Cache-Controlが正しいことを記録。`scripts/release-remote-smoke.mjs` が継続的に検証。
- **What I observed:** 拡張子が無いため、`_headers` が適用されないとCTが `application/octet-stream` 等になり得る。ただし `fetchCloudflareDefaults()` は `response.json()` を使い（CT非依存でparse）、`/clock/` はこのAPIを呼ばないため実害は小さい。Workers Static Assets での `_headers` 適用は production smoke で確認済。
- **Why it matters:** 仕組みが `_headers` 一点依存。将来 `_headers` の扱いが変わると静かにCTが劣化し得る（機能は概ね維持）。
- **放置リスク:** CT劣化の見落とし。`release:remote-smoke` が gate になっている限り低リスク。
- **Recommended action:** 現状維持で可。`docs/manual-qa.md`/`post-launch-ops.md` のチェック継続を明記、または拡張子付与等の代替を将来検討（任意）。
- **Minimal Codex task candidate:** docへの依存関係note追記（docs-only）。
- **Verification needed:** 実deploy環境でのヘッダ確認（`release:remote-smoke`）。
- **Notes for ChatGPT triage:** 既存smokeで担保されており優先度低。

### CL-009: `npm test` が `dist/` を生成する（純読み取りでない）

- **Category:** Test / Tooling
- **Severity:** Info
- **Confidence:** High
- **Evidence:**
  - `tests/build.test.mjs`: `spawnSync(process.execPath, ["scripts/build.mjs"])` で実ビルドし `dist/` を生成・検証。
- **What I observed:** `node --test` は `dist/` への書き込みを伴う（`dist/` は `.gitignore` 済なので作業ツリーの追跡変更にはならない）。本レビューで `npm run test` を実行しなかった判断はこの副作用ゆえ妥当。
- **Why it matters:** 「読み取り専用」を厳格に求めるsandbox/CIでの前提と齟齬。
- **放置リスク:** ほぼ無し。明記されていれば誤解を防げる。
- **Recommended action:** docに「`npm test` は build を走らせ `dist/` を生成する（ignore対象）」と一文追記（任意）。
- **Minimal Codex task candidate:** docs-only。
- **Verification needed:** なし。
- **Notes for ChatGPT triage:** 情報共有目的。

---

## 4. Positive observations（維持すべき強み）

- **OBS URL再現性契約:** `/clock/` は `clock.js` で `parseConfigFromQuery(window.location.href)` のみを使用し、`localStorage` 非依存。`decodeConfig`→`normalizeConfig` で不正値を安全側へ。`config.test.mjs` が round-trip / compact / flat GET / 壊れた`c` / 未来version / 長文truncate を網羅。**契約が明確かつテストで守られている。**
- **clock面のAPI最小性:** clock面は `document`/`Intl`/`setTimeout`/`visibilitychange`/`pagehide` のみ使用。`queryLocalFonts`/clipboard/canvas/Web Share/`navigator.share` 等は `builder.js` に隔離され、OBS(CEF)で欠ける可能性のあるAPIにclock面が依存しない。
- **サニタイズの多層防御:** `normalizeHex`（厳格 `#rrggbb`）、`clampNumber`、`enumValue`（Set照合）、`coerceBool`、`sanitizeTimezone`（`Intl` で検証）、`safeText`（制御文字除去＋code-point truncate）。CSSは `cssStringLiteral`（`JSON.stringify` ＋ U+2028/U+2029 escape）＋ `setProperty` 検証、色は `rgba()` 生成。**`innerHTML`/`eval`/`document.write` 等のrisky sinkはソースに皆無**（一致箇所はdocの「避けるべし」記述のみ）。
- **DOM構築の安全性:** `render.js`/`builder.js` とも `createElement`＋`textContent`＋`dataset`＋`setAttribute` のみ。未信頼値はテキストとして表示。
- **時刻処理の堅牢性:** `Intl.DateTimeFormat`＋`hourCycle:"h23"`、`normalizeHour("24")→"00"`、`nextSecondDelay` による秒境界自己補正（`setInterval` ドリフト回避）、tab復帰時の再スケジュール。`time.test.mjs` が網羅。
- **テスト品質:** `NUMBER_LIMITS` と HTML range入力の **一致をテストで相互検証**（`config.test.mjs`）、hostileフォント/CSS入力のescape検証、`render.js` のFakeElementによるvisibility/CSS変数検証、`worker.test.mjs` の委譲検証、`build.test.mjs` の成果物検証。
- **Cloudflareコスト規律:** `wrangler.jsonc` は `ASSETS` binding のみ、`run_worker_first` 不使用、有料binding皆無。docは有料feature不使用を繰り返し明記し、GitHub Actionsはコストガードのため`.github/workflows/`不在を意図的に維持（私の確認でも `.github` 無し）。rollback runbook は「正常productionを訓練目的でrollbackしない」と安全側。
- **依存・供給鎖:** ランタイム依存ゼロ、devは `wrangler` のみ。`.gitignore` は `dist/`/`node_modules/`/`.wrangler/`/screenshot を適切に除外。**secret/token/credential/`.env` は確認範囲で皆無。**
- **日本語UX/docs:** UI/README/QAが日本語で平易。ラベル欄に「命令として実行されない形で表示」と明示するなど配信者向けの配慮。
- **AIガバナンス分離:** REVIEW_BRIEF/CLAUDE_REVIEW/AI_REVIEW_TRIAGE/CODEX_TASKS/DECISION_LOG が役割分離され、placeholderも整備。本レビューの位置付け（advisory）が明確。

---

## 5. Test and verification gap analysis

**Automated tests worth adding（自動テスト候補）**
- `builder.js` から抽出可能な純関数（share文生成、URL長警告閾値、X intent URL、preview背景クラス選択、contrast警告条件）の単体テスト — 中核導線の回帰検知。**backlog（CL-005）**、MVPブロッカーではない。
- `parseImportInput` の「`c` の生エンコード文字列のみ（URL/JSON/query以外）」の明示テスト — 現状は間接的にしかカバーされず。**backlog**、低優先。
- `configToClockUrl` の `compact:false`（フル）round-trip明示テスト（compactは有り） — 低優先。

**Manual browser/OBS checks worth doing（手動確認）**
- Neon HUD等グロー強templateでの `/clock/` 端クリップ（CL-002） — **要視覚確認**。実害判定に必須。
- 透明背景・毎秒更新・表示/非表示後の次tick復帰・URL再貼り付け再現・文字切れ（`docs/manual-qa.md` のOBS実機記録欄）。docsでは報告済だがv0.1.1変更後の再確認は要検討。
- 390px / 768px / 1280px の横スクロール無し（768pxは下記レイアウト注意点参照）。

**Deployment/Cloudflare checks worth doing**
- `npm run cf:dry-run`（binding=`ASSETS`のみ、有料feature無しの再確認）。
- `release:remote-smoke` による `/api/defaults` のCT/`no-store`/JSON body 継続検証（CL-008の担保）。
- `_headers`/`_redirects` がWorkers Static Assetsで意図通り適用されるかの定点確認（`/clock` の307はdoc記載どおりか）。

**Out of scope for now（現状は対象外で妥当）**
- 実OBS(CEF)でのフォント解決差分・実描画ピクセル一致 — OS/PC依存で単体テスト不可。`docs` 通り manual。
- 実Cloudflare課金/usage数値 — dashboard手動確認（Issue #12）に委譲が妥当。
- E2E（Playwright等）導入 — static-first/low-ops方針とコストの兼ね合い。MVPでは過剰の可能性、ChatGPT判断。

---

## 6. Security review notes

- **URL/config/import parsing:** `decodeConfig` の `JSON.parse` と base64url復号失敗は呼び出し側 `parseConfigFromQuery`/`parseImportInput` が try/catch で既定/安全値へフォールバック。`config.test.mjs` が壊れた`c`・壊れたJSON・未来versionを検証。**具体的問題は確認されず。**
- **label/font sanitization:** `safeText`（制御文字→空白、code-pointで40/80字truncate）。font値は最終的に `cssStringLiteral`（render）/`canvasFontFamily`（canvasは `["'\\;\n\r]` 除去＋80字）でさらに無害化。`localFontCssValue` の生family名も後段で正規化。**多層防御で問題なし。**
- **innerHTML等のrisky sink:** ソースに `innerHTML`/`outerHTML`/`insertAdjacentHTML`/`eval`/`new Function`/`document.write` は**不在**（grep一致はdocの注意書きのみ）。
- **CSS/style injection:** 色は厳格hex→`rgba()`、数値はclamp＋px、fontはJSON文字列リテラル、すべて `style.setProperty`（CSSOM検証）。`render.test.mjs` が hostile font の escape を確認。**問題なし。**
- **malformed/oversized input:** 数値クランプ（`NUMBER_LIMITS`）、長文truncate（emoji=surrogate安全な `Array.from`）、`cssStringLiteral` 120 code-point制限。`config.test.mjs` の「hostile long CSS-like input」「😀×45」等で検証。**問題なし。**
- **localStorage:** 編集画面のみ（`STORAGE_KEY="obs-clock-builder:v1"`）。読み書きとも try/catch でブロック時も動作継続。clock面は不参照。保存内容はconfigのみで個人情報なし。**privacy/security上の問題は確認されず。**
- **secrets/config exposure:** token/key/credential/`.env`/account識別子は確認範囲で**皆無**。docはsecret不記載を明文化し規律も良好。`*.workers.dev` subdomain・Worker version ID・issueリンクは運用メタデータ（非secret）であり、扱いはCL-007として意思決定事項に整理（値は本報告に転記せず）。
- **Cloudflare/GitHub cost or deployment safety:** `ASSETS` のみ、有料binding無し、`run_worker_first` 無し、`.github/workflows/`不在。deploy系scriptは `build` 経由でdry-run/環境指定が明確。rollback runbookは安全側。**コスト/誤デプロイ面の具体的問題は確認されず**（ただし実dashboard状態は未検証＝docの手動確認に依存）。

---

## 7. UX/UI review notes

**Concrete issues（具体的指摘）**
- **CL-001（フォールバックコピー）** は投稿文コピーUXに関わる軽微バグ（§3）。
- **CL-002（端クリップ）** はclock面の見え方に関わる視覚要確認項目（§3）。
- **タブレット768pxのレイアウト:** `styles.css` の breakpoint は `max-width: 1080px`（レイアウト1列化）と `max-width: 760px`（`form-grid`/`template-grid`/`faq-grid` を1列化）。**768pxちょうどでは760pxルールが効かず2列のまま**で、タブレット縦でフォームがやや窮屈になり得る（横スクロールは `minmax(0,1fr)` で回避見込み）。`docs/post-launch-ops.md` は「768px相当で横スクロール無し」を確認済と記載。要視覚確認の軽微点。

**Review suggestions（提案・任意）**
- **Japanese copy clarity:** 全体に平易で配信者向け。ラベル欄補足「そのまま画面用の命令として実行されない形で表示」、フォント説明、URL再現性の注意など良好。
- **OBS setup clarity:** `README.md`/`index.html`/`docs/manual-qa.md` に手順とFAQ（背景白/フォント未反映/URL紛失/PC時刻/見切れ/X画像）が揃い、非プログラマーにも追える。
- **common-problem guidance:** 透明背景・フォント・URL紛失・PC時刻・clipping・X画像添付制限をFAQ＋docで網羅。良好。
- **accessibility/keyboard/focus:** `label`で各inputを内包、`aria-live="polite"` のstatus、`aria-pressed` のtemplateトグル、`aria-describedby` でURL補足、`:focus-visible` の明確なoutline＋ `color-mix` 非対応fallback、touch target 36px以上（`ui-static.test.mjs` で検証）。良好。`output` はlabel内包で関連付けOK。
- **empty/error/loading/permission states:** import status、`loadLocalFonts` の loading/empty/権限拒否メッセージ、`fetchCloudflareDefaults` の確認中/失敗メッセージ、URL長警告（1800/4000閾値）、contrast警告（背景不透明度・stroke・shadowの条件付き）と状態表示が充実。

---

## 8. Codex-ready improvement candidate list

| Candidate ID | Based on finding | Proposed task | Type | Risk if implemented | Risk if not implemented | Estimated size | Requires manual QA? |
|---|---|---|---|---|---|---|---|
| C-01 | CL-001 | `copyText()` のフォールバックを引数内容に紐づけ、成功判定を実コピーに合わせる | bugfix | 低（局所修正） | 限定環境で投稿文の誤コピー | XS | はい（clipboard無効環境） |
| C-02 | CL-002 | clock面の原点側余白確保 or 推奨サイズ算出見直し（視覚確認後） | UX | 中（レイアウト/サイズ契約に波及） | グロー系templateの見切れ | S | はい（ブラウザ/OBS） |
| C-03 | CL-005 | `builder.js` の純ロジック抽出＋単体テスト追加（behavior不変） | test/refactor | 中（抽出リファクタの回帰） | 編集UI回帰の自動検知不可 | M（分割可） | 一部 |
| C-04 | CL-003 | `loadInitialConfig` をsearch有無判定へ小修正＋テスト | bugfix | 低 | 既定一致URLの稀な不一致 | XS | いいえ |
| C-05 | CL-004 | `lint`/`typecheck` の実体をdocで明記（必要なら将来tool導入を別途検討） | docs | 低 | 静的解析の過信 | XS | いいえ |
| C-06 | CL-006 | 正規要件サマリの集約 or REVIEW_BRIEFの正規化 | docs | 低 | 認識齟齬/scope creep | S | いいえ |
| C-07 | CL-007 | AI調整doc・運用metaのcommit/ignore方針確定（ChatGPT判断後に反映） | ops/docs | 低〜中（公開範囲） | 履歴喪失/公開時露出 | S | いいえ |
| C-08 | CL-008 | `/api/defaults` のCTが`_headers`依存である旨をdocへ注記 | docs | 低 | CT劣化の見落とし | XS | いいえ（smokeで担保） |
| C-09 | CL-009 | `npm test` が `dist/` を生成する旨をdocへ注記 | docs | 低 | 読み取り専用前提との齟齬 | XS | いいえ |

すべて **"Proposed only; requires ChatGPT triage."**（採用/保留/却下はChatGPTが判断。Codexは承認後のみ実装）

---

## 9. Suggested verification commands for later

> 私はこれらを**実行していません**。Codex/maintainer が後で実行する候補です。`npm run test` と `npm run build` は `dist/`（ignore対象）を生成します。`scripts/format-check.mjs` は読み取り専用実装ですが、本セッションでは指示に従い未実行です。

- `npm run lint`（= `node --check` 構文検査）
- `npm run typecheck`（= import/round-trip smoke）
- `npm run format:check`（最終改行/行末空白の検査。実装上は読み取り専用）
- `npm run test`（`node --test`。`build.test.mjs` 経由で `dist/` 生成）
- `npm run build`（`dist/` 生成）
- `npm run cf:dry-run`（`wrangler deploy --dry-run --env staging`。実デプロイなし）
- `npm run release:check`（lint→typecheck→format:check→test→build→cf:dry-run→`git diff --check` を順次）
- `npm run release:http-smoke`（一時ローカルサーバを起動し `/`,`/clock/`,`/clock`,`/api/defaults`,`/favicon.ico` を確認後に停止）
- `SMOKE_BASE_URL=<deploy-url> npm run release:remote-smoke`（外部URLへのHTTP確認。URL指定時のみ）

**明示承認が必要（コスト/本番影響）:**
- `npm run deploy:staging` — **要明示承認**
- `npm run deploy:production` — **要明示承認**
- `npx wrangler rollback <version-id> --env production --yes` — **要明示承認**（`docs/post-launch-ops.md` 参照）

---

## 10. Questions for ChatGPT triage

1. **MVP-blocking閾値:** 本レビューはリリースブロッカー無しと判断。CL-005（builderテスト）/CL-006（要件集約）を「v0.1.1で対応すべき」とみなすか、backlog据え置きか。閾値の明示をお願いします。
2. **AI coordination docのcommit:** `docs/{REVIEW_BRIEF,CLAUDE_REVIEW,AI_REVIEW_TRIAGE,CODEX_TASKS,DECISION_LOG,CHATGPT_HANDOFF}.md` を版管理に含めるか/ignoreするか（CL-007）。`DECISION_LOG.md` のOpen decisionにも未決として残っています。
3. **secrets/config監査:** 本レビュー範囲ではsecret/credentialは検出されず。ただし repo公開や外部共有を広げる前に、Worker version ID・`*.workers.dev` subdomain・issueリンク等の運用メタデータ掲載可否を確認すべきか（CL-007）。
4. **deployment/costレビューのscope:** Cloudflare/GitHubのコスト・デプロイ安全性をClaudeレビュー対象に含め続けるか、ChatGPT/Codexの運用レビューに委ねるか（`REVIEW_BRIEF.md` の問いと重複）。
5. **OBS実機再検証:** v0.1.0で実機確認済との記録があるが、v0.1.1（font help/usability変更）後やCL-002の視覚確認のため、リリース前にOBS実機再検証を必須とするか。

---

All findings above are advisory only and require ChatGPT triage before Codex implementation.

## Findings table

| ID | Severity | Confidence | Area | Finding | Evidence | Risk if ignored | Suggested action | ChatGPT triage status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CG-001 | Coordination | High | Review docs | Review coordination docs still contained stale pending wording after Claude output was pasted. | `docs/CLAUDE_REVIEW.md`, `docs/AI_REVIEW_TRIAGE.md`, `docs/CODEX_TASKS.md` | Future agents may think Claude review or ChatGPT triage is still pending. | Update review coordination docs. | Approved first batch |
| CL-001 | Low | High | Implementation | `copyText()` fallback selected `generatedUrl` even when copying share text. | `assets/js/builder.js` | Clipboard fallback environments may copy the wrong text. | Make fallback copy the function argument text. | Approved first batch |
| CL-002 | Low | Medium | UX/Render | `/clock/` shadow/glow clipping may occur near the viewport origin. | `assets/css/styles.css`, `assets/js/render.js` | Some templates may look clipped. | Confirm visually before any CSS/layout change. | Needs additional confirmation |
| CL-003 | Info | High | Implementation | Editor `loadInitialConfig()` may let localStorage win when URL config equals default config. | `assets/js/builder.js` | Rare editor-only mismatch. | Use explicit config-query detection before saved editor state. | Approved / implemented second batch |
| CL-004 | Info | High | Tooling/Docs | `lint` and `typecheck` script names can be misunderstood. | `package.json`, `scripts/check-js.mjs`, `scripts/module-smoke.mjs` | Static checks may be overestimated. | Document actual script behavior. | Approved docs-only first batch |
| CL-005 | Medium | High | Tests | `assets/js/builder.js` lacks broader automated tests. | `tests/`, `assets/js/builder.js` | Editor regressions rely heavily on manual QA. | Keep broader builder tests/refactor as a separately approved task. | Narrow CL-003 test slice implemented; broader scope deferred |
| CL-006 | Medium | Medium | Requirements/Docs | Requirements and non-goals are spread across multiple docs. | `README.md`, `AGENTS.md`, `docs/*` | Future scope drift or agent misunderstanding. | Consolidate existing requirements only. | Approved docs-only first batch |
| CL-007 | Info | High | Ops/Governance | AI coordination docs and operation metadata tracking/publication policy is undecided. | `git status`, `docs/post-launch-ops.md` | History may be lost or operation metadata may be exposed unintentionally. | Human/ChatGPT decision on commit/publication policy. | Needs additional confirmation |
| CL-008 | Low | Medium | Deployment/Docs | `/api/defaults` JSON `Content-Type` relies on `_headers`. | `api/defaults`, `_headers`, smoke scripts | Header regression could be missed if smoke checks are skipped. | Document the dependency and keep smoke checks. | Approved docs-only first batch |
| CL-009 | Info | High | Test/Tooling | `npm test` writes `dist/` through build test. | `tests/build.test.mjs`, `scripts/build.mjs` | Read-only assumptions can be wrong. | Document that `dist/` may be generated and remains ignored. | Approved docs-only first batch |

## Raw Claude notes

Raw Claude review output is pasted in the `Claude review output` section above. The table here is a tracking summary for ChatGPT triage and Codex handoff.

## Follow-up questions for Claude

- No follow-up questions are pending for this first Codex batch.
- If ChatGPT reopens CL-002, Claude or a browser/OBS visual pass should provide concrete evidence before any CSS/layout change.
- If ChatGPT reopens CL-007, the user or ChatGPT should decide commit/publication policy for AI coordination docs and operation metadata.
