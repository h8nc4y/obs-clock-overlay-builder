# HANDOFF — OBS Clock Overlay Builder（Codex 引き継ぎプロンプト）

> このファイルは Codex がこのリポジトリの開発を引き継ぐための「最新状況サマリ＋作業指示」です。
> 作成: 2026-06-17 / 作成者: Claude (Opus, 司令塔) / 想定読者: Codex（実装担当）
>
> **読む順番**: ① この HANDOFF.md → ② [AGENTS.md](AGENTS.md)（正の規約） → ③ 該当コードを実読。
> 本文は日本語、コード識別子・ファイル名は原文のまま。`file:line` 参照は確認の起点（行は前後しうるので必ず実コードで照合）。

---

## 0. 最重要 — 30秒で掴む現状

1. **`master` は `v1.4.0`（commit `46cc111`）で origin と同期済み・本番デプロイ済み**。`https://obs-clock-overlay-builder.h8nc4y.workers.dev` で稼働。
2. **未コミットの作業中機能が1つだけある = 「秒を小さく表示」(`smallSeconds`)**。11ファイル・約 +455 行。
   - ⚠️ **状態は「機能完成・テスト追加済み・全チェック緑・実ブラウザで描画確認済み・ただし未コミット」**。
   - `git status` だけ見ると「壊れた途中変更」に見えるが、**違う。完成しておりコミット待ち**。下の §1 が全容。
3. **このリポは「時計オーバーレイ専用」**。チャット/コメント反応は別プロジェクト `007_yt-live-word-alert-overlay` の担当で、ここには絶対に足さない。

まず現物を確認:

```bash
git status
git --no-pager diff --stat
node --test            # → 143 pass / 0 fail（=緑）
npm run lint           # node --check 構文チェックのみ（ESLintではない）
npm run typecheck      # import/encode/decode/time のスモーク（tscではない）
npm run format:check   # 末尾改行・行末空白のみを見る独自チェック（整形器ではない）
```

筆者の実測（2026-06-17）: 上記すべて緑。`node --test` = **143 pass / 0 fail**。

---

## 1. 未コミット WIP の全容 — `smallSeconds`（秒を小さく表示）

### 1.1 何の機能か
デジタル時計で、秒を本体時刻（`HH:MM`）の右下に**小さく（半分サイズ・下付き）**添える表示オプション。`12:43₅₆` のような見た目。配信者が「秒は欲しいが主張させたくない」要望に応える定番デザイン。

### 1.2 変更ファイルと役割（`git diff` の実体）

| ファイル | 変更内容 |
|---|---|
| `assets/js/config.js` | `DEFAULT_CONFIG.smallSeconds = false` 追加。`normalizeConfig`/`flatParamsToConfig`/`applyTemplate` に配線。新テンプレ **`mono-sub`**（標準カテゴリ・`showSeconds:true`+`smallSeconds:true`・Roboto Mono 白パネル）を追加。 |
| `assets/js/time.js` | `formatTimeParts` を新設し `formatClock`/`formatTime` が `time`（フル `HH:MM:SS`）に加え **`timeMain`（`HH:MM`＋AM/PM、秒なし）** と **`secondsText`（`SS` のみ）** を返すよう分離。 |
| `assets/js/render.js` | デジタル時計に `.clock-seconds-small` 別スパンを追加。`smallSeconds && showSeconds` のとき本体に `timeMain`・別スロットに `secondsText` を `setFixedWidthDigits` で描き、それ以外は従来どおりフル `time`。`secondsNode.hidden` も連動。 |
| `assets/css/clock.css` | `.clock-time-row`（font-size を集約）＋ `.clock-seconds-small`（`font-size:0.5em; vertical-align:sub; margin-inline-start:0.04em; -webkit-text-stroke は半分`）を追加。 |
| `assets/js/builder.js` | エディタUIに `#smallSeconds` チェックボックス配線（boolean field 追加）。**共有画像(Canvas)側の鏡像実装**を追加: `hasSmallShareSeconds` / `measureShareTime` / `drawShareTime`。stacked / side-label 両レイアウトの時刻描画を新ヘルパ経由に置換。 |
| `index.html` | `#smallSeconds`「秒を小さく表示」トグル（`data-clock-mode="digital"`）を追加。 |
| `tests/time.test.mjs` | `timeMain`/`secondsText` の期待値を各ケースに追加。 |
| `tests/render.test.mjs` | 小秒の別スロット描画／無効時に本体がフル `time` のままを検証。 |
| `tests/config.test.mjs` | `smallSeconds` の compact/full 往復・`smallSeconds` 欠落の旧payloadが既定 false で復号・flat param `smallSeconds=true` の解釈を検証。 |
| `tests/template-lineup.test.mjs` | `TEMPLATES.length` 期待値 17 → **18**。 |
| `tests/fixtures/template-compat.golden.json` | 全エントリに `smallSeconds:false` を追加＋ `mono-sub` の template/compact/full/styleSnapshot を追加（=golden 再生成済み）。 |

