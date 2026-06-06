# Candidate A Manual Input Dispatch Scope Decision

## Status

この文書は Candidate A: keyword reaction overlay の manual input dispatch scope を固定する docs-only 記録です。

これは implementation planning evidence です。editor UI接続、manual input送信、overlay本体transport、`postMessage`、`BroadcastChannel`、`localStorage` transport、fixture linkage、YouTube API integration、OAuth、API key、scraping、実データ取得、deploy、Codex for OSS 申請を実装または承認するものではありません。

関連:

- [CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md](CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md)
- [CANDIDATE_A_MANUAL_TOAST_SCOPE_DECISION.md](CANDIDATE_A_MANUAL_TOAST_SCOPE_DECISION.md)
- [CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md](CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md)
- [CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_FIRST_TRANSPORT_DECISION.md](CANDIDATE_A_FIRST_TRANSPORT_DECISION.md)
- [CANDIDATE_A_INTERNAL_DISPATCH_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_INTERNAL_DISPATCH_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_FIXTURE_DISPATCH_SCOPE_DECISION.md](CANDIDATE_A_FIXTURE_DISPATCH_SCOPE_DECISION.md)
- [CANDIDATE_A_URL_CONTRACT_DRAFT.md](CANDIDATE_A_URL_CONTRACT_DRAFT.md)
- [CANDIDATE_A_SECURITY_AND_QA_PLAN.md](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- [YOUTUBE_DATA_POLICY_BOUNDARY.md](YOUTUBE_DATA_POLICY_BOUNDARY.md)

## Purpose

PR #62 で `/overlay/keyword-reaction/?demo=1` の fixed synthetic event は same-window internal dispatch helper 経由で overlay runtime へ渡るようになった。

次に決めることは、editor 側の manual input をどの範囲で internal dispatch 経路へ寄せるかです。

この文書の目的:

- editor preview 内の manual input event path と、OBS Browser Source で開く overlay本体への transport を分ける。
- 次の実装PRを editor preview 内の小変更に限定する。
- manual input text を generated URL へ含めない方針を維持する。
- raw manual input、transport payload、queue state、secret-like values を debug/status/URL へ出さない。
- `postMessage` / `BroadcastChannel` / `localStorage` transport をまだ採用しない。
- fixture linkage と YouTube integration を後続へ残す。

## Decision

次PR候補は **editor preview 内の manual input event path を same-window internal dispatch helper へ寄せる小実装** に限定する。

採用する範囲:

- 既存の manual toast preview のUI、見た目、操作フローを基本維持する。
- editor preview 内の manual input text を local intake payload として扱う。
- manual input event は local intake helper で normalized event へ寄せる。
- same-window internal dispatch helper の detail には normalized event だけを渡す。
- dispatch後は既存 preview toast 表示経路へつなぐ。
- manual input text は表示に使ってよいが、generated URL には入れない。
- DOM表示は `textContent` など safe DOM API のみを使う。

採用しない範囲:

- overlay本体 `/overlay/keyword-reaction/` への manual input transport。
- OBS Browser Source へ manual input を送る仕組み。
- `postMessage`。
- `BroadcastChannel`。
- `localStorage` transport。
- external network transport。
- fixture linkage。
- manual input queue runtime の複数source拡張。
- ticker / badge。
- paste JSON import。
- YouTube API / OAuth / API key / scraping / real data。

## Editor Preview vs Overlay Transport

editor preview 内の manual input dispatch は、同じ document 内の preview helper 整理です。transportではありません。

区別する理由:

- editor preview は同一ページ内で完結するため、origin / source / channel lifetime の問題を持ち込まない。
- OBS Browser Source で開く overlay本体は別contextになり得るため、manual input を届けるには別途 transport design が必要になる。
- transport を急ぐと、raw manual input text や private text を URL、storage、message payload に混ぜるリスクが増える。
- 先に preview内の normalized event path を固定すると、後続の transport PR でも受け取るshapeを狭くできる。

今回の判断:

- editor preview 内の internal dispatch path は次実装候補。
- overlay本体への manual input transport は後続。

## Intended Next Implementation Flow

次PRの想定flow:

```text
editor manual input text
  -> local intake helper
  -> normalized manual event
  -> same-window internal dispatch helper
  -> preview listener receives normalized event
  -> existing manual toast preview display
```

維持すること:

- preview 判定と generated URL config は同じ normalized config を source of truth にする。
- manual input text は generated URL へ含めない。
- unsupported / secret-like manual input は safe fallback または safe no-display とし、raw value を status、console、URLへ出さない。
- repeated trigger / reset / fixture playback 後も古いtimerやlistenerが残らないようにする。

## Local Intake And Queue Relationship

manual input text は raw form state のまま dispatch しない。

次PRで使う候補:

- `sourceType: "manual"`。
- `displayText`: editor preview で表示する public-safe normalized text。
- `keyword`: normalized config 由来の public-safe keyword。
- `displayPattern: "toast"`。
- `reactionStyle` / `intensity`: normalized config 由来の public-safe values。
- bounded `durationMs`。

detail / queue / preview へ残さないもの:

- raw form state。
- unknown fields。
- transport payload。
- queue state。
- raw JSON。
- fixture event data。
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

- manual input text。
- manual input event payload。
- internal dispatch payload。
- normalized event payload。
- queue state。
- queue length / current index。
- event `eventId`。
- event `displayText`。
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

## Rendering Boundary

manual input text は untrusted text として扱う。

必須方針:

- 表示は `textContent` など safe DOM API に限定する。
- HTML-like text は inert text として扱う。
- `innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler は使わない。
- CSS class、dataset、style値は enum / bounded number / normalized value だけにする。
- debug/status に raw manual input text、raw `c`、keyword実値、fixture event data、queue state、transport payload、secret-like values を出さない。

## QA Requirements For The Next PR

次実装PRでは少なくとも次を確認する。

- manual input event が editor preview 内で same-window internal dispatch helper 経由になる。
- listener が受け取る detail は normalized event のみ。
- existing manual toast preview の見た目と表示/非表示挙動が維持される。
- manual input text は generated URL へ含まれない。
- raw manual input text、event payload、queue state、transport payload は debug/status/URL へ出ない。
- HTML-like manual input text は inert text として表示される。
- `innerHTML` / unsafe sink がない。
- `postMessage` / `BroadcastChannel` / `localStorage` transport がない。
- overlay本体 `/overlay/keyword-reaction/` への manual input transport がない。
- fixture linkage がない。
- no external network。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- `/clock/` と `/clock/?c=...` に回帰がない。
- `/overlay/keyword-reaction/` の idle / debug / demo 境界に回帰がない。

## Non-Goals

- editor UIの新規設計。
- overlay本体への manual input transport。
- manual input event source を OBS Browser Source へ送る仕組み。
- `postMessage` 実装。
- `BroadcastChannel` 実装。
- `localStorage` transport。
- external network transport。
- fixture linkage。
- built-in fixture を overlay本体へ流す実装。
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

- 次PR候補が editor preview 内の manual input event path を same-window internal dispatch helper へ寄せる小実装に限定されている。
- overlay本体への manual input transport は後続扱いである。
- same-window internal dispatch は transportではないと明記されている。
- manual input text は generated URL へ入れない。
- internal dispatch detail は normalized event のみ。
- raw manual input text、event payload、transport payload、queue state、secret-like values を debug/status/URLへ出さない。
- text-not-HTML 方針が明確である。
- `postMessage` / `BroadcastChannel` / `localStorage` transport は後続扱い。
- fixture linkage は後続扱い。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- validation が通る。

## Post-PR #64 Fixture Preview Handoff

PR #64 で editor preview 内の manual input event path は same-window internal dispatch helper 経由へ寄った。

次段階は [CANDIDATE_A_FIXTURE_DISPATCH_SCOPE_DECISION.md](CANDIDATE_A_FIXTURE_DISPATCH_SCOPE_DECISION.md) に分ける。次の実装PR候補は、editor preview 内の built-in fixture playback event path を同じ internal dispatch helper へ寄せる小変更に限定する。

この handoff でも same-window internal dispatch は transport ではありません。fixture event data、manual input text、internal dispatch payload、event payload、queue state、transport payload は generated URL へ含めず、overlay本体transport、`postMessage`、`BroadcastChannel`、`localStorage` transport、paste JSON import、YouTube integration は後続扱いです。

## Follow-Up Split

後続PRへ分けるもの:

1. manual input dispatch scope decision。この文書。
2. editor preview manual input event path through same-window internal dispatch helper。
3. built-in fixture dispatch scope decision。
4. editor preview built-in fixture playback event path through same-window internal dispatch helper。
5. fixture linkage scope decision。
6. same-origin `postMessage` design / prototype only after origin/source QA is fixed。
7. `BroadcastChannel` design / prototype only after channel lifecycle QA is fixed。
8. overlay本体 manual input transport design after transport boundary review。
9. toast queue runtime for multiple public-safe sources。
10. ticker / badge runtime。
11. paste JSON import design and validation。
12. import/export UI。
13. YouTube integration design after official docs review, data boundary review, and human approval。

## Open Questions

- editor preview の internal dispatch target を既存 preview state に閉じるか、test injection だけ許すか。
- manual input dispatch 後の preview toast timer cleanup を既存timerへ寄せるか、internal event subscription cleanup と分けるか。
- manual input preview event の `eventId` を固定的に生成するか、初期は render modelから落とすか。
- overlay本体への manual input transport を検討する前に、fixture linkage scope を先に固定するか。
- `postMessage` と `BroadcastChannel` のどちらを先に設計レビューするか。
