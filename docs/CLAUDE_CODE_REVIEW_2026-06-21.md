# Claude Code 独立再レビュー — 011_obs-clock-overlay-builder（2026-06-21）

> 本ファイルは Claude Code (Opus 4.8) による 2026-06-21 時点の独立再レビュー結果です。Codex はこのファイルを参照してください。
> レビューに際してソースコード/資材は一切変更していません（docs への本ファイル追加のみ）。
> 本レビューは advisory です。既存の CLAUDE_REVIEW.md / AI_REVIEW_TRIAGE.md / CODEX_TASKS.md フローに対する、独立した最新の所見です。

## 2026/06/25 Codex補足

このレビューは 2026-06-21 時点の静的所見です。現行 `master` ではその後 PR #111 (`beb9d90`) で v1.5.0 後の handoff 状態が更新済みです。
本レビュー内の M1/M2/Low/改善提案は履歴的 advisory として扱い、着手前に現行 `HANDOFF.md`、`AGENTS.md`、`README.md`、`docs/post-launch-ops.md`、該当 source/tests で再確認してください。本番 deploy、Cloudflare dry-run、release/tag、manual Actions dispatch、secret/real data/cost 操作は引き続きゲートです。

## レビュー範囲と方法

精読したファイル:

- docs: `docs/PRODUCT_REQUIREMENTS.md`, `docs/ROADMAP.md`(一覧)、`HANDOFF.md`(冒頭〜§2)
- 規約: `README.md`, `AGENTS.md`, `CLAUDE.md`
- セキュリティ/正しさの核: `assets/js/config.js`(全 1047 行), `assets/js/render.js`(全 520 行), `assets/js/time.js`(全), `assets/js/time-sync.js`(全), `assets/js/clock.js`(全), `assets/js/share.js`(全)
- エディタ配線(抜粋): `assets/js/builder.js`(行 655-754, 855-972, 1080-1169。share/font/clipboard/window.open まわりを重点)
- 配信/運用: `worker/index.js`, `functions/api/defaults.js`, `api/defaults`(静的), `_headers`, `_redirects`, `wrangler.jsonc`, `package.json`, `scripts/build.mjs`, `scripts/serve.mjs`, `scripts/release-http-smoke.mjs`, `scripts/release-remote-smoke.mjs`
- テスト: `tests/worker.test.mjs`(全)。他テスト群はファイル名/サイズで存在確認(`config.test.mjs`, `render.test.mjs`, `share.test.mjs`, `time*.test.mjs`, `template-*.test.mjs`, `ui-static.test.mjs` ほか計15ファイル)
- 横断検索: `assets/js` 全体に対し `innerHTML|outerHTML|insertAdjacentHTML|document.write|eval|new Function|localStorage|queryLocalFonts|navigator.share|clipboard|window.open|location.href=` を grep

サンプリング/未読の範囲(context discipline):

- `builder.js` は 1756 行のうち約 25% を精読。Canvas 共有描画(`drawShareClock`/`drawShareBackground`/`drawShareFooter` の内部実装)とフォーム配線の全行は未読。
- `assets/css/*`(builder.css 30KB ほか)、`tests/*` の本文、`docs/CODEX_FOR_OSS_*` 系、`browser-temp/`(.gitignore 対象)、`dist/`/`node_modules/` は未読。
- 指示に従い `.env`/secrets/実データは読んでいない(本リポにはそもそも存在しない設計)。

前提: ビルド・テスト・lint・deploy・ネットワークアクセスは一切実行していない。`HANDOFF.md` の「`node --test` 146 pass」は記載を信頼した未実行の前提。

## プロジェクト目標の理解（docsベース）

事実(docs 明記):

- OBS のブラウザソースに貼る「透明背景フレンドリーな時計オーバーレイ URL」を作る、ランタイム依存ゼロの静的 Web アプリ。
- 正本は生成 `/clock/?c=<base64url>` URL。`/clock/` は時計専用面で、編集 UI も `localStorage` 依存も持たない。
- 未信頼入力(URL/import/label/font/timezone/色/数値)は HTML 実行せず、安全な既定値・許可列挙・範囲内数値・検証済み timezone へ正規化する。
- `/clock/` は同一オリジン `/api/defaults` の HTTP `Date` ヘッダでサーバー時刻補正、失敗時は system time へフォールバック。バックエンドは増やさない。
- Cloudflare Workers Static Assets を第一候補にした無料枠運用。有料 binding/DB/auth は追加しない(non-goals)。
- 日本語ファースト UI。AI フロー(ChatGPT 司令塔/Claude advisory/Codex 実装)を docs に記録。

推定(推定と明記): 現状は `v1.5.0`(smallSeconds + 全18テンプレ)コードリリース済みで、本番デプロイ前の段階という `HANDOFF.md` の記述は、コード/テンプレ実装と整合しており妥当と判断。

