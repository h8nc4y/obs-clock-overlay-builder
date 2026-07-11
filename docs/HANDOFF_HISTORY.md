# HANDOFF 実施メモ履歴

`HANDOFF.md` に蓄積していた日付付き実施メモの保管場所です。現在の状態・残タスク・規約は
[HANDOFF.md](../HANDOFF.md) が正であり、本ファイルは「いつ・誰が・何を・どう検証したか」の
時系列記録として残します。リリース内容の正確な一覧は [CHANGELOG.md](../CHANGELOG.md) と
GitHub Releases、コード変更の詳細は git log / PR を参照してください。

記載順は古い順です。各メモは記録当時のスナップショットであり、テスト数・残タスク・
デプロイ状態などは現在と異なる場合があります。

---

**Codex 2026-06-21**: PR #110 merge 済み、merge commit `88506a9`。annotated tag `v1.5.0` と GitHub Release `https://github.com/h8nc4y/obs-clock-overlay-builder/releases/tag/v1.5.0` 作成済み。本番 deploy は未実施。

**Codex 2026-06-27**: Claude advisory の「remote smoke に HTML セキュリティヘッダ検証を追加」は `release-remote-smoke.mjs` と `tests/release-remote-smoke.test.mjs` で実装済み。`/`、`/clock/`、`/clock` は CSP / `X-Content-Type-Options` / `Referrer-Policy` を検査し、OBS 埋め込み維持のため `frame-ancestors` 混入も回帰として落とす。production deploy / remote smoke 実行は引き続きオーナーGO後。

**Codex 2026-06-28**: PR #115 / merge commit `d54452f` で、Workers Static Assets の `/api/defaults` は `timezone:null` の静的fallbackであり timezone自動提案をしない契約を README / post-launch ops / tests へ同期済み。PR #116 / merge commit `1e7e91c` で handoff を PR #115 後の状態へ更新し、PR #117 / merge commit `640a5ad` で template URL compatibility comments を明確化済み。PR #118 / merge commit `f8eac6c` で handoff を PR #117 後の状態へ同期済み。本番 deploy / remote smoke / Cloudflare dashboard確認は引き続き未実行。

**Codex 2026-06-29**: `scripts/check-js.mjs` は `node --check` 子プロセスが起動前に失敗して `stderr/stdout` が空でも、`ERR_INVALID_ARG_TYPE` で二次クラッシュせず対象ファイルと起動エラーを表示する。Windows sandbox で `spawnSync ... EPERM` が出る場合は通常の構文エラーではなく実行環境の子プロセス制限として扱い、必要に応じて権限付き実行で `npm run lint` を再確認する。

**Codex 2026-06-30**: `fix/template-picker-a11y-names` でテンプレート一覧に `role="group"` / `aria-label="テンプレート一覧"` を追加し、生成テンプレートボタンの `aria-label` を「テンプレート『名前』を適用: 補足文」に揃えた。機能面の a11y/キーボード QA として `docs/manual-qa.md` にロール/Tab確認項目を追記。検証は `npm run lint` / `typecheck` / `format:check` / `npm test`（151 pass）/ `npm run build` / `git diff --check` が通過。Chrome DevTools で 500/768/1280px の横スクロールなし、テンプレート一覧DOM属性、テンプレートボタン名を確認。390px相当は Chrome DevTools の最小実測幅が500pxになり、Playwrightはbrowser未導入/起動制約のため未確認。`release:check` は Cloudflare dry-runを含むため未実行。

**Codex 2026-07-01**: `docs/sync-pr120-current-state` で handoff の冒頭サマリを PR #119/#120 後の実状態へ同期。コード・公開プロセス文書・Cloudflare ゲートには触れていない。

**Codex 2026-07-01 21:50**: Chrome DevTools MCP で `node scripts/serve.mjs` のローカル 4173 番を確認し、Builder `/` と clock-only `/clock/` を 390x844 / 768x1024 / 1280x900 で実測。全 viewport で `documentElement.scrollWidth <= clientWidth`、横スクロールなし。`/clock/` は `builderControlsPresent:false` で編集 UI 不在。Network は app asset/API が 200、console は DevTools の `evaluate_script` 由来と思われる CSP issue のみで app error/warn は未検出。これにより 2026-06-30 メモの「390px相当未確認」は解消済み。production deploy / remote smoke / Cloudflare dashboard確認は当時点で未実行。

**Claude Fable5 2026-07-02（本番デプロイ・要件再定義）**: オーナーGO(第一目的=実ユーザー獲得、成功指標=外部利用シグナル+自分のOBSで常用+公開品質、公開方針=無料範囲で露出増)を取得し、`release:check` → `release:http-smoke` → `deploy:production` → remote smoke を全通過。production は v1.5.0 配信中(当時)。要件再定義・市場調査・Codexセカンドオピニオンは `docs/FABLE5_REQUIREMENTS_REVIEW.md` 参照。

