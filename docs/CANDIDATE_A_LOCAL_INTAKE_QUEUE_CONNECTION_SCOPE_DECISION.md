# Candidate A Local Intake Queue Connection Scope Decision

## Status

この文書は Candidate A: keyword reaction overlay の local intake to queue connection 方針を固定する docs-only 記録です。

これは implementation planning evidence です。PR #56 の local intake to queue helper 実装を記録しますが、overlay runtime connection、transport、`postMessage`、`BroadcastChannel`、`localStorage` transport、fixture linkage、toast queue runtime、ticker、badge、YouTube API integration、OAuth、API key、scraping、実データ取得、deploy、Codex for OSS 申請を実装または承認するものではありません。

関連:

- [CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md](CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md)
- [CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md](CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md)
- [CANDIDATE_A_QUEUE_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_QUEUE_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_OVERLAY_QUEUE_CONNECTION_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_QUEUE_CONNECTION_SCOPE_DECISION.md)
- [CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_LOCAL_INTAKE_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_LOCAL_INTAKE_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_FIRST_TRANSPORT_DECISION.md](CANDIDATE_A_FIRST_TRANSPORT_DECISION.md)
- [CANDIDATE_A_URL_CONTRACT_DRAFT.md](CANDIDATE_A_URL_CONTRACT_DRAFT.md)
- [CANDIDATE_A_SECURITY_AND_QA_PLAN.md](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- [YOUTUBE_DATA_POLICY_BOUNDARY.md](YOUTUBE_DATA_POLICY_BOUNDARY.md)

## Purpose

PR #48 で normalized event shape helper、PR #50 で queue helper、PR #54 で local event intake helper が入った。

次に決めるべきことは、local intake helper が返す normalized event を queue helper へ渡す境界です。ただし、この段階で overlay runtime、transport、fixture linkage、real integration まで広げると、URL契約、timer cleanup、origin/source validation、実データ境界が曖昧になる。

この文書の目的:

- 次の実装PRを local intake to queue pure helper + tests に限定する。
- raw local input を必ず local intake helper で normalize してから queue へ渡す方針を固定する。
- `manual` / `fixture` / `demo` 以外の `sourceType` を queue へ入れない境界を維持する。
- queue state、event payload、manual input text、fixture event data、transport payload を generated URL へ入れない方針を維持する。
- helper を DOM、timer、storage、network、transport から独立させる。
- overlay runtime connection、transport、fixture linkage、YouTube integration を後続に分ける。

## Post-PR #56 Local Intake To Queue Status

PR #56 で local intake to queue helper + tests は実装済みです。

実装済みとして扱うもの:

- raw local input を local intake helper で normalized event へ寄せてから queue helper へ渡す pure helper。
- `manual` / `fixture` / `demo` の sourceType 境界。
- unsupported sourceType の safe fallback / reject。
- max 5 bounded queue と overflow policy。
- local intake payload、event payload、queue state を generated URL へ入れない tests。
- helper が DOM、timer、storage、network、transport に依存しないこと。

これは pure helper の実装証跡であり、overlay runtime connection、transport、fixture linkage、toast queue runtime、YouTube integration の承認ではありません。

次段階は [CANDIDATE_A_LOCAL_INTAKE_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_LOCAL_INTAKE_OVERLAY_RUNTIME_SCOPE_DECISION.md) に分ける。次の実装候補は `demo=1` fixed synthetic event だけを local intake helper -> queue helper -> existing overlay toast display へ通す小変更に限定する。

## Next Implementation PR Scope

次の小実装PRは local intake to queue helper + tests に限定する。

入れてよいもの:

- raw local input を `normalizeKeywordReactionLocalEventInput` で normalized event へ寄せる pure helper。
- normalized event を `createKeywordReactionQueue` / `enqueueKeywordReactionEvent` / queue helper へ渡す pure helper。
- batch input を deterministic に queue へ入れる helper。
- invalid / unsupported input を safe reject または safe fallback する tests。
- max 5 bounded queue と overflow policy の再確認 tests。
- generated URL に local intake payload、event payload、queue state、manual input text、fixture event data、transport payload を入れない tests。

helper名の候補:

- `enqueueKeywordReactionLocalInput`
- `buildKeywordReactionQueueFromLocalInputs`
- `normalizeKeywordReactionLocalInputBatch`
- `buildLocalIntakeQueueSchedule`

実装時の命名は既存moduleの粒度に合わせる。複雑な抽象化は避け、local intake output と queue helper の接続だけに留める。

## Intended Flow

初期flow:

```text
raw local input
  -> normalizeKeywordReactionLocalEventInput
  -> normalized event
  -> enqueueKeywordReactionEvent
  -> bounded queue
  -> deterministic schedule helper if needed
```

raw input を queue helper へ直接渡さない。

queue helper が受け取るもの:

- `normalizeKeywordReactionLocalEventInput` を通った normalized event。
- `sourceType: "manual" | "fixture" | "demo"`。
- public-safe `eventId`。
- public-safe `displayText`。
- `displayPattern: "toast"`。
- normalized `reactionStyle`。
- bounded `intensity`。
- bounded `durationMs` / `offsetMs`。

queue helper が受け取らないもの:

- raw local input object。
- unknown fields。
- transport payload。
- queue state payload。
- raw manual input text。
- raw fixture JSON。
- raw fixture event data。
- raw config value。
- API key / OAuth token / access token / refresh token / client secret。
- private key。
- real viewer identifier。
- raw YouTube comment / live chat content。
- private account data。
- billing / payment info。
- secret-like values。

## SourceType Boundary

### `manual`

`manual` は artificial manual input 由来の local input として扱う。

- raw manual input は local intake helper で normalize する。
- queue には normalized event だけを入れる。
- raw manual input text は generated URL、debug/status、queue stateへ入れない。
- overlay runtime へのmanual event injection はこのPRでは実装しない。

### `fixture`

`fixture` は built-in artificial fixture 由来の local input として扱う。

- fixture event data は artificial data only。
- raw fixture JSON や fixture event data は generated URL へ入れない。
- built-in fixture playback を overlay本体へ流す linkage は後続PRに分ける。
- fixture sourceを queue へ接続する場合も、local intake helper の normalized event だけを使う。

### `demo`

`demo` は public-safe fixed demo 由来の local input として扱う。

- `demo=1` は display test flag であり、real event sourceではない。
- queue に入れる場合も fixed synthetic event だけを使う。
- demo event payload を `c` parameter へ入れない。

### Future Integration

future YouTube integration は local intake to queue helper の `sourceType` には含めない。

- YouTube API / OAuth / API key / scraping / real data は別boundary reviewと人間承認が必要。
- raw API response、raw live chat、real viewer id を queue へ直接渡さない。
- future integration は local-only helper の追加sourceとして扱わず、credential / data / policy設計を分ける。

## Queue Boundary

local intake to queue helper は既存queue helperの方針を維持する。

- queue は max 5 bounded queue。
- overflow時は古い未表示eventをdropし、最新eventを残す。
- queue は normalized event だけを保持する。
- unknown fields、transport payload、queue state payload、secret-like values を保持しない。
- helper は deterministic に動作する。
- helper は DOM、timer id、network、storage、transport に依存しない。

このPRでは timer runtime を実装しない。`setTimeout`、`clearTimeout`、playback lifecycle、visible toast runtime は後続の overlay runtime connection で扱う。

## Generated URL Boundary

generated URL は config-only を維持する。

`/overlay/keyword-reaction/?c=...` に入れてよいもの:

- `schemaVersion`
- `overlayType`
- `displayPattern`
- `reactionStyle`
- `intensity`
- `keyword`
- `matchMode`
- public-safe visual config

URLへ入れないもの:

- local intake payload。
- normalized event payload。
- queue state。
- queue length / current index。
- schedule state。
- transport payload。
- event `eventId`。
- event `displayText`。
- `displayText` arrays。
- raw manual input text。
- raw fixture JSON。
- fixture event data。
- raw user JSON。
- API key / OAuth token / access token / refresh token / client secret。
- private key。
- real viewer identifier。
- raw YouTube comment / live chat content。
- private account data。
- billing / payment info。
- secret-like values。

将来、public-safe reference を URL へ入れるかは未確定です。次の local intake to queue helper PRでは URL契約を広げない。

## Rendering And Text Boundary

local intake to queue helper は DOM rendering をしない。

後続renderingで `displayText` を表示する場合も次を守る:

- `displayText` は `textContent` など safe DOM API で表示する。
- HTML-like text は inert text として扱う。
- `innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler は使わない。
- debug/status に raw local input、raw `c`、keyword実値、manual input text、fixture event data、transport payload、secret-like value を出さない。

## Security / QA Policy

local intake to queue helper PRでは次を確認する。

- sourceType は `manual` / `fixture` / `demo` のみ。
- unsupported sourceType は safe reject または safe fallback。
- invalid local input は queue に raw data を残さない。
- raw input object を破壊しない。
- unknown fields、transport payload、queue state、secret-like values を event に残さない。
- queue は max 5 bounded queue を維持する。
- overflow時は古い未表示eventをdropし、最新eventを残す。
- generated URL は config-only のまま。
- local intake payload、event payload、queue state、manual input text、fixture event data、transport payload は URL へ入らない。
- helper は DOM、timer、storage、network、transport に依存しない。
- no `localStorage` transport。
- no external network。
- no `postMessage` / no `BroadcastChannel`。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- `/clock/` と `/clock/?c=...` に回帰がない。
- `/overlay/keyword-reaction/` の idle / debug / demo 境界に回帰がない。

## Non-Goals

- overlay runtime connection。
- timer runtime。
- toast queue runtime。
- transport実装。
- same-origin `postMessage` 実装。
- `BroadcastChannel` 実装。
- `localStorage` transport。
- external network transport。
- event source runtime。
- fixture linkage。
- built-in fixtureをoverlay本体へ流す実装。
- manual input textをoverlayへ渡すUI/runtime。
- ticker / badge runtime。
- paste JSON import。
- import/export UI。
- YouTube API integration。
- OAuth login。
- API key creation or storage。
- scraping。
- 実視聴者データ。
- 実コメントデータ。
- deploy。
- Codex for OSS application submission。

## Done Criteria For This Decision

- 次実装PRが local intake to queue pure helper + tests に限定されている。
- raw local input は local intake helper を通してから queue helper へ渡す方針である。
- sourceType は `manual` / `fixture` / `demo` のみである。
- unsupported sourceType は safe reject または safe fallback。
- queue は max 5 bounded queue と overflow policy を維持する。
- generated URL は config-only のまま。
- local intake payload、event payload、queue state、manual input text、fixture event data、transport payload、raw JSON、`displayText` arrays は URLへ入れない。
- helper は DOM、timer、storage、network、transport に依存しない。
- text-not-HTML 方針が維持されている。
- no transport / no fixture linkage / no overlay runtime connection。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- validation が通る。

## Follow-Up Split

後続PRへ分けるもの:

1. local intake to queue connection scope decision。この文書。
2. local intake to queue pure helper + tests。
3. queue schedule adapter if needed。
4. local intake overlay runtime connection scope decision。
5. `demo=1` fixed synthetic event local intake -> queue -> overlay runtime connection。
6. first transport decision before any cross-window transport。
7. same-window internal dispatch helper + tests if the first transport decision remains narrow。
8. same-origin `postMessage` design and prototype only after origin/source QA is fixed。
9. `BroadcastChannel` design and prototype only after channel lifecycle QA is fixed。
10. built-in fixture linkage from safe artificial fixture to overlay runtime。
11. toast queue runtime for multiple public-safe sources。
12. ticker / badge runtime。
13. paste JSON import design and validation。
14. import/export UI。
15. YouTube integration design after boundary review and human approval。

## Open Questions

- local intake to queue helper を event-intake module に置くか、queue module に置くか。
- batch input helper を初回で入れるか、single input enqueue helperだけにするか。
- unsupported input の戻り値を `null`、empty queue、または explicit status object のどれにするか。
- duplicate event を public-safe `eventId` で dedupe するか、初期は順番どおり enqueue するか。
- queue schedule helper をこの接続helperから直接返すか、queue stateだけを返すか。
- local queued events を overlay runtime へつなぐ前に、same-window internal dispatch docs を挟む必要があるか。
