# PRODUCT_REQUIREMENTS

## Status

`obs-clock-overlay-builder` のプロダクト要件・非目標・品質契約の正本です。

`README.md`、`AGENTS.md`、`docs/manual-qa.md`、`docs/post-launch-ops.md` に分散していた要件を統合し、2026-07-02 のオーナー回答（目的・成功指標・公開方針）と市場調査結果（経緯は `docs/FABLE5_REQUIREMENTS_REVIEW.md`）を反映しています。現在の開発状況と残タスクは `HANDOFF.md` を参照してください。

## Product purpose

日本語話者のOBS配信者が、**アカウント登録・ソフト追加・デザイン知識なしで、短時間で自分の配信画面へ好みの時計を置ける**こと。

編集画面で見た目を調整し、生成された `/clock/?c=...` URLをOBSのブラウザソースへ貼ることで、時計だけの透明背景フレンドリーな表示を再現できることが主目的です。

## Value hypothesis（2026-07-02 オーナー確認済み）

- 第一目的は**実ユーザー（日本語配信者）の獲得**。公開方針は無料範囲での露出増（独自ドメインなし）。
- 訴求の主軸は「**OBSに貼ったURLそのものが設定の保存・復元・共有の単位**」であること: アカウント不要 / 別PCでも同じURLを貼れば同じ時計 / 共同作業者にURL一本で渡せる / PC買い替え・OBS再構築でもシーンコレクションと一緒に保存したURLで即復元。
- 副次価値: 配信画面に時計があると、切り抜き制作者が該当シーンを特定しやすい（日本の切り抜き文化に根ざした実用ニーズ）。
- 単機能（日本語UI・透明背景・テンプレ数）では競合に埋没する。「日本語UI × URL一本再現 × 無料/登録不要 × 透明背景が最初から正しい」の**束**が差別化。

## Success metrics（バックエンド追加なしの制約下）

| 指標 | 計測手段（無料枠のみ） | 位置づけ |
|---|---|---|
| production が最新リリースと一致 | deploy + remote smoke | 前提条件 |
| OBS実機QA合格の公開記録 | `docs/manual-qa.md` 記録欄 | 信頼の土台 |
| 外部利用シグナル（stars / Issue流入 / traffic） | GitHub（無料） | 認知シグナル |
| オーナー自身のOBSでの常用 | 実運用 | 実用性の証明 |
| X共有機能経由の投稿・検索流入 | X検索・Cloudflare無料メトリクス（手動・個人特定なし） | 拡散・需要シグナル |

初期は精密なコンバージョンより「発見されたか・壊れていないか・質問が来るか」を見る。

## Primary users

- 日本語話者のOBS利用者、配信者、配信オペレーター。
- このリポジトリを保守し、release check、manual QA、Cloudflare運用を行う人。
- AI review/implementation workflowに参加するagent（Claude Code、Codex等）。

## Core product contracts

- 生成された `/clock/?c=...` URLがOBS再現性のsource of truthです。過去に共有された任意の `?c=` URLは将来も同じ見た目に復号できなければなりません。
- `/clock/` は時計専用画面として維持します。編集UIを表示せず、透明背景に向いた表示を壊しません。
- 編集画面の `localStorage` は編集補助として使えますが、`/clock/` は `localStorage` に依存してはいけません。
- URL、import入力、label、font値などの未信頼入力はHTMLとして実行してはいけません。
- 未信頼値に対して `innerHTML` などのHTML injectionにつながるsinkを使いません。
- URL/config値は安全な既定値、許可された列挙値、範囲内の数値、検証済みtimezoneへ正規化します。
- 日本語UIと日本語docsは、非プログラマーの日本国内ユーザーにも分かる短く具体的な文言を優先します。

## Functional requirements

- 時計の種類をデジタル / アナログ / パタパタ(フリップ)から選べ、テンプレート（現行18種: 定番 / かわいい / クール / アナログ / パタパタ）で見た目を一括適用できること。
- 編集画面で色、背景不透明度、角丸、余白、文字サイズ、文字間隔、行間、太さ、影、縁取り、枠線を調整できること。
- 24時間/12時間、秒、秒の小型表示、日付、曜日、label、label位置をURLへ保存できること。
- 日付表示は独立した軸（年の有無・ゼロ埋め・`/`・`-`・日本語区切り）で組み合わせられ、曜日の括弧表示、12時間表示でのAM/PM前置・サイズ調整ができること。
- 文字調整はラベル / 日付 / 時刻のグループ単位で行え、太さ・文字間隔の個別override（既定は連動＝null）がURLに保存・再現されること。旧URLの見た目は変えないこと。
- 生成URL全体、query string、`c` parameter、JSON、URLエンコード済みJSONから設定をimportできること。
- 壊れた `c`、壊れたJSON、不正timezone、不正色、不正数値は初期値または安全な範囲へ戻すこと。
- 旧形式の入力（flat query、旧 `dateFormat`、`theme` 別名）は入力エイリアスとして受理し、従来と同じ見た目へ写像すること。
- 現在の時計デザインを宣伝画像(1200×675 PNG)として完全クライアントサイドで生成・共有できること（アップロードなし）。
- PC内フォント読み込みは、対応ブラウザでユーザー操作後だけ実行し、非対応・拒否・空状態では手入力へ案内すること。
- フォント名はOBSを動かすPCに同じfontがある場合だけ同じ表示になります。未インストール時はsystem fallbackを許容します。
- `/clock/` は同一オリジンの `Date` レスポンスヘッダでサーバー時刻へ自動補正し、取得に失敗したときはPCのsystem timeへフォールバックすること（バックエンドは追加しない）。
- `/api/defaults` は公開先の補助情報だけを返します。Workers Static Assets では `timezone:null` の静的fallbackであり、timezone自動提案は行いません。候補が取れない環境でも、時計表示はURL設定だけで動くこと。

