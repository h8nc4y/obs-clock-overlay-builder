# Candidate A Internal Dispatch Overlay Runtime Scope Decision

## Status

この文書は Candidate A: keyword reaction overlay の internal dispatch -> overlay runtime connection scope を固定する docs-only 記録です。

これは implementation planning evidence です。overlay runtime へ接続する次PRの範囲を固定するための文書であり、transport、`postMessage`、`BroadcastChannel`、`localStorage` transport、editor UI connection、fixture linkage、manual input runtime connection、YouTube API integration、OAuth、API key、scraping、実データ取得、deploy、Codex for OSS 申請を実装または承認するものではありません。

関連:

- [CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md](CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md)
- [CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_FIRST_TRANSPORT_DECISION.md](CANDIDATE_A_FIRST_TRANSPORT_DECISION.md)
- [CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_LOCAL_INTAKE_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_LOCAL_INTAKE_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_LOCAL_INTAKE_QUEUE_CONNECTION_SCOPE_DECISION.md](CANDIDATE_A_LOCAL_INTAKE_QUEUE_CONNECTION_SCOPE_DECISION.md)
- [CANDIDATE_A_URL_CONTRACT_DRAFT.md](CANDIDATE_A_URL_CONTRACT_DRAFT.md)
- [CANDIDATE_A_SECURITY_AND_QA_PLAN.md](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- [YOUTUBE_DATA_POLICY_BOUNDARY.md](YOUTUBE_DATA_POLICY_BOUNDARY.md)

## Purpose

PR #60 で same-window internal dispatch helper + tests は実装済みです。

実装済みとして扱うもの:

- helper は `EventTarget` を注入可能にする。
- `CustomEvent` detail には normalized keyword reaction event だけを入れる。
- subscribe helper は cleanup / unsubscribe function を返す。
- `manual` / `fixture` / `demo` だけを sourceType として扱う。
- unsupported sourceType、raw input、transport payload、queue state、secret-like values を dispatch detail に残さない。
- `postMessage`、`BroadcastChannel`、`localStorage` transport は実装していない。

次に決めることは、overlay runtime の `demo=1` fixed synthetic event path で、この helper をどこまで使うかです。

この文書の目的:

- 次の実装PRを small runtime connection に限定する。
- same-window internal dispatch が transport ではないことを明確にする。
- `demo=1` fixed synthetic event だけを internal dispatch path に通す。
- 既存の local intake -> queue -> toast display path を維持する。
- idle / debug / timer cleanup / generated URL config-only 境界を維持する。

## Next Implementation Scope

次の実装PRは **demo=1 fixed synthetic event を same-window internal dispatch helper 経由で overlay runtime 表示へ渡す小変更** に限定する。

入れてよいもの:

- overlay runtime 内の dedicated `EventTarget`。
- `subscribeKeywordReactionInternalEvents` による normalized event 受信。
- `dispatchKeywordReactionInternalEvent` による `demo=1` fixed synthetic event の dispatch。
- dispatch後に queue helper path へ渡し、既存toast表示へつなぐ処理。
- runtime lifecycle 内での unsubscribe / cleanup。
- 既存 `setTimeout` demo timer cleanup の維持。
- tests / static checks / manual QA の更新。

入れないもの:

- editor UI connection。
- manual input event sending。
- fixture event sending。
- `postMessage`。
- `BroadcastChannel`。
- `localStorage` transport。
- external network transport。
- transport本体。
- event source本体。
- fixture linkage。
- toast queue複数source対応。
- ticker / badge。
- paste JSON import。
- import/export UI。
- YouTube API / OAuth / API key / scraping / real data。

## Same-Window Internal Dispatch Boundary

same-window internal dispatch は transport ではありません。

この段階では、同一 overlay runtime module 内の internal handoff として扱う。

方針:

- `EventTarget` は overlay runtime 内に閉じる。
- dispatch detail は normalized event のみ。
- raw local input、transport payload、queue state、raw JSON は dispatch detail に残さない。
- subscribe listener は normalized event だけを受け取る。
- invalid / unsupported event は safe reject / fallback とし、raw value を画面、status、console、URLへ出さない。
- unsubscribe は runtime lifecycle で必ず呼べる形にする。

## Demo Path Policy

次PRで internal dispatch に通すのは `demo=1` fixed synthetic event だけです。

維持すること:

- 通常 `/overlay/keyword-reaction/` は transparent / no visible text。
- `debug=1` は public-safe status のみ。
- `demo=1` は public-safe fixed synthetic event のみ。
- `demo=1` の表示文言、表示時間、消える挙動は既存と同等にする。
- repeated mount / rerun / idle transition で旧timerと旧subscriptionが残らない。

次PRで広げないこと:

- manual input event runtime connection。
- fixture event runtime connection。
- external event source。
- multi-source queue runtime。

## Queue Path Policy

既存の queue helper path は維持する。

次PRの想定経路:

```text
demo=1 fixed synthetic event
  -> local intake normalized event
  -> same-window internal dispatch helper
  -> subscribe listener receives normalized event
  -> queue helper
  -> existing toast display
```

queue state、queue length、current index、schedule state は debug/status/URLへ出さない。

## URL Boundary

generated URL は config-only を維持する。

URLへ入れないもの:

- internal dispatch payload。
- normalized event payload。
- queue state。
- queue length / current index。
- eventId。
- event displayText。
- manual input text。
- fixture event data。
- raw fixture JSON。
- raw user JSON。
- `displayText` arrays。
- transport payload。
- raw `postMessage` payload。
- `BroadcastChannel` payload。
- `localStorage` transport state。
- API key / OAuth token / access token / refresh token / client secret / private key。
- real viewer identifier。
- raw YouTube comment / live chat content。
- private account data。
- billing / payment info。
- secret-like values。

`demo=1` は public-safe display test flag であり、event payload を `c` へ入れる仕組みではない。

## Rendering And Debug Boundary

表示は text-not-HTML を維持する。

- event `displayText` は `textContent` など safe DOM API で表示する。
- HTML-like text は inert text として扱う。
- `innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler は使わない。
- debug/status に raw `c`、keyword実値、manual input text、fixture event data、queue state、internal dispatch payload、secret-like values を出さない。

## QA Requirements For The Implementation PR

次実装PRでは少なくとも次を確認する。

- `demo=1` event が same-window internal dispatch helper 経由で受信される。
- subscribe listener が normalized event だけを受け取る。
- queue helper path が維持される。
- `demo=1` fixed synthetic toast が既存と同等に表示され、短時間後に消える。
- 通常 idle は transparent / no visible text のまま。
- `debug=1` は public-safe status のみ。
- invalid `c` + `demo=1` + `debug=1` は safe fallback し、raw invalid value を表示しない。
- unsubscribe / cleanup により duplicate delivery や stale listener が残らない。
- timer cleanup が repeated mount / rerun で維持される。
- no `postMessage` / no `BroadcastChannel` / no `localStorage` transport。
- no external network。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- no `innerHTML` / no unsafe sink。
- generated URL は config-only のまま。
- `/clock/` と `/clock/?c=...` に回帰がない。
- `/overlay/keyword-reaction/` の idle / debug / demo 境界に回帰がない。

## Non-Goals

- transport実装。
- `postMessage` 実装。
- `BroadcastChannel` 実装。
- `localStorage` transport。
- external network transport。
- editor UI connection。
- manual input runtime connection。
- fixture runtime connection。
- fixture linkage。
- toast queue複数source対応。
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

- 次実装PRが `demo=1` fixed synthetic event の internal dispatch path 接続に限定されている。
- same-window internal dispatch は transportではないと明記されている。
- `postMessage` / `BroadcastChannel` / `localStorage` transport は後続扱い。
- editor UI / manual input / fixture linkage は後続扱い。
- `EventTarget` は overlay runtime 内に閉じる。
- dispatch detail は normalized event のみ。
- queue helper path は維持する。
- generated URL は config-only のまま。
- raw値やsecret-like値を debug/status/toast/URLへ出さない。
- subscribe cleanup / unsubscribe と timer cleanup を runtime lifecycle で確認する。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- validation が通る。

## Follow-Up Split

後続PRへ分けるもの:

1. internal dispatch overlay runtime connection。この文書。
2. `demo=1` fixed synthetic event を same-window internal dispatch helper 経由で overlay runtimeへ渡す実装PR。
3. manual event runtime connection scope decision。
4. fixture linkage scope decision。
5. same-origin `postMessage` design / prototype only after origin/source QA is fixed。
6. `BroadcastChannel` design / prototype only after channel lifecycle QA is fixed。
7. toast queue runtime for multiple public-safe sources。
8. ticker / badge runtime。
9. paste JSON import design and validation。
10. import/export UI。
11. YouTube integration design after official docs review, data boundary review, and human approval。

## Open Questions

- internal `EventTarget` を runtime state として外部から注入できるように残すか、runtime内専用に閉じるか。
- subscription cleanup を mount return function へ集約するか、既存 timer cleanup と別管理にするか。
- manual event runtime connection の前に、editor preview と overlay page の責務をさらに分ける必要があるか。
- fixture linkage の前に、same-window internal dispatch を public API として扱うか internal-only として扱うか。
