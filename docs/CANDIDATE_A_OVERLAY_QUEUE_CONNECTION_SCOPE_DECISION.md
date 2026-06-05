# Candidate A Overlay Queue Connection Scope Decision

## Status

この文書は Candidate A: keyword reaction overlay の次段階である overlay runtime queue connection のスコープ固定記録です。

これは docs-only の implementation planning evidence です。overlay runtime queue接続、transport、event source、fixture linkage、toast queue runtime、ticker、badge、YouTube API integration、OAuth、API key、scraping、実データ取得、deploy、Codex for OSS 申請を実装または承認するものではありません。

関連:

- [CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md](CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md)
- [CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_SINGLE_SYNTHETIC_EVENT_SCOPE_DECISION.md](CANDIDATE_A_SINGLE_SYNTHETIC_EVENT_SCOPE_DECISION.md)
- [CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md](CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md)
- [CANDIDATE_A_QUEUE_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_QUEUE_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_URL_CONTRACT_DRAFT.md](CANDIDATE_A_URL_CONTRACT_DRAFT.md)
- [CANDIDATE_A_SECURITY_AND_QA_PLAN.md](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- [YOUTUBE_DATA_POLICY_BOUNDARY.md](YOUTUBE_DATA_POLICY_BOUNDARY.md)

## Purpose

PR #50 で keyword reaction queue helper + tests が入り、max 5 bounded queue、overflow policy、FIFO dequeue、deterministic schedule helper が pure helper として固定された。

次に決めるべきことは、`/overlay/keyword-reaction/` の runtime がこの queue helper をどの範囲で使うかです。

この文書の目的:

- 次の実装PRを overlay runtime queue connection の最小実装に限定する。
- `demo=1` の fixed synthetic event を queue helper 経由で表示する方針を固定する。
- transport、event source、fixture linkage、YouTube integration を後続に分ける。
- generated URL config-only 境界を維持する。
- text-not-HTML と timer cleanup の review blocker を明確にする。

## Next Implementation PR Scope

次の小実装PR候補は overlay runtime queue connection に限定する。

入れてよいもの:

- `/overlay/keyword-reaction/` runtime 内で queue helper を import して使う。
- `demo=1` の fixed synthetic event を queue に入れる。
- queue helper の max 5 bounded queue と overflow policy をそのまま使う。
- queue から dequeue した event を既存の synthetic toast rendering へ渡す。
- demo sequence の timer cleanup を queue 経由表示へ合わせて拡張する。
- repeated `demo=1` / re-run / unmount で古い timer が残らないようにする。
- tests / manual QA で generated URL config-only と raw値非表示を確認する。

入れないもの:

- transport。
- event source runtime。
- manual input event を overlay へ渡す仕組み。
- built-in fixture event を overlay へ流す linkage。
- external event input。
- toast queue runtime の複数source対応。
- ticker / badge runtime。
- paste JSON import。
- import/export UI。
- YouTube API / OAuth / API key / scraping / real data。

## Demo Event Queue Policy

初回 overlay queue connection で queue に入れる event は、`demo=1` の fixed synthetic event だけにする。

`demo=1` の扱い:

- public-safe display test flag のまま維持する。
- event source、fixture linkage、transport、YouTube integration として扱わない。
- synthetic event text はコード内固定の人工文言だけにする。
- manual input text、fixture event data、raw JSON、real viewer/comment data を読まない。
- generated URL の `c` へ synthetic event payload を入れない。

通常 idle は引き続き transparent / no visible text とする。`debug=1` は public-safe status 表示だけに使う。

## Queue Runtime Policy

runtime が queue helper を使う時の初期方針:

- queue の中身は normalized event のみ。
- max 5 bounded queue を維持する。
- overflow時は古い未表示eventをdropし、最新eventを残す。
- FIFO dequeue を維持する。
- schedule helper は deterministic な表示順と表示時間の確認に使う。
- duplicate event のdedupeは初回では実装しない。
- queue state、current index、dropped event details を URL、DOM、debug/status へ出さない。

初回は `demo=1` の single synthetic event が対象のため、max 5 overflow は主に helper contract と regression tests で確認する。実sourceが増える前に、runtime側も helper contract を破らないことを確認する。

## Timer Cleanup Policy

overlay runtime queue connection では bounded `setTimeout` のみを使ってよい。

必須方針:

- `setInterval` は使わない。
- unbounded loop、watch-like polling、foreground server は使わない。
- timer id を runtime state として保持する。
- play / clear / unmount / re-run / new demo sequence で `clearTimeout` する。
- repeated `demo=1` で旧timerが古いeventを再表示しない。
- debug表示やfallback表示のために raw payload を log / DOM / URL へ出さない。

timer cleanup は tests で確認する。Browser確認を追加する場合も、console errorなし、unexpected networkなしを確認する。

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
- playback schedule state。
- event payload。
- `eventId`。
- event `displayText`。
- `displayText` arrays。
- manual input text。
- fixture event data。
- raw fixture JSON。
- raw user JSON。
- transport payload。
- raw `postMessage` payload。
- `BroadcastChannel` payload。
- API key / OAuth token / client secret。
- real viewer id。
- raw comment / live chat data。
- private account data。
- secret-like values。

`demo=1` と `debug=1` は explicit query flag として扱い、`c` の中へ event data を入れる理由にしない。

## Display Policy

初回表示対象は toast のみ。

- `displayPattern: "toast"` を初回runtime表示対象とする。
- `ticker` / `badge` は URL config 語彙として残っていても runtime表示実装は後続。
- idle時は transparent / no visible text。
- `debug=1` の時だけ public-safe status。
- `demo=1` の時だけ fixed synthetic event。
- `demo=1` と `debug=1` が共存しても raw値やsecret-like値を出さない。

CSS class、dataset、style値へ入れるものは enum、bounded number、normalized value に限定する。

## Text-Not-HTML Policy

event `displayText` は HTML ではなく text として扱う。

必須方針:

- DOMへ表示する時は `textContent` など safe DOM API を使う。
- `innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler は使わない。
- HTML-like text は inert text として扱う。
- raw event payload、raw `c`、keyword実値、manual input text、fixture event data、secret-like value を debug/status に出さない。
- style attribute や CSS custom property へ untrusted text を直接流さない。

この方針は queue connection PR の review blocker とする。

## Non-Goals

- overlay runtime queue接続実装。この文書では実装しない。
- transport実装。
- event source runtime。
- fixture linkage。
- built-in fixtureをoverlay本体へ流す実装。
- manual input textをoverlayへ渡す仕組み。
- same-origin `postMessage` 実装。
- `BroadcastChannel` 実装。
- `localStorage` transport。
- external network transport。
- toast queue runtime の複数source対応。
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

## Done Criteria For The Next Implementation PR

- overlay runtime queue connection に限定されている。
- `demo=1` fixed synthetic event が queue helper 経由で表示される。
- queue は max 5 bounded queue として helper contract を使う。
- overflow policy は helper contract と tests で維持される。
- timer cleanup が repeated `demo=1` / re-run / unmount で確認される。
- 通常 idle は transparent / no visible text。
- `debug=1` は public-safe status のみ。
- generated URL は config-only のまま。
- queue state、event payload、transport payload、manual input text、fixture event data、raw JSON、`displayText` arrays を URL へ入れない。
- event source / fixture linkage / transport / toast queue runtime は入っていない。
- no `innerHTML` / no unsafe sink。
- no localStorage transport / no external network。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- `/clock/` と `/clock/?c=...` に回帰がない。
- `/overlay/keyword-reaction/` の idle / debug / demo 挙動に回帰がない。
- validation が通る。

## Follow-Up Split

後続PRへ分けるもの:

1. overlay runtime queue connection and timer cleanup。
2. transport scope decision before any cross-window channel。
3. same-origin transport prototype if approved。
4. built-in fixture linkage from safe artificial fixture to overlay runtime。
5. toast queue runtime QA for multiple safe sources。
6. ticker / badge runtime。
7. paste JSON import design and validation。
8. import/export UI。
9. YouTube integration design after boundary review and human approval。

## Open Questions

- 表示中eventがある状態で overflow した場合、表示中eventを守るか、次実装PRで明示するか。
- `demo=1` repeated run を queue reset として扱うか、enqueue として扱うか。
- duplicate event をそのまま表示するか、public-safe `eventId` で dedupe するか。
- `durationMs` は event側、config側、または schedule helper側のどれを source of truth にするか。
- public-safe `fixtureId`、event reference、queue reference を URL へ入れる時期。
- 最初の transport は `postMessage`、`BroadcastChannel`、または別の local-only channel のどれを候補にするか。
