# HANDOFF — OBS Clock Overlay Builder（Codex 引き継ぎ＆自走プロンプト）

> このファイルは **Codex がこのリポジトリの開発を単独で引き継いで進める**ための「最新状況サマリ＋作業指示＋運用ルール」です。
> 更新: 2026-07-16 / 2026-07-11 固定分掌廃止を反映 / 想定読者: Codex（開発主軸）
>
> **読む順番**: リポジトリ直下の [CODEX_START_HERE.md](CODEX_START_HERE.md) に記載された「読み順（正本）」に従う。
> 過去の日付付き実施メモは [docs/HANDOFF_HISTORY.md](docs/HANDOFF_HISTORY.md) に時系列で保管。リリース内容は [CHANGELOG.md](CHANGELOG.md) が正。
> 本文は日本語、コード識別子・ファイル名は原文のまま。`file:line` 参照は確認の起点（行は前後しうるので必ず実コードで照合）。

---

## ★ 貼り付け用キックオフ（Codex 起動時にこれだけ渡せばよい）

```
あなた（Codex）はこのリポジトリ（011_obs-clock-overlay-builder）の開発主担当です。
まず CODEX_START_HERE.md を読み、そこに記載された正本資料を順に読んでから着手してください。

運用ルール:
- 開発はあなた（Codex）が単独で進めて構いません。レビューは原則あなたのセルフレビューで十分です。
- 要件・設計・UI・実装・テスト・ドキュメントを end-to-end で担当してください。補助 skill や外部レビューは、
  リスク・曖昧さ・専門性・反復失敗などで品質向上に実益がある場合だけ使い、固定分掌として待たないでください。
- 本番デプロイ（production）だけは外向き・課金が絡むので、ゲート（release:check 等）を通したうえでオーナーに最終GOを取ってください。
  それ以外（コード/テスト/docs/コミット/ブランチ/PR/版上げ準備/CHANGELOG/staging 検証）は自走で進めて構いません。

最初の一手: `git status` と `node --test` で現状（v1.7.1 リリース済み・本番反映済み／185 pass）を確認し、
HANDOFF.md §1 の残タスクから着手してください。壊してはいけない不変条件は §4、規約・Git/リリース実務は §5 にまとめてあります。
```

---

## 0. 最重要 — 30秒で掴む現状

1. **`master` は `v1.7.1` リリース＋PR #129 まで完了**。v1.5.0（小秒表示）→ v1.5.1（UI微調整11件）→ v1.6.0（日付3軸分解・曜日括弧・AM/PM前置）→ v1.7.0（文字調整3グループ・AM/PM小型化・nullable override）→ v1.7.1（見出しスケール・ピンSVG化）まで、各版とも annotated tag と GitHub Release 作成済み。
2. **本番は v1.7.1 と一致**。production URL `https://obs-clock-overlay-builder.h8nc4y.workers.dev` の配信物を 2026-07-11 に実測し、ローカルとの一致を確認済み。Worker version ID は運用ポリシーに従い repo へ記録しない。
3. **テストは `node --test` 185 pass / 0 fail**（2026-07-16 実測。数字は snapshot、減ったら回帰）。`DEFAULT_CONFIG` は **51 フィールド**、テンプレは **18 種**。
4. **このリポは「時計オーバーレイ専用」**。チャット/コメント反応は別プロジェクト `007_yt-live-word-alert-overlay` の担当で、ここには絶対に足さない。

まず現物を確認:

```bash
git status
node --test                       # → 185 pass / 0 fail
npm run lint                      # node --check 構文チェックのみ（ESLintではない）
npm run typecheck                 # import/encode/decode/time のスモーク（tscではない）
npm run format:check              # 末尾改行・行末空白のみを見る独自チェック（整形器ではない）
npm run release:http-smoke        # ローカルHTTP smoke（production deployではない）
```

---

## 1. 残タスク（v1.7.1 出荷後・2026-07-16 更新）

実装・リリース・本番反映は v1.7.1 まで完了済み。残りは「出す・見せる・見つかる」フェーズ。優先順位と市場調査の根拠は [docs/PRODUCT_REQUIREMENTS.md](docs/PRODUCT_REQUIREMENTS.md) §目的・§成功指標（経緯の詳細は `docs/FABLE5_REQUIREMENTS_REVIEW.md`）:

1. [ ] **P1: OBS実機QA の公開記録** — [docs/manual-qa.md](docs/manual-qa.md) §OBS実機確認 の記録欄を production URL ベースで埋める。**実機操作はオーナー**。手順書・チェックリスト・記録テンプレは整備済みで、残るのは実機結果の記入（OBS Browser Source 固有差分: 透明背景・キャッシュ・フォント解決・DPI・URL長・秒更新の安定性）。
2. [x] **P2: README スクショ更新** — `docs/assets/editor-preview.png` を v1.7.1 の現行UIへ更新。1440×900 のローカル実画面を採用し、390×844 / 768×1024 / 1440×900 で横スクロールなし、console error/warning なし、失敗requestなしを 2026-07-16 に確認。対応PR: #135
3. [x] **P3: 発見可能性** — `index.html` に canonical / Open Graph / X Card metadata を追加し、1200×630 のローカル実画面 `assets/og-image.png` を配信対象へ追加。build artifact・PNG実寸・remote smoke fixture をテストで固定し、`npm run release:check` / `npm run release:http-smoke` を通過。Playwright でローカル metadata、画像 200 / `image/png`、console / network error なしを 2026-07-16 に確認。production deploy / production URL の remote smoke は未実施。
4. **保留: 新機能・新テンプレ** — 配信者フィードバック（GitHub Issue）が来てから。Issue テンプレは `.github/ISSUE_TEMPLATE/`（bug_report / feature_request / feedback）に**整備済み**なので、収集導線の新設は不要。

---

## 2. 運用モデル（重要）

**要件・意匠・実装は Codex が自走し、本番デプロイだけオーナーGO** — これが現行方針。詳細:

| 観点 | 運用 |
|---|---|
| **開発の主導** | Codex 単独（タスク分解・実装・テスト・docs・コミット・ブランチ・PR・版上げ準備）。逐一の承認待ちは不要。 |
| **レビュー** | 原則 Codex のセルフレビュー。`node --test`＋§5 のチェックリストを必ず通す。 |
| **フロントの「デザイン」** | 意匠判断（配色・タイポ・余白/サイズ感・レイアウトの美観・新テンプレの見た目・共有画像の構図・色コントラスト調整）も Codex が担当する。「対象 / 現状 / 制約（依存ゼロ・CSP・`clock.css` 凍結・再現性契約）/ 狙い / 受け入れ基準」を整理し、実装 → テスト → 共有Canvas鏡像化 → golden再生成まで完遂する。補助 skill やレビューは必要時だけ使う。 |
| **Codex が担当する範囲** | 要件、意匠、ロジック/状態/配線、サニタイズ・コーデック・正規化、テスト・golden fixture、共有Canvasの鏡像化、ドキュメント、リリース機構、バグ修正。 |
| **本番デプロイ** | 外向き＋課金が絡むため**ゲート通過＋オーナー最終GO**（唯一の人間確認ゲート）。staging までは自走可。 |

迷ったら: Codex が要件・意匠・挙動・契約・配線・検証を一貫して担当し、補助 skill や外部レビューは固定分掌ではなく必要性で選ぶ。

**公開ガバナンス文書の扱い**: [docs/HOW_WE_USE_CODEX.md](docs/HOW_WE_USE_CODEX.md) は「ChatGPT=司令塔、Claude=助言レビュー、Codex=承認スコープのみ実装」という**歴史的・対外的なプロセス記録**であり、文面はオーナー承認なく書き換えない。ただしそれは日々の作業ゲートではない — オーナーが上表の通り Codex セルフレビューへ権限委譲済み。「公開文書は承認前提と書いてあるのに自走してよいのか？」で止まらないこと。答えは「日々の実装は自走、公開文書はそのまま保全」。

---

## 3. プロジェクト全体像（オリエンテーション）