## Deployment and operations requirements

- 新規Cloudflare公開はWorkers with Static Assetsを第一候補にします。
- Cloudflare Pages compatibilityは、`functions/api/defaults.js` が harmless optional fallbackである限り残してよいです。
- `api/defaults` は拡張子なしの静的JSONです。`{"timezone":null,"country":null,"source":"static"}` を返し、JSON `Content-Type` と `Cache-Control: no-store` は `_headers` によって指定します。この前提はlocal/remote smoke checksで監視します。
- `wrangler.jsonc` では `run_worker_first` を使わず、通常の静的配信は `dist/` のStatic Assetsへ任せます。
- productionが正常な間は、訓練目的だけでproduction rollbackを実行しません。
- GitHub ActionsやCloudflare運用は、費用・無料枠・支出上限の確認を前提にします。運用手順の詳細は `docs/post-launch-ops.md`。

## Validation requirements

- `npm run lint` はESLintではなく、`node --check` によるJavaScript構文チェックです。
- `npm run typecheck` はTypeScript型検査ではなく、主要module importとencode/decode/time formatのsmoke checkです。
- `npm test` はNode testを実行します。`tests/build.test.mjs` は `DIST_DIR` で指定した一時ディレクトリへビルドして検証するため、共有 `dist/` を生成・変更せず、並列実行でも競合しません。
- golden fixture（`tests/fixtures/template-compat.golden.json`）が「既出 `?c=` URLが無言で見た目変化しない」契約を凍結します。再生成は契約を意図的に変えたときだけ行い、差分をレビューします。
- 通常のrelease preflightは `npm run release:check` と `npm run release:http-smoke`、staging/production確認は `SMOKE_BASE_URL=<deploy-url> npm run release:remote-smoke` です。手順の詳細は `docs/pre-release-qa.md`。

## Manual QA requirements and limitations

- 自動テストだけでは、実ブラウザ描画、OS font、OBS browser source固有の挙動、透明背景の実見え、文字切れは保証できません。チェックリストは `docs/manual-qa.md`。
- OBS実機では、編集画面ではなく生成URLそのものをブラウザソースに貼って確認します。
- 390px前後、768px前後、1280px以上で横スクロール、読みにくさ、押しにくさ、focus/hover state、console/network errorを確認します。
- OBSを動かすPCに同じfontが無い場合、同じURLでも見た目が変わる可能性があります。
- 時計はサーバー時刻(同一オリジンの `Date` ヘッダ)へ自動補正しますが、補正できないオフライン時はsystem timeに従います。秒未満の精度やNTP級の厳密さは保証しません。

## Non-goals

- チャット/コメント反応機能、YouTube API、OAuth、実YouTubeデータ連携（別プロジェクト `007_yt-live-word-alert-overlay` の担当領域）。
- `localStorage` をOBS時計表示のsource of truthにすること。
- `/clock/` に編集UIや共有UIを混ぜること。
- backend state、authentication、database、paid Cloudflare binding、new paid cloud serviceの無承認追加。
- Workers AI、AI Gateway、R2、D1、KV、Queues、Durable Objects、Workflows、Hyperdriveなどの有料化し得るbindingの追加。
- ライセンス確認と `docs/licenses` 記録なしのfont file同梱。
- GitHub Actionsの支出上限未確認のままの `push` / `pull_request` trigger追加。

## 未決事項（Open questions）

本書は要件・非目標・品質契約の正本であり、個別の残タスク・優先順位・未決事項の
最新状態は `HANDOFF.md` の「Known issues / owner gates」と「Next steps」に委譲
しています。要件レベルで新たな未決事項が生じた場合は、まず `HANDOFF.md` に記録し、
要件として確定したものだけを本書へ反映してください。

## AI-assisted workflow

- 公開向けの歴史的プロセス記録は `docs/HOW_WE_USE_CODEX.md`（文面はオーナー承認なく変更しない）。
- 現行の実作業の運用モデルはglobal instructionsと `AGENTS.md`、個別のowner gateは
  `HANDOFF.md` の「Known issues / owner gates」が正です。
- AIの出力を事実扱いせず、テスト結果・コミット・デプロイ・PR・検証状態を捏造しないこと。スキップしたチェックと未確認事項は明記すること。
