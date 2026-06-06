# Candidate A Fixture Dispatch Scope Decision

## Status

この文書は Candidate A: keyword reaction overlay の built-in fixture preview dispatch scope を固定する docs-only 記録です。

これは implementation planning evidence です。editor preview 内の built-in fixture playback event path を same-window internal dispatch helper へ寄せる次PRの範囲を決めるための文書であり、overlay本体fixture transport、`postMessage`、`BroadcastChannel`、`localStorage` transport、paste JSON import、fixture linkage、YouTube API integration、OAuth、API key、scraping、実データ取得、deploy、Codex for OSS 申請を実装または承認するものではありません。

関連:

- [CANDIDATE_A_FIXTURE_PLAYBACK_SCOPE_DECISION.md](CANDIDATE_A_FIXTURE_PLAYBACK_SCOPE_DECISION.md)
- [CANDIDATE_A_FIXTURE_SCHEMA_DRAFT.md](CANDIDATE_A_FIXTURE_SCHEMA_DRAFT.md)
- [CANDIDATE_A_MANUAL_INPUT_DISPATCH_SCOPE_DECISION.md](CANDIDATE_A_MANUAL_INPUT_DISPATCH_SCOPE_DECISION.md)
- [CANDIDATE_A_INTERNAL_DISPATCH_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_INTERNAL_DISPATCH_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_FIRST_TRANSPORT_DECISION.md](CANDIDATE_A_FIRST_TRANSPORT_DECISION.md)
- [CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_URL_CONTRACT_DRAFT.md](CANDIDATE_A_URL_CONTRACT_DRAFT.md)
- [CANDIDATE_A_SECURITY_AND_QA_PLAN.md](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- [YOUTUBE_DATA_POLICY_BOUNDARY.md](YOUTUBE_DATA_POLICY_BOUNDARY.md)

## Purpose

PR #42 で built-in artificial fixture + schema validation + editor preview playback は実装済みです。

PR #64 で editor preview 内の manual input match path は same-window internal dispatch helper 経由へ寄りました。

次に決めることは、editor preview 内の built-in fixture playback event path も同じ internal handoff へ寄せるかどうかです。

この文書の目的:

- built-in fixture playback と overlay本体への fixture transport を分ける。
- 次の実装PRを editor preview 内の小変更に限定する。
- built-in artificial fixture only の境界を維持する。
- fixture event data を generated URL へ含めない方針を維持する。
- fixture event data、internal dispatch payload、event payload、queue state、transport payload、secret-like values を debug/status/URL へ出さない。
- `postMessage` / `BroadcastChannel` / `localStorage` transport をまだ採用しない。
- paste JSON import と YouTube integration を後続へ残す。

## Decision

次PR候補は **editor preview 内の built-in fixture playback event path を same-window internal dispatch helper へ寄せる小実装** に限定する。

採用する範囲:

- 既存の fixture playback UI、見た目、再生 / 停止 / リセットを基本維持する。
- built-in artificial fixture の各 event を local intake payload として扱う。
- fixture event は local intake helper で normalized event へ寄せる。
- same-window internal dispatch helper の detail には normalized event だけを渡す。
- subscribe listener が受け取った normalized event を既存 fixture toast 表示経路へ渡す。
- timer cleanup / stop / reset / replay の既存方針を維持する。
- fixture event text は表示に使ってよいが、generated URL には入れない。
- DOM表示は `textContent` など safe DOM API のみを使う。

採用しない範囲:

- overlay本体 `/overlay/keyword-reaction/` への fixture transport。
- OBS Browser Source へ fixture event を送る仕組み。
- `postMessage`。
- `BroadcastChannel`。
- `localStorage` transport。
- external network transport。
- paste JSON import。
- fixture file保存。
- fixture linkage。
- toast queue複数source対応。
- ticker / badge。
- import/export UI。
- YouTube API / OAuth / API key / scraping / real data。

## Editor Preview vs Overlay Transport

editor preview 内の fixture dispatch は、同じ document 内の preview helper 整理です。transportではありません。

区別する理由:

- editor preview は同一ページ内で完結するため、origin / source / channel lifetime の問題を持ち込まない。
- OBS Browser Source で開く overlay本体は別contextになり得るため、fixture event を届けるには別途 transport design が必要になる。
- transport を急ぐと、fixture event data、raw fixture JSON、private text を URL、storage、message payload に混ぜるリスクが増える。
- 先に preview内の normalized event path を固定すると、後続の transport PR でも受け取るshapeを狭くできる。

今回の判断:

- editor preview 内の built-in fixture internal dispatch path は次実装候補。
- overlay本体への fixture transport は後続。

## Intended Next Implementation Flow

次PRの想定flow:

```text
built-in artificial fixture event
  -> local intake helper
  -> normalized fixture event
  -> same-window internal dispatch helper
  -> preview listener receives normalized event
  -> existing fixture toast preview display
```

維持すること:

- built-in fixture は artificial data only。
- fixture schema validation / playback schedule helper は既存方針を維持する。
- fixture event data は generated URL へ含めない。
- stop / reset / replay 後も古いtimerやlistenerが残らないようにする。
- manual input dispatch path は壊さない。

## Local Intake And Queue Relationship

fixture event は raw fixture object のまま dispatch しない。

次PRで使う候補:

- `sourceType: "fixture"`。
- `eventId`: public-safe fixture event id。
- `displayText`: built-in fixture の public-safe normalized text。
- `keyword`: built-in fixture の public-safe keyword。
- `displayPattern: "toast"`。
- `reactionStyle` / `intensity`: normalized event 由来の public-safe values。
- bounded `durationMs` / `offsetMs`。

detail / queue / preview へ残さないもの:

- raw fixture JSON。
- unknown fields。
- transport payload。
- queue state。
- raw user JSON。
- paste JSON input。
- API key / OAuth token / access token / refresh token / client secret / private key。
- real viewer id。
- raw YouTube comment / live chat content。
- private account data。
- billing / payment info。
- secret-like values。

## Generated URL Boundary

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

- fixture event data。
- fixture event payload。
- internal dispatch payload。
- normalized event payload。
- queue state。
- queue length / current index。
- event `eventId`。
- event `displayText`。
- raw fixture JSON。
- pasted fixture JSON。
- manual input text。
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

## Rendering And Debug Boundary

fixture event text は untrusted text として扱う。

必須方針:

- 表示は `textContent` など safe DOM API に限定する。
- HTML-like text は inert text として扱う。
- `innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler は使わない。
- CSS class、dataset、style値は enum / bounded number / normalized value だけにする。
- debug/status に raw fixture data、raw `c`、keyword実値、manual input text、queue state、transport payload、secret-like values を出さない。
- validation error / playback status は public-safe Japanese message に限定する。

## Timer Cleanup Policy

次PRでは既存の fixture playback timer 方針を維持する。

- `setTimeout` による bounded playback schedule は維持してよい。
- `setInterval`、unbounded loop、watch は使わない。
- stop / reset で古いtimerを clear する。
- replay 前に古いtimerを clear する。
- internal dispatch subscription は event処理後に cleanup / unsubscribe する。
- stop / reset 後に古いfixture eventが後からtoast表示されないことを確認する。

## QA Requirements For The Next PR

次実装PRでは少なくとも次を確認する。

- built-in fixture playback event が editor preview 内で same-window internal dispatch helper 経由になる。
- listener が受け取る detail は normalized event のみ。
- existing fixture toast preview の見た目、再生 / 停止 / リセットが維持される。
- timer cleanup が stop / reset / replay で維持される。
- fixture event data は generated URL へ含まれない。
- raw fixture data、event payload、queue state、transport payload は debug/status/URL へ出ない。
- HTML-like fixture text は inert text として表示される。
- manual input internal dispatch path に回帰がない。
- `innerHTML` / unsafe sink がない。
- `postMessage` / `BroadcastChannel` / `localStorage` transport がない。
- overlay本体 `/overlay/keyword-reaction/` への fixture transport がない。
- paste JSON import がない。
- no external network。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- `/clock/` と `/clock/?c=...` に回帰がない。
- `/overlay/keyword-reaction/` の idle / debug / demo 境界に回帰がない。

## Non-Goals

- overlay本体への fixture transport。
- fixture event source を OBS Browser Source へ送る仕組み。
- `postMessage` 実装。
- `BroadcastChannel` 実装。
- `localStorage` transport。
- external network transport。
- paste JSON import。
- fixture file保存。
- fixture linkage。
- built-in fixture を overlay本体へ流す実装。
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

- 次PR候補が editor preview 内の built-in fixture playback event path を same-window internal dispatch helper へ寄せる小実装に限定されている。
- overlay本体への fixture transport は後続扱いである。
- same-window internal dispatch は transportではないと明記されている。
- built-in artificial fixture only の境界が維持されている。
- fixture event data は generated URL へ入れない。
- internal dispatch detail は normalized event のみ。
- raw fixture data、event payload、transport payload、queue state、secret-like values を debug/status/URLへ出さない。
- text-not-HTML 方針が明確である。
- timer cleanup / stop / reset / replay 方針が明確である。
- `postMessage` / `BroadcastChannel` / `localStorage` transport は後続扱い。
- paste JSON import は後続扱い。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- validation が通る。

## Follow-Up Split

後続PRへ分けるもの:

1. fixture dispatch scope decision。この文書。
2. editor preview built-in fixture playback event path through same-window internal dispatch helper。
3. overlay本体 fixture transport design after transport boundary review。
4. paste JSON import design and validation。
5. same-origin `postMessage` design / prototype only after origin/source QA is fixed。
6. `BroadcastChannel` design / prototype only after channel lifecycle QA is fixed。
7. toast queue runtime for multiple public-safe sources。
8. ticker / badge runtime。
9. import/export UI。
10. YouTube integration design after official docs review, data boundary review, and human approval。

## Open Questions

- fixture preview の internal dispatch target を manual preview と共通にするか、fixture playback 専用に閉じるか。
- fixture dispatch 後の subscription cleanup を eventごとに行うか、playback lifecycleへ集約するか。
- fixture event の `eventId` を existing fixture id から維持するか、preview用に固定prefixを付けるか。
- overlay本体への fixture transport を検討する前に、paste JSON import のscopeを先に固定するか。
- `postMessage` と `BroadcastChannel` のどちらを先に設計レビューするか。
