# Candidate A BroadcastChannel Feasibility

## Status

この文書は Candidate A: keyword reaction overlay の overlay本体fixture transport を実装する前に、`BroadcastChannel` を最初の transport 候補にできるかを整理する docs / static QA 記録です。

これは implementation planning evidence です。`BroadcastChannel`、`postMessage`、`localStorage` transport、overlay本体fixture transport、paste JSON import、YouTube API integration、OAuth、API key、scraping、実データ取得、deploy、Codex for OSS 申請を実装または承認するものではありません。

関連:

- [CANDIDATE_A_OVERLAY_FIXTURE_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_FIXTURE_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_OBS_BROADCASTCHANNEL_QA_SCOPE.md](CANDIDATE_A_OBS_BROADCASTCHANNEL_QA_SCOPE.md)
- [CANDIDATE_A_OBS_BROADCASTCHANNEL_HUMAN_QA_PACKET.md](CANDIDATE_A_OBS_BROADCASTCHANNEL_HUMAN_QA_PACKET.md)
- [CANDIDATE_A_OBS_BROADCASTCHANNEL_HUMAN_QA_RESULT.md](CANDIDATE_A_OBS_BROADCASTCHANNEL_HUMAN_QA_RESULT.md)
- [CANDIDATE_A_LIMITED_BROADCASTCHANNEL_PROTOTYPE_SCOPE_DECISION.md](CANDIDATE_A_LIMITED_BROADCASTCHANNEL_PROTOTYPE_SCOPE_DECISION.md)
- [CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_FIXTURE_DISPATCH_SCOPE_DECISION.md](CANDIDATE_A_FIXTURE_DISPATCH_SCOPE_DECISION.md)
- [CANDIDATE_A_FIXTURE_PLAYBACK_SCOPE_DECISION.md](CANDIDATE_A_FIXTURE_PLAYBACK_SCOPE_DECISION.md)
- [CANDIDATE_A_FIRST_TRANSPORT_DECISION.md](CANDIDATE_A_FIRST_TRANSPORT_DECISION.md)
- [CANDIDATE_A_SECURITY_AND_QA_PLAN.md](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- [CANDIDATE_A_URL_CONTRACT_DRAFT.md](CANDIDATE_A_URL_CONTRACT_DRAFT.md)
- [YOUTUBE_DATA_POLICY_BOUNDARY.md](YOUTUBE_DATA_POLICY_BOUNDARY.md)

## Sources Checked

確認日: 2026-06-06。

- WHATWG HTML Standard, "Broadcasting to other browsing contexts": <https://html.spec.whatwg.org/multipage/web-messaging.html#broadcasting-to-other-browsing-contexts>
- MDN `BroadcastChannel` reference: <https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel>
- OBS Browser Source knowledge base: <https://obsproject.com/kb/browser-source>

確認できたこと:

- WHATWG HTML Standard は `BroadcastChannel` interface、`postMessage(message)`、`close()`、`message` / `messageerror` event、structured serialization、eligible destination、closed flag、channel name matching を定義している。
- WHATWG HTML Standard は送信元自身を destination から除外し、destination 側へ task として message event を配送する流れを定義している。
- WHATWG HTML Standard は listener を持つ未closeの `BroadcastChannel` object が残り得るため、不要になったら明示的に `close()` することを推奨している。
- MDN は `BroadcastChannel` を same-origin の browsing contexts 間 communication API として説明し、`close()` と `messageerror` を含む API surface を案内している。
- OBS Browser Source KB は Browser Source が Chrome Embedded Framework ベースであることを記録している。

未確認:

- このrepoの対象 production OBS Browser Source 環境で `BroadcastChannel` が実際に有効か。
- OBS Browser Source と通常ブラウザの間で同じ origin / storage key として channel が共有されるか。
- OBS Browser Source の "Shutdown source when not visible" や "Refresh browser source when scene becomes active" 相当設定で channel lifetime がどう変わるか。
- 複数scene / 複数Browser Source / 複数通常ブラウザtabでの配送順と stale event suppression。

## Feasibility Judgment

判断: **`BroadcastChannel` は overlay本体fixture transport の有力候補で、OBS Browser Source human QA はPASSしたが、まだruntime transportは実装しない**。

理由:

- API自体は same-origin contexts 間通信に合う。
- overlay本体は OBS Browser Source と通常ブラウザ editor が別contextになるため、same-window internal dispatch では届かない。
- `BroadcastChannel` は window relationship を必要としない点で `postMessage` より初期候補にしやすい。
- ただし、OBS Browser Source固有の lifetime、storage key、reload、visibility/shutdown 挙動は未確認。
- channel名とpayload設計を誤ると、fixture event data、secret-like値、raw transport payload が URL / debug / console / storage 相当に漏れるリスクがある。

このため、いきなり overlay本体fixture transport 実装PRへは進まない。次PR候補は limited BroadcastChannel prototype scope decision / limited prototype に限定する。

人間OBS QAで public-safe に確認済み:

- OBS 32.1.2 / Windows / local server。
- availability PASS。
- single receiver、sender remove / restore、receiver recreate、two receiver same-channel、different-channel isolation、scene switch がPASS。
- duplicate delivery なし。
- stale listener なし。
- secret / token / OAuth / API key / real data 未使用。

`BroadcastChannel` runtime prototype は、[CANDIDATE_A_LIMITED_BROADCASTCHANNEL_PROTOTYPE_SCOPE_DECISION.md](CANDIDATE_A_LIMITED_BROADCASTCHANNEL_PROTOTYPE_SCOPE_DECISION.md) の範囲で判断する。PASSは即実装承認ではなく、prototype scope decision への入力に留める。

## Candidate Position

`BroadcastChannel` が担う可能性があるもの:

- editor page から overlay page へ public-safe fixture event candidate を送る same-origin transport。
- overlay page が channel message を受け、local intake / queue helper boundary へ渡す前段。
- built-in artificial fixture only の manual QA path。

`BroadcastChannel` が担わないもの:

- generated URL config。
- raw fixture JSON import。
- `localStorage` persistence。
- external network relay。
- YouTube Live integration。
- real viewer / comment data ingestion。

## Same-Origin And Channel Boundary

前提:

- channel は same-origin contexts のみに限定する。
- channel name は固定の public-safe product namespace から作る。
- channel name に user input、keyword実値、fixture id、event id、manual input text、secret-like value を混ぜない。
- sender / receiver ともに expected message type と schemaVersion を検証する。
- invalid message は safe reject し、raw payload を表示・console出力・URL化しない。

初期channel名候補:

```text
obs-clock-overlay-builder:keyword-reaction:fixture:v1
```

この候補はまだ実装しない。採用前に collision、multi-overlay routing、複数tab挙動をQAする。

## Payload Boundary

送ってよい候補:

- message type。
- schemaVersion。
- overlayType。
- normalized event、または local intake input candidate。
- `sourceType: "fixture"`。
- public-safe `eventId`。
- public-safe `displayText`。
- bounded `reactionStyle`。
- bounded `intensity`。
- bounded `durationMs` / `offsetMs`。

送ってはいけないもの:

- raw fixture JSON。
- pasted fixture JSON。
- unknown fixture fields。
- raw `BroadcastChannel` message blob。
- queue state。
- generated URL。
- raw `c` parameter。
- keyword実値をdebug routingへ使う値。
- manual input text。
- API key / OAuth token / access token / refresh token / client secret / private key。
- real viewer identifier。
- raw YouTube comment / live chat content。
- private account data。
- billing / payment info。
- secret-like values。

payload は transport layer で広げず、既存 local intake helper / queue helper の境界へ寄せる。

## URL Boundary

generated URL は config-only を維持する。

URLへ入れないもの:

- `BroadcastChannel` channel name variations based on user input。
- `BroadcastChannel` payload。
- fixture event data。
- event payload。
- local intake payload。
- queue state。
- transport payload。
- raw fixture JSON。
- pasted fixture JSON。
- `displayText` arrays。
- API key / OAuth token / secret-like values。
- real viewer / raw comment data。

URLは OBS Browser Source 再現用 config の source of truth であり、event transport ではない。

## Lifetime And Cleanup

実装前に固定するQA:

- receiver mount時に channel を open する。
- receiver unmount / reload / idle cleanup 時に `close()` する。
- sender側も use-after-close を safe no-op / safe error にする。
- stale event を replay しない。
- reload直後に古い fixture event を表示しない。
- 複数overlayが同じchannelを聞く場合の動作を明示する。
- repeated subscribe / unsubscribe で duplicate delivery が起きない。
- `messageerror` を public-safe status または internal rejection として扱い、raw payload を出さない。

`setInterval`、unbounded polling、watch-like loop は使わない。

## OBS Browser Source QA Required

実装前または prototype PR で確認すること:

- OBS Browser Source で `BroadcastChannel` constructor が使えるか。
- 通常ブラウザ editor と OBS Browser Source overlay が同じ origin として channel を共有できるか。
- overlay page reload 後に stale event が表示されないか。
- scene切替 / source非表示 / refresh browser source で cleanup 前提が破綻しないか。
- 複数Browser Sourceで同じchannelを使った場合の配送先。
- 390px / 768px / 1280px 相当の overlay view で unexpected horizontal scroll がないか。
- console error/warn がないか。
- app由来の external network がないか。

このdocs PRでは OBS Browser Source実機確認は行わない。

## postMessage Difference

`postMessage` は window / iframe / opener / parent relationship を前提に設計しやすい。一方、OBS Browser Source単体は通常 editor の child window / iframe ではない可能性がある。

`postMessage` 採用前に必要な追加境界:

- `event.origin`。
- `event.source`。
- target window relationship。
- sender lifecycle。
- listener cleanup。

現段階では、window relationship不要な `BroadcastChannel` を先に feasibility整理する。ただし `postMessage` も未実装の後続候補に留める。

## localStorage Transport Difference

`localStorage` transport は初期採用しない。

理由:

- editor convenience storage と overlay event transport が混ざりやすい。
- OBS Browser Sourceとの共有やpersist timingが分かりにくい。
- raw fixture data / secret-like values が永続化されやすい。
- cleanup、reload、stale event suppression の説明が難しい。
- generated URL config-only契約を弱めやすい。

既存editorの `localStorage` convenience と、overlay本体fixture transport は別物として扱う。

## Static QA Added

このPRでは static QA として、keyword reaction runtime / helper module に `BroadcastChannel`、`postMessage`、`localStorage` transport、external network transport が未実装であることを tests で固定する。

対象は overlay runtime と keyword reaction helper modules であり、editor convenience 用の既存 `localStorage` とは分ける。

## Non-Goals

- `BroadcastChannel` 実装。
- `postMessage` 実装。
- `localStorage` transport。
- overlay本体fixture transport。
- paste JSON import。
- external network transport。
- event source runtime。
- toast queue複数source対応。
- ticker / badge runtime。
- YouTube API integration。
- OAuth login。
- API key creation or storage。
- scraping。
- 実視聴者データ。
- 実コメントデータ。
- deploy。
- Codex for OSS application submission。

## Done Criteria

- BroadcastChannel feasibility を公式/一次情報とrepo境界に基づいて整理している。
- OBS Browser Source固有の未確認点を未確認として明記している。
- `BroadcastChannel` を実装済みまたは採用済みと書いていない。
- overlay本体fixture transport を実装済みと書いていない。
- generated URL config-only 方針を維持している。
- fixture event data / event payload / queue state / transport payload を URLへ入れない方針を維持している。
- raw fixture data / secret-like values を debug/status/DOM/consoleへ出さない方針を維持している。
- text-not-HTML 方針を維持している。
- static QA が transport primitive 未実装を確認している。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- validation が通る。

## Follow-Up Split

後続PRへ分けるもの:

1. BroadcastChannel feasibility docs/static QA。この文書。
2. OBS BroadcastChannel QA scope docs。
3. OBS BroadcastChannel human QA packet。
4. OBS BroadcastChannel human QA result docs。
5. limited BroadcastChannel prototype scope decision。
6. BroadcastChannel limited prototype only after scope decision is fixed。
7. postMessage design only after window relationship / origin / source QA is fixed。
8. overlay本体fixture transport implementation only after prototype result, transport candidate, and QA are fixed。
9. paste JSON import design and validation。
10. toast queue runtime for multiple public-safe sources。
11. ticker / badge runtime。
12. YouTube integration design after official docs review, data boundary review, and human approval。

## Open Questions

- `BroadcastChannel` channel name に public-safe routing key が必要か。
- 複数overlayを同時に開いた場合、全overlayへ同じfixture eventを表示してよいか。
- fixture payload は normalized event と local intake input candidate のどちらで transport boundary に渡すか。
- limited prototype の payload を normalized event と local intake input candidate のどちらに寄せるか。
- production URL上での追加QAを limited prototype 前後のどちらに置くか。
- `BroadcastChannel` prototype が失敗した場合に postMessage feasibility を並行比較するか。