**一言**: 依存ゼロの静的Webアプリ。OBS のブラウザソースに貼る**透明背景の時計オーバーレイURL**を作るビルダー。ビルド時バンドルなし、`scripts/build.mjs` が `dist/` へファイルをコピーするだけ。Cloudflare Workers (Static Assets) で配信。

### 3.1 2つの面と起動
- **エディタ `index.html`**（`assets/js/builder.js`）: `loadInitialConfig()` → `mountClock(preview)` → `init()`。プレビューは**ローカル `new Date()`**（サーバー時刻補正なし）。
- **時計専用 `clock/index.html`**（`assets/js/clock.js`）: `parseConfigFromQuery(location.href)` → `mountClock(root,{now:correctedNow})` → 毎秒 tick。`startTimeSync()` でサーバー時刻補正、`visibilitychange`/`pageshow(bfcache)` で再開。**`builder.css` を読まない＝透明背景を維持**。

### 3.2 モジュール責務
- `config.js` — **唯一の正**: `DEFAULT_CONFIG`/`TEMPLATES`/`FONT_CANDIDATES`、サニタイズ `normalizeConfig`、URLコーデック `encodeConfig`/`decodeConfig`（base64url）、`configToClockUrl`/`parseConfigFromQuery`、import 解釈 `parseImportInput`、色/コントラスト助関数。
- `builder-initial-config.js` — エディタ初期状態の優先順位（`?c=`/flat > 有効な localStorage > 既定）。
- `builder.js` — エディタ全体（フォーム束縛・ライブプレビュー・URL生成/警告・debounce永続化・テンプレ/スウォッチ・ローカルフォント・コントラスト警告・**共有画像Canvasパイプライン**）。export ゼロ・末尾で即時 `init()`・DOM副作用ありで **Node から import 不可**。テストしたいロジックは純関数として別モジュールへ切り出すのが定石（前例: `builder-initial-config.js`, `share.js`）。
- `render.js` — 純DOM/SVG描画。`mountClock`（digital/analog/flip）・`applyClockStyles`（`--clock-*` CSS変数を書く）・アナログ角度・フリップ・`recommendedObsSize`。
- `clock.js` — `/clock/` ブート＋サーバー補正tickループ＋ライフサイクル。
- `time.js` — `Intl.DateTimeFormat` ベースの整形（`createFormatters`/`formatClock`、`timeMain`/`secondsText` 分離、`nextSecondDelay` 等）。
- `time-sync.js` — サーバー時刻補正。`/api/defaults` を `no-store` で叩き**レスポンスの `Date` ヘッダ**だけ読む（本文は使わない）。往復中点で `offsetMs` 推定。失敗時は `offsetMs=0`＝ローカル時計に**無言フォールバック**（OBSでコンソールエラーを出さない）。**この補正値は `?c=` には絶対入れない**（再現性維持）。
- `worker/index.js` — Cloudflare Worker。全リクエストを `env.ASSETS.fetch(request)` に委譲するだけ。
- `functions/api/defaults.js` — Cloudflare **Pages** 用の動的版。Workers デプロイでは**使われない**（`dist/` にもコピーされない）。互換のため残置。
- CSS: `tokens.css`（両面共有値のみ）/ `base.css`（リセット・`html.clock-page-root` で透明背景強制）/ `clock.css`（**時計描画契約＝凍結扱い**、compatテスト＋承認でのみ変更）/ `builder.css`（エディタ専用＋3テーマ）/ `styles.css`（旧キャッシュ救済の `@import` シムのみ、現HTMLは未参照）。