### 1.3 動作確認（筆者が実施済み）
- `npm run dev`（serve.mjs）→ `/clock/?c=<mono-sub full>` を実ブラウザで開き DOM を実測:
  - `.clock-time` = `"22:19"`（本体は `HH:MM`）、`.clock-seconds-small` = `"39"`（秒だけ別スロット）、秒の `font-size`=21px＝本体42pxのちょうど半分、`hidden=false`。
  - → **ライブ `/clock/` 面で意図どおり描画されることを確認済み**。共有Canvas側は §3.4 の鏡像実装＋テスト（render/time/config）でカバー。

### 1.4 出荷までの残タスク（=Codex が引き継いでやること）

> いずれも「機能を壊す変更」ではなく「完成品を出荷ラインに乗せる」作業。**コミット・版上げ・デプロイはオーナー（ChatGPT司令塔）承認事項**。勝手にデプロイしない。

1. **コミット**。慣習どおり Conventional Commits ＋日本語要約＋版トークン。案:
   `feat(clock): 秒を小さく表示するオプションと mono-sub テンプレを追加 v1.5.0`
2. **版上げ**: `package.json` `1.4.0` → **`1.5.0`**（新ユーザー機能＝minor。過去 v1.2.0 がピン機能追加で minor にした前例に倣う）。
3. **CHANGELOG.md**: 先頭の `## [Unreleased]` を `## [1.5.0] - YYYY-MM-DD` 化。Keep a Changelog 準拠で `### Added`（小秒オプション＋mono-subテンプレ）。**「`/clock/?c=...` 再現契約は不変」を明記**するのが当リポの慣習。
4. **ドキュメント反映（日本語ファースト）**:
   - `README.md` の機能箇条書き／日本語概要に「秒を小さく表示」を1行追加（テンプレ全17種→**18種**の表記も更新）。
   - `docs/manual-qa.md` に小秒の手動QA項目（ライブ＝`/clock/` と 共有画像 の一致確認）を追加。
5. **軽微な綻び**（任意・低優先）:
   - `tests/template-lineup.test.mjs` の新しい assert 行が**インデント4スペース**（周囲は2スペース）。`format:check` は通る（インデント非検査）が見栄えが悪い。2スペースへ揃える。
   - **テストの穴**: 共有Canvasの小秒3関数 `measureShareTime`/`drawShareTime`/`hasSmallShareSeconds` は `tests/share.test.mjs` で**直接テストされていない**（render/time 経由の間接カバーのみ）。`share.js` の純関数化前例に倣い、可能なら fake ctx で直接テストを足すと堅い。
6. **出荷前ゲート**（デプロイするなら、承認後）: `npm run release:check` → `npm run release:http-smoke` →（デプロイ先に対し）`SMOKE_BASE_URL=<url> npm run release:remote-smoke`。タグ `v1.5.0` ＋日本語タイトルの GitHub Release。

---

## 2. 引き継ぎ後の最初の一手

