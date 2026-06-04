# Candidate A Manual Input Toast Scope Decision

## Status

この文書は Candidate A: keyword reaction overlay の「manual input + toast」に入る前のスコープ固定記録です。PR #38 で editor preview 中心の manual input + toast preview は実装済みだが、この文書自体は implementation planning evidence として扱う。

これは planning / implementation planning evidence です。Candidate A が fully implemented であること、YouTube API 連携が承認済みであること、Codex for OSS 申請済みまたは採択済みであること、利用者が多数いることを示す証拠ではありません。

今回の目的は、次の実装PRを小さくし、editor preview 中心の安全な人工入力だけで keyword reaction の基本UXを確認できるようにすることです。YouTube API、OAuth、API key、scraping、実視聴者データ、実コメントデータ、external sending、deploy は引き続き非対象です。

関連:

- [CANDIDATE_A_IMPLEMENTATION_SCOPE_DECISION.md](CANDIDATE_A_IMPLEMENTATION_SCOPE_DECISION.md)
- [CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md](CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md)
- [CANDIDATE_A_URL_CONTRACT_DRAFT.md](CANDIDATE_A_URL_CONTRACT_DRAFT.md)
- [CANDIDATE_A_MATCHING_NORMALIZATION_DECISION.md](CANDIDATE_A_MATCHING_NORMALIZATION_DECISION.md)
- [CANDIDATE_A_SECURITY_AND_QA_PLAN.md](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- [YOUTUBE_DATA_POLICY_BOUNDARY.md](YOUTUBE_DATA_POLICY_BOUNDARY.md)

## ChatGPT Scope Decision

次の実装PRは manual input + toast の初回範囲に限定する。

- editor側に Candidate A の最小操作領域を追加する。
- manual input は maintainer / reviewer が入力する人工テキストだけを扱う。
- keyword と一致した場合に editor preview 内で toast を表示する。
- generated URL は visual config と keyword rules だけを再現する。
- manual input text そのものは初回 generated URL に含めない。
- toast は preview 検証用であり、実YouTube連携ではない。
- `/overlay/keyword-reaction/` は overlay-only page として維持するが、初回manual input + toast PRで本格イベント表示runtimeまでは広げない。

## Intensity Policy

`assets/js/keyword-reaction-config.js` の `intensity` は `0` から `3` の連続値を許容する。

初回 manual input UI では、利用者が理解しやすいように整数ステップだけを出す。

- UIが生成する値: `0` / `1` / `2` / `3`
- runtimeが受け入れる値: `0` から `3` の連続値
- helper変更: 不要
- 将来拡張: 細かい強度調整が必要になった場合のみ、sliderなどの連続値UIを検討する

この方針により、既存helperの互換性を保ちつつ、初回UIの説明とQAを単純にする。

## Editor Scope

初回 manual input + toast PR で editor 側に入れるもの:

- Candidate A 用の最小操作領域。
- keyword 設定。
- `matchMode: "contains"` / `"exact"` の選択。
- `displayPattern: "toast"` の初回固定または明確な初期値。
- `reactionStyle` の安全な選択肢。
- `intensity` の整数ステップ選択。
- 人工テキストの manual input。
- preview 内の toast 表示。
- generated URL の config-only 再現。

editor 側で初回に入れないもの:

- fixture playback。
- fixture JSON files。
- import/export UI。
- ticker / badge runtime。
- YouTube API integration。
- OAuth login。
- API key storage。
- scraping。
- 実視聴者データ、実コメントデータ、配信者データ。
- external sending。

## Overlay Scope

`/overlay/keyword-reaction/` は引き続き overlay-only page として扱う。

初回 manual input + toast PR の overlay 側は、次のどちらかに留める。

- config helper の読み込み準備。
- safe default の維持。

初回PRで overlay 側に入れないもの:

- OBS本番面へのイベント注入。
- live連携。
- 実YouTube data の表示。
- manual input text を generated URL 経由で再生する仕組み。
- fixture playback。
- ticker / badge runtime。

overlay runtime の本格イベント表示は、editor preview の behavior と安全境界が安定した後の後続PRで判断する。

## Keyword Matching Policy

初回は最小matchingだけを対象にする。

- `matchMode: "contains"` と `"exact"` のみ。
- 英数字は case-insensitive。
- 日本語は単純包含または完全一致。

初回では扱わないもの:

- 全角半角 normalization。
- かな / カナ normalization。
- Unicode normalization 強化。
- 正規表現matching。
- YouTube chat 向けに十分であるという断定。

この初期matching方針は PR #38 で最小previewとして実装された。NFKC、全角半角、かな / カナ normalization は実装済みではなく、後続検討として扱う。

## Matching Normalization Follow-Up

PR #38 の manual input + toast preview 後、次の小PRでは matching normalization と preview/config consistency を先に整える。

固定する方針:

- 英数字は引き続き case-insensitive。
- 日本語は引き続き単純包含または完全一致。
- NFKC、全角半角、かな / カナ normalization は後続検討。
- preview 判定は generated URL に保存される config と同じ normalized config を source of truth にする。
- manual input text は generated URL に含めない方針を維持する。
- keyword が空または secret-like で fallback される場合、preview も fallback 後の normalized keyword で判定するか、fallback が起きたことを status で明示する。

詳細は [CANDIDATE_A_MATCHING_NORMALIZATION_DECISION.md](CANDIDATE_A_MATCHING_NORMALIZATION_DECISION.md) に分ける。この follow-up は高度normalization実装やYouTube連携を承認するものではない。

## Display Pattern And Reaction Style Policy

初回実装対象は `displayPattern: "toast"` のみ。

`ticker` と `badge` は後続PRへ分ける。queueing、overflow、count、reset behavior などの仕様が増えるため、manual input + toast の初回範囲には含めない。

`reactionStyle` は config 語彙として次を扱える。

- `spark`
- `pulse`
- `soft`
- `none`

ただし、初回 toast runtime で全styleの表現差を完全に実装する必要はない。実装できないstyleは safe fallback してよい。fallbackする場合は、どのstyleがどの表示へ寄るかをdocsまたはtestsで確認できるようにする。

## Generated URL Policy

初回 generated URL は config-only とする。

URLに入れてよいもの:

- `schemaVersion`
- `overlayType: "keyword-reaction"`
- `displayPattern`
- `reactionStyle`
- `intensity`
- `keyword`
- `matchMode`
- 将来必要になるpublic-safeなvisual settings

URLに入れないもの:

- manual input text。
- fixture event payloads。
- API keys。
- OAuth tokens。
- access tokens / refresh tokens。
- client secrets。
- private account identifiers。
- real viewer identifiers。
- raw real chat / comment data。
- billing / payment details。
- ユーザーが公開する意図のない personal data。

manual input text は preview testing input であり、OBS再現のsource of truthにはしない。OBS再現のsource of truthは、時計ツールと同じく generated config URL とする。

## Text-Not-HTML Boundary

manual input text、keyword、URL config由来のtextは untrusted として扱う。

実装PRでは次を守る。

- DOMへ入れるときは `textContent` などの text API を使う。
- untrusted text に `innerHTML` を使わない。
- HTML-like input は inert text として表示するか、安全にnormalizeする。
- manual input text と keyword に長さ制限を置く。
- long text は layout を壊さないように truncate、wrap、またはsafe fallbackする。

## UI Flow Sanity Check

日本語の非プログラマーOBS利用者向けには、初回UIは次の流れを優先する。

1. keyword を決める。
2. matching mode を選ぶ。
3. reaction style と intensity を軽く選ぶ。
4. 人工テキストを入力する。
5. previewでtoast反応を見る。
6. 設定だけを再現するgenerated URLを確認する。

manual input は「テスト入力」であり、「OBSへ保存される実イベント」ではないことを画面文言やdocsで誤解なく扱う。preview中心にすることで、OBS本番面やYouTube連携へ早く広げすぎない。

## Non-Goals

- fixture playback。
- fixture JSON files。
- import/export UI。
- ticker / badge runtime。
- YouTube API。
- OAuth。
- API key。
- scraping。
- 実視聴者データ。
- 実コメントデータ。
- 配信者データ。
- external sending。
- backend persistence。
- production deploy。
- Codex for OSS application submission。

## Done Criteria For The Next Implementation PR

次の manual input + toast 実装PRの完了条件:

- editor preview 内で人工テキストを入力できる。
- `contains` / `exact` の最小matchingでtoast表示を確認できる。
- 英数字は case-insensitive、日本語は単純包含または完全一致として扱う。
- UIが生成する `intensity` は `0` / `1` / `2` / `3` の整数。
- runtimeは `0` から `3` の連続値に耐える。
- generated URL は config-only で、manual input text を含めない。
- untrusted text は `textContent` 等で扱い、`innerHTML` を使わない。
- manual input text と keyword に長さ制限がある。
- no YouTube API / no OAuth / no API key / no real data / no external network。
- 390px / 768px / 1280px で editor preview とcontrolsが破綻しない。
- `/overlay/keyword-reaction/` の overlay-only surface が壊れない。
- `/clock/` と `/clock/?c=...` の既存契約を変えない。
- console に関連errorがない。
- validation が通る。

## Done Criteria For The Preview/Config Consistency Follow-Up

manual input + toast 後の次PRの完了条件:

- preview 判定と generated URL が同じ normalized config から作られる。
- preview 判定は normalized `keyword` と normalized `matchMode` を使う。
- secret-like keyword fallback 時に、入力実値を出さずに安全な fallback status を出す。
- manual input text が generated URL に含まれない。
- NFKC、全角半角、かな / カナ normalization は実装しない。
- no YouTube API / no OAuth / no API key / no real data / no external network。
- `/clock/` と `/clock/?c=...` の既存契約を変えない。
- `/overlay/keyword-reaction/` の skeleton / overlay-only surface を壊さない。

## Fixture Playback Follow-Up

PR #40 後の次段階は fixture playback + schema validation のスコープ固定とする。詳細は [CANDIDATE_A_FIXTURE_PLAYBACK_SCOPE_DECISION.md](CANDIDATE_A_FIXTURE_PLAYBACK_SCOPE_DECISION.md) に分ける。

fixture playback は manual input + toast preview の後続であり、初回は editor preview 内の artificial data only とする。manual input text は引き続き generated URL に含めない。

初回 fixture playback 実装では、built-in artificial fixture を優先し、paste JSON import、fixture file保存、overlay本体runtime、ticker、badge、import/export、YouTube API / OAuth / API key / scraping / real data は後続へ分ける。

## Open Questions

- toast duration、cooldown、queueing の初期値。
- `reactionStyle` のstyle差分を初回でどこまで表現するか。
- manual inputの最大文字数。
- keywordの最大文字数を helper の `KEYWORD_REACTION_LIMITS.keywordLength` と完全に揃えるか。
- preview toast の位置とsafe inset。
- generated URL の表示位置を既存時計editorの導線へどう統合するか。
- overlay runtime本格化を manual input + toast の直後に入れるか、fixture playback後にするか。

## Handoff To The Next PR

次の実装PRは、まず editor preview 中心の manual input + toast に集中する。

実装前に確認すること:

- config helper の `intensity` は連続値を許容するが、初回UIは整数stepにする。
- manual input text は generated URL に入れない。
- preview 判定と generated URL config は同じ normalized config へ寄せる。
- NFKC、全角半角、かな / カナ normalization は後続検討に残す。
- `displayPattern` は初回 `toast` のみ。
- `ticker` / `badge` と fixture playback は後続。
- YouTube API / OAuth / API key / scraping / real data は非対象。
- text-not-HTML と `innerHTML` 禁止をtestsまたはmanual QAで確認する。
