# Candidate A First Transport Decision

## Status

この文書は Candidate A: keyword reaction overlay の first transport implementation decision を固定する docs-only 記録です。

これは implementation planning evidence です。transport、`postMessage`、`BroadcastChannel`、`localStorage` transport、event source、fixture linkage、overlay runtime 追加実装、YouTube API integration、OAuth、API key、scraping、実データ取得、deploy、Codex for OSS 申請を実装または承認するものではありません。

関連:

- [CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md](CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md)
- [CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_QUEUE_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_QUEUE_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md](CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md)
- [CANDIDATE_A_LOCAL_INTAKE_QUEUE_CONNECTION_SCOPE_DECISION.md](CANDIDATE_A_LOCAL_INTAKE_QUEUE_CONNECTION_SCOPE_DECISION.md)
- [CANDIDATE_A_LOCAL_INTAKE_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_LOCAL_INTAKE_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_INTERNAL_DISPATCH_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_INTERNAL_DISPATCH_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_MANUAL_INPUT_DISPATCH_SCOPE_DECISION.md](CANDIDATE_A_MANUAL_INPUT_DISPATCH_SCOPE_DECISION.md)
- [CANDIDATE_A_FIXTURE_DISPATCH_SCOPE_DECISION.md](CANDIDATE_A_FIXTURE_DISPATCH_SCOPE_DECISION.md)
- [CANDIDATE_A_OVERLAY_FIXTURE_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_FIXTURE_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_URL_CONTRACT_DRAFT.md](CANDIDATE_A_URL_CONTRACT_DRAFT.md)
- [CANDIDATE_A_SECURITY_AND_QA_PLAN.md](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- [YOUTUBE_DATA_POLICY_BOUNDARY.md](YOUTUBE_DATA_POLICY_BOUNDARY.md)

## Purpose

PR #58 で `demo=1` fixed synthetic event は local intake helper -> queue helper -> overlay runtime 表示へ通った。現時点で、manual / fixture event を overlay runtime へ届ける transport はまだない。

次に決めるべきことは、すぐ cross-window transport へ入るか、先に same-window 内部経路を整理するかです。

この文書の目的:

- transport候補を比較する。
- 最初に実装する候補と、まだ採用しない候補を明確にする。
- OBS Browser Source での使いやすさ、再現性、安全性、実装リスクを整理する。
- generated URL config-only 境界を維持する。
- YouTube API / OAuth / API key / scraping / real data を別boundary reviewまで扱わない。

## Current Implemented Boundary

実装済みとして扱うもの:

- `/overlay/keyword-reaction/` は config-aware overlay runtime として `?c=...` を読む。
- 通常 idle は transparent / no visible text。
- `debug=1` は public-safe status のみ。
- `demo=1` は fixed synthetic event を表示し、短時間後に消える。
- `demo=1` path は local intake helper と queue helper を通る。
- generated URL は config-only のまま。

まだ実装していないもの:

- manual event runtime connection。
- fixture event runtime connection。
- event source。
- fixture linkage。
- transport。
- same-origin `postMessage`。
- `BroadcastChannel`。
- `localStorage` transport。
- external network transport。
- YouTube API / OAuth / API key / scraping / real data。

## Transport Candidate Comparison

| Candidate | OBS Browser Source use | Browser-to-OBS use | Safety / reproducibility notes | Decision |
|---|---|---|---|---|
| No transport yet | 使える。overlayはURL configと`demo=1`だけで完結する。 | イベント注入はできない。 | 最も安全だが、manual / fixture runtime接続へ進めない。 | 現状維持としては安全。ただし次の小PRでは内部経路を整理する。 |
| Same-window internal dispatch | 同一document内のruntime helper整理には使える。OBS Browser Source単体では外部送信ではない。 | 通常ブラウザから別OBS Browser Sourceへは届かない。 | origin/channel問題を持ち込まず、normalized event intake pathを先に固定できる。 | 初回候補にする。次PRは helper + tests まで。 |
| Same-origin `postMessage` | iframe / preview window / child window と overlay を結ぶ候補。 | OBS Browser Source と別ブラウザ間では window関係が必要で、通常は自然には成立しない。 | `event.origin` / `event.source` / message type / cleanup のQAが必須。 | 初回では実装しない。設計とQA固定後の後続候補。 |
| `BroadcastChannel` | same-origin contexts間の候補。 | 通常ブラウザとOBS Browser Sourceが同一originなら候補だが、OBS互換性とlifetime確認が必要。 | channel名、複数tab、reload、cleanup、stale event の設計が必要。 | 初回では実装しない。OBS互換QA後の後続候補。 |
| URL config | OBS再現性のsource of truth。 | 設定共有には強い。event transportには向かない。 | URLにevent payloadを入れるとprivate data混入と長大化のリスクがある。 | config-onlyを維持。transportには使わない。 |
| `localStorage` transport | OBS Browser Source依存の挙動が読みにくい。 | 通常ブラウザとOBSでstorage共有が分かりにくい。 | secret-like value、manual input、fixture dataを永続化しやすい。 | 初期採用しない。editor convenience と transport を分ける。 |
| External network transport | 技術的には可能。 | remote relayなら可能。 | 外部送信、認証、保存、費用、data boundaryが必要。 | 現段階では禁止。 |
| Future YouTube integration | 将来のreal event source候補。 | transportではなくintegration boundary。 | official docs review、credential/data handling、human approvalが必要。 | 今回は対象外。 |

## First Transport Decision

判断: まだ cross-window transport 実装に入らない。

次PR候補は **same-window internal dispatch helper + tests** に限定する。

目的:

- overlay runtime 内または同一document内で、public-safe local event を intake -> queue -> render path へ渡す境界を整理する。
- `manual` / `fixture` runtime connection を始める前に、dispatch payload を normalized event shape へ寄せる tests を作る。
- `postMessage` / `BroadcastChannel` の origin、source、channel lifetime 問題をまだ持ち込まない。

次PRで扱ってよいもの:

- same-window internal dispatch helper。
- local-only event object を local intake helper へ渡す小さな adapter。
- normalized event だけを queue helper へ渡す tests。
- unsupported sourceType / invalid payload の safe reject / fallback tests。
- no DOM / no storage / no network / no transport API dependency の static tests。

次PRで扱わないもの:

- `window.postMessage` listener / sender。
- `BroadcastChannel`。
- `localStorage` transport。
- external network。
- manual / fixture UI runtime connection。
- built-in fixture overlay linkage。
- multi-source toast queue runtime。
- YouTube API / OAuth / API key / scraping / real data。

## Post-PR #60 Overlay Runtime Handoff

PR #60 で same-window internal dispatch helper + tests は実装済みです。

次段階は [CANDIDATE_A_INTERNAL_DISPATCH_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_INTERNAL_DISPATCH_OVERLAY_RUNTIME_SCOPE_DECISION.md) に分ける。次の実装PR候補は、`demo=1` fixed synthetic event を same-window internal dispatch helper 経由で overlay runtime の既存 local intake / queue / toast path へ渡す小変更に限定する。

この handoff は transport実装の承認ではありません。`postMessage`、`BroadcastChannel`、`localStorage` transport、editor UI connection、manual input runtime connection、fixture linkage、external network、YouTube integration は引き続き後続に分ける。

## Post-PR #62 Manual Input Dispatch Handoff

PR #62 で `demo=1` fixed synthetic event は same-window internal dispatch helper 経由で overlay runtime へ渡るようになった。

次段階は [CANDIDATE_A_MANUAL_INPUT_DISPATCH_SCOPE_DECISION.md](CANDIDATE_A_MANUAL_INPUT_DISPATCH_SCOPE_DECISION.md) に分ける。次の実装PR候補は、editor preview 内の manual input event path を same-window internal dispatch helper へ寄せる小変更に限定する。

この handoff は overlay本体transport の承認ではありません。`postMessage`、`BroadcastChannel`、`localStorage` transport、fixture linkage、external network、YouTube integration は後続扱いです。

## Post-PR #64 Fixture Dispatch Handoff

PR #64 で editor preview 内の manual input event path は same-window internal dispatch helper 経由へ寄った。

次段階は [CANDIDATE_A_FIXTURE_DISPATCH_SCOPE_DECISION.md](CANDIDATE_A_FIXTURE_DISPATCH_SCOPE_DECISION.md) に分ける。次の実装PR候補は、editor preview 内の built-in fixture playback event path を same-window internal dispatch helper へ寄せる小変更に限定する。

この handoff も transport実装の承認ではありません。overlay本体fixture transport、`postMessage`、`BroadcastChannel`、`localStorage` transport、paste JSON import、external network、YouTube integration は後続扱いです。

## Post-PR #68 Overlay Fixture Transport Handoff

PR #66 で editor preview built-in fixture playback path は same-window internal dispatch helper 経由へ寄り、PR #68 で fixture linkage readiness helper + tests は実装済みです。

次段階は [CANDIDATE_A_OVERLAY_FIXTURE_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_FIXTURE_TRANSPORT_SCOPE_DECISION.md) に分ける。判断は、まだ overlay本体fixture transport 実装へ進まず、`BroadcastChannel` feasibility docs/static QA または overlay fixture transport readiness helper + tests に限定することです。

URL config は event payload transport には使わない。`localStorage` transport は初期非推奨を維持し、`BroadcastChannel` / `postMessage` は origin / source / channel lifetime / cleanup QA を固定してから後続候補にする。

## Same-Window Internal Dispatch Boundary

same-window internal dispatch は transportではなく、同一document内の internal handoff として扱う。

受け付けてよいもの:

- `sourceType: "manual" | "fixture" | "demo"` の public-safe local event input。
- `normalizeKeywordReactionEvent` / local intake helper で normalized event へ寄せられる payload。
- bounded `durationMs` / `offsetMs`。
- enum化された `displayPattern` / `reactionStyle`。

受け付けないもの:

- raw transport payload。
- raw `postMessage` event。
- `BroadcastChannel` message。
- `localStorage` value。
- raw manual input text をURLへ入れる目的のpayload。
- raw fixture JSON。
- real viewer id。
- raw comment / live chat data。
- API key / OAuth token / access token / refresh token / client secret / private key。
- secret-like values。

## postMessage Requirements Before Adoption

`postMessage` を採用する前に、少なくとも次をdocs / tests / manual QAで固定する。

- same-origin前提か、明示allowlistにするか。
- `event.origin` の検証。
- `event.source` の検証。
- message type / schemaVersion / overlayType の検証。
- raw message payload をDOM、status、console、URLへ出さないこと。
- listener setup / cleanup。
- iframe / popup / OBS Browser Source の想定関係。
- invalid message の safe reject / fallback。

この文書では `postMessage` を実装しない。

## BroadcastChannel Requirements Before Adoption

`BroadcastChannel` を採用する前に、少なくとも次をdocs / tests / manual QAで固定する。

- channel名。
- 複数tab / 複数overlay / reload時のlifetime。
- stale event を再表示しない方針。
- channel cleanup。
- OBS Browser Source での互換確認。
- payload最小化。
- raw channel message をDOM、status、console、URLへ出さないこと。

この文書では `BroadcastChannel` を実装しない。

## URL Boundary

generated URL は config-only を維持する。

URLへ入れてよいもの:

- `schemaVersion`
- `overlayType`
- `displayPattern`
- `reactionStyle`
- `intensity`
- `keyword`
- `matchMode`
- public-safe visual config

URLへ入れないもの:

- same-window dispatch payload。
- transport payload。
- event payload。
- queue state。
- queue length / current index。
- manual input text。
- fixture event data。
- raw fixture JSON。
- `displayText` arrays。
- raw `postMessage` payload。
- `BroadcastChannel` payload。
- `localStorage` transport state。
- API key / OAuth token / access token / refresh token / client secret / private key。
- real viewer identifier。
- raw YouTube comment / live chat content。
- private account data。
- billing / payment info。
- secret-like values。

## Rendering Boundary

transport候補に関係なく、表示は text-not-HTML を維持する。

- `displayText` は `textContent` など safe DOM API で表示する。
- HTML-like text は inert text として扱う。
- `innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler は使わない。
- debug/status に raw payload、raw `c`、keyword実値、manual input text、fixture event data、queue state、secret-like values を出さない。

## Security / QA Gate For Any Real Transport PR

実際に `postMessage` / `BroadcastChannel` / その他transportを実装するPRでは、次を必須にする。

- origin / source / channel validation。
- setup / cleanup。
- reload時の挙動。
- invalid payload の safe reject / fallback。
- no raw payload in DOM / status / console / URL。
- generated URL config-only維持。
- no `localStorage` transport by default。
- no external network。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- no `innerHTML` / no unsafe sink。
- no `setInterval` / no unbounded loop / no watch-like polling。
- `/clock/` と `/clock/?c=...` に回帰がない。
- `/overlay/keyword-reaction/` の idle / debug / demo 境界に回帰がない。

## Non-Goals

- transport実装。
- `postMessage` 実装。
- `BroadcastChannel` 実装。
- `localStorage` transport。
- external network transport。
- event source runtime。
- manual event runtime connection。
- fixture event runtime connection。
- fixture linkage。
- toast queue runtime複数source対応。
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

- transport候補を比較している。
- 初回は `postMessage` / `BroadcastChannel` / `localStorage` transportへ進まない判断である。
- 次PR候補が same-window internal dispatch helper + tests に限定されている。
- generated URL は config-only のまま。
- transport payload、event payload、queue state、manual input text、fixture event data、raw JSON、`displayText` arrays はURLへ入れない。
- `localStorage` transport は初期採用しない。
- external network transport は禁止。
- YouTube integration は別boundary reviewと人間承認後。
- text-not-HTML 方針が維持されている。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- validation が通る。

## Follow-Up Split

後続PRへ分けるもの:

1. first transport decision。この文書。
2. same-window internal dispatch helper + tests。
3. internal dispatch overlay runtime connection scope decision。
4. `demo=1` fixed synthetic event through internal dispatch helper。
5. manual input dispatch scope decision。
6. editor preview manual input event path through same-window internal dispatch helper。
7. built-in fixture dispatch scope decision。
8. editor preview built-in fixture playback event path through same-window internal dispatch helper。
9. built-in fixture linkage scope decision。
10. fixture linkage readiness helper + tests。
11. overlay fixture transport scope decision。
12. `BroadcastChannel` feasibility docs/static QA、または overlay fixture transport readiness helper + tests。
13. same-origin `postMessage` design / prototype only after origin/source QA is fixed。
14. `BroadcastChannel` design / prototype only after channel lifecycle QA is fixed。
15. toast queue runtime for multiple public-safe sources。
16. ticker / badge runtime。
17. paste JSON import design and validation。
18. import/export UI。
19. YouTube integration design after official docs review, data boundary review, and human approval。

## Open Questions

- same-window internal dispatch helper を overlay runtime module に置くか、local intake helper module に寄せるか。
- dispatch helper の戻り値を queue state にするか、render-ready event にするか。
- manual event runtime connection の前に、editor preview と overlay page の責務をさらに分ける必要があるか。
- postMessage を採用する場合、OBS Browser Source と通常ブラウザのwindow関係をどう検証するか。
- BroadcastChannel を採用する場合、OBS Browser Source互換性をどの環境で確認するか。
