# Fable5 要件再定義レビュー - 011_obs-clock-overlay-builder

作成: 2026-07-02 / 作成者: Claude Fable5(司令塔)
配置: repo-local draft(FABLE5_HANDOFF/PROMPT と同じ扱い)。commit/PR化する前に private context・ローカル絶対パスの混入を確認すること。

---

## 1. 現状の1枚整理(確認済み事実 / 未確認事項)

### 確認済み事実(2026-07-02 実測)

| 項目 | 状態 | 根拠 |
|---|---|---|
| コード | v1.5.0 リリース済(tag + GitHub Release)、PR #121 まで merge 済 | HANDOFF §0、git log |
| テスト | `node --test` **151 pass / 0 fail** | 本日実測 |
| local viewport QA | 390/768/1280 で横スクロールなし・確認済 | manual-qa.md 記録(2026-07-01) |
| 本番URL | `https://obs-clock-overlay-builder.h8nc4y.workers.dev` は **200 で稼働中** | 本日単発GET |
| 本番の版 | 配信中 `config.js` に `smallSeconds` / `mono-sub` が**無い** → **本番は v1.5.0 より古い版** | 本日単発GET(grep 0件) |
| 機能 | 18テンプレ(standard4/cute4/cool3/analog4/flip3)、smallSeconds、共有PNG、a11y改善済 | HANDOFF §1, §3.4 |

### 未確認事項

- OBS実機QA(生成URLをOBSブラウザソースへ貼る確認)は**未実施**(manual-qa.md 記録欄が空)。
- Cloudflare dashboard の費用・上限状態(オーナーのみ確認可能)。
- `release:check`(cf:dry-run 含む)は Cloudflare 認証境界のため未実行。
- 実ユーザー(配信者)からのフィードバックは未収集(GitHub Issue流入なし ※未確認)。
- 市場調査は本日 Sonnet subagent へ委譲済(結果は §4 に統合)。

### Gate(人間の承認が必要)

1. `npm run release:check`(cf:dry-run = Cloudflare 外部ネットワーク/認証)
2. `npm run deploy:production`(オーナー最終GO。manual-qa.md の承認文言が正)
3. remote smoke(`SMOKE_BASE_URL=<prod>`)
4. Cloudflare dashboard 費用確認(オーナーのみ)

---

## 2. 再要件定義ドラフト(Fable5 仮説)

既存 `PRODUCT_REQUIREMENTS.md` は契約(再現性・サニタイズ・非目標)は精緻だが、**市場・価値仮説・成功指標が未定義**。以下を追補する仮説として提示する。

### 目的(再定義案)

日本語話者のOBS配信者が、**アカウント登録・ソフト追加・デザイン知識なしで、1分以内に自分の配信画面へ好みの時計を置ける**こと。

### 価値仮説

- 競合(英語圏 overlay generator、StreamElements 等)に対する差別化は
  **「日本語UI × URLだけで再現 × 透明背景が最初から正しい × 無料/登録不要」の束**。
  単機能では模倣可能だが、束としては日本語圏で希少(→ §4 市場調査で検証)。
- 「URLだけで再現」は配信者にとって**シーンコレクションと一緒に保存できる**=PC買い替え・OBS再構築に強い、という運用価値に翻訳できる。

### 成功指標(候補・バックエンド追加なしの制約下)

| 指標 | 計測手段(無料枠のみ) | 位置づけ |
|---|---|---|
| production に v1.5.0 が出ている | deploy + remote smoke | 前提条件 |
| OBS実機QA合格の公開記録 | manual-qa.md 記録欄 | 信頼の土台 |
| GitHub stars / Issue流入 | GitHub(無料) | 認知シグナル |
| X共有機能経由の投稿 | X検索(手動・目視) | 拡散シグナル |
| 検索流入 | Cloudflare Workers 無料メトリクス(リクエスト数)※個人特定なし | 需要シグナル |

### 非目標(既存維持・変更なし)

チャット反応(007へ)/ 有料binding / フォント同梱 / GitHub Actions常設 / `/clock/` の localStorage 依存化 / 公開ガバナンス文書の無断改変。

---

## 3. 優先順位仮説(Fable5 提案)

**機能は足りている。次は「出す・見せる・見つかる」フェーズ。**