### 3.3 再現性契約（最重要・`config.js`）
- **正本 = `?c=` ペイロード**。`CONFIG_VERSION = 1`。`DEFAULT_CONFIG` は `Object.freeze`（**51 フィールド**）。
- **`normalizeConfig` が唯一のサニタイズ関門**。全フィールドが既定値seedから始まり既知キーのみ代入＝未知キーは落ちる。
  - boolean: `coerceBool`（`hour12/showSeconds/smallSeconds/showDate/showWeekday` 等。`showSeconds` は `raw.showSeconds ?? raw.seconds` の別名フォールバックあり）。
  - enum: `enumValue`（厳格 allowlist。`template/clockType/analogMarks/analogSecondHand/flipGroup/dateSeparator/weekdayFormat/labelPosition`）。
  - number: `clampNumber`（`NUMBER_LIMITS`。`null/""` は既定へ。`fontWeight` は100刻みに丸め）。**`NULLABLE_NUMBER_LIMITS`**（v1.7.0）は null=連動を許す override 群（`labelWeight/labelLetterSpacing/dateWeight/dateLetterSpacing` 等）で、null のとき CSS は `var(--x, 従来固定値)` フォールバックで旧URL互換を保つ。
  - timezone: `sanitizeTimezone`（`Intl.DateTimeFormat` で実在検証、不正は `Asia/Tokyo`）。
  - 色: `normalizeHex`（**`/^#[0-9a-fA-F]{6}$/` 厳格**。`rgb()`/named/`url()`/3桁/8桁すべて拒否＝CSS注入の主防御）。
  - 自由文字列 `label`(40cp)/`fontFamily`(80cp): `stripControlText`＋`truncateCodePoints`。**HTMLエスケープはここでなく描画境界で**: render は `cssStringLiteral`（JSON文字列化＋U+2028/2029エスケープ＋120cp）で CSS へ安全に出す。