## 総合評価

健全性: **良好**

中核契約(再現性・サニタイズ・透明背景・無料枠・バックエンド無し)が設計とコードで一貫して守られている。`config.js` の正規化は列挙値ホワイトリスト・範囲クランプ・hex 厳格検証・timezone 実検証・制御文字除去・コードポイント truncate を網羅し、`render.js`/`clock.js` は全 DOM 書き込みが `textContent`/`setAttribute`/`dataset` で、`innerHTML`/`eval` 系 sink はリポジトリ全体で 0 件。CSP は `unsafe-inline` 無し・インライン script/style 無しで実際に成立しており、Canvas 共有も完全クライアントサイドでネットワーク送信が無い。`time-sync.js` は失敗時に必ずローカル時刻へ落ちる防御的設計で、OBS で console エラーを出さない配慮も効いている。

懸念は Critical/High 級は見当たらず、運用・テスト整合・軽微なコード品質の Medium/Low に留まる。OSS 公開・本番デプロイへ進められる水準。

## 指摘事項

### 🔴 Critical

該当なし。

### 🟠 High

該当なし。

### 🟡 Medium

**M1. Pages 版 `functions/api/defaults.js` と Workers 版で `/api/defaults` の JSON が異なり、`source` の意味が分岐する**

- `functions/api/defaults.js:2-7` は `cf.timezone`/`cf.country` を返し `source` は `"cloudflare"|"fallback"`。一方 Workers Static Assets で配信される `api/defaults`(静的ファイル)は `{"timezone":null,"country":null,"source":"static"}` 固定。`worker/index.js` は全リクエストを `env.ASSETS.fetch` に委譲するため、Workers デプロイでは常に静的版が返る。
- 影響: 第一候補(Workers)では `/api/defaults` は timezone 候補を一切返さない。`PRODUCT_REQUIREMENTS.md:40` の「候補が取れない環境でも時計表示は URL 設定だけで動く」は満たすので機能破綻ではないが、Pages 互換のコードパスは実質デッドコードに近く、`/api/defaults` の補助情報(timezone 自動提案)は Workers 本番では機能しない。`docs` の表現と実挙動の乖離になりうる。
- 推奨対応: (a) この分岐を docs(post-launch-ops 等)で「Workers では timezone 候補は出ない/出さない設計」と明記する、もしくは (b) Workers 本番でも cf 情報を返したいなら静的アセットでなく Worker 側で `/api/defaults` を生成する案を検討(ただしこれは「バックエンドを増やさない」non-goal と緊張するため、現状維持＋docs 明記が無難)。advisory。
- 確度: 高(コードで確認)。ただし「これを変えるべきか」は ChatGPT/オーナー判断。

**M2. `time-sync` のサーバー時刻補正は `Date` ヘッダの秒精度に依存し、丸めにより最大約1秒の系統誤差が残りうる**

- `time-sync.js:15-21` は `Date.parse(header)`(秒精度)とローカル往復中点の差を offset にする。HTTP `Date` はミリ秒を持たないため、サーバーが「いま」を返した瞬間でも 0〜999ms の切り捨て分だけ offset が過小に出る系統的バイアスが入る(往復遅延とは別)。
- 影響: docs(`PRODUCT_REQUIREMENTS.md:67`)が「秒未満の精度や NTP 級の厳密さは保証しない」と明言済みなので契約違反ではない。実害は「表示秒が真の秒境界より平均 ~0.5 秒早く/遅く切り替わりうる」程度。配信時計としては許容範囲。
- 推奨対応: 現状維持で問題なし。気になる場合のみ「`Date` の秒に +500ms 加える/中点でなく `start` 寄りに重み付け」等の経験的補正を検討できるが、過剰実装になりやすい。advisory・優先度低め。
- 確度: 高(ロジック上の性質)。

### 🟢 Low

**L1. dev サーバ `serve.mjs` のパストラバーサル防御が Windows セパレータ前提**

- `scripts/serve.mjs:71-74` で `normalized.replace(/^(\.\.[/\\])+/, "")` 後に `target.startsWith(`${root}\\`)` と `${root}/` の両方をチェックしており実用上は防げているが、`rootWithSeparator` 変数名が `\\` 固定で可読性が低い。これは dev 専用(本番は Workers が配信)なのでセキュリティ実害は限定的。
- 推奨対応: `path.relative(root, target)` が `..` で始まらないことを判定する形にすると OS 非依存で明快。advisory。
- 確度: 中(防御は効いているが表現が脆い)。

**L2. `config.js` の `gap` がエディタ非公開だが URL 経由では受理され続ける**

