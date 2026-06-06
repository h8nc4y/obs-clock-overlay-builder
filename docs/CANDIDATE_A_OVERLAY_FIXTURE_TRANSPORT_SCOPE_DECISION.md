# Candidate A Overlay Fixture Transport Scope Decision

## Status

この文書は Candidate A: keyword reaction overlay の overlay本体fixture transport scope を固定する docs-only 記録です。

これは implementation planning evidence です。overlay本体fixture transport、`BroadcastChannel`、`postMessage`、`localStorage` transport、paste JSON import、YouTube API integration、OAuth、API key、scraping、実データ取得、deploy、Codex for OSS 申請を実装または承認するものではありません。

関連:

- [CANDIDATE_A_FIXTURE_DISPATCH_SCOPE_DECISION.md](CANDIDATE_A_FIXTURE_DISPATCH_SCOPE_DECISION.md)
- [CANDIDATE_A_FIXTURE_PLAYBACK_SCOPE_DECISION.md](CANDIDATE_A_FIXTURE_PLAYBACK_SCOPE_DECISION.md)
- [CANDIDATE_A_FIXTURE_SCHEMA_DRAFT.md](CANDIDATE_A_FIXTURE_SCHEMA_DRAFT.md)
- [CANDIDATE_A_FIRST_TRANSPORT_DECISION.md](CANDIDATE_A_FIRST_TRANSPORT_DECISION.md)
- [CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_INTERNAL_DISPATCH_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_INTERNAL_DISPATCH_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md](CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md)
- [CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_SECURITY_AND_QA_PLAN.md](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- [CANDIDATE_A_URL_CONTRACT_DRAFT.md](CANDIDATE_A_URL_CONTRACT_DRAFT.md)
- [CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md](CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md)
- [YOUTUBE_DATA_POLICY_BOUNDARY.md](YOUTUBE_DATA_POLICY_BOUNDARY.md)

## Purpose

PR #66 で editor preview 内の built-in fixture playback path は same-window internal dispatch helper 経由へ寄った。

PR #68 で fixture linkage readiness helper + tests が入り、built-in artificial fixture event を `sourceType: "fixture"` の local intake input、queue candidate、schedule candidate へ安全に変換できる pure boundary ができた。

次に決めることは、この fixture event を将来 `/overlay/keyword-reaction/` 本体へ渡す場合、どの transport を採用するか、またはまだ採用しないかです。

この文書の目的:

- editor preview 内の same-window internal dispatch と、overlay本体への別ページtransportを分ける。
- overlay本体fixture transport 候補を比較する。
- generated URL config-only 境界を維持する。
- fixture event data を URL へ入れない方針を維持する。
- raw fixture data、secret-like value、transport payload を debug/status/DOM/console へ出さない方針を維持する。
- YouTube API / OAuth / API key / scraping / real data を別boundary reviewまで扱わない。

## Current Implemented Boundary

実装済みとして扱うもの:

- built-in artificial fixture `demo-basic`。
- fixture schema validation / playback schedule helper。
- editor preview 内の fixture playback。
- editor preview fixture playback path through same-window internal dispatch helper。
- fixture linkage readiness helper + tests。
- fixture event -> local intake input candidate。
- fixture event -> queue candidate / schedule candidate。
- generated URL config-only boundary。

まだ実装していないもの:

- overlay本体 `/overlay/keyword-reaction/` への fixture transport。
- fixture event を OBS Browser Source の overlay page へ送る仕組み。
- `BroadcastChannel`。
- `postMessage`。
- `localStorage` transport。
- external network transport。
- paste JSON import。
- fixture file保存。
- real YouTube integration。

## Editor Preview vs Overlay Fixture Transport

editor preview 内の fixture dispatch は同一document内の internal handoff です。transportではありません。

overlay本体 `/overlay/keyword-reaction/` は OBS Browser Source で別contextとして開かれる可能性があるため、editor page の `EventTarget` や same-window internal dispatch helper だけでは届かない。

区別する理由:

- same-window internal dispatch は origin / channel / window relationship を扱わない。
- overlay本体へ送るには、別page間の lifetime、cleanup、送信元、受信先、stale event の扱いが必要になる。
- fixture event data を URL、storage、message payload に安易に入れると config-only contract と privacy boundary が崩れる。
- overlay本体transport を選ぶ前に、OBS Browser Source での挙動確認が必要になる。

## Transport Candidate Comparison

| Candidate | Candidate use | Risk / QA need | Decision |
|---|---|---|---|
| No transport yet | overlay は config-only URL と `demo=1` だけで完結する。 | fixture event は overlay本体へ届かないが、境界が最も安全。 | 採用。次PRではまだ transport 実装に入らない。 |
| Same-window internal dispatch | editor preview 内の helper整理。overlay runtime 内の `demo=1` handoff。 | 別page / OBS Browser Source へは届かない。 | overlay本体fixture transport としては不採用。preview/internal 用に限定。 |
| `BroadcastChannel` | same-origin contexts 間で fixture event を流す候補。 | OBS Browser Source互換、channel名、multi-tab、reload、cleanup、stale event、payload最小化のQAが必要。 | 後続候補。実装前に feasibility docs/static QA を挟む。 |
| `postMessage` | iframe / child window / opener 関係がある場合の候補。 | `event.origin` / `event.source` / window relationship / listener cleanup が必須。OBS Browser Source単体では送信元設計が必要。 | 後続候補。実装前に origin/source QA を固定する。 |
| URL config | OBS再現用 config の source of truth。 | event payload transportに使うと URL長大化、private data混入、raw value露出のリスクが高い。 | event transportには使わない。config-onlyを維持。 |
| `localStorage` transport | same-origin storage共有に見える案。 | OBS Browser Sourceとの共有が不透明。secret-like valueやfixture event dataの永続化リスクがある。 | 初期非推奨。transportには採用しない。 |
| External network transport | relay / backend / websocket / SSE。 | 外部送信、費用、認証、retention、privacy reviewが必要。 | 現段階は禁止。 |
| Future YouTube integration | 将来のreal source候補。 | transportではなくintegration boundary。official docs review、人間承認、credential/data設計が必要。 | 今回対象外。 |

## Decision

判断: **まだ overlay本体fixture transport 実装には入らない**。

次PR候補は次のどちらかに限定する。

1. `BroadcastChannel` feasibility docs/static QA。
2. overlay fixture transport readiness helper + tests。

この段階で採用しないもの:

- overlay本体fixture transport実装。
- `BroadcastChannel` 実装。
- `postMessage` 実装。
- `localStorage` transport。
- URL event transport。
- paste JSON import。
- YouTube API / OAuth / API key / scraping / real data。

判断理由:

- overlay本体は別page / OBS Browser Source context になり得る。
- same-window internal dispatch は別page transportではない。
- `BroadcastChannel` と `postMessage` は origin / source / lifetime / cleanup QA が必要。
- generated URL に fixture data を入れない制約がある。
- localStorage transport は secret-like value と raw fixture data を残しやすい。

## BroadcastChannel Requirements Before Adoption

`BroadcastChannel` を実装候補にする前に、少なくとも次を docs / static tests / manual QA で固定する。

- channel名。
- channel名に private value、keyword実値、fixture id、event id を混ぜない方針。
- same-origin 前提。
- 複数tab / 複数overlay / reload時の挙動。
- stale event を再表示しない方針。
- channel open / close cleanup。
- OBS Browser Sourceでの互換確認。
- invalid payload の safe reject / fallback。
- raw channel message を DOM、status、console、URLへ出さないこと。
- payload は normalized event または local intake candidate へ寄せること。
- no YouTube API / no OAuth / no API key / no real data。

この文書では `BroadcastChannel` を実装しない。

## postMessage Requirements Before Adoption

`postMessage` を実装候補にする前に、少なくとも次を docs / static tests / manual QA で固定する。

- window / iframe / opener / parent の関係。
- same-origin前提または明示allowlist。
- `event.origin` の確認。
- `event.source` の確認。
- message type / schemaVersion / overlayType の確認。
- listener setup / cleanup。
- invalid payload の safe reject / fallback。
- raw message payload を DOM、status、console、URLへ出さないこと。
- OBS Browser Source単体でどう送信元を持つか。
- no YouTube API / no OAuth / no API key / no real data。

この文書では `postMessage` を実装しない。

## URL Boundary

generated URL は config-only を維持する。

URLへ入れてよいもの:

- `schemaVersion`。
- `overlayType`。
- `displayPattern`。
- `reactionStyle`。
- `intensity`。
- `keyword`。
- `matchMode`。
- public-safe visual config。

URLへ入れないもの:

- fixture transport payload。
- fixture linkage payload。
- fixture event data。
- fixture event payload。
- local intake payload。
- normalized event payload。
- queue state。
- queue length / current index。
- event `eventId`。
- event `displayText`。
- raw fixture JSON。
- pasted fixture JSON。
- `displayText` arrays。
- raw `BroadcastChannel` payload。
- raw `postMessage` payload。
- `localStorage` transport state。
- API key / OAuth token / access token / refresh token / client secret / private key。
- real viewer identifier。
- raw YouTube comment / live chat content。
- private account data。
- billing / payment info。
- secret-like values。

URL は OBS再現用 config の source of truth であり、event transport ではない。

## Rendering And Debug Boundary

fixture event text は untrusted text として扱う。

必須方針:

- 表示する場合は `textContent` など safe DOM API に限定する。
- HTML-like text は inert text として扱う。
- `innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler は使わない。
- debug/status に raw fixture data、raw `c`、keyword実値、manual input text、queue state、transport payload、secret-like values を出さない。
- validation / transport status は public-safe Japanese message に限定する。

## Timer And Cleanup Boundary

fixture playback / overlay rendering で timer を使う場合も、transportとは別に cleanup を維持する。

- `setTimeout` を使う場合は bounded schedule にする。
- `setInterval`、unbounded loop、watch-like polling は使わない。
- stop / reset / reload / remount で古いtimerを clear する。
- channel / listener / subscription は lifecycle 終了時に cleanup する。
- stale fixture event が後からoverlayへ表示されないことを確認する。

## QA Requirements Before Any Transport PR

実際の transport 実装PRへ進む前に、少なくとも次を確認対象にする。

- OBS Browser Sourceで対象APIが使えるか。
- 通常ブラウザとOBS Browser Sourceの間で same-origin と lifetime が成立するか。
- origin / source / channel validation。
- setup / cleanup。
- reload時の挙動。
- stale event suppression。
- invalid payload の safe reject / fallback。
- generated URL config-only維持。
- fixture event data / event payload / queue state / transport payload を URLへ入れない。
- raw payload を DOM / status / console へ出さない。
- no `localStorage` transport by default。
- no external network。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- no `innerHTML` / no unsafe sink。
- `/clock/` と `/clock/?c=...` に回帰がない。
- `/overlay/keyword-reaction/` の idle / debug / demo 境界に回帰がない。

## Non-Goals

- overlay本体fixture transport実装。
- `BroadcastChannel` 実装。
- `postMessage` 実装。
- `localStorage` transport。
- external network transport。
- paste JSON import。
- fixture file保存。
- event source runtime。
- toast queue複数source対応。
- ticker / badge runtime。
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

- overlay本体fixture transport候補を比較している。
- same-window internal dispatch が別page transportではないと明記している。
- 判断は no transport yet である。
- 次PR候補が `BroadcastChannel` feasibility docs/static QA または overlay fixture transport readiness helper + tests に限定されている。
- URL config を event transport に使わない方針である。
- `localStorage` transport は初期非推奨である。
- generated URL は config-only のまま。
- fixture event data、event payload、queue state、transport payload は URLへ入れない。
- raw fixture data、manual input text、secret-like values を debug/status/DOM/consoleへ出さない。
- text-not-HTML 方針が維持されている。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- validation が通る。

## Follow-Up Split

後続PRへ分けるもの:

1. overlay fixture transport scope decision。この文書。
2. `BroadcastChannel` feasibility docs/static QA、または overlay fixture transport readiness helper + tests。
3. `BroadcastChannel` design / prototype only after channel lifecycle QA is fixed。
4. same-origin `postMessage` design / prototype only after origin/source QA is fixed。
5. overlay本体fixture transport implementation only after transport candidate and QA are fixed。
6. paste JSON import design and validation。
7. toast queue runtime for multiple public-safe sources。
8. ticker / badge runtime。
9. import/export UI。
10. YouTube integration design after official docs review, data boundary review, and human approval。

## Open Questions

- `BroadcastChannel` と `postMessage` のどちらを先に feasibility review するか。
- OBS Browser Sourceで `BroadcastChannel` のlifetimeとcleanupをどう記録するか。
- overlay本体fixture transport を実装する前に、fixture payloadを normalized event と local intake input のどちらで渡すか。
- transport channel名に config hash のような public-safe routing key が必要か。
- fixture transport の前に paste JSON import scope を先に固定するか。
