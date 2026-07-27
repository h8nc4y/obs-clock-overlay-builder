# 開発引き継ぎ — obs-clock-overlay-builder

> **2026-07-11 方針更新**: 開発領域の固定分掌は廃止済み。このファイル名は既存リンクとの
> 互換性のため残す。開発の主軸は Codex で、依頼範囲を end-to-end で担当する。
> 廃止済みの `codex` / `codex-deep` MCP bridge と `agmsg` は復活させない。

作成日時: 2026/07/06 JST

## 開発体制

- Codex が要件整理、時計UIのデザインと実装、検証、文書化までを一貫して進める。
- Claude Code、subagent、外部レビューは必要時の実行手段であり、固定担当ではない。

## このリポジトリの性質と注意

- 「時計オーバーレイ専用」の zero-runtime-dependency な静的ビルダー。チャット/コメント反応など
  範囲外の機能をここに足さない（別プロジェクトの担当領域）。
- 本番デプロイは外向き・課金が絡むため、ゲート通過（release:check 等）とオーナー最終GOが必要な
  唯一の人間確認ゲート。それ以外（コード/テスト/docs/コミット/ブランチ/PR/版上げ準備/CHANGELOG/
  staging 検証）は自走してよい。
- フロントエンドの「見た目・デザイン」（配色/タイポ/余白/レイアウトの美観、新テンプレの意匠、
  エディタテーマの配色調整、共有画像の構図/装飾）も主担当が既存仕様と実レンダーを確認し、
  方針から実装まで一貫して進める。補助 skill やレビューは必要時だけ使う。
- 時計描画契約（クロック用 CSS）は凍結対象。変更時は既存の再現性契約と回帰検証を優先する。
- 共有画像のピクセル不一致は「意匠」ではなく「ライブ描画への整合」であることが多い。新しい見た目を
  選ぶのが意匠、既存ライブ値に一致させ直すのは実装側で完結してよい整合作業。

## 調査範囲と注意（引き継ぎ時点の限界）

- 根拠は local git 状態、repo 内 README/HANDOFF/docs、読み取り専用調査のみ。
- 外部API・CI・Cloudflare の実挙動、production の実際の配信状態は都度再確認すること
  （本書作成時点の記述は作成時点のスナップショットであり、陳腐化を疑う）。
- secret・認証情報・実データ・生成物ではない実ユーザー情報は読んでいない。
- 既存資料は現状把握の材料であり、要件定義の最終正本ではない。

## 主要ファイル（reading order）

1. `HANDOFF.md` — current state、hard contracts、owner gates、next steps
2. `AGENTS.md` — Codex側運用ポリシー（プロジェクト固有の差分のみ）
3. `docs/PRODUCT_REQUIREMENTS.md` — プロダクト要件・価値仮説・成功指標の正本
4. `docs/ROADMAP.md` — ロードマップ
5. `docs/HOW_WE_USE_CODEX.md` — 公開ガバナンス文書（歴史的記録。文面はオーナー承認なく書き換えない）
6. `docs/manual-qa.md` / `docs/pre-release-qa.md` / `docs/post-launch-ops.md` — QA・運用手順
7. `docs/HANDOFF_HISTORY.md` — 過去の日付付き実施メモ（時系列の歴史的記録）
8. `README.md` — repo概要

`HANDOFF.md` の「Current state」と「Known issues / owner gates」は、着手前に必ず現物確認
（`git status` / テスト実行 / lint・typecheck・format:check）で裏取りしてから読み進める。

## 次アクション候補（着手前に HANDOFF.md で最新化を確認）

1. HANDOFF.md の「Known issues / owner gates」にある未完了項目（引き継ぎ時点では実機QAなど運用側の確認作業が
   残っている想定）を確認し、ローカルで支援できる範囲（手順整備・チェックリスト・検証スクリプト）
   を先回りで進める。
2. 直近のPRマージ履歴とCHANGELOGを確認し、HANDOFF.mdの記述と実際のmasterの状態が一致しているか
   照合する。乖離があればHANDOFF.md側を実状態に同期する。
3. lint/typecheck/format:check/テストスイートを実行し、回帰がないことを確認してから新規タスクへ
   着手する。テスト数は都度のスナップショットであり、減少は回帰として扱う。
4. UIに関わる変更が必要な場合は、配色・タイポ・レイアウト・signatureの方針を主担当が定め、
   実装と実レンダー検証まで行う。

## Stop only when（費用・外部リスクの境界）

有料API/有料クラウド/課金、OAuth/secret/token入力、実ユーザー/実データの外部送信、
ストア提出・公開release・production deploy、または人間の意思決定なしには進めない
product 判断が必要なときだけ止まる。production deployは費用見積もり・ゲート通過・
明示的なオーナーGOがそろうまで実行しない。

## 委譲時の注意

委譲する場合は self-contained spec（対象ファイル・受け入れ条件・検証コマンド・書き込み許可範囲）
を渡し、成果物の実在と検証結果を主担当が確認する。フロントの意匠も固定の委譲先を設けない。

---

## Fable5 期の記録（履歴・2026-07-02 時点 v1.5.0 基準）

以下は Fable5 期のスナップショットであり、現状把握には使わない（現状は `HANDOFF.md` が正）。

- 旧 handoff / prompt は 2026-07-11 の固定分掌廃止後に active tree から削除済み（git 履歴に保持）。
- [FABLE5_REQUIREMENTS_REVIEW.md](FABLE5_REQUIREMENTS_REVIEW.md) — 要件再定義・市場調査・優先順位（**P1〜P3 の優先順位根拠は現在も有効**）