- **encode/decode**: `encodeConfig` は normalize → (compact なら `compactConfig`＝既定値と異なるキーだけ) → base64url。`decodeConfig` は base64url戻し → `JSON.parse` → `normalizeConfig`。**compact と full は同じ config に復号**（欠落キーは既定でseed）。
- **後方互換は構造的に担保**: バージョン分岐なし。欠落キー→既定、別名 `v→version`/`theme→template`/**旧 `dateFormat`→日付3軸への写像**（v1.6.0 で enum 廃止、入力エイリアスとして受理継続）、範囲外→再clamp、未知キー→破棄。**よって過去に共有された任意の `?c=` は復号可能**。これを壊さないことが至上命題。
- flat互換: `?tz=&seconds=&date=&weekday=&font=&theme=&smallSeconds=...`。`?c=` が優先。テンプレ名付き flat はそのテンプレ config に上書きで重ねる。

### 3.4 テンプレートと共有画像
- `TEMPLATES`（`Object.freeze`、**18 件**）。各要素 = `{id,name,note,sampleText,category,config}`。カテゴリ内訳: **standard 4**（mono-compact / mono-sub / minimal-clear / studio-live）/ cute 4 / cool 3 / analog 4 / flip 3。`applyTemplate` はテンプレで見た目を上書きしつつ **timezone/hour12/showDate/showWeekday 等の表示設定はユーザー値を保持**、`showSeconds`/`smallSeconds` は「テンプレが明示すれば従う、なければ保持」（`mono-sub` だけ true を明示）。
- **共有画像 = 時計の見た目を"二度目に"実装している**（重要な構造）。ライブは DOM+CSS（`render.js`+`clock.css`）、共有PNGは Canvas（`builder.js` の `drawDigitalShareClock*` 群＋ `share.js`/`share-decorations.js`）。**正は常にライブ(`clock.css`)。共有Canvasを後から合わせる（逆は禁止）**。1200×675・完全クライアント内・ネット/外部フォント不使用（CSP安全）。モバイルは `navigator.share`、PCは「PNG保存→X投稿画面」フォールバック。
- レイアウト数学は純関数化済み（`computeStackedLayout`/`computeSideLabelLayout` in `share.js`）＝Canvasに触れずユニットテスト可能。装飾は `templateDecoration`(データ)＋`drawDigitalTemplateDecorations`(描画)。
- 小秒などの Canvas 側定数（サイズ比・gap・下げ量）は `clock.css` 側の値の**手写し**。ライブを変えたら Canvas 定数の追従を忘れない。

### 3.5 ビルド / デプロイ / 運用
- npm scripts: `build`(コピーのみ)/`dev`(serve.mjs, 既定:4173, 本番同等のセキュリティヘッダ注入)/`lint`(`node --check`)/`typecheck`(module-smoke)/`format:check`(末尾改行・行末空白のみ)/`test`(`node --test`)/`release:check`(lint→typecheck→format→test→build→cf:dry-run→`git diff --check` を順に)/`release:http-smoke`/`release:remote-smoke`(要 `SMOKE_BASE_URL`)/`cf:dry-run`/`deploy:staging`/`deploy:production`。
- `build.mjs`: `dist/` をクリーン再生成し `index.html`/`clock/`/`assets/`/`api/`/`favicon.ico`（必須、欠けたら throw）＋ `_redirects`/`_headers`（任意）をコピー。`api/defaults` は静的JSON `{"timezone":null,"country":null,"source":"static"}`。`DIST_DIR` で出力先上書き可（テストが共有 `dist/` と競合しないため）。
- Cloudflare: `wrangler.jsonc` の Workers + Static Assets が主。env `staging`=`obs-clock-overlay-builder-staging` / `production`=`obs-clock-overlay-builder`。**有料バインディング（D1/KV/R2/Queues/DO/Workflows/Hyperdrive/Workers AI/AI Gateway）は契約外＝足さない**。
- セキュリティヘッダ（`_headers` と `serve.mjs` で同一）: `X-Content-Type-Options: nosniff` / `Referrer-Policy: no-referrer` / CSP `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; object-src 'none'; form-action 'self'`。**`frame-ancestors` は意図的に未設定**（`/clock/` を OBS に埋め込めるように）。`/api/defaults` は `no-store`＋`application/json`。
- 運用ポリシー（[docs/post-launch-ops.md](docs/post-launch-ops.md)）: 本番デプロイ/ロールバックは承認＋ゲート必須。**健全な本番でロールバックを訓練実行しない**。ロールバック候補IDやWorker版IDは**repoに記録しない**（インシデント時にCloudflare実リストから選ぶ）。secret/token/実データ/private URL/ローカルパスをrepoに書かない。GitHub Actions は**意図的に不在**（費用管理）＝勝手に `push`/`pull_request` トリガを足さない。

### 3.6 テストと golden fixture
- `node:test`＋`node:assert/strict` のみ（外部フレームワークなし）。**185 pass**（2026-07-16 時点）。DOMは自前 `FakeElement`/`FakeStyle`、Canvasは「呼び出し記録するfake ctx」、`fetch`/`document` はスタブ。
- **golden fixture**（`tests/fixtures/template-compat.golden.json` ＋ `tests/template-compat.test.mjs`）が「既出 `?c=` URLが二度と無言で見た目変化しない」契約を凍結（`defaultConfig`・全テンプレ・compact/full 復号結果・flat query・`applyClockStyles` スナップショット）。
  - **再生成は「契約を意図的に変えた時だけ」**: `node tests/fixtures/generate-template-compat-golden.mjs`（npmエイリアスなし）。configフィールド/テンプレ追加・encode/decode・`applyClockStyles` 変更時に実行し、**差分をレビューしてコミット**。`template-lineup.test.mjs` の件数も同時更新。
  - ⚠️ **意図しない失敗を再生成で握りつぶさない**。それは実バグ＝コードを直す。再生成は「契約を意図的に変えた」宣言行為。

---

## 4. 壊してはいけない不変条件（hard contracts）

AGENTS.md / CONTRIBUTING.md / PRODUCT_REQUIREMENTS.md / ROADMAP.md に横断して書かれている荷重壁:

1. **`/clock/?c=...` が OBS 再現の正本**。壊れた `c`/JSON/不正TZ/色/数値は**既定or安全範囲に正規化**、決して実行しない。
2. **`/clock/` は時計専用＋透明背景対応**。編集UI/共有UIを混ぜない。
3. **`/clock/` は editor `localStorage` に依存しない**（編集補助には使ってよいが、再現の必須にしない）。manual-QA で「localStorage 削除しても URL だけで再現」を検証。
4. **未信頼入力をサニタイズ・`innerHTML` 等の危険シンク禁止**。`ui-static.test.mjs` が `innerHTML`/`eval` 等の不在をガード。
5. **フォントファイルを同梱しない**（追加時はライセンス確認し `docs/licenses` に記録）。URL にはフォント名文字列のみ。
6. **バックエンド/有料サービスを承認なく足さない**。サーバー時刻補正は同一オリジンの `Date` ヘッダのみ＝バックエンド増設ではない。`/api/defaults` は静的フォールバックで、無くても時計はURL設定だけで動く。
7. **スコープ＝時計のみ**。チャット/コメント反応・YouTube API/OAuth は 007 の担当。ここに足さない。
8. Cloudflare は **Workers + Static Assets が第一**。Pages 互換は `functions/api/defaults.js` が無害な任意フォールバックである限り維持。
9. **公開ガバナンス文書の文面（`docs/HOW_WE_USE_CODEX.md` の役割記述）をオーナー承認なく書き換えない**（AGENTS.md には役割記述は無い＝対象外）。実作業の運用更新は本 HANDOFF が担う。

---

## 5. 規約（守ること）＋ セルフレビュー・チェックリスト

- **コミット**: `type(scope): 日本語の要約 vX.Y.Z`。type=feat/fix/chore/docs/refactor/test、scope例=ui/share/clock/release/hardening。リリースは `chore(release): vX.Y.Z`。全角（）＋・英数は固有名詞/テンプレ名のみ。
- **日本語ファースト**: Web UI・README・Issue/PR 本文は配信者に分かる平易な日本語。コードコメントは**機械的に日本語化しない**（非自明な製品挙動/運用/費用/デプロイ文脈のときだけ）。
- **`format:check` の実態**: prettier 等ではなく独自スクリプトで「末尾改行・行末空白」だけ見る。**インデントやクォートは検査しない**。よって整形ツール（prettier/eslint）を勝手に導入しない。スタイルは周囲のコードに合わせる。
- **`lint`/`typecheck` も名前と中身が違う**: lint=`node --check`(構文のみ)、typecheck=import/encode/decode/time のスモーク（TypeScriptではない）。TypeScript化・ビルドツール導入は契約外。
- **依存を足さない**: `devDependencies` は `wrangler` のみ。ランタイム依存ゼロが売り。npm パッケージ追加は原則しない。
- **テンプレ/configフィールドを足したら**: ①`DEFAULT_CONFIG`/`normalizeConfig`/flat/`compactConfig` 全層に配線 ②`template-lineup.test.mjs` の件数更新 ③golden 再生成（§3.6）④共有Canvas（ライブと二重描画）への反映 ⑤READMEの種類数表記。前例: v1.5.0 `smallSeconds`（全層変更）、v1.7.0 nullable override（旧URL互換の作法）。

**コミット前セルフレビュー（最低限これを通す）**:
1. `node --test` 緑（pass 数が**減っていない**／意図して増えている）。
2. `npm run lint && npm run typecheck && npm run format:check` 緑。
3. 再現性契約（§3.3）・hard contracts（§4）を壊していないか自問。
4. config/テンプレ変更なら golden を**意図的に**再生成し diff をレビュー済みか。
5. 見た目（意匠）を変えたか？ → **変えたならデザインエスカレーション（§2）を通したか**。通していない審美変更はコミットしない（通したなら trailer で記録）。
6. docs（README/CHANGELOG/manual-qa）の追従が要るか。

### Git / リリースの実務（自走の手順）

- **ブランチ**: 既定ブランチは `master`。通常は `master` に直接コミットせず、作業ブランチを切る（例: `feature/<short-kebab>`）。履歴は PR マージ運用。
- **コミット**: メッセージは上記 Conventional Commits。**secret/token/実データを含めない**。意匠変更なら §2 の `Design:` trailer を付す。
- **PR**: `gh pr create`（本文は日本語・標準構成: 概要/変更/検証/レビュー観点/残リスク/費用）。通常のコード/ドキュメント変更は Codex セルフレビューで merge まで自走可。不確実性が高い/契約に触れる変更は任意で ChatGPT・Claude にレビュー依頼してよい（依頼はオーナー経由）。
- **タグ＆Release（手動）**: このリポは **GitHub Actions を意図的に置いていない**ので、リリースは手動。版上げ＋CHANGELOG確定後、`git tag vX.Y.Z` → push → `gh release create vX.Y.Z --title "<日本語タイトル>" --notes-file <CHANGELOG該当節>`。**本番デプロイはこのタグ確定とゲート（§3.5）通過＋オーナーGOの後**。
- **本番デプロイ（唯一の人間確認ゲート）**: `npm run release:check`（cf:dry-run 含む）→ `npm run release:http-smoke` → オーナーGO → `npm run deploy:production` → `SMOKE_BASE_URL=<prod> npm run release:remote-smoke`。Cloudflare の課金/上限はダッシュボードで人が確認（数値は repo に書かない）。

---

## 6. この環境固有の地雷（Codex 運用上の注意）

- **Windows サンドボックスはサブプロセスのファイル書込を弾く**（`os error 5` / `CreateProcessAsUserW failed: 5`）。`ruff --fix`/`git apply`/外部整形器など「子プロセスがファイルを書く」操作は途中で失敗し、最悪ファイルが削除状態で残る。実例: 2026-07-03 に codex-deep がファイル読取も不能になった（他ウィンドウの Codex セッション競合疑い）。
  - 対策: 編集は `apply_patch` 主体に。大規模な機械置換は避けるか、最終検証（`npm run release:check` 等）は**サンドボックス外**で回す前提に。`git apply` 系を使うなら影響を小さく。
  - 競合誘発を避けるため、同一ファイルを複数エージェントで同時編集しない（ファイル所有権で分割）。
- **未コミットのまま放置しない**: この環境は別リポで「未コミット変更が再同期で消える」事故例がある。意図する変更は最終的にコミットして durable に。実装済みの機能や handoff 更新も、確認後に小さく commit/push して保全する。
- **正直な記録**: 検証で飛ばしたチェック・不明点・残リスクは捏造せず正直に記録する（テスト結果・コミット・デプロイ・PR・アプリ状態をでっち上げない）。
- **secret/実データ非接触**: token/OAuth/実ユーザーデータを読まない・送らない・repoや決定ファイルに書かない。

---

### 付録: 確認用クイックリファレンス

```bash
# 状態
git status
git --no-pager diff --stat
node --test                                   # 緑を確認（現状 185 pass・減っていないこと）

# 動かす
npm run dev                                    # http://localhost:4173/ （builder: / 時計面: /clock/）
#   小秒確認用 mono-sub compact URL（golden fixture と同一）:
#   /clock/?c=eyJ2ZXJzaW9uIjoxLCJ0ZW1wbGF0ZSI6Im1vbm8tc3ViIiwic2hvd1NlY29uZHMiOnRydWUsInNtYWxsU2Vjb25kcyI6dHJ1ZX0

# 本番デプロイ前フルゲート（オーナーGO後。cf:dry-run 含む）
npm run release:check

# golden を意図的に更新するとき（フィールド/テンプレ変更時のみ）
node tests/fixtures/generate-template-compat-golden.mjs
```

前提（コールドスタート時）: Node は **20 以上**（`node:test` / ESM 前提）。`wrangler` は devDependency なので、`release:check`/`cf:dry-run` を回す前に一度 `npm install`（ランタイム依存はゼロなのでアプリ自体の動作には不要）。

正の規約は [AGENTS.md](AGENTS.md)。過去の実施メモは [docs/HANDOFF_HISTORY.md](docs/HANDOFF_HISTORY.md)。本ファイルはスナップショット（2026-07-16）。コミット後やデプロイ後は内容が古くなるので、節目ごとに実状へ更新すること。

## 外部レビュー指摘の台帳（2026-07-15 maxエフォート横断レビュー）

読取専用レビュー（実行検証なし）の指摘。採否と実装は次担当が判断する。完了時は行頭を [x] にし、対応PRを追記する。

- [x] docs/README.md(資料マップ)が無い — README部分リンクのみ。026/027形式の索引追加を推奨。対応PR: #134
- [x] PRODUCT_REQUIREMENTS.mdに「未決事項」節がない(残タスクはHANDOFF委譲)。1節追加を推奨。対応PR: #134
- [ ] builder.js:36 — BUILDER_URLが本番URLハードコード(fork/staging配布時もシェア文言が本番を指す。意図的なら注記)。confidence低
