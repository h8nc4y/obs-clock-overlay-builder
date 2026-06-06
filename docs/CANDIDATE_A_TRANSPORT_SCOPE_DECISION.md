# Candidate A Transport Scope Decision

## Status

この文書は Candidate A: keyword reaction overlay の transport scope を固定する docs-only 記録です。

これは implementation planning evidence です。transport、event source、fixture linkage、overlay runtime 追加実装、postMessage、BroadcastChannel、localStorage transport、external network transport、YouTube API integration、OAuth、API key、scraping、実データ取得、deploy、Codex for OSS 申請を実装または承認するものではありません。

関連:

- [CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md](CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md)
- [CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md](CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md)
- [CANDIDATE_A_QUEUE_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_QUEUE_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_OVERLAY_QUEUE_CONNECTION_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_QUEUE_CONNECTION_SCOPE_DECISION.md)
- [CANDIDATE_A_LOCAL_INTAKE_QUEUE_CONNECTION_SCOPE_DECISION.md](CANDIDATE_A_LOCAL_INTAKE_QUEUE_CONNECTION_SCOPE_DECISION.md)
- [CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_FIRST_TRANSPORT_DECISION.md](CANDIDATE_A_FIRST_TRANSPORT_DECISION.md)
- [CANDIDATE_A_INTERNAL_DISPATCH_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_INTERNAL_DISPATCH_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_MANUAL_INPUT_DISPATCH_SCOPE_DECISION.md](CANDIDATE_A_MANUAL_INPUT_DISPATCH_SCOPE_DECISION.md)
- [CANDIDATE_A_FIXTURE_DISPATCH_SCOPE_DECISION.md](CANDIDATE_A_FIXTURE_DISPATCH_SCOPE_DECISION.md)
- [CANDIDATE_A_OVERLAY_FIXTURE_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_FIXTURE_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_BROADCASTCHANNEL_FEASIBILITY.md](CANDIDATE_A_BROADCASTCHANNEL_FEASIBILITY.md)
- [CANDIDATE_A_URL_CONTRACT_DRAFT.md](CANDIDATE_A_URL_CONTRACT_DRAFT.md)
- [CANDIDATE_A_SECURITY_AND_QA_PLAN.md](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- [YOUTUBE_DATA_POLICY_BOUNDARY.md](YOUTUBE_DATA_POLICY_BOUNDARY.md)

## Purpose

PR #48 で normalized event shape helper、PR #50 で queue helper、PR #52 で `demo=1` fixed synthetic event の overlay runtime queue connection が入った。

次に決めるべきことは、manual input、fixture、future integration などの event を overlay へどう届けるかです。ただし、transport を急いで実装すると URL契約、origin確認、lifecycle cleanup、実データ境界が曖昧になりやすい。

この文書の目的:

- overlay へ event を渡す transport 候補を比較する。
- 初回transport実装前に安全境界を固定する。
- queue helper、event shape helper、overlay runtime queue connection の次に何を作るべきかを整理する。
- generated URL へ event payload、queue state、transport payload を入れない方針を維持する。
- `localStorage` transport を安易に採用しない。
- external network transport を採用しない。
- YouTube API / OAuth / API key / scraping / real data は別boundary reviewと人間承認まで扱わない。

## Transport Candidates

| Candidate | Possible use | Current decision |
|---|---|---|
| Same-window internal dispatch | editor preview内で、同一documentのcontrolとpreviewを結ぶ | overlay本体へのtransportではない。preview向けの内部経路としては候補だが、別window/OBS Browser Source への送信には使わない。 |
| Same-origin `postMessage` | 将来、別window / iframe / previewからoverlayへeventを送る | origin / source確認、payload shape、cleanupが必要。初回では実装しない。 |
| `BroadcastChannel` | same-originタブ間でeventを流す | OBS Browser Sourceと通常ブラウザで挙動差の可能性がある。channel名、origin、lifetime、cleanup設計が必要。初回では実装しない。 |
| URL config | OBS再現用に設定だけを渡す | 現在のgenerated URL config-only契約を維持する。event transportには使わない。 |
| `localStorage` | editor draftや同一origin状態共有に見える | 初期transportとして非推奨。OBSと通常ブラウザ間の状態共有が不透明で、secret/実データ保持リスクがある。 |
| External network | remote service / backend / websocket等でeventを渡す | 現段階では禁止。外部送信、保存、認証、費用、data boundaryの別reviewが必要。 |
| Future YouTube integration | 実YouTube eventを扱う将来候補 | transportではなく別フェーズ。official documentation review、人間承認、credential/data handling設計後に検討する。 |

## Same-Window Internal Dispatch

same-window internal dispatch は、同じ document 内の editor controls と preview surface をつなぐ内部イベント経路です。

扱ってよい可能性があるもの:

- editor preview 内の manual input。
- editor preview 内の artificial fixture playback。
- normalized event shape へ寄せた public-safe event。

扱わないもの:

- OBS Browser Source の overlay本体へのtransport。
- 別window / iframe / tab への送信。
- YouTube real data。
- raw manual input text や raw fixture JSON の直接転送。

この候補は「overlay本体transport」ではありません。次の実装候補にする場合も、まず local event intake boundary を作り、normalized event だけを受ける設計にする。

## Same-Origin postMessage

same-origin `postMessage` は、将来 editor preview window や iframe から overlayへeventを送る候補です。

必要な境界:

- `event.origin` の確認。
- `event.source` の確認。
- message type / schemaVersion / overlayType の確認。
- normalized event shape への normalize。
- invalid event の safe reject / fallback。
- raw value を status、DOM、console、URLへ出さない。
- listener setup / cleanup の明確化。

初回では実装しない。`postMessage` を使うPRは、origin/source validationとcleanupを tests / manual QA の対象にする。

## BroadcastChannel

`BroadcastChannel` は same-originタブ間transport候補です。

慎重に扱う理由:

- OBS Browser Source と通常ブラウザで挙動差が出る可能性がある。
- channel名の衝突を避ける必要がある。
- 複数tab / 複数overlay / reload時のlifetimeが複雑になりやすい。
- listener cleanup と stale channel の扱いが必要。
- event payload を広げると secret-like values やraw data保持リスクが増える。

初回では実装しない。採用する場合は、channel名、origin、lifetime、cleanup、payload最小化を別PRで固定する。

## Post-PR #58 First Transport Decision Handoff

PR #58 で `demo=1` fixed synthetic event は local intake helper -> queue helper -> overlay runtime表示へ通った。

次段階は [CANDIDATE_A_FIRST_TRANSPORT_DECISION.md](CANDIDATE_A_FIRST_TRANSPORT_DECISION.md) で扱う。判断は、まだ `postMessage` / `BroadcastChannel` / `localStorage` transport 実装へ進まず、次PR候補を same-window internal dispatch helper + tests に限定することです。

この判断は transport実装の承認ではありません。manual / fixture runtime connection、fixture linkage、external network、YouTube integration は引き続き後続に分ける。

## Post-PR #60 Internal Dispatch Overlay Runtime Handoff

PR #60 で same-window internal dispatch helper + tests は実装済みです。

次段階は [CANDIDATE_A_INTERNAL_DISPATCH_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_INTERNAL_DISPATCH_OVERLAY_RUNTIME_SCOPE_DECISION.md) で扱う。次の実装PR候補は transport ではなく、overlay runtime 内で `demo=1` fixed synthetic event を same-window internal dispatch helper 経由に寄せる小変更です。

この handoff でも、`postMessage`、`BroadcastChannel`、`localStorage` transport、editor UI connection、manual input runtime connection、fixture linkage、external network、YouTube integration は後続扱いです。

## Post-PR #62 Manual Input Dispatch Handoff

PR #62 で overlay runtime の `demo=1` fixed synthetic event は same-window internal dispatch helper 経由になった。

次段階は [CANDIDATE_A_MANUAL_INPUT_DISPATCH_SCOPE_DECISION.md](CANDIDATE_A_MANUAL_INPUT_DISPATCH_SCOPE_DECISION.md) で扱う。次の候補は transport ではなく、editor preview 内の manual input event path を same-window internal dispatch helper へ寄せる小変更です。

manual input text は local intake payload として扱い、generated URL へ入れない。overlay本体への manual input transport、`postMessage`、`BroadcastChannel`、`localStorage` transport、fixture linkage、external network、YouTube integration は後続扱いです。

## Post-PR #68 Overlay Fixture Transport Handoff

PR #66 で editor preview built-in fixture playback path は same-window internal dispatch helper 経由へ寄り、PR #68 で fixture linkage readiness helper + tests は実装済みです。

次段階は [CANDIDATE_A_OVERLAY_FIXTURE_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_FIXTURE_TRANSPORT_SCOPE_DECISION.md) に分ける。fixture event を overlay本体へ届ける transport はまだ実装しない。

fixture-specific transport decision でも次を維持する。

- same-window internal dispatch は別page transportではない。
- URL config を fixture event payload transport に使わない。
- `BroadcastChannel` / `postMessage` は origin / source / channel lifetime / cleanup QA 固定後の後続候補。
- `localStorage` transport は初期非推奨。
- external network transport は禁止。
- paste JSON import と YouTube integration は後続。

## Post-PR #69 BroadcastChannel Feasibility Handoff

PR #69 で overlay本体fixture transport scope decision は merge 済みです。

次段階は [CANDIDATE_A_BROADCASTCHANNEL_FEASIBILITY.md](CANDIDATE_A_BROADCASTCHANNEL_FEASIBILITY.md) で扱う。`BroadcastChannel` は same-origin contexts 間 transport 候補だが、この段階では実装しない。

feasibilityでは次を固定する。

- WHATWG HTML Standard / MDN / OBS Browser Source KB で確認できた情報と未確認事項を分ける。
- OBS Browser Source固有の `BroadcastChannel` support / lifetime / storage key / reload behavior は未確認として扱う。
- runtime / helper modules に `BroadcastChannel` / `postMessage` / `localStorage` transport が混入していないことを static QA で確認する。
- generated URL は config-only のまま、fixture event data、event payload、queue state、transport payload を入れない。

## URL Config

URLは設定再現のsource of truthです。transportではありません。

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

- transport payload。
- event payload。
- queue state。
- queue length / current index。
- event `displayText`。
- `displayText` arrays。
- raw manual input text。
- raw fixture JSON。
- fixture event data。
- API key / OAuth token / access token / refresh token / client secret。
- private key。
- real viewer identifier。
- raw YouTube comment / live chat content。
- private account data。
- billing / payment info。
- secret-like values。

invalid `c` は safe default へ fallback し、raw valueを画面、status、consoleへ出さない。

## localStorage

`localStorage` transport は初期方針では非推奨です。

理由:

- OBS Browser Source と通常ブラウザで状態共有が分かりにくい。
- editor draft convenience と overlay playback dependency が混ざりやすい。
- secret-like values、manual input text、fixture event data、private data を保持してしまうリスクがある。
- clear / reset / reload / multi-tab behavior を説明しにくい。
- generated URL source-of-truth契約を弱める。

editor convenienceとしての `localStorage` と、overlay event transportとしての `localStorage` は分けて考える。overlay本体の transport としては採用しないか、別boundary reviewで慎重に扱う。

## External Network

external network transport は現段階では禁止です。

禁止するもの:

- backend relay。
- websocket / SSE / polling。
- remote storage。
- third-party service。
- YouTube API calls。
- scraping。
- real viewer/comment dataの外部送信。

将来必要になる場合は、費用、認証、secret管理、data retention、privacy、policy review、人間承認を別PR/別docsで扱う。

## Future YouTube Integration

future YouTube integration は transport候補ではなく、別フェーズのintegration boundaryです。

この段階では扱わないもの:

- YouTube API実行。
- OAuth login。
- API key作成または保存。
- access token / refresh token。
- raw live chat / comment fetching。
- scraping。
- real viewer data。
- moderation / author-centric browsing。

YouTube integration を検討する場合も、まず official documentation review、credential/data handling設計、費用確認、人間承認が必要です。この文書はYouTube API仕様や規約適合を断定しない。

## Initial Transport Policy

初回は transport実装に入らない。

PR #58 後の次の小PR候補は transport そのものではなく、same-window internal dispatch helper + tests に限定する。

理由:

- `normalizeKeywordReactionEvent` を event intake boundary で使う方針を tests で固定できる。
- transportの種類を選ぶ前に、受け取ってよいevent shapeを狭くできる。
- raw data、secret-like values、raw comment data、YouTube real dataをreject/fallbackする境界を先に確認できる。
- postMessage / BroadcastChannel の origin/channel/lifetime 問題をまだ持ち込まなくてよい。

初回 event intake は normalized event shape だけを受け付ける。raw transport payload、raw manual input text、raw fixture JSON、real YouTube data は受け付けない。

## Post-PR #54 Local Intake Status

PR #54 で local event intake helper + tests は実装済みです。

実装済みとして扱うもの:

- `manual` / `fixture` / `demo` だけを local intake `sourceType` として許可する。
- raw local input を normalized event へ寄せる。
- unsupported sourceType を safe fallback / reject する。
- unknown fields、transport payload、queue state、secret-like values を normalized event に残さない。
- helper が DOM、storage、network、transport に依存しない。

これは local intake helper の実装証跡であり、transport、`postMessage`、`BroadcastChannel`、`localStorage` transport、overlay runtime connection、queue connection、fixture linkage、YouTube integration の承認ではありません。

## Next Local Intake To Queue Decision

PR #54 の後続では、transport実装ではなく [CANDIDATE_A_LOCAL_INTAKE_QUEUE_CONNECTION_SCOPE_DECISION.md](CANDIDATE_A_LOCAL_INTAKE_QUEUE_CONNECTION_SCOPE_DECISION.md) で local intake output を queue helper へ渡す境界を固定する。

初期方針:

- raw local input は local intake helper で normalized event へ寄せてから queue helper へ渡す。
- `manual` / `fixture` / `demo` 以外の sourceType は queue へ入れない。
- queue は max 5 bounded queue と overflow policy を維持する。
- helper は DOM、timer、storage、network、transport 非依存にする。
- generated URL は config-only のまま、local intake payload、event payload、queue state、transport payload、manual input text、fixture event data を入れない。
- overlay runtime connection、transport、fixture linkage、toast queue runtime、YouTube integration は後続に分ける。

## Transport Boundary

transportで渡してよいもの:

- normalized event。
- `sourceType: "manual" | "fixture" | "demo"`。
- public-safe `eventId`。
- public-safe `displayText`。
- `displayPattern: "toast"`。
- `reactionStyle`。
- bounded `intensity`。
- bounded `durationMs` / `offsetMs`。

transportで渡してはいけないもの:

- API key。
- OAuth token。
- access token。
- refresh token。
- client secret。
- private key。
- real viewer identifier。
- raw YouTube comment / live chat content。
- private account data。
- billing / payment info。
- queue state。
- raw fixture JSON。
- raw manual input text。
- secret-like values。
- raw config value。
- raw user data。

event intakeは `normalizeKeywordReactionEvent` を通す。invalid event は safe reject / fallback し、raw valueを画面、status、console、generated URLへ出さない。

## Security / QA Policy

transportを実装するPRでは次をQA対象にする。

- origin / source / channel の確認。
- listener / channel cleanup。
- invalid event の safe reject / fallback。
- raw value を DOM、status、console、URLへ出さない。
- generated URL に transport payload、event payload、queue stateを入れない。
- `textContent` 等の safe DOM API を使う。
- no `innerHTML` / no `insertAdjacentHTML` / no `eval` / no `new Function` / no `document.write` / no inline event handler。
- no `setInterval` / no unbounded loop / no watch-like polling。
- timerを使う場合は bounded `setTimeout` と `clearTimeout` cleanup。
- no localStorage transport by default。
- no external network。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- `/clock/` と `/clock/?c=...` に回帰がない。
- `/overlay/keyword-reaction/` の idle / debug / demo 境界に回帰がない。

## Non-Goals

- transport実装。
- same-origin `postMessage` 実装。
- `BroadcastChannel` 実装。
- `localStorage` transport実装。
- external network transport実装。
- event source runtime。
- fixture linkage。
- overlay runtime追加実装。
- queue runtime拡張。
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
- external sending。
- deploy。
- Codex for OSS application submission。

## Done Criteria For This Decision

- transport候補が比較されている。
- 初回は transport実装に入らない方針が明確である。
- PR #58 後の次PR候補が same-window internal dispatch helper + tests として整理されている。
- event intakeは normalized event shape だけを受ける方針である。
- postMessage / BroadcastChannel は未実装の後続候補として扱われている。
- `localStorage` transport は初期非推奨である。
- external network transport は禁止である。
- generated URL は config-only のまま。
- transport payload、event payload、queue state、manual input text、fixture event data、raw JSON、`displayText` arrays は URLへ入れない。
- text-not-HTML 方針が維持されている。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- validation が通る。

## Follow-Up Split

後続PRへ分けるもの:

1. transport scope decision docs。この文書。
2. local event intake helper + tests。PR #54で完了。
3. local intake to queue helper + tests。PR #56で完了。
4. local intake to overlay runtime connection for `demo=1` only。PR #58で完了。
5. first transport decision, scoped by [CANDIDATE_A_FIRST_TRANSPORT_DECISION.md](CANDIDATE_A_FIRST_TRANSPORT_DECISION.md)。
6. same-window internal dispatch helper + tests。
7. internal dispatch overlay runtime connection scope decision。
8. `demo=1` fixed synthetic event through internal dispatch helper。
9. manual input dispatch scope decision。
10. editor preview manual input event path through same-window internal dispatch helper。
11. same-origin `postMessage` design and prototype only after origin/source QA is fixed。
12. `BroadcastChannel` design and prototype only after channel lifecycle QA is fixed。
13. built-in fixture linkage readiness helper + tests。PR #68で完了。
14. overlay fixture transport scope decision。
15. `BroadcastChannel` feasibility docs/static QA。
16. overlay fixture transport readiness helper + tests、または `BroadcastChannel` design scope / static QA。
17. built-in fixture linkage from safe artificial fixture to overlay runtime only after transport boundary review。
18. toast queue runtime for multiple public-safe sources。
19. ticker / badge runtime。
20. paste JSON import design and validation。
21. import/export UI。
22. YouTube integration design after boundary review and human approval。

## Open Questions

- same-window internal dispatch helper は overlay runtime module内に置くか、local intake helper moduleへ分けるか。
- `postMessage` を採用する場合の message type 名、origin allowlist、source確認の最小仕様。
- `BroadcastChannel` を採用する場合の channel名、multi-tab behavior、OBS Browser Source互換性。
- public-safe `eventId` を transport payloadに必須とするか。
- duplicate event の扱いを intake helper で見るか queue helper で見るか。
- fixture linkage の前に same-window internal dispatch を実装する必要があるか。