```bash
# 1) 現状把握
git status && git --no-pager diff --stat
node --test                      # 緑であることを確認

# 2) ローカルで実物を見る
npm run dev                      # http://localhost:4173/ （使用中なら別ポート）
#   ビルダー: http://localhost:4173/
#   時計面 : http://localhost:4173/clock/
#   小秒の確認用 mono-sub フルURL（golden fixture と同一）:
#   /clock/?c=eyJ2ZXJzaW9uIjoxLCJ0ZW1wbGF0ZSI6Im1vbm8tc3ViIiwic2hvd1NlY29uZHMiOnRydWUsInNtYWxsU2Vjb25kcyI6dHJ1ZX0
#   （↑これは compact。full 版は tests/fixtures/template-compat.golden.json の template-mono-sub-full 参照）
```

**判断が要る点（オーナー承認事項。Codex単独で進めない）**: ①このWIPをこのままコミットしてよいか ②版 `1.5.0` でよいか ③デプロイまで進めるか。スコープが承認されるまでは「コミット可能な状態に整える（CHANGELOG/README/版/テスト綻び）」までを準備し、実コミット・デプロイは承認後に。

---

## 3. プロジェクト全体像（オリエンテーション）

**一言**: 依存ゼロの静的Webアプリ。OBS のブラウザソースに貼る**透明背景の時計オーバーレイURL**を作るビルダー。ビルド時バンドルなし、`scripts/build.mjs` が `dist/` へファイルをコピーするだけ。Cloudflare Workers (Static Assets) で配信。

### 3.1 2つの面と起動
- **エディタ `index.html`**（`assets/js/builder.js`）: `loadInitialConfig()` → `mountClock(previewプレビュー)` → `init()`。プレビューは**ローカル `new Date()`**（サーバー時刻補正なし）。
- **時計専用 `clock/index.html`**（`assets/js/clock.js`）: `parseConfigFromQuery(location.href)` → `mountClock(root,{now:correctedNow})` → 毎秒 tick。`startTimeSync()` でサーバー時刻補正、`visibilitychange`/`pageshow(bfcache)` で再開。**`builder.css` を読まない＝透明背景を維持**。

### 3.2 モジュール責務
- `config.js` — **唯一の正**: `DEFAULT_CONFIG`/`TEMPLATES`/`FONT_CANDIDATES`、サニタイズ `normalizeConfig`、URLコーデック `encodeConfig`/`decodeConfig`（base64url）、`configToClockUrl`/`parseConfigFromQuery`、import 解釈 `parseImportInput`、色/コントラスト助関数。
- `builder-initial-config.js` — エディタ初期状態の優先順位（`?c=`/flat > 有効な localStorage > 既定）。
- `builder.js` — エディタ全体（フォーム束縛・ライブプレビュー・URL生成/警告・debounce永続化・テンプレ/スウォッチ・ローカルフォント・コントラスト警告・**共有画像Canvasパイプライン**）。export ゼロ・末尾で即時 `init()`・DOM副作用ありで **Node から import 不可**。テストしたいロジックは純関数として別モジュールへ切り出すのが定石（前例: `builder-initial-config.js`, `share.js`）。
- `render.js` — 純DOM/SVG描画。`mountClock`（digital/analog/flip）・`applyClockStyles`（`--clock-*` CSS変数を書く）・アナログ角度・フリップ・`recommendedObsSize`。
- `clock.js` — `/clock/` ブート＋サーバー補正tickループ＋ライフサイクル。
- `time.js` — `Intl.DateTimeFormat` ベースの整形（`createFormatters`/`formatClock`、`nextSecondDelay` 等）。**今回 `timeMain`/`secondsText` を追加**。
- `time-sync.js` — サーバー時刻補正。`/api/defaults` を `no-store` で叩き **レスポンスの `Date` ヘッダ**だけ読む（本文は使わない）。往復中点で `offsetMs` 推定。失敗時は `offsetMs=0`＝ローカル時計に**無言フォールバック**（OBSでコンソールエラーを出さない）。**この補正値は `?c=` には絶対入れない**（再現性維持）。
- `worker/index.js` — Cloudflare Worker。全リクエストを `env.ASSETS.fetch(request)` に委譲するだけ。
- `functions/api/defaults.js` — Cloudflare **Pages** 用の動的版（`request.cf` から geo）。Workers デプロイでは**使われない**（`dist/` にもコピーされない）。互換のため残置。
- CSS: `tokens.css`（両面共有値のみ）/ `base.css`（リセット・`html.clock-page-root` で透明背景強制）/ `clock.css`（**時計描画契約＝凍結扱い**、compatテスト＋承認でのみ変更）/ `builder.css`（エディタ専用＋3テーマ）/ `styles.css`（旧キャッシュ救済の `@import` シムのみ、現HTMLは未参照）。