- `config.js:615` のコメント通り `gap` は編集 UI 非公開・テンプレ専用だが、`flatParamsToConfig`(`config.js:839`)と `NUMBER_LIMITS` 経由で外部 URL から任意の `gap`(0〜40)を注入できる。視覚レイアウトが変わるだけで安全性問題は無いが、「UI に無い隠しパラメータ」が公開 API 的に残る。
- 影響: 軽微。再現性契約上はむしろ受理する方が一貫的(古い URL 互換)。
- 推奨対応: 現状維持で可。意図(後方互換)を 1 行 docs 化しておくと将来の混乱を防げる。
- 確度: 高。

**L3. `applyTemplate` が `showSeconds`/`smallSeconds` のみテンプレ優先、他の表示系は現状維持で非対称**

- `config.js:643-651`: テンプレ適用時に `showSeconds`/`smallSeconds` はテンプレ値があれば優先、`showDate`/`showWeekday`/`hour12`/`timezone` はユーザー現状維持。`mono-sub` が秒を強制 ON にする意図は理解できるが、テンプレ切替で秒だけ勝手に変わる挙動はユーザーには非対称に映りうる。
- 影響: 仕様判断の領域。バグではない。
- 推奨対応: 意図的なら docs/コメントに「テンプレは秒スタイルを規定値として持ち込む」と明記。advisory。
- 確度: 中(意図の確認が必要)。

### 💡 改善提案

- `worker/index.js` は単純委譲のみで `_headers` を honor する前提。Workers Static Assets が `_headers` を適用することは前提として正しいが、リモート smoke(`release-remote-smoke.mjs`)は `/api/defaults` の `cache-control: no-store` を検証している一方、トップ/clock の CSP ヘッダ存在は検証していない。本番で CSP が落ちていないことを remote smoke に 1 ケース足すと、ヘッダ回帰を早期検知できる(再現性・セキュリティ契約の自動ガード強化)。
- `share.js` の `canvasFontStack`(303-309)と `config.js` の `cssStringLiteral`(761-764)はフォント名サニタイズの二系統。役割は違う(Canvas font 文字列 vs CSS 文字列リテラル)が、両方が同じ未信頼 `fontFamily` を扱うので、テストで「危険文字を含む fontFamily を両経路へ流して安全化を確認する」共通ケースがあると意図が固定される(`font-names.test.mjs` 既存だが網羅範囲は未確認)。

## 要件カバレッジ

満たしている点(docs の目標に対し):

- 再現性契約(`/clock/?c=...` 正本、`/clock/` の localStorage 非依存、旧 flat query 互換): `config.js` の encode/decode/parse 各経路と `clock.js` の `parseConfigFromQuery(window.location.href)` で成立。
- サニタイズ(URL/import/label/font/tz/色/数値): `normalizeConfig` で網羅。HTML injection sink 無し。
- 透明背景・時計専用面: `clock/index.html` は時計のみ、CSP は `frame-ancestors` を付けず埋め込み可。
- サーバー時刻補正＋フォールバック: `time-sync.js`/`clock.js` で成立、失敗時ローカル時刻。
- 無料枠/バックエンド無し/有料 binding 無し: `wrangler.jsonc` に binding 追加無し、Worker は静的委譲のみ。
- 全18テンプレ・smallSeconds: `TEMPLATES`(18件)と `smallSeconds` 配線を確認。
- 日本語ファースト UI: 文言・エラー・空状態が日本語。

未達・乖離:

- M1 のとおり、Workers 本番では `/api/defaults` の timezone 候補が常に null(機能要件としては「URL 設定だけで動く」を満たすため許容範囲だが、補助機能としての timezone 自動提案は Workers では無効)。これは欠落ではなく設計上の分岐で、docs 明記が望ましい。

## セキュリティ・プライバシー所見