1. **P0: v1.5.0 を本番へ**(release:check → オーナーGO → deploy → remote smoke → post-launch-ops 更新)
   - 根拠: コードと本番の乖離が最大のリスク。README の demo URL が古い版を見せ続けている。
2. **P1: OBS実機QA の公開記録**(manual-qa.md 記録欄を埋める)
   - 根拠: 「OBS用」を名乗るのに OBS 実機証跡ゼロは信頼の穴。ROADMAP Medium Term とも一致。
3. **P2: README スクショ/日本語導線の更新**(★意匠 = ClaudeDesign 案件)
   - mono-sub / smallSeconds のスクショ追加、日本語ファーストの Quick Start。
4. **P3: 発見可能性**(検索・共有経由の流入導線。OGP/メタ記述の点検、必要なら改善)
5. **保留: 新機能・新テンプレ**は配信者フィードバック(Issue)が来てから。
6. **保留: FABLE5_PROMPT addendum の「設定密度・プレビュー・URLコピー・透明背景・スマホ確認の UI 再設計」**は、local viewport QA(390/768/1280)が既に緑であり、市場調査でも UI が弱点という証拠が無いため、**全面再設計は現時点で不要**と判断。ClaudeDesign 投入は P2(READMEスクショ意匠)と、実ユーザーフィードバック後の改善に温存する(意匠変更は `clock.css` 凍結契約と golden 再生成コストも伴うため)。オーナーが再設計を望む場合のみ着手。

---

## 4. 市場調査メモ(Sonnet subagent 委譲、2026-07-02 実施)

### 競合の要点

| 競合 | 型 | 対011比較 |
|---|---|---|
| はいしんツールキット(ruri.info) | 無料Web生成・URL貼付方式・日本語 | 日本語圏の定番。デザイン選択肢は少なめとの第三者評 |
| スコラボ | 無料・カスタマイズ高・日本語 | **ログイン必須**が明確な弱点(第三者評) |
| OBS-clock(pigeon-system) | 無料・時計15種+タイマー10種・import/export有 | テンプレ数で既に2桁。サイト「テスト中」表示で運営基盤薄い |
| Stream Clock(Benri Lab) | 無料・4テーマ+タイマー複合 | 透過はクロマキー緑背景方式(CSS透過ではない) |
| StreamElements | 総合オーバーレイ基盤・基本英語 | Widget ID方式=単体URL再現の思想なし |
| BOOTH配布素材(無料〜数百円) | ローカルHTML素材 | VTuber向け「かわいい」系で強い。別の発見経路 |

### 差別化検証(調査結論)

- **「日本語UI」「透明背景」「テンプレ数」単体では埋没する**(主要競合が既に対応)。
- 有望な複合訴求は3点:
  1. **アカウント/ログイン不要**(スコラボ対比)
  2. **URL一本で保存・共有・復元できる再現性**(明確に訴求する競合はOBS-clockのみ、それもimport/export止まり)
  3. **わんコメ/BOOTH/FANBOX風の「配信者が見慣れたUI」デザイン統一感**(既存メモリの3テーマ方針と一致)
- 「URLだけで再現」は「**他の人の時計デザインをそのままコピーして使える**」「**PC買い替え・OBS再構築でも同じURLで即復元**」という具体ユースケースで見せないと伝わらない。

### 需要シグナル

- 時計表示の主目的は装飾でなく「**切り抜き制作者が該当シーンを特定しやすくする**」実用ニーズ(日本の切り抜き文化と結合した根強い需要)。訴求文言に使える。
- 時計+タイマー複合ツールが増加傾向(スコープ拡張の誘惑だが、011は時計専用が正=メモリ準拠)。

### 集客チャネル(確度順)

1. **既存の配信ノウハウ系まとめブログ**(castcraft.live等)への掲載 — 自社SEOより現実的な初速
2. VTuber特化メディア(スコマガ等)の比較記事
3. YouTube解説動画 / note / X(開発者アカウント告知)

出典URL・詳細は subagent 調査結果(2026-07-02)による。定量データ(検索順位・流入数)は未確認。

---

## 5. Codex GPT-5.5 セカンドオピニオン(2026-07-02 実施)

agmsg で相談送信後、Codex 側 sandbox が agmsg 返信不可(`CreateProcessAsUserW failed: 5`)だったため、codex-deep MCP(read-only)で同期取得した。

