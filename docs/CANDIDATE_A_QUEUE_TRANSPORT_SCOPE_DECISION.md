# Candidate A Queue Transport Scope Decision

## Status

この文書は Candidate A: keyword reaction overlay の queue / transport 境界を固定する docs-only 記録です。

これは implementation planning evidence です。PR #50 の queue helper 実装を記録しますが、transport、event source、fixture linkage、toast queue runtime、ticker、badge、YouTube API integration、OAuth、API key、scraping、実データ取得、deploy、Codex for OSS 申請を実装または承認するものではありません。

関連:

- [CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md](CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md)
- [CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md](CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md)
- [CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_OVERLAY_QUEUE_CONNECTION_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_QUEUE_CONNECTION_SCOPE_DECISION.md)
- [CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_LOCAL_INTAKE_QUEUE_CONNECTION_SCOPE_DECISION.md](CANDIDATE_A_LOCAL_INTAKE_QUEUE_CONNECTION_SCOPE_DECISION.md)
- [CANDIDATE_A_URL_CONTRACT_DRAFT.md](CANDIDATE_A_URL_CONTRACT_DRAFT.md)
- [CANDIDATE_A_SECURITY_AND_QA_PLAN.md](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- [YOUTUBE_DATA_POLICY_BOUNDARY.md](YOUTUBE_DATA_POLICY_BOUNDARY.md)

## Purpose

PR #48 で `normalizeKeywordReactionEvent` と `buildDemoKeywordReactionEvent` が入り、manual / fixture / demo を同じ normalized event shape へ寄せる土台ができた。

次に決めるべきことは、複数eventを overlay 内でどう順番表示するかと、将来eventを overlay へどう渡すかを混ぜないことです。

この文書の目的:

- queue を overlay runtime 内部の順番表示機構として扱う。
- transport を editor / manual / fixture / future integration から overlay へeventを渡す経路として扱う。
- PR #50 で入った queue helper + tests を、transport や event source とは別の pure helper として扱う。
- 次段階を overlay runtime queue connection に限定し、`demo=1` fixed synthetic event を queue helper 経由にする。
- PR #52 後の transport decision を別docsに分け、transport、fixture linkage、event source、YouTube integration を後続に分ける。
- generated URL config-only 境界と text-not-HTML 境界を維持する。

## Post-PR #50 Queue Helper Status

PR #50 で queue helper + tests は実装済みです。

実装済みとして扱うもの:

- max 5 bounded queue。
- overflow時に古い未表示eventをdropし、最新eventを残す方針。
- FIFO dequeue。
- clear helper。
- deterministic schedule helper。
- queue helper が DOM、timer id、network、localStorage に依存しないこと。
- generated URL へ queue state、event payload、`eventId`、event `displayText` を入れない tests。

これは queue helper の実装証跡であり、transport、event source、fixture linkage、overlay runtime queue connection、toast queue runtime、YouTube integration の承認ではありません。

## Why Separate Queue And Transport

queue と transport は責務が違う。

- queue は、すでに normalized event shape になったeventを overlay 内で安全に順番表示するための内部状態です。
- transport は、event を overlay へ届ける将来の入力経路です。

この2つを同じPRで扱うと、URL契約、timer cleanup、origin/source validation、fixture linkage、real integration の境界が曖昧になりやすい。

初回は queue helper + tests に絞り、eventが overlay 内部へ届いた後の処理だけを先に安定させる。

## Queue Responsibility

queue が扱う責務:

- normalized event を順番に保持する。
- 最大件数を超えないよう bounded queue にする。
- overflow時にどのeventをdropするかを決める。
- 表示順と表示時間の schedule を作る。
- repeated enqueue / replay でも順序が deterministic であることを保つ。
- unknown fields を保持しない normalized event だけを扱う。
- raw payload、manual input text、fixture raw JSON、real viewer data、secret-like value を保持しない。

queue は transport ではありません。queue helper は event の到達経路を知らず、network、postMessage、BroadcastChannel、localStorage、YouTube API を扱わない。

## Transport Responsibility

transport が将来扱う責務:

- editor preview、manual input、built-in fixture、future integration などから overlay へeventを渡す。
- eventの送信元、受信元、同一origin、lifecycleを設計する。
- replay、stop、reset、disconnect時の扱いを決める。
- origin / source boundary を明示する。

transport は今回も次PRも実装しない。future YouTube integration は、official documentation review、credential/data handling設計、人間承認の後で別途検討する。

## Completed Queue Helper Scope

PR #50 の実装PRは queue helper + tests に限定した。

入ったもの:

- `createKeywordReactionQueue`
- `enqueueKeywordReactionEvent`
- `dequeueKeywordReactionEvent`
- `applyKeywordReactionQueueLimit`
- `buildKeywordReactionQueueSchedule`
- `clearKeywordReactionQueue`

tests で確認したこと:

- normalized event だけを queue に入れる。
- unknown fields が残らない。
- max 5 件の bounded queue を守る。
- overflow時に古い未表示eventをdropし、最新eventを残す。
- schedule が deterministic である。
- duration / offset の bounds が守られる。
- helper が raw payload、manual input text、fixture event data、secret-like value を返さない。
- helper が DOM、timer id、network、localStorage に依存しない。

PR #50 で入れなかったもの:

- transport。
- event source runtime。
- overlay DOM runtime への本格queue接続。
- built-in fixture を overlay本体へ流す linkage。
- manual input text を overlay へ渡す仕組み。
- toast queue runtime。
- ticker / badge runtime。
- paste JSON import。
- import/export UI。
- YouTube API / OAuth / API key / scraping / real data。

## Next Overlay Queue Connection Scope

次の小実装PR候補は [CANDIDATE_A_OVERLAY_QUEUE_CONNECTION_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_QUEUE_CONNECTION_SCOPE_DECISION.md) に分ける。

初期方針:

- `/overlay/keyword-reaction/` runtime 内で queue helper を使う。
- `demo=1` の fixed synthetic event だけを queue に入れる。
- manual input event、fixture event、external event はまだ queue に入れない。
- transport、event source、fixture linkage は後続に分ける。
- generated URL は config-only のまま維持する。
- queue state、event payload、transport payload、manual input text、fixture event data を URL へ入れない。
- timer は bounded `setTimeout` のみとし、`setInterval` と unbounded loop は使わない。
- play / clear / unmount / re-run で `clearTimeout` cleanup を必須にする。

## Queue Limit

初回 queue helper の上限は最大 5 件を推奨する。

理由:

- OBS画面では古い反応を長く残すより、現在の反応を短く見せる方が邪魔になりにくい。
- tests と manual QA の組み合わせが小さく保てる。
- fixture playback や real integration へ広げる前に、overflow policy を明確にレビューできる。

将来、ticker や high-frequency fixture QA が必要になった場合は、別PRで 10 件などの上限を再検討する。

## Overflow Policy

初回方針:

- queue が最大件数に達している場合、古い未表示eventをdropし、最新eventを残す。
- すでに表示中のeventを途中で消すかどうかは runtime 接続PRで再確認する。
- drop が起きたことを debug/status に出す場合も、raw payload や secret-like value は出さない。
- dropped event の raw `displayText`、keyword、manual input text、fixture data を log / DOM / URL へ出さない。

この方針は、OBS向けoverlayで新しい反応の鮮度を優先するための初期判断です。

## Timer Cleanup Policy

queue helper 段階では DOM timer を実装しない。まず pure helper で schedule や next event state を作る。

後続 runtime 接続PRで timer を扱う場合:

- `setTimeout` は使用可。
- `setInterval`、unbounded loop、watch-like polling は使わない。
- timer id を必ず保持する。
- stop / reset / unmount / page lifecycle cleanup / new sequence で `clearTimeout` する。
- repeated enqueue や replay で timer が重複しないことを tests または manual QA で確認する。
- old timer が hidden overlay に古いeventを再表示しないことを確認する。

## Generated URL Config-Only Boundary

generated URL は config-only を維持する。

`c` に入れてよいもの:

- `schemaVersion`
- `overlayType`
- `displayPattern`
- `reactionStyle`
- `intensity`
- `keyword`
- `matchMode`
- public-safe visual config

`c` に入れないもの:

- queue state。
- queue length / current index。
- event payload。
- transport payload。
- `eventId`。
- event `displayText`。
- `displayText` arrays。
- manual input text。
- fixture event data。
- raw fixture JSON。
- raw user JSON。
- API key / OAuth token / client secret。
- real viewer id。
- raw comment / live chat data。
- private account data。
- secret-like values。

将来、public-safe event reference、fixture id、queue id を URL へ入れるかは未確定です。overlay runtime queue connection PRでも URL contract は広げない。

## Transport Candidates

| Candidate | Possible use | Current decision |
|---|---|---|
| Same-window internal dispatch | 同一document内で editor preview と overlay preview を結ぶ | overlay-only OBS page への transport ではない。次PRでは実装しない。 |
| Same-origin `postMessage` | 別window / iframe の overlay へeventを送る候補 | origin / source validation の設計が必要。別docsで固定するまで実装しない。 |
| `BroadcastChannel` | same-origin tabs / windows へeventを流す候補 | channel lifecycle、複数tab、compatibility、source boundary の設計が必要。次PRでは実装しない。 |
| URL config only | OBS再現性の source of truth | 現在維持する。event transport には使わない。 |
| `localStorage` transport | editor draft 共有の誘惑がある | overlay playback dependency にしない。transportとしては採用しないか、慎重に別reviewする。 |
| External network transport | remote service 経由 | 現段階では禁止。external sending、backend storage、paid/cost/data boundary が必要。 |
| Future YouTube integration | 実YouTube eventを扱う将来候補 | official docs review、人間承認、credential/data handling設計後の別フェーズ。 |

## Why No Transport Yet

transport をまだ実装しない理由:

- queue helper は source-agnostic にできる。
- transport は origin/source validation と lifecycle 設計が必要。
- fixture linkage と real integration を同時に扱うと、人工データと実データの境界が曖昧になる。
- URLへevent payloadを入れない方針を先に安定させたい。
- YouTube API / OAuth / API key / real data は別boundary reviewと人間承認が必要。

## Security / Rendering Boundary

queue helper と後続runtimeは text-not-HTML を維持する。

- `displayText` を表示する場合は `textContent` など safe DOM API を使う。
- `innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler は使わない。
- HTML-like text は inert text として扱う。
- CSS class、dataset、style値へ入れるものは enum / bounded number / normalized value に限る。
- debug/status に raw event payload、raw `c`、keyword実値、manual input text、fixture event data、secret-like value を出さない。
- queue helper は no external network / no localStorage dependency を維持する。

## Non-Goals

- queue helperの再設計。
- toast queue runtime実装。
- overlay DOM runtime へのqueue接続。
- transport実装。
- event source runtime。
- fixture linkage。
- built-in fixtureをoverlay本体へ流す実装。
- manual input textをoverlayへ渡す仕組み。
- same-origin `postMessage` 実装。
- `BroadcastChannel` 実装。
- `localStorage` transport。
- external network transport。
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

## Done Criteria For PR #50 Queue Helper

- queue helper + tests に限定されている。
- queue は max 5 件の bounded queue として扱われる。
- overflow時は古い未表示eventをdropし、最新eventを残す。
- helper は normalized event shape だけを返し、unknown fields を保持しない。
- helper は raw payload、manual input text、fixture event data、secret-like value を返さない。
- schedule helper は deterministic である。
- DOM timer runtime、transport、event source、fixture linkage は入っていない。
- generated URL は config-only のまま。
- no `innerHTML` / no unsafe sink。
- no localStorage transport / no external network。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- `/clock/` と `/clock/?c=...` に回帰がない。
- validation が通る。

## Done Criteria For The Next Overlay Queue Connection PR

- overlay runtime queue connection に限定されている。
- `demo=1` fixed synthetic event が queue helper 経由で表示される。
- queue helper の max 5 bounded queue と overflow policy を使う。
- timer cleanup が repeated `demo=1` / re-run / unmount で確認される。
- generated URL は config-only のまま。
- queue state、event payload、transport payload、manual input text、fixture event data を URL へ入れない。
- event source、fixture linkage、transport、toast queue runtime は入っていない。
- no `innerHTML` / no unsafe sink。
- no localStorage transport / no external network。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- `/clock/` と `/clock/?c=...` に回帰がない。
- `/overlay/keyword-reaction/` の idle / debug / demo 挙動に回帰がない。
- validation が通る。

## Post-PR #52 Transport Decision Handoff

PR #52 で overlay runtime queue connection は実装済みです。

実装済みとして扱うもの:

- `demo=1` fixed synthetic event を queue helper 経由で既存toast表示へ渡す。
- 通常 idle、`debug=1`、invalid `c` fallback、fixed synthetic toastの既存境界を維持する。
- queue state、event payload、transport payload、manual input text、fixture event data を URL や debug 表示へ出さない。
- repeated `demo=1` / re-run で古いtimerが残らないことを tests / manual QA で確認する。

次段階は [CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md) に分ける。transport実装、fixture linkage、event source、toast queue runtime複数source対応、YouTube integration はまだ実装しない。

## Post-PR #54 Local Intake Handoff

PR #54 で local event intake helper + tests は実装済みです。

次の実装候補は transport ではなく、[CANDIDATE_A_LOCAL_INTAKE_QUEUE_CONNECTION_SCOPE_DECISION.md](CANDIDATE_A_LOCAL_INTAKE_QUEUE_CONNECTION_SCOPE_DECISION.md) の方針に沿った local intake to queue pure helper + tests に限定する。

この後続PRで扱うもの:

- raw local input を local intake helper で normalized event へ寄せる。
- normalized event だけを queue helper へ渡す。
- `manual` / `fixture` / `demo` の sourceType 境界を維持する。
- max 5 bounded queue と overflow policy を維持する。

この後続PRで扱わないもの:

- transport。
- overlay runtime connection。
- fixture linkage。
- toast queue runtime。
- YouTube API / OAuth / API key / scraping / real data。

## Follow-Up Split

後続PRへ分けるもの:

1. queue helper + tests。PR #50で完了。
2. overlay runtime への queue 接続と timer cleanup。PR #52で完了。
3. transport scope decision。[CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md) で扱う。
4. local event intake helper + tests。PR #54で完了。
5. local intake to queue connection scope decision。[CANDIDATE_A_LOCAL_INTAKE_QUEUE_CONNECTION_SCOPE_DECISION.md](CANDIDATE_A_LOCAL_INTAKE_QUEUE_CONNECTION_SCOPE_DECISION.md) で扱う。
6. local intake to queue pure helper + tests。
7. same-origin transport prototype if approved。
8. built-in fixture linkage from safe artificial fixture to overlay runtime。
9. toast queue runtime QA。
10. ticker / badge runtime。
11. paste JSON import design and validation。
12. import/export UI。
13. YouTube integration design after boundary review and human approval。

## Open Questions

- queue最大件数を最終的に 5 件のままにするか、fixture QA 後に 10 件へ広げるか。
- duplicate event をそのまま保持するか、public-safe `eventId` で dedupe するか。
- `durationMs` は event 側、config 側、または schedule helper 側のどれを source of truth にするか。
- 表示中eventがある状態で overflow した場合、表示中eventを守るか、次回PRで明示するか。
- public-safe `fixtureId`、event reference、queue reference を URL へ入れる時期。
- 最初の transport は `postMessage`、`BroadcastChannel`、または別の local-only channel のどれを候補にするか。
- queue helper は PR #50 で別moduleになった。将来event helperへ統合する必要が出た場合は別PRで再検討する。