### 3.3 再現性契約（最重要・`config.js`）
- **正本 = `?c=` ペイロード**。`CONFIG_VERSION = 1`。`DEFAULT_CONFIG` は `Object.freeze`（**今 41 フィールド**、`smallSeconds` 追加後）。
- **`normalizeConfig` が唯一のサニタイズ関門**。全フィールドが既定値seedから始まり既知キーのみ代入＝未知キーは落ちる。
  - boolean: `coerceBool`（`hour12/showSeconds/smallSeconds/showDate/showWeekday`。`showSeconds` は `raw.showSeconds ?? raw.seconds` 等の別名フォールバックあり）。
  - enum: `enumValue`（厳格 allowlist。`template/clockType/dateFormat/weekdayFormat/labelPosition/analogMarks/analogSecondHand/flipGroup`）。
  - number: `clampNumber`（`NUMBER_LIMITS` 21キー。`null/""` は既定へ。`fontWeight` は100刻みに丸め）。
  - timezone: `sanitizeTimezone`（`Intl.DateTimeFormat` で実在検証、不正は `Asia/Tokyo`）。
  - 色: `normalizeHex`（**`/^#[0-9a-fA-F]{6}$/` 厳格**。`rgb()`/named/`url()`/3桁/8桁すべて拒否＝CSS注入の主防御）。
  - 自由文字列 `label`(40cp)/`fontFamily`(80cp): `stripControlText`＋`truncateCodePoints`。**HTMLエスケープはここでなく描画境界で**: render は `cssStringLiteral`（JSON文字列化＋U+2028/2029エスケープ＋120cp）で CSS へ安全に出す。
- **encode/decode**: `encodeConfig` は normalize → (compact なら `compactConfig`＝既定値と異なるキーだけ) → base64url。`decodeConfig` は base64url戻し → `JSON.parse` → `normalizeConfig`。**compact と full は同じ config に復号**（欠落キーは既定でseed）。
- **後方互換は構造的に担保**: バージョン分岐なし。欠落キー→既定、別名 `v→version`/`theme→template`、範囲外→再clamp、未知キー→破棄。**よって過去に共有された任意の `?c=` は復号可能**。これを壊さないことが至上命題。
- flat互換: `?tz=&seconds=&date=&weekday=&font=&theme=&smallSeconds=...`。`?c=` が優先。テンプレ名付き flat はそのテンプレ config に上書きで重ねる。

### 3.4 テンプレートと共有画像
- `TEMPLATES`（`Object.freeze`、**18件**）。各要素 = `{id,name,note,sampleText,category,config}`。カテゴリ: standard(4)/cute(4)/cool(3)/analog(4)/flip(3)。`applyTemplate` はテンプレで見た目を上書きしつつ **timezone/hour12/showDate/dateFormat/showWeekday/weekdayFormat はユーザー値を保持**、`showSeconds`/`smallSeconds` は「テンプレが明示すれば従う、なければ保持」（`mono-sub` だけ true を明示）。
- **共有画像 = 時計の見た目を“二度目に”実装している**（重要な構造）。ライブは DOM+CSS（`render.js`+`clock.css`）、共有PNGは Canvas（`builder.js` の `drawDigitalShareClock*` 群＋ `share.js`/`share-decorations.js`）。**正は常にライブ(`clock.css`)。共有Canvasを後から合わせる（逆は禁止）**。1200×675・完全クライアント内・ネット/外部フォント不使用（CSP安全）。モバイルは `navigator.share`、PCは「PNG保存→X投稿画面」フォールバック。
- レイアウト数学は純関数化済み（`computeStackedLayout`/`computeSideLabelLayout` in `share.js`）＝Canvasに触れずユニットテスト可能。装飾は `templateDecoration`(データ)＋`drawDigitalTemplateDecorations`(描画)。
- **小秒の鏡像**（§1のWIP）: Canvas側の定数 `0.5`(サイズ)/`0.04`(gap)/`0.18`(sub下げ)/`0.5`(stroke) は `clock.css:128-140` の値の手写し。`hasSmallShareSeconds` ゲートで measure/draw を分岐。

