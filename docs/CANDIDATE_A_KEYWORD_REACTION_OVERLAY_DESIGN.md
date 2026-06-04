# Candidate A Keyword Reaction Overlay Design

## Status

この文書は Candidate A: manual / fixture keyword reaction overlay の設計ドラフトです。

この文書は、YouTube API、OAuth、API key、scraping、live chat 取得、実視聴者データ、deploy、Codex for OSS申請を承認するものではありません。次の小さな実装PRへ渡すための docs-only 設計です。

関連:

- Issue #30: <https://github.com/h8nc4y/obs-clock-overlay-builder/issues/30>
- Safe MVP comment: <https://github.com/h8nc4y/obs-clock-overlay-builder/issues/30#issuecomment-4613411826>
- Implementation scope decision: [CANDIDATE_A_IMPLEMENTATION_SCOPE_DECISION.md](CANDIDATE_A_IMPLEMENTATION_SCOPE_DECISION.md)
- Manual input + toast scope decision: [CANDIDATE_A_MANUAL_TOAST_SCOPE_DECISION.md](CANDIDATE_A_MANUAL_TOAST_SCOPE_DECISION.md)
- URL contract draft: [CANDIDATE_A_URL_CONTRACT_DRAFT.md](CANDIDATE_A_URL_CONTRACT_DRAFT.md)
- Fixture schema draft: [CANDIDATE_A_FIXTURE_SCHEMA_DRAFT.md](CANDIDATE_A_FIXTURE_SCHEMA_DRAFT.md)
- Security and QA plan: [CANDIDATE_A_SECURITY_AND_QA_PLAN.md](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- Suite concept: [YOUTUBE_LIVE_OVERLAY_SUITE_CONCEPT.md](YOUTUBE_LIVE_OVERLAY_SUITE_CONCEPT.md)
- MVP requirements: [HEADLINE_FEATURE_MVP_REQUIREMENTS.md](HEADLINE_FEATURE_MVP_REQUIREMENTS.md)
- Data boundary: [YOUTUBE_DATA_POLICY_BOUNDARY.md](YOUTUBE_DATA_POLICY_BOUNDARY.md)

## 目的

Candidate A の目的は、YouTube連携に入る前に「キーワードに反応してOBS向けオーバーレイを出す体験」が有用かを安全に検証することです。

このMVPで確認したいこと:

- 配信者がプログラムを書かずに keyword rule を設定できるか。
- 手入力イベントで分かりやすい reaction overlay を出せるか。
- overlay-only page が透明背景の OBS Browser Source として使えるか。
- generated URL で visual config と keyword rules を再現できるか。
- untrusted text を HTML として扱わず、安全に表示できるか。

## 対象ユーザー

- バックエンドやAPI設定なしで小さな配信用オーバーレイを試したい日本語圏のOBS利用者。
- YouTube Live向けのchat-reactive visualを検討しているが、まだYouTube account接続はしたくない配信者。
- 実YouTube連携前に、overlay UX、URL契約、fixture形式、QA境界を固めたい maintainer。

## Path

Candidate A の overlay-only page は、初回実装方針として次を採用する。

```text
/overlay/keyword-reaction/?c=...
```

これは route/static skeleton PR の対象path。将来 suite 化が進んだ場合は path 再編の可能性を残す。

## ユースケース

- maintainer が route/static skeleton を通常ブラウザと OBS Browser Source で確認する。
- 配信者が editor で keyword と `reactionStyle` を設定し、手入力で reaction を試す。
- reviewer が generated overlay URL を通常ブラウザまたは OBS Browser Source で開き、同じ設定が再現されることを確認する。
- maintainer が後続PRで synthetic fixture を再生し、表示密度やタイミングを確認する。

## OBS Workflow

route/static skeleton 後の想定workflow:

1. editor / builder page を開く。
2. `displayPattern`、`reactionStyle`、keyword rules を設定する。
3. manual input で人工テキストを入力して反応を試す。
4. generated overlay URL をコピーする。
5. OBS Browser Source を追加する。
6. 生成URLを貼る。
7. 推奨 width / height を入力する。
8. overlay-only page が透明背景で、editor UI を含まないことを確認する。

時計ツールと同じく、設定用の editor surface と OBS用の overlay-only surface を分ける。

## Safe MVP Sequence

Candidate A は次の順で小さく進める。

1. Route/static skeleton。
2. Manual input + toast。
3. Fixture playback。
4. Ticker / badge。
5. URL import/export refinement。
6. YouTube integration design。

この順序は、OBS向け surface、transparent background、安全境界、URL再現性を段階的に確認するためのもの。

## First Implementation PR: Route/Static Skeleton

最初の実装PRは route/static skeleton のみにする。

含めるもの:

- `/overlay/keyword-reaction/` の静的HTML entry。
- overlay-only transparent surface。
- 最小CSS。
- safe default text。
- no editor UI。
- no external network。
- no editor `localStorage` dependency。
- no `innerHTML`。

含めないもの:

- editor integration。
- manual input。
- fixture playback。
- generated URL editor。
- config import/export UI。
- YouTube API / OAuth / API key / scraping / real data。

完了条件:

- `/overlay/keyword-reaction/` が 200 で開く。
- `body` margin 0。
- transparent background。
- editor UI が出ない。
- safe default text のみ表示。
- external network request なし。
- editor `localStorage` dependency なし。
- `innerHTML` なし。
- tests / build / smoke が通る。
- `/clock/` と `/clock/?c=...` の既存契約を変えない。

初回 skeleton では `c` parser は未実装または最小 fallback でよい。

## Second Implementation PR: Manual Input + Toast

skeleton の次は manual input + toast を優先する。

このPRは editor preview 中心の初回behavior確認に限定する。toast は人工テキストに対する preview 検証用であり、実YouTube連携やOBS本番面への live event injection ではない。

含めるもの:

- editor から人工テキストを入力できる。
- keyword に一致したら preview 内で toast 表示する。
- `displayPattern: "toast"` を初期値にする。
- `reactionStyle` と `intensity` を安全な enum / numeric range に制限する。
- 初回UIが生成する `intensity` は `0` / `1` / `2` / `3` の整数stepにする。
- runtime は config helper と同じく `0` から `3` の連続値に耐える。
- `matchMode: "contains"` / `"exact"` の最小matchingを扱う。
- generated URL で visual config と keyword rules が再現できる。
- manual input text そのものは初回 generated URL に含めない。
- user-provided text は HTML ではなく text として表示する。
- no YouTube API / OAuth / API key / real data。

含めないもの:

- fixture playback。
- fixture JSON files。
- import/export UI。
- ticker。
- badge。
- overlay runtime の本格イベント表示。
- YouTube integration。
- live chat / comment fetching。
- OAuth login。
- API key storage。
- raw real comments。

`/overlay/keyword-reaction/` は引き続き overlay-only page として維持する。初回 manual input + toast PR では、overlay 側は config helper の読み込み準備または safe default 維持に留めてよい。

## Fixture Playback

現在の次段階は fixture playback + schema validation のスコープ固定です。詳細は [CANDIDATE_A_FIXTURE_PLAYBACK_SCOPE_DECISION.md](CANDIDATE_A_FIXTURE_PLAYBACK_SCOPE_DECISION.md) に分ける。

fixture playback は manual input + toast の後続PRに分ける。

fixture は artificial events だけを扱う。timing、repeated events、missed keyword、visual density を確認するために使う。

初回実装は editor preview 内の playback に限定する。built-in artificial fixture を優先し、paste JSON input、fixture file追加、overlay本体runtime、ticker、badge、import/export、YouTube integration は後続PRへ分けてよい。

fixture playback は `/overlay/keyword-reaction/` の本格イベントruntimeを実装済みにするものではない。overlay-only skeleton は引き続き維持し、実YouTube連携前の安全な表示・timing・QA検証として扱う。

fixture に含めてはいけないもの:

- real viewer names。
- real comments / live chat messages。
- channel IDs / account identifiers。
- API keys / OAuth tokens / secrets。
- private dashboard values。
- personal data。

## 表示パターン案

### Toast

短時間の reaction が画面端や指定位置に出る形式。

利点:

- 初見で理解しやすい。
- layout pressure が小さい。
- manual input MVP に向く。
- OBS確認がしやすい。

リスク:

- イベントが多いと重なる可能性がある。
- animation timing は控えめな初期値が必要。

### Ticker

イベントを横方向の帯で流す形式。

利点:

- repeated events と相性がよい。
- broadcast UI として馴染みがある。

リスク:

- 配信画面の邪魔になりやすい。
- 小さいサイズで読みにくい。
- queueing / overflow の仕様が増える。

### Badge

keyword reaction を小さな badge や count として見せる形式。

利点:

- 表示密度が低い。
- 長時間の状態表示に向く。

リスク:

- 初回 demo としては反応が分かりにくい可能性がある。
- reset / count behavior の仕様が必要。

## MVP推奨

最初の behavior MVP は Toast を推奨する。

理由:

- 最小の behavior surface で reaction overlay の価値を検証できる。
- manual input で確認しやすい。
- 時計ツールで学んだ safe inset、transparent background、generated URL reproducibility を活かしやすい。
- Ticker と Badge は、config と overlay contract が安定した後の follow-up に分けられる。

## Keyword Matching 初期方針

初回は最小の matching から始める。

- 英数字は case-insensitive を対象にする。
- 日本語は完全一致または単純包含から始める。
- 全角半角 normalization は初回MVPでは未実装または後続検討。
- かな / カナ normalization は初回MVPでは未実装または後続検討。
- Unicode normalization は初回MVPでは未実装または後続検討。

日本語 normalization を実装済みとは書かない。

## 再現性契約の適用方針

時計ツールでは `/clock/?c=...` が source of truth になっている。Candidate A も、visual configuration については同じ考え方を採用する。

- generated URL が OBS playback の source of truth。
- overlay-only page は editor `localStorage` に依存しない。
- invalid config は safe defaults に normalize する。
- user-provided strings は HTML ではなく text として表示する。
- runtime manual input と fixture events は、private external data とは分離する。
- secrets、API keys、OAuth tokens、private identifiers、raw real comments は URL に encode しない。

詳細は [CANDIDATE_A_URL_CONTRACT_DRAFT.md](CANDIDATE_A_URL_CONTRACT_DRAFT.md) に分ける。

## 語彙

URL config と fixture schema は次の語彙に寄せる。

- `schemaVersion`
- `overlayType: "keyword-reaction"`
- `displayPattern: "toast" | "ticker" | "badge"`
- `reactionStyle: "spark" | "pulse" | "soft" | "none"`
- `intensity`
- `keyword`
- `matchMode`

reaction visual style の呼び方は `reactionStyle` に揃える。

## 未確定事項

- Candidate A を長期的にこの repository に置くか、将来 suite / umbrella repo に分けるか。
- `matchMode` の最終enum。
- `reactionStyle` の最終enum。
- toast animation はどの程度なら便利で邪魔にならないか。
- fixture playback は built-in fixture list、pasted JSON、または両方にするか。
- import/export を manual input + toast の直後に入れるか、fixture playback 後に入れるか。
- real YouTube integration を検討する場合の official documentation review、credential storage、quota/cost、privacy、data deletion / revocation 設計。
