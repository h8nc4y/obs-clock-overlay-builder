# ClaudeCode Fable5 handoff - 011_obs-clock-overlay-builder

作成日時: 2026/07/02 08:30:54 JST
配置: repo-local draft。公開・commit・PR化する前に、private context とローカル絶対パスが残っていないか確認すること。

## 調査範囲と注意

- 根拠は local git 状態、repo 内 README/HANDOFF/TASKS/docs、読み取り専用 subagent 調査。
- 外部API、GitHub live、CI、ブラウザ、テスト、Cloudflare、Chrome Web Store、Discord、Google、Anthropic、YouTube、X API は今回未確認。
- `*.p12`、`*.pem`、`*.pfx`、`.env*`、`auth.json` は読んでいない。
- raw log、cache、DB、state、queue、drafts、実データの中身は読んでいない。
- 既存のWeb調査/判断資材は repo 内資料の path map であり、Fable5 側で最新市場調査・最新仕様確認をやり直すこと。

## Repo handoff

## 011_obs-clock-overlay-builder

- 状態: `<repo-root>`; branch `docs/record-mobile-viewport-qa`; clean; latest `6c5e675 docs(qa): manual QAへviewport evidenceを同期 v1.5.0`
- 目的: OBS向け時計 overlay builder。生成URLをOBSへ貼る透明背景時計。
- 要件定義/要件相当: `docs/PRODUCT_REQUIREMENTS.md`
- Web調査/判断資材: `docs/pre-release-qa.md`, `docs/post-launch-ops.md`, `docs/CODEX_FOR_OSS_*`, `docs/licenses/fonts.md`
- 設計書/UI: `HANDOFF.md`, `docs/PRODUCT_REQUIREMENTS.md`, `docs/manual-qa.md`, `docs/pre-release-qa.md`
- 完成までのタスク一覧: `HANDOFF.md` §1.4, `docs/ROADMAP.md`
- 進捗: v1.5.0 release/tag済み記録。local viewport QA は 390/768/1280 済み。
- 残タスク/gate: production deploy、remote smoke、Cloudflare dashboard確認、OBS実機確認、Cloudflare dry-run、secret/OAuth、有料binding。
- Fable5 reading order: `AGENTS.md` → `HANDOFF.md` → `docs/PRODUCT_REQUIREMENTS.md` → `docs/manual-qa.md` → `docs/pre-release-qa.md` → `docs/post-launch-ops.md`
- Prompt addendum: UIあり。ClaudeDesign でOBS配信者向けに設定密度、プレビュー、URLコピー、透明背景、スマホ確認を再設計する。`clock.css` の描画契約は凍結寄り。

## Fable5 next action

1. `docs/CLAUDECODE_FABLE5_PROMPT.md` を読み、Fable5 の作業方針を確認する。
2. 上記の reading order に従って repo の正本資料を読む。
3. 既存要件をそのまま前提にせず、ユーザーへの質問から目的・市場・成功指標・非目標を再定義する。
4. UI が存在する repo では ClaudeDesign で wireframe または UI spec を作ってから実装へ進む。
5. 実装は Codex GPT5.5 XHIGH skill に依頼してよいが、Fable5 が受け入れ条件・対象ファイル・検証コマンド・gate を具体化してから渡す。