### 3.5 ビルド / デプロイ / 運用
- npm scripts: `build`(コピーのみ)/`dev`(serve.mjs, 既定:4173, 本番同等のセキュリティヘッダ注入)/`lint`(`node --check`)/`typecheck`(module-smoke)/`format:check`(末尾改行・行末空白のみ)/`test`(`node --test`)/`release:check`(lint→typecheck→format→test→build→cf:dry-run→`git diff --check` を順に)/`release:http-smoke`/`release:remote-smoke`(要 `SMOKE_BASE_URL`)/`cf:dry-run`/`deploy:staging`/`deploy:production`。
- `build.mjs`: `dist/` をクリーン再生成し `index.html`/`clock/`/`assets/`/`api/`/`favicon.ico`（必須、欠けたら throw）＋ `_redirects`/`_headers`（任意）をコピー。`api/defaults` は静的JSON `{"timezone":null,"country":null,"source":"static"}`。`DIST_DIR` で出力先上書き可（テストが共有 `dist/` と競合しないため）。
- Cloudflare: `wrangler.jsonc` の Workers + Static Assets が主。env `staging`=`obs-clock-overlay-builder-staging` / `production`=`obs-clock-overlay-builder`。**有料バインディング（D1/KV/R2/Queues/DO/Workflows/Hyperdrive/Workers AI/AI Gateway）は契約外＝足さない**。
- セキュリティヘッダ（`_headers` と `serve.mjs` で同一）: `X-Content-Type-Options: nosniff` / `Referrer-Policy: no-referrer` / CSP `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; object-src 'none'; form-action 'self'`。**`frame-ancestors` は意図的に未設定**（`/clock/` を OBS に埋め込めるように）。`/api/defaults` は `no-store`＋`application/json`。
- 運用ポリシー（`docs/post-launch-ops.md`）: 本番デプロイ/ロールバックは承認＋ゲート必須。**健全な本番でロールバックを訓練実行しない**。ロールバック候補IDやWorker版IDは**repoに記録しない**（インシデント時にCloudflare実リストから選ぶ）。secret/token/実データ/private URL/ローカルパスをrepoに書かない。GitHub Actions は**意図的に不在**（費用管理）＝勝手に `push`/`pull_request` トリガを足さない。

### 3.6 テストと golden fixture
- `node:test`＋`node:assert/strict` のみ（外部フレームワークなし）。14ファイル・**143 pass**。DOMは自前 `FakeElement`/`FakeStyle`、Canvasは「呼び出し記録するfake ctx」、`fetch`/`document` はスタブ。
- **golden fixture**（`tests/template-compat.golden.json` ＋ `tests/template-compat.test.mjs`）が「既出 `?c=` URLが二度と無言で見た目変化しない」契約を凍結（`defaultConfig` 41フィールド・全18テンプレ・compact/full 復号結果・flat query・`applyClockStyles` スナップショット）。
  - **再生成は「契約を意図的に変えた時だけ」**: `node tests/fixtures/generate-template-compat-golden.mjs`（npmエイリアスなし）。configフィールド/テンプレ追加・encode/decode・`applyClockStyles` 変更時に実行し、**差分をレビューしてコミット**。`template-lineup.test.mjs` の件数(18)も同時更新。
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

---

## 5. 規約（守ること）

