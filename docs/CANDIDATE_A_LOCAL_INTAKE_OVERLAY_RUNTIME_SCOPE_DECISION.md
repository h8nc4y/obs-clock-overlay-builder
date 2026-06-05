# Candidate A Local Intake Overlay Runtime Scope Decision

## Status

この文書は Candidate A: keyword reaction overlay の local intake to overlay runtime connection 方針を固定する docs-only 記録です。

これは implementation planning evidence です。local intake to overlay runtime connection、transport、event source、fixture linkage、manual / fixture runtime injection、toast queue runtime 複数source対応、ticker、badge、YouTube API integration、OAuth、API key、scraping、実データ取得、deploy、Codex for OSS 申請を実装または承認するものではありません。

関連:

- [CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md](CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md)
- [CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md](CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md)
- [CANDIDATE_A_QUEUE_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_QUEUE_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_OVERLAY_QUEUE_CONNECTION_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_QUEUE_CONNECTION_SCOPE_DECISION.md)
- [CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_LOCAL_INTAKE_QUEUE_CONNECTION_SCOPE_DECISION.md](CANDIDATE_A_LOCAL_INTAKE_QUEUE_CONNECTION_SCOPE_DECISION.md)
- [CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_URL_CONTRACT_DRAFT.md](CANDIDATE_A_URL_CONTRACT_DRAFT.md)
- [CANDIDATE_A_SECURITY_AND_QA_PLAN.md](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- [YOUTUBE_DATA_POLICY_BOUNDARY.md](YOUTUBE_DATA_POLICY_BOUNDARY.md)

## Purpose

PR #48 で normalized event shape helper、PR #50 で queue helper、PR #52 で `demo=1` fixed synthetic event の queue 経由表示、PR #54 で local event intake helper、PR #56 で local intake to queue pure helper が入った。

次に決めるべきことは、overlay runtime の `demo=1` 経路を local intake helper と local intake to queue helper 経由へ寄せるかどうかです。ただし、この段階で transport、manual / fixture runtime connection、event source、fixture linkage まで広げると、URL契約、timer cleanup、source boundary、実データ境界が曖昧になる。

この文書の目的:

- 次の実装PRを `demo=1` fixed synthetic event の local intake to queue to overlay runtime connection に限定する。
- `demo=1` を public-safe display test flag のまま維持する。
- raw local input、event payload、queue state を generated URL、debug/status、DOMへ出さない方針を固定する。
- manual / fixture event の overlay runtime connection を後続に分ける。
- transport、`postMessage`、`BroadcastChannel`、`localStorage` transport、external network、YouTube integration を後続に分ける。
- 既存 timer cleanup、transparent idle、public-safe debug、text-not-HTML 境界を維持する。

## Next Implementation PR Scope

次の小実装PRは、overlay runtime の `demo=1` 経路を次の流れへ寄せることに限定する。

```text
demo=1 fixed synthetic input
  -> validateKeywordReactionLocalEventInput
  -> normalized demo event
  -> enqueueKeywordReactionLocalInput / buildKeywordReactionQueueFromLocalInputs
  -> bounded queue
  -> dequeue
  -> existing overlay toast display
```

入れてよいもの:

- `demo=1` で使う固定人工eventを local intake input として扱う小変更。
- local intake to queue helper を overlay runtime の demo path で使う import / call。
- existing toast rendering へ渡す normalized event の形を維持する変更。
- tests で local intake to queue helper path を通っていることを確認する。
- tests で idle、debug、invalid `c` fallback、timer cleanup、unsafe sink禁止を維持する。
- `docs/manual-qa.md` の小さな確認項目追加。

入れないもの:

- manual input event の overlay runtime connection。
- built-in fixture event の overlay runtime connection。
- transport。
- same-origin `postMessage`。
- `BroadcastChannel`。
- `localStorage` transport。
- external network。
- event source runtime。
- fixture linkage。
- toast queue runtime 複数source対応。
- ticker / badge runtime。
- paste JSON import。
- import/export UI。
- YouTube API / OAuth / API key / scraping / real data。

## Demo Input Boundary

`demo=1` は public-safe display test flag であり、event source ではない。

次PRで扱う demo input:

- コード内固定の人工データだけ。
- `sourceType: "demo"`。
- public-safe `eventId`。
- public-safe `displayText`。
- `displayPattern: "toast"`。
- normalized `reactionStyle`。
- bounded `intensity`。
- bounded `durationMs` / `offsetMs`。

次PRで扱わないもの:

- manual input text。
- fixture event data。
- raw fixture JSON。
- raw local input object のDOM表示。
- transport payload。
- queue state payload。
- real viewer id。
- raw YouTube comment / live chat content。
- private account data。
- secret-like values。

## Runtime Behavior To Preserve

次PRでは既存 overlay runtime の見た目と境界を維持する。

- 通常 `/overlay/keyword-reaction/` は transparent / no visible text。
- `debug=1` は public-safe status のみ。
- `demo=1` は fixed synthetic event を短時間表示して消す。
- `demo=1&debug=1` でも raw `c`、keyword実値、manual input text、fixture event data、queue state、secret-like value を表示しない。
- invalid `c` は safe fallback。
- generated URL は config-only。
- `/clock/` と `/clock/?c=...` に影響しない。

## Timer Cleanup Policy

既存 demo timer cleanup を維持する。

- timer は bounded `setTimeout` のみ。
- `setInterval`、unbounded loop、watch-like polling は使わない。
- rerun / remount / non-demo transition で古い timer を `clearTimeout` する。
- old timer が hidden overlay に古いeventを再表示しないことを tests / manual QA で確認する。

## Generated URL Boundary

generated URL は config-only を維持する。

URLへ入れないもの:

- local intake payload。
- normalized event payload。
- queue state。
- queue length / current index。
- queue schedule state。
- event `eventId`。
- event `displayText`。
- `displayText` arrays。
- raw manual input text。
- raw fixture JSON。
- fixture event data。
- transport payload。
- raw `postMessage` payload。
- `BroadcastChannel` payload。
- `localStorage` transport state。
- API key / OAuth token / access token / refresh token / client secret。
- private key。
- real viewer identifier。
- raw YouTube comment / live chat content。
- private account data。
- billing / payment info。
- secret-like values。

## Rendering Boundary

overlay runtime の rendering は text-not-HTML を維持する。

- `displayText` は `textContent` など safe DOM API で表示する。
- HTML-like text は inert text として扱う。
- `innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler は使わない。
- CSS class、dataset、style値は enum / bounded number / normalized value だけを使う。
- debug/status に raw local input、raw `c`、keyword実値、manual input text、fixture event data、transport payload、secret-like value を出さない。

## Security / QA Policy

次PRでは次を確認する。

- `demo=1` path が local intake to queue helper を通る。
- local intake helper が `sourceType: "demo"` を normalized event へ寄せる。
- queue helper の max 5 bounded queue と FIFO dequeue を使う。
- invalid / unsupported input は raw data を DOM、status、URLへ残さない。
- generated URL は config-only のまま。
- local intake payload、event payload、queue state、manual input text、fixture event data、transport payload は URL へ入らない。
- normal idle は transparent / no visible text。
- `debug=1` は public-safe status のみ。
- `demo=1` は public-safe fixed synthetic event のみ。
- timer cleanup が repeated run / non-demo run で維持される。
- no `innerHTML` / no unsafe sink。
- no `setInterval` / no unbounded loop / no watch-like polling。
- no `localStorage` transport。
- no external network。
- no `postMessage` / no `BroadcastChannel`。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- `/clock/` と `/clock/?c=...` に回帰がない。
- `/overlay/keyword-reaction/` の idle / debug / demo 境界に回帰がない。

## Non-Goals

- transport実装。
- same-origin `postMessage` 実装。
- `BroadcastChannel` 実装。
- `localStorage` transport。
- external network transport。
- event source runtime。
- manual input event の overlay runtime connection。
- built-in fixture event の overlay runtime connection。
- fixture linkage。
- toast queue runtime 複数source対応。
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

- 次実装PRが `demo=1` fixed synthetic event の local intake to queue to overlay runtime connection に限定されている。
- manual / fixture runtime connection は後続扱いである。
- transport、event source、fixture linkage、toast queue runtime 複数source対応は後続扱いである。
- generated URL は config-only のまま。
- local intake payload、event payload、queue state、transport payload、manual input text、fixture event data、raw JSON、`displayText` arrays は URLへ入れない。
- debug/status に raw values や secret-like values を出さない。
- text-not-HTML 方針が維持されている。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- validation が通る。

## Follow-Up Split

後続PRへ分けるもの:

1. local intake overlay runtime scope decision。この文書。
2. `demo=1` fixed synthetic event の local intake to queue to overlay runtime connection。
3. manual event runtime connection scope decision。
4. built-in fixture linkage scope decision。
5. transport prototype only after origin/source/channel QA is fixed。
6. toast queue runtime for multiple public-safe sources。
7. ticker / badge runtime。
8. paste JSON import design and validation。
9. import/export UI。
10. YouTube integration design after boundary review and human approval。

## Open Questions

- `demo=1` path で `enqueueKeywordReactionLocalInput` を使うか、`buildKeywordReactionQueueFromLocalInputs` を使うか。
- overlay runtime 内の helper名を増やすか、既存 `buildKeywordReactionDemoEvent` の内部だけを差し替えるか。
- manual event runtime connection の前に same-window internal dispatch docs を挟む必要があるか。
- built-in fixture linkage を overlay本体へ流す前に、fixture id / event reference をURLへ入れない方針を再確認する必要があるか。