- **Q1(優先順位)**: **同意**。「触れるURLと説明が一致して初めて訴求できる」— production deploy → OBS実機QA → README/スクショ → 発見可能性 の順を支持。
- **Q2(訴求)**: 最優先は「**OBSに貼ったURLそのものが設定保存・復元・共有の単位**」という説明。アカウント不要 / 別PCでもURLを貼れば同じ時計 / 共同作業者にURL一本で渡せる。
- **Q3(計測)**: production一致 + remote smoke + OBS実機QA記録 / Cloudflare無料メトリクス / GitHub stars・issues・**traffic** / X・検索の手動観測。初期は精密CVより「**発見されたか・壊れていないか・質問が来るか**」。
- **Q4(公開前リスク)**: **OBS Browser Source 固有差分**(透明背景・キャッシュ・フォント解決・DPI・URL長・秒更新の安定性)は通常ブラウザQAでは足りない → P1 の OBS実機QA の重要性を補強。加えて「**共有URL内のラベルに未公開情報を入れる漏えいリスク**」をREADME等に明記すべき(新規の実行可能タスク)。
- **Q5(Fable5仮説の最大の弱点)**: 「切り抜き制作者のシーン特定が主需要」という前提。**導入判断をするのは配信者本人**なので、訴求の中心は「URL一本で保存・復元・共有できるOBS時計」に置き、切り抜き用途は**副次価値**として扱う。→ §2 価値仮説の訴求順を修正して採用。

**採用した修正**: 訴求の主軸=「URL一本で保存・復元・共有」/ 副次=切り抜き文化の実用ニーズ。新規タスク: READMEへ「ラベルに配信予定など未公開情報を入れない」注意書き追加(P2に併合)。

---

## 6. オーナーへの質問リスト(**2026-07-02 回答済み**)

**回答(AskUserQuestion)**: 本番deploy=**GO**(→同日実施済み・remote smoke通過) / 第一目的=**実ユーザー獲得** / 成功指標=**外部利用シグナル+自分のOBSで常用+公開品質の完成** / 公開方針=**無料範囲で露出を増やす**(独自ドメインなし)。Q6(Long Term凍結)のみ未確認。

以下は当初の質問リスト(記録):

**目的・利用者**
- Q1. このプロダクトの第一目的はどれですか? (a)自分の配信で使う実用 (b)OSS実績づくり(Codex for OSS 等) (c)日本語配信者への実ユーザー獲得 (d)AI協業ワークフローの実験台。優先順位を付けてください。

**市場・競合**
- Q2. 競合調査(§4)を踏まえ、「日本語UI×URL再現×無料」の訴求で実ユーザー獲得を狙いますか? それとも現状の「静かな公開」を維持しますか?

**成功指標**
- Q3. 何が達成されたら「このプロジェクトは成功」と言えますか? (例: 自分のOBSで常用 / stars 10 / 外部からのIssue 1件 / 特に無し=完成で満足)

**公開範囲・費用**
- Q4. workers.dev サブドメインのままでよいですか? 独自ドメイン(費用発生)や宣伝(X投稿等)の意向はありますか?
- Q5. v1.5.0 の production deploy を承認しますか? (manual-qa.md の承認文言ベース。Cloudflare Free範囲・有料binding無し)

**非目標**
- Q6. ROADMAP Long Term の「時計以外の再現可能オーバーレイ面」は、現時点で完全凍結でよいですか?

---

## 7. タスクbreakdownと分担(オーナー回答後に確定)

| タスク | 担当 | 状態 |
|---|---|---|
| 要件再定義・質問設計・市場調査統合 | Fable5(主担当) | 本ドキュメント |
| production deploy 一式(release:check→deploy→remote smoke→ops docs) | Fable5 が実施 | **完了(2026-07-02)** |
| OBS実機QA | オーナー(実機) + agent(記録整備) | P1 |
| README スクショ構図・日本語導線の意匠 | ClaudeDesign(Opus4.8, frontend-design skill) | P2 |
| スクショ反映・docs更新の配線 | codex-deep or Sonnet5 | P2(意匠確定後) |
| OGP/メタ記述点検 | Fable5 レビュー → 実装は codex-deep | P3 |

**実装委譲の型**(HANDOFF準拠): 対象ファイル / 背景 / 受け入れ条件 / 禁止事項(§4 hard contracts) / 検証コマンド(`node --test` 緑・151以上) / 期待diff / 残リスク を必ず添える。