- **コミット**: `type(scope): 日本語の要約 vX.Y.Z`。type=feat/fix/chore/docs/refactor/test、scope例=ui/share/clock/release/hardening。リリースは `chore(release): vX.Y.Z`。全角（）＋・英数は固有名詞/テンプレ名のみ。
- **日本語ファースト**: Web UI・README・Issue/PR 本文は配信者に分かる平易な日本語。コードコメントは**機械的に日本語化しない**（非自明な製品挙動/運用/費用/デプロイ文脈のときだけ）。
- **`format:check` の実態**: prettier 等ではなく独自スクリプトで「末尾改行・行末空白」だけ見る。**インデントやクォートは検査しない**。よって整形ツール（prettier/eslint）を勝手に導入しない。スタイルは周囲のコードに合わせる。
- **`lint`/`typecheck` も名前と中身が違う**: lint=`node --check`(構文のみ)、typecheck=import/encode/decode/time のスモーク（TypeScriptではない）。TypeScript化・ビルドツール導入は契約外。
- **依存を足さない**: `devDependencies` は `wrangler` のみ。ランタイム依存ゼロが売り。npm パッケージ追加は原則しない。
- **テンプレ/configフィールドを足したら**: ①`DEFAULT_CONFIG`/`normalizeConfig`/flat/`compactConfig` 全層に配線 ②`template-lineup.test.mjs` の件数更新 ③golden 再生成（§3.6）④共有Canvas（ライブと二重描画）への反映 ⑤READMEの種類数表記。今回の `smallSeconds` がまさにこの全層変更の実例＝参考にできる。

---

## 6. Codex 運用上の注意（この環境固有の地雷）

- **Windows サンドボックスはサブプロセスのファイル書込を弾く**（`os error 5` / `CreateProcessAsUserW failed: 5`）。`ruff --fix`/`git apply`/外部整形器など「子プロセスがファイルを書く」操作は途中で失敗し、最悪ファイルが削除状態で残る。
  - 対策: 編集は `apply_patch` 主体に。大規模な機械置換は避けるか、最終検証（`npm run release:check` 等）は**サンドボックス外**で回す前提に。`git apply` 系を使うなら影響を小さく。
  - 競合誘発を避けるため、同一ファイルを複数エージェントで同時編集しない（ファイル所有権で分割）。
- **未コミットのまま放置しない**: この環境は別リポで「未コミット変更が再同期で消える」事故例がある。意図する変更は最終的にコミットして durable に。
- **ガバナンス（`docs/HOW_WE_USE_CODEX.md`）**: 公開ドキュメント上の役割は「ChatGPT=司令塔/トリアージ、Claude=助言的レビュー(read-only)、Codex=承認スコープのみ実装」。レビュー指摘＝実装承認ではない。**コミット・版上げ・デプロイ・PR はオーナー承認後**。検証で飛ばしたチェック・不明点・残リスクは捏造せず正直に記録。
- **secret/実データ非接触**: token/OAuth/実ユーザーデータを読まない・送らない・repoや決定ファイルに書かない。

---

## 7. 今後のバックログ（`smallSeconds` 出荷の先）

ROADMAP（短期）＋直近の全体レビュー（v1.4.0で大半消化済み）からの残り:

- README スクショ/例を UI 変更に追従更新（小秒・mono-sub のスクショ追加候補）。
- 配信者フィードバックを GitHub Issue テンプレで収集 → digital/analog/flip テンプレ陣容を磨く。
- 公開可能な実機 OBS QA 結果の記録（`docs/manual-qa.md` 系）。
- a11y/キーボード QA の拡充。
- 共有Canvas小秒3関数の直接テスト追加（§1.4-5、唯一残るカバレッジの穴）。
- ラベルの NFKC/全半角/かな正規化は**具体的な要望が出たときだけ**再検討（先回りしない）。

**やらないこと**: チャット反応機能・YouTube連携・有料バインディング・フォント同梱・GitHub Actions の常時トリガ・`/clock/` の localStorage 依存化。

---

### 付録: 確認用クイックリファレンス

```bash
# 状態
git status
git --no-pager diff
node --test                                   # 143 pass を確認
npm run release:check                         # 出荷前フルゲート（cf:dry-run 含む。実行可な環境でのみ）

# 動かす
npm run dev                                    # / と /clock/

# golden を意図的に更新するとき（フィールド/テンプレ変更時のみ）
node tests/fixtures/generate-template-compat-golden.mjs
```

正の規約は [AGENTS.md](AGENTS.md)。本ファイルはスナップショット（2026-06-17）。コミット後やデプロイ後は内容が古くなるので、引き継ぎ完了後は実状に合わせて更新するか削除してよい。