**Claude Fable5 2026-07-02（v1.5.1）**: オーナー指摘のUI不具合4件+UIUXレビュー承認7件を実装し v1.5.1 として版上げ。内容: ①小秒を `vertical-align: baseline` で分と下ぞろえ(共有Canvas鏡像 `SMALL_SECONDS_BASELINE_OFFSET_EM=0`) ②デジタルのテンプレカードを `mountClock` 実描画へ統一 ③カードを現在の表示設定8項目(秒/小秒/日付/曜日/各書式/TZ/12h)へ追従(署名比較で差し替え、focus/aria-pressed維持) ④Studio Live / Night Studio の時刻下線を `.clock-time-row` へ移し小秒まで到達(共有PNGは元から全幅で無変更) ⑤モバイルで共有パネルをSTEP後ろへ(`display:contents`+`order`、基底 `grid-area` は `auto` へ戻す必要ありに注意) ⑥浮遊プレビュー対策の `scroll-margin-top` ⑦URL文字数を控えめ色 ⑧STEP番号を sr-only 提示 ⑨推奨サイズ用途説明・リード能動化・共有見出し中立化。検証: 151 pass 維持、実ブラウザで下線右端=小秒右端の実測一致、UIUXレビューは frontend-developer(Opus)実測。オーナー「deployまでGO」回答(2026-07-02)に基づき、merge 後に tag → GitHub Release → release:check → deploy:production → remote smoke を実施。

**Claude Fable5 2026-07-03（v1.6.0）**: オーナー指示の表示設定細分化を実装し v1.6.0 として版上げ。内容: ①`dateFormat` enum を廃止し `dateYear`/`dateZeroPad`/`dateSeparator` の3軸へ分解(12通り) ②`weekdayBrackets`(ja=全角（）/en=半角()) ③`meridiemFirst`(AM/PM前置、digital/flip/共有PNG共通、24時間時disabled連動) ④こだわり表示欄でラベル位置を左端へ。**旧 `dateFormat` は入力エイリアス**(theme→template方式)で新3軸へ写像し既存URL の見た目を完全維持。DEFAULT_CONFIG は45フィールドに。golden 意図的再生成(見た目値の変更なし)。テスト151→160。実装=codex-deep(GPT-5.5)、ただし Codex sandbox が検証不能(`CreateProcessAsUserW failed: 5`)のため検証は Claude 実施。Codex の実行時DOM注入UIは静的HTMLへ書き直し、`syncFormFromState` の旧 `elements.dateFormat` 残存TypeError等3バグをレビューで検出・修正。オーナー「deployまでGO」(2026-07-03)。

**Claude Fable5 2026-07-03（v1.7.0）**: 文字調整の細分化を実装し v1.7.0 として版上げ。①`meridiemSize`(既定0.55、意図的デザイン変更)でAM/PMを時刻より小さく(digital/flip静的トークン/共有PNG共通、24h時disabled) ②`dateWeekdayGap`(既定0=詰める、意図的変更) ③`labelWeight`/`labelLetterSpacing`/`dateWeight`/`dateLetterSpacing` は **nullable override(null=連動)**で旧URL完全互換(CSSは `var(--x, 従来固定値)` フォールバック化、applyClockStylesはnon-null時のみset) ④こだわり「文字の詳細」→「文字調整：ラベル/日付/時刻」3グループ+個別調整トグル(UI状態、OFF=null) ⑤miniPreviewSignature の廃止済みdateFormat参照を修正。DEFAULT_CONFIG 51フィールド。`NULLABLE_NUMBER_LIMITS` 新設。テスト184 pass。golden再生成(既存見た目値はbyte-identical)。実装=Sonnet 5(codex-deep が sandbox 障害 `CreateProcessAsUserW failed: 5` でファイル読取も不能だったためフォールバック。トリアージ済み・他ウィンドウのCodexセッション競合疑い)。オーナー「deployまでGO」(2026-07-03)。

**Claude Fable5 2026-07-07（v1.7.1）**: design-taste-frontend 監査の承認2件を実装し v1.7.1 として版上げ(PR #128)。①h2 1.08→1.22rem / h3 0.96→1.06rem で見出し階層をサイズでも支える ②浮遊プレビューのピン📌絵文字をインラインSVG(丸頭+針、currentColor・1em追従)へ置換、未固定時45°傾きと状態色切替は維持。エディタ専用変更で `/clock/` 出力・再現性契約に影響なし。tag / GitHub Release 作成済み、本番反映済み(2026-07-11 実測で一致確認)。

**Claude Fable5 2026-07-11（引き継ぎ整備）**: HANDOFF を v1.7.1 実状態へ同期(184 pass / 51フィールド / 本番一致の実測を反映)し、残タスクを出荷後フェーズへ再構成。README 日本語版プライバシーへ「ラベルに未公開情報を入れない」注意書きを追加(英語版は反映済みだった)。Fable5 期の引き継ぎドラフト3件(`docs/CLAUDECODE_FABLE5_HANDOFF.md` / `docs/CLAUDECODE_FABLE5_PROMPT.md` / `docs/FABLE5_REQUIREMENTS_REVIEW.md`、いずれも 2026-07-02 時点 v1.5.0 基準の歴史的記録)を履歴としてコミット。以後の司令塔運用は `docs/CLAUDECODE_HANDOFF.md`(post-Fable5・役割名ベース)が正。

**Claude Fable5 2026-07-12（docs 全面整理）**: HANDOFF.md を再構成し、日付付き実施メモを本ファイルへ移設。`docs/PRODUCT_REQUIREMENTS.md` へオーナー確定済みの目的・価値仮説・成功指標(2026-07-02 回答)を統合し、機能要件を v1.7.1 の実装へ追従、旧「ChatGPT司令塔」体制の記述を現行運用へ更新。ROADMAP を残タスク P1〜P3 と整合させ、「Issueテンプレ整備」が実は完了済み(.github/ISSUE_TEMPLATE に3種在存)だった誤りを修正。