- 入力検証は堅牢。列挙値はホワイトリスト(`enumValue`)、数値は `clampNumber` で範囲クランプ＋非有限値拒否、色は `^#[0-9a-fA-F]{6}$` 厳格、timezone は `Intl.DateTimeFormat` で実検証、テキストは制御文字除去＋コードポイント truncate。`fontWeight` は 100 刻み丸め。
- XSS 面: `assets/js` 全体に `innerHTML`/`insertAdjacentHTML`/`document.write`/`eval`/`new Function` は 0 件。`render.js` の SVG/HTML 生成は全て `setAttribute`/`textContent`/`createElementNS`。`cssStringLiteral` は CSS カスタムプロパティへ入れる font 名を `JSON.stringify`＋U+2028/2029 エスケープで無害化。
- CSP: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; object-src 'none'; form-action 'self'`。`unsafe-inline` 無し、インライン script/style 無し、`data:` は img のみ(共有 PNG/favicon 用)。`X-Content-Type-Options`/`Referrer-Policy: no-referrer` も付与。`frame-ancestors` 不在は OBS 埋め込みのための意図的設計で docs に明記済み。
- プライバシー: backend/DB/secret 無し。`/api/defaults` は `Date` ヘッダ取得目的で `no-store` GET のみ、設定や個人データを送らない。`localStorage` は編集補助に限定され `/clock/` は非依存。clipboard/queryLocalFonts は明示的ユーザー操作後のみ、拒否/非対応は日本語で手入力誘導。
- オープンリダイレクト/外部遷移: `window.open(elements.generatedUrl.value, "_blank", "noopener")`(`builder.js:678`)は同一オリジンの生成 URL のみ、`noopener` 付き。`buildXIntentUrl`(`share.js:262`)は `x.com/intent/tweet` 固定でユーザー文/URL は `URLSearchParams` でエンコード。問題なし。
- 重大なセキュリティ指摘は無し。

## テスト・検証の所見

- テスト資産は config/render/share/time/time-sync/template/ui-static/worker/build/font-names/analog/builder-initial-config と広く、golden fixture(`tests/fixtures/template-compat.golden.json`)で互換性退行を捕捉する設計。`HANDOFF.md` 記載で 146 pass(未実行・記載信頼)。
- `worker.test.mjs` は委譲先 URL と静的 JSON 形状を検証。`release-remote-smoke.mjs` は status/content-type/cache-control/JSON 形状を本番 URL で検証。
- 自動テストで届かない範囲(docs も明示): 実ブラウザ描画、OS フォント、OBS 透明背景の実見え、文字切れ、queryLocalFonts/navigator.share の実機権限挙動。`docs/manual-qa.md` でカバーする運用。
- 改善余地(💡 既述): remote smoke への CSP ヘッダ検証追加、fontFamily 危険文字の二経路サニタイズ共通テスト。いずれも advisory。

## 前回レビューからの差分

本リポジトリ直下・docs 配下に既存の `CLAUDE_REVIEW.md` は見当たらず(調整状態は `HANDOFF.md` に集約)。よって **前回 Claude レビュー無し**。本ファイルが Claude Code による初回の独立レビュー記録です。`docs/CODEX_FOR_OSS_*`(readiness/evidence/application draft)は未読のため、そこに過去の Claude 所見があれば別途突き合わせを推奨。

## Codex への推奨アクション（優先順位付き）

1. **M1**: Workers 本番で `/api/defaults` が timezone 候補を返さない点を、`docs/post-launch-ops.md` か README の該当箇所に「Workers では timezone 自動提案は出さない設計／Pages 版 `functions/api/defaults.js` は optional fallback」と 1〜2 行で明記する(コード変更不要・docs 整合のみ)。ChatGPT/オーナー確認の上で。
2. **💡(検証強化)**: `release-remote-smoke.mjs` に「`/` と `/clock/` のレスポンスに CSP ヘッダが含まれる」検証を 1 ケース追加し、本番でのヘッダ回帰を自動検知できるようにする(再現性・セキュリティ契約の自動ガード)。
3. **L3 / L2**: `applyTemplate` の秒スタイル持ち込みと `gap` の URL 互換受理について、意図をコメント/docs に 1 行ずつ残す(将来のステートレス引き継ぎでの誤解防止)。
4. **L1**: dev 専用 `serve.mjs` のパストラバーサル判定を `path.relative` ベースへ整理(任意・可読性向上、セキュリティ実害は限定的)。
5. **💡(テスト)**: `fontFamily` に引用符/セミコロン/改行を含む値を `cssStringLiteral` と `canvasFontStack` の両経路へ流す共通テストの有無を確認し、無ければ追加。

いずれも advisory。本番デプロイ前ゲート(`release:check`/オーナー GO)を阻害する Blocker は本レビューでは検出していません。

## 未確認事項

- `node --test` 146 pass / lint / typecheck / format:check / build の実行結果(指示によりコマンド未実行。`HANDOFF.md` の記載を信頼)。
- `builder.js` の Canvas 共有描画本体(`drawShareClock`/`drawShareBackground`/`drawShareFooter` 等)とフォーム配線の全行。共有 PNG とライブ `clock.css` のピクセル整合は未検証(視覚は manual QA 領域)。
- `assets/css/*` の実内容(builder.css/clock.css)。CSP 上インラインが無いことは HTML 側で確認済みだが、CSS の `url()` 等で外部参照が無いかは未精読。
- Workers Static Assets が `_headers` の `/api/defaults` 個別ヘッダ(`Cache-Control: no-store`)を本番で実際に適用するかの実機確認(remote smoke が緑なら担保されるが、本レビューでは未実行)。
- `docs/CODEX_FOR_OSS_READINESS.md` / `EVIDENCE_INDEX.md` / `APPLICATION_DRAFT.md` の内容(OSS 公開準備の網羅性は未読)。
