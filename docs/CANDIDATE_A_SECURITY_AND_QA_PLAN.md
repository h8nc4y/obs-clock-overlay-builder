# Candidate A Security And QA Plan

## Status

この文書は、将来の Candidate A keyword reaction overlay 実装PRに求める security / QA expectations を整理します。

この文書は、実装、YouTube API calls、OAuth、API keys、scraping、real viewer data、deploy、external data sending を承認するものではありません。

関連するスコープ固定記録:

- [CANDIDATE_A_IMPLEMENTATION_SCOPE_DECISION.md](CANDIDATE_A_IMPLEMENTATION_SCOPE_DECISION.md)
- [CANDIDATE_A_MANUAL_TOAST_SCOPE_DECISION.md](CANDIDATE_A_MANUAL_TOAST_SCOPE_DECISION.md)
- [CANDIDATE_A_MATCHING_NORMALIZATION_DECISION.md](CANDIDATE_A_MATCHING_NORMALIZATION_DECISION.md)
- [CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_SINGLE_SYNTHETIC_EVENT_SCOPE_DECISION.md](CANDIDATE_A_SINGLE_SYNTHETIC_EVENT_SCOPE_DECISION.md)
- [CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md](CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md)
- [CANDIDATE_A_QUEUE_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_QUEUE_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_OVERLAY_QUEUE_CONNECTION_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_QUEUE_CONNECTION_SCOPE_DECISION.md)
- [CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_LOCAL_INTAKE_QUEUE_CONNECTION_SCOPE_DECISION.md](CANDIDATE_A_LOCAL_INTAKE_QUEUE_CONNECTION_SCOPE_DECISION.md)
- [CANDIDATE_A_LOCAL_INTAKE_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_LOCAL_INTAKE_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_FIRST_TRANSPORT_DECISION.md](CANDIDATE_A_FIRST_TRANSPORT_DECISION.md)
- [CANDIDATE_A_INTERNAL_DISPATCH_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_INTERNAL_DISPATCH_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_MANUAL_INPUT_DISPATCH_SCOPE_DECISION.md](CANDIDATE_A_MANUAL_INPUT_DISPATCH_SCOPE_DECISION.md)
- [CANDIDATE_A_FIXTURE_DISPATCH_SCOPE_DECISION.md](CANDIDATE_A_FIXTURE_DISPATCH_SCOPE_DECISION.md)
- [CANDIDATE_A_OVERLAY_FIXTURE_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_FIXTURE_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_BROADCASTCHANNEL_FEASIBILITY.md](CANDIDATE_A_BROADCASTCHANNEL_FEASIBILITY.md)
- [CANDIDATE_A_OBS_BROADCASTCHANNEL_QA_SCOPE.md](CANDIDATE_A_OBS_BROADCASTCHANNEL_QA_SCOPE.md)
- [CANDIDATE_A_OBS_BROADCASTCHANNEL_HUMAN_QA_PACKET.md](CANDIDATE_A_OBS_BROADCASTCHANNEL_HUMAN_QA_PACKET.md)

## Security Principles

- URL config、manual input、fixture text は untrusted として扱う。
- text は HTML ではなく text として表示する。
- untrusted values に `innerHTML` を使わない。
- invalid config は safe defaults へ normalize する。
- overlay playback は editor `localStorage` に依存しない。
- generated URLs に secrets、tokens、private account data、raw user data を入れない。
- manual input、fixture data、generated config を external services へ送信しない。
- overlay-only surface は transparent background と `body` margin 0 を守る。

## Implementation Phases

### Phase 1: Route/Static Skeleton

最初の実装PRで確認すること:

- `/overlay/keyword-reaction/` が 200 で開く。
- overlay-only transparent surface。
- `body` margin 0。
- editor controls なし。
- safe default text のみ表示。
- external network request なし。
- editor `localStorage` dependency なし。
- `innerHTML` なし。
- `/clock/` と `/clock/?c=...` の既存契約を変えない。

### Phase 2: Manual Input + Toast

skeleton 後の manual input + toast PR で確認すること:

- editor から人工テキストを入力できる。
- keyword に一致したら preview 内で toast が表示される。
- `displayPattern: "toast"` が初期 behavior。
- `reactionStyle` と `intensity` が safe enum / numeric range に収まる。
- 初回UIが生成する `intensity` は `0` / `1` / `2` / `3` の整数step。
- runtime は helper 方針どおり `0` から `3` の連続値に耐える。
- `matchMode: "contains"` / `"exact"` の最小matchingだけを扱う。
- generated URL で visual config と keyword rules が再現できる。
- preview 判定と generated URL config が同じ normalized config から作られる。
- preview 判定は normalized `keyword` と normalized `matchMode` を使う。
- manual event text は generated OBS URL に default で入れない。
- manual input text は generated URL に含めない。
- secret-like keyword が fallback される場合、入力実値を表示せず、fallback 後 keyword で判定するか fallback status を出す。
- manual input text と keyword に長さ制限がある。
- text-not-HTML samples が `textContent` などで inert text として扱われる。
- untrusted values に `innerHTML` を使わない。
- 390px / 768px / 1280px で editor preview と controls が破綻しない。
- `/overlay/keyword-reaction/` の overlay-only surface が壊れない。
- `/clock/` と `/clock/?c=...` の既存契約を変えない。
- console に関連errorがない。
- external network request がない。
- no YouTube API / no OAuth / no API key / no real data。

この phase は editor preview 中心のbehavior確認であり、overlay runtime の本格イベント表示、fixture playback、ticker / badge runtime、YouTube integration を実装済みにしない。

### Config Helper Tests

manual input + toast の前段として、`assets/js/keyword-reaction-config.js` で config encode/decode helper を追加する。

tests で確認すること:

- default config が安定している。
- unsupported `schemaVersion`、`overlayType`、enum values が safe default へ fallback する。
- `displayPattern`、`reactionStyle`、`matchMode` が決めた語彙へ normalize される。
- `intensity` が safe range に clamp される。
- `keyword` が trim / length limit され、secret-like value は default に戻る。
- preview 判定に使う keyword と generated URL に入る keyword が同じ normalized value になる。
- encode / decode round trip が安定している。
- invalid `c` parameter は safe default へ fallback する。
- unknown fields、secret-like fields、raw user data indicators は normalized config に保持しない。

この helper は URL config の土台であり、manual input UI、toast trigger、keyword matching runtime、fixture playback、YouTube integration を実装したものではない。

### Phase 3: Fixture Playback

fixture playback + schema validation のスコープ固定は [CANDIDATE_A_FIXTURE_PLAYBACK_SCOPE_DECISION.md](CANDIDATE_A_FIXTURE_PLAYBACK_SCOPE_DECISION.md) に分ける。

fixture playback PR で確認すること:

- fixture は人工データのみ。
- `schemaVersion`、`fixtureId`、`events`、`offsetMs`、`displayText`、`keyword`、`reactionStyle`、`intensity` の validation がある。
- fixture event order が deterministic。
- overly long `displayText` と `keyword` が安全に制限される。
- unsupported enum values が reject または safe fallback になる。
- fixture payload を generated URL に default で入れない。
- real YouTube data への拡張として扱わない。
- 初回は editor preview 内の built-in artificial fixture を優先し、paste JSON input と overlay runtime 本格化は後続へ分けてよい。
- 再生 / 停止 / リセットが安全に動き、timer cleanup がある。
- generated URL は config-only のまま、fixture event data を含めない。
- no YouTube API / no OAuth / no API key / no scraping / no real data。

### Phase 4: Config-Aware Overlay Runtime Skeleton

fixture playback の後続では、`/overlay/keyword-reaction/` 本体を config-aware overlay runtime skeleton に進める。

この phase で確認すること:

- `/overlay/keyword-reaction/?c=valid-config` が safe normalized config を読む。
- `/overlay/keyword-reaction/?c=invalid-config` が safe default へ fallback する。
- invalid fallback 時に raw `c`、secret-like value、入力実値を画面、status、consoleへ出さない。
- 通常 idle は transparent / no visible text。
- `debug=1` などの明示queryがある場合だけ public-safe status を表示する。
- debug 表示に manual input text、fixture event data、raw JSON、`displayText` array、secret-like value を出さない。
- event source、fixture linkage、toast event発火runtimeを実装しない。
- generated URL は config-only のまま、manual input text と fixture event data を含めない。
- `textContent` など safe DOM API を使い、`innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler を使わない。
- no external network。
- no editor `localStorage` dependency。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- 390px / 768px / 1280px で unexpected horizontal scroll がない。
- `/clock/` と `/clock/?c=...` の既存契約を変えない。

この phase は overlay本体が config を読めるようにするだけであり、event rendering、fixture playbackのoverlay連携、ticker、badge、YouTube integrationを実装済みにしない。

### Phase 5: Single Synthetic Event Rendering

config-aware overlay runtime skeleton の後続では、`/overlay/keyword-reaction/` 本体で 1 件だけの public-safe synthetic event を表示する。

この phase で確認すること:

- 通常 `/overlay/keyword-reaction/` は transparent / no visible text。
- `demo=1` の時だけ public-safe synthetic event を 1 件表示する。
- `debug=1` の時だけ public-safe status を表示する。
- `demo=1` と `debug=1` が共存しても raw `c`、keyword実値、manual input text、fixture event data、secret-like value を画面、status、consoleへ出さない。
- `/overlay/keyword-reaction/?c=invalid&demo=1` が safe default へ fallback し、raw invalid value を表示しない。
- event text はコード内固定の人工文言だけにする。
- generated URL は config-only のまま、synthetic event text、manual input text、fixture event data、raw JSON、`displayText` array を含めない。
- `textContent` など safe DOM API を使い、`innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler を使わない。
- demo event は短時間表示して消え、timer cleanup がある。
- no external network。
- no editor `localStorage` dependency。
- no event source / no fixture linkage / no toast event queue。
- no ticker / no badge / no paste JSON import。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- 390px / 768px / 1280px で unexpected horizontal scroll がない。
- `/clock/` と `/clock/?c=...` の既存契約を変えない。

この phase は OBS Browser Source で toast 表示と透明背景を確認するための public-safe demo event であり、fixture playback、event source、YouTube integrationを実装済みにしない。

### Phase 6: Event Source Shape Helper

single synthetic event rendering の後続では、event transport ではなく normalized event shape helper を先に固定する。

この phase で確認すること:

- `manual` / `fixture` / `demo` の `sourceType` 境界が明確である。
- manual input text は generated URL に含まれない。
- fixture event data、raw fixture JSON、`displayText` arrays は generated URL に含まれない。
- `demo=1` は public-safe display test flag のままで、event sourceや実データ入力として扱わない。
- `displayText` は `textContent` など safe DOM API で表示する前提で扱われる。
- HTML-like text は HTML として実行されない。
- secret-like values は reject または safe fallback され、raw値を status、DOM、console、generated URL に出さない。
- event payload、event queue state、raw JSON、real viewer id、raw comment data は URL へ入れない。
- 複数eventやqueueは後続PRへ分け、bounded queue、最大件数、timer cleanup、stop/reset を設計してから扱う。
- `setInterval` や無限loopは使わず、`setTimeout` を使う場合は `clearTimeout` 管理を必須にする。
- no external network。
- no editor `localStorage` dependency。
- no YouTube API / no OAuth / no API key / no scraping / no real data。

この phase は helper shape と tests の境界固定であり、event transport、fixture linkage、toast queue、ticker、badge、YouTube integrationを実装済みにしない。

### Phase 7: Queue Helper And Transport Boundary

event shape helper の後続では、transport ではなく queue helper + tests を先に固定する。

この phase で確認すること:

- queue helper + tests に限定する。
- queue は normalized event shape だけを扱う。
- bounded queue の最大件数を守る。初期候補は 5 events。
- overflow時は古い未表示eventをdropし、最新eventを残す。
- repeated enqueue でも順序とscheduleが deterministic である。
- queue helper は DOM、timer id、network、localStorage に依存しない。
- timer runtimeを実装する場合は後続PRに分け、`setTimeout` id管理と `clearTimeout` cleanupを確認する。
- stop / reset / unmount / new sequence で古いtimerが残らない方針を維持する。
- generated URL に queue state、event payload、transport payload、manual input text、fixture event data、raw JSON、`displayText` arrays を入れない。
- transport、event source、fixture linkage、toast queue runtimeを実装しない。
- no localStorage transport。
- no external network。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- `displayText` は後続renderingでも `textContent` など safe DOM API を使う。
- `innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler を使わない。
- `/clock/` と `/clock/?c=...` の既存契約を変えない。

この phase は queue helper と transport境界の固定であり、cross-window transport、BroadcastChannel、postMessage、fixture linkage、YouTube integrationを実装済みにしない。

### Phase 8: Overlay Runtime Queue Connection

queue helper + tests の後続では、overlay runtime queue connection を小さく実装する。

この phase で確認すること:

- overlay runtime queue connection に限定する。
- `demo=1` fixed synthetic event だけを queue helper 経由で表示する。
- manual input event、fixture event、external event は queue に入れない。
- queue は max 5 bounded queue として helper contract を使う。
- overflow時は古い未表示eventをdropし、最新eventを残す方針を維持する。
- repeated enqueue / repeated `demo=1` / re-run でも順序とscheduleが deterministic である。
- timer runtime は bounded `setTimeout` のみを使う。
- `setInterval`、unbounded loop、watch-like polling は使わない。
- play / clear / unmount / re-run / new demo sequence で `clearTimeout` cleanup を確認する。
- old timer が hidden overlay に古いeventを再表示しない。
- generated URL に queue state、event payload、transport payload、manual input text、fixture event data、raw JSON、`displayText` arrays を入れない。
- debug/status に raw `c`、keyword実値、manual input text、fixture event data、secret-like value を出さない。
- event `displayText` は `textContent` など safe DOM API で表示する。
- `innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler を使わない。
- transport、event source、fixture linkage、toast queue runtimeを実装しない。
- no localStorage transport。
- no external network。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- `/clock/` と `/clock/?c=...` の既存契約を変えない。
- `/overlay/keyword-reaction/` の通常 idle は transparent / no visible text のまま。
- `debug=1` は public-safe status のみ。
- `demo=1` は public-safe display test flag のまま。

この phase は `demo=1` の fixed synthetic event を queue helper 経由にする接続確認であり、transport、fixture linkage、manual input event injection、YouTube integrationを実装済みにしない。

### Phase 9: Transport Scope Decision

overlay runtime queue connection の後続では、transportを実装する前に候補比較と安全境界をdocs-onlyで固定する。

この phase で確認すること:

- same-window internal dispatch、same-origin `postMessage`、`BroadcastChannel`、URL config、`localStorage`、external network、future YouTube integration を比較する。
- 初回は transport実装に入らない。
- 次の実装候補は overlay runtime local event intake helper + tests、または same-window internal dispatch設計docsに分ける。
- event intake は `normalizeKeywordReactionEvent` で normalized event shape へ寄せる。
- invalid event は safe reject / fallback する。
- raw value を status、DOM、console、generated URL に出さない。
- generated URL に transport payload、event payload、queue state、manual input text、fixture event data、raw JSON、`displayText` arrays を入れない。
- same-origin `postMessage` を将来使う場合は origin / source確認をQA対象にする。
- `BroadcastChannel` を将来使う場合は channel名、lifetime、cleanup、OBS Browser Source互換性をQA対象にする。
- no localStorage transport by default。
- no external network。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- transport実装を含めない。
- `/clock/` と `/clock/?c=...` の既存契約を変えない。

### Phase 10: Local Intake To Queue Connection

local event intake helper の後続では、transportやoverlay runtime connectionではなく、local intake output を queue helper へ渡す pure helper + tests を先に固定する。

この phase で確認すること:

- raw local input は local intake helper で normalized event へ寄せてから queue helper へ渡す。
- queue には normalized event だけを入れる。
- `manual` / `fixture` / `demo` だけを sourceType として扱う。
- unsupported sourceType は safe reject または safe fallback。
- invalid local input は raw data を queue に残さない。
- unknown fields、transport payload、queue state、secret-like values を event に残さない。
- raw input object を破壊しない。
- queue は max 5 bounded queue を維持する。
- overflow時は古い未表示eventをdropし、最新eventを残す。
- generated URL に local intake payload、event payload、queue state、manual input text、fixture event data、transport payload、raw JSON、`displayText` arrays を入れない。
- helper は DOM、timer、storage、network、transport に依存しない。
- no `postMessage` / no `BroadcastChannel`。
- no `localStorage` transport。
- no external network。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- `displayText` は後続renderingでも `textContent` など safe DOM API を使う。
- `innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler を使わない。
- `/clock/` と `/clock/?c=...` の既存契約を変えない。
- `/overlay/keyword-reaction/` の idle / debug / demo 境界に回帰がない。

この phase は local intake と queue helper の pure connection であり、overlay runtime connection、transport、fixture linkage、toast queue runtime、YouTube integrationを実装済みにしない。

### Phase 11: Local Intake To Overlay Runtime Connection

local intake to queue helper の後続では、overlay runtime の `demo=1` 経路だけを local intake helper -> queue helper -> existing overlay toast display へ寄せる。

この phase で確認すること:

- `demo=1` fixed synthetic event だけを local intake input として扱う。
- local intake helper が `sourceType: "demo"` を normalized event へ寄せる。
- local intake to queue helper が bounded queue へ normalized event だけを入れる。
- queue から取り出した normalized event を既存toast表示へ渡す。
- manual input event、fixture event、external event は runtime connection しない。
- transport、`postMessage`、`BroadcastChannel`、`localStorage` transport、external network は実装しない。
- generated URL に local intake payload、event payload、queue state、manual input text、fixture event data、transport payload、raw JSON、`displayText` arrays を入れない。
- debug/status に raw `c`、keyword実値、manual input text、fixture event data、queue state、secret-like value を出さない。
- 通常 idle は transparent / no visible text のまま。
- `debug=1` は public-safe status のみ。
- `demo=1` は public-safe fixed synthetic event のみ。
- timer runtime は bounded `setTimeout` のみを使い、`setInterval` と unbounded loop は使わない。
- repeated run / non-demo run で `clearTimeout` cleanup を維持する。
- event `displayText` は `textContent` など safe DOM API で表示する。
- `innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler を使わない。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- `/clock/` と `/clock/?c=...` の既存契約を変えない。
- `/overlay/keyword-reaction/` の idle / debug / demo 境界に回帰がない。

この phase は `demo=1` の fixed synthetic event を local intake + queue helper 経由にする接続確認であり、manual / fixture runtime connection、transport、fixture linkage、YouTube integrationを実装済みにしない。

### Phase 12: First Transport Decision

local intake to overlay runtime connection の後続では、transport実装へ進む前に first transport implementation decision を docs-only で固定する。

この phase で確認すること:

- no transport yet、same-window internal dispatch、same-origin `postMessage`、`BroadcastChannel`、URL config、`localStorage` transport、external network、future YouTube integration を比較する。
- 初回は `postMessage`、`BroadcastChannel`、`localStorage` transportへ進まない。
- 次PR候補は same-window internal dispatch helper + tests に限定する。
- same-window internal dispatch は transportではなく、同一document内の internal handoff として扱う。
- generated URL に dispatch payload、transport payload、event payload、queue state、manual input text、fixture event data、raw JSON、`displayText` arrays を入れない。
- `localStorage` transportは初期採用しない。
- external network transportは禁止する。
- YouTube integration は別boundary reviewと人間承認後にする。
- text-not-HTML 方針を維持する。
- no YouTube API / no OAuth / no API key / no scraping / no real data。

この phase は docs-only の判断であり、transport、event source、fixture linkage、overlay runtime追加実装を実装済みにしない。

### Phase 13: Internal Dispatch Overlay Runtime Connection

same-window internal dispatch helper + tests の後続では、overlay runtime の `demo=1` 経路だけを internal dispatch helper 経由へ寄せる。

この phase で確認すること:

- `demo=1` fixed synthetic event だけを same-window internal dispatch helper で dispatch する。
- `EventTarget` は overlay runtime 内に閉じる。
- subscribe listener は normalized event だけを受け取る。
- 既存の local intake -> queue -> toast display path を維持する。
- manual input event、fixture event、external event は runtime connection しない。
- transport、`postMessage`、`BroadcastChannel`、`localStorage` transport、external network は実装しない。
- generated URL に internal dispatch payload、event payload、queue state、manual input text、fixture event data、transport payload、raw JSON、`displayText` arrays を入れない。
- debug/status に raw `c`、keyword実値、manual input text、fixture event data、queue state、internal dispatch payload、secret-like value を出さない。
- 通常 idle は transparent / no visible text のまま。
- `debug=1` は public-safe status のみ。
- `demo=1` は public-safe fixed synthetic event のみ。
- subscription cleanup と timer cleanup を repeated mount / rerun で確認する。
- event `displayText` は `textContent` など safe DOM API で表示する。
- `innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler を使わない。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- `/clock/` と `/clock/?c=...` の既存契約を変えない。
- `/overlay/keyword-reaction/` の idle / debug / demo 境界に回帰がない。

この phase は `demo=1` の internal handoff 確認であり、manual / fixture runtime connection、transport、fixture linkage、YouTube integrationを実装済みにしない。

### Phase 14: Manual Input Dispatch Scope

internal dispatch overlay runtime connection の後続では、editor preview 内の manual input event path を same-window internal dispatch helper へ寄せる前に docs-only で範囲を固定する。

この phase で確認すること:

- manual input dispatch は editor preview 内の同一ページ経路に限定する。
- overlay本体 `/overlay/keyword-reaction/` への manual input transport は実装しない。
- manual input text は local intake payload として扱い、generated URL へ入れない。
- internal dispatch detail は normalized event のみにする。
- raw manual input text、event payload、queue state、transport payload、secret-like values を debug/status/URL へ出さない。
- existing manual toast preview のUIと見た目を基本維持する。
- 表示は `textContent` など safe DOM API を使う。
- `innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler を使わない。
- `postMessage`、`BroadcastChannel`、`localStorage` transport、external network は実装しない。
- fixture linkage は後続に分ける。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- `/clock/` と `/clock/?c=...` の既存契約を変えない。
- `/overlay/keyword-reaction/` の idle / debug / demo 境界に回帰がない。

この phase は docs-only の判断であり、manual input dispatch実装、overlay本体transport、fixture linkage、YouTube integrationを実装済みにしない。

### Phase 15: Built-In Fixture Preview Dispatch Scope

manual input dispatch の後続では、editor preview 内の built-in fixture playback event path を same-window internal dispatch helper へ寄せる前に docs-only で範囲を固定する。

この phase で確認すること:

- fixture dispatch は editor preview 内の同一ページ経路に限定する。
- overlay本体 `/overlay/keyword-reaction/` への fixture transport は実装しない。
- built-in artificial fixture only の境界を維持する。
- fixture event data は local intake payload として扱い、generated URL へ入れない。
- internal dispatch detail は normalized event のみにする。
- raw fixture data、event payload、queue state、transport payload、secret-like values を debug/status/URL へ出さない。
- existing fixture playback のUI、見た目、再生 / 停止 / リセットを基本維持する。
- stop / reset / replay 後に古い timer と listener が残らないことをQA対象にする。
- 表示は `textContent` など safe DOM API を使う。
- `innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler を使わない。
- `postMessage`、`BroadcastChannel`、`localStorage` transport、external network は実装しない。
- paste JSON import は後続に分ける。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- `/clock/` と `/clock/?c=...` の既存契約を変えない。
- `/overlay/keyword-reaction/` の idle / debug / demo 境界に回帰がない。

この phase は docs-only の判断であり、fixture dispatch実装、overlay本体fixture transport、paste JSON import、YouTube integrationを実装済みにしない。

### Phase 16: Overlay Fixture Transport Scope

fixture linkage readiness helper + tests の後続では、overlay本体fixture transportを実装する前に docs-only で候補比較とQA gateを固定する。

この phase で確認すること:

- same-window internal dispatch は別page transportではない。
- まだ overlay本体fixture transport 実装には入らない。
- 次PR候補は `BroadcastChannel` feasibility docs/static QA、または overlay fixture transport readiness helper + tests に限定する。
- `BroadcastChannel` は channel名、same-origin、OBS Browser Source互換、lifetime、cleanup、stale event suppression をQA対象にしてから後続候補にする。
- `postMessage` は origin / source / window relationship / listener cleanup をQA対象にしてから後続候補にする。
- URL config は event payload transport に使わない。
- `localStorage` transport は初期非推奨を維持する。
- generated URL に fixture event data、event payload、queue state、transport payload、raw JSON、`displayText` arrays を入れない。
- raw fixture data、manual input text、secret-like values を debug/status/DOM/console へ出さない。
- text-not-HTML 方針を維持する。
- no external network。
- no YouTube API / no OAuth / no API key / no scraping / no real data。

この phase は docs-only の判断であり、overlay本体fixture transport、`BroadcastChannel`、`postMessage`、`localStorage` transport、paste JSON import、YouTube integrationを実装済みにしない。

### Phase 17: BroadcastChannel Feasibility

overlay fixture transport scope decision の後続では、`BroadcastChannel` を最初の overlay fixture transport 候補にできるかを docs / static QA で整理する。

この phase で確認すること:

- WHATWG HTML Standard / MDN / OBS Browser Source KB で確認できた情報と未確認事項を分ける。
- OBS Browser Source固有の `BroadcastChannel` support / lifetime / storage key / reload / visibility behavior は未確認として扱う。
- `BroadcastChannel` は有力候補だが、まだ実装しない。
- runtime / helper modules に `BroadcastChannel` / `postMessage` / `localStorage` transport が混入していないことを static QA で確認する。
- channel名に user input、keyword実値、fixture id、event id、manual input text、secret-like value を混ぜない方針を維持する。
- generated URL に fixture event data、event payload、queue state、transport payload、raw JSON、`displayText` arrays を入れない。
- raw fixture data、manual input text、secret-like values を debug/status/DOM/console へ出さない。
- text-not-HTML 方針を維持する。
- no YouTube API / no OAuth / no API key / no scraping / no real data。

この phase は docs / static tests の判断であり、overlay本体fixture transport、`BroadcastChannel` runtime、`postMessage`、`localStorage` transport、paste JSON import、YouTube integrationを実装済みにしない。

### Phase 18: OBS BroadcastChannel QA Scope

BroadcastChannel feasibility の後続では、OBS Browser Sourceでの availability / reload / lifecycle / multi-source behavior を実装前にどう確認するかを docs-only で固定する。

この phase で確認すること:

- OBS Browser Sourceでの `BroadcastChannel` 動作は未確認として扱う。
- 人間OBS QAとCodexが確認できるlocal/static範囲を分ける。
- OBS QAでは built-in artificial fixture / fixed synthetic event のみを使う。
- real YouTube data、real viewer data、raw comment data、secret-like values は使わない。
- generated URL に fixture event data、event payload、queue state、transport payload、raw JSON、`displayText` arrays を入れない。
- raw channel payload、raw fixture data、manual input text、secret-like values を debug/status/DOM/console へ出さない。
- `BroadcastChannel` は availability、channel open / close、reload後cleanup、scene切替、source再読み込み、複数Browser Source、通常ブラウザtabとの通信、page hidden / visible、stale listener / duplicate delivery をQA対象にする。
- fail時は `BroadcastChannel` 実装へ進まず、結果をdocsへ追記して止める。
- no `BroadcastChannel` runtime / no `postMessage` / no `localStorage` transport / no overlay本体fixture transport。
- no Cloudflare deploy / no OBS operation in Codex。
- no YouTube API / no OAuth / no API key / no scraping / no real data。

この phase は docs-only の判断であり、OBS操作、overlay本体fixture transport、`BroadcastChannel` runtime、`postMessage`、`localStorage` transport、paste JSON import、YouTube integrationを実装済みにしない。

### Phase 19: OBS BroadcastChannel Human QA Packet

OBS BroadcastChannel QA scope の後続では、人間テスターが OBS Browser Source で確認結果を貼り戻せる checklist / result template を docs-only で固定する。

この phase で確認すること:

- 人間テスターが OBS version、OS、Browser Source settings、URL type、page URL を記録する。
- QAでは built-in artificial fixture / fixed synthetic event のみを使う。
- secret、token、OAuth、API key、real viewer data、raw comment data、private account data は使わない。
- generated URL config-only を確認し、fixture event data、event payload、queue state、transport payload をURLへ入れない。
- raw channel payload、raw fixture data、manual input text、keyword実値、secret-like values を debug/status/DOM/console へ出さない。
- pass / fail / blocked / not run を public-safe result template で記録する。
- PASS は即実装承認ではなく、限定prototype scope decision の入力に留める。
- no `BroadcastChannel` runtime / no `postMessage` / no `localStorage` transport / no overlay本体fixture transport。
- no Cloudflare deploy / no OBS operation in Codex。
- no YouTube API / no OAuth / no API key / no scraping / no real data。

この phase は docs-only の human QA handoff であり、OBS操作、overlay本体fixture transport、`BroadcastChannel` runtime、`postMessage`、`localStorage` transport、paste JSON import、YouTube integrationを実装済みにしない。

## Input Surfaces

Candidate A の planned input surfaces:

- URL config。
- manual event input。
- synthetic fixture JSON。

各 surface に必要な bounds:

- maximum text length。
- maximum keyword length。
- maximum number of rules。
- maximum fixture event count。
- timing / intensity の accepted numeric ranges。
- `matchMode` の accepted enum。
- `reactionStyle` の accepted enum。
- unknown enum values の safe fallback。

## URL Config Sanitization

実装前に設計したい checks:

- invalid base64url config は safe fallback。
- unsupported `schemaVersion` は safe fallback。
- unknown `overlayType` は safe fallback または error state。
- unknown theme は default。
- unknown `displayPattern` は `toast`。
- unsupported `reactionStyle` は safe fallback。
- unsupported `matchMode` は safe fallback。
- unsafe color / style values は reject または normalize。
- keyword rules は length-limited。
- manual input text は URL config に含めない。
- preview 判定用の keyword は URL config と同じ normalized config から読む。
- text は text APIs で代入し、HTML として解釈しない。
- config は external URLs や script-like values を許可しない。

## Preview / Config Consistency QA

manual input + toast 後の follow-up PR で確認すること:

- editor input から normalized config を作り、generated URL と preview 判定の両方が同じ normalized config を使う。
- 空 keyword の場合、preview 判定と generated URL が同じ fallback keyword を扱うか、fallback status を出す。
- secret-like keyword の場合、入力実値を status、DOM、URL、console に出さず、safe fallback を扱う。
- secret-like keyword の fallback 後も manual input text は generated URL に入らない。
- 英数字は case-insensitive のまま。
- 日本語は単純包含 / 完全一致のまま。
- NFKC、全角半角、かな / カナ normalization を実装済みと扱わない。
- fixture playback、ticker、badge、import/export、YouTube integration を同じPRへ混ぜない。

## Fixture Sanitization

fixture playback + schema validation PR で追加確認すること:

- invalid JSON は safe error。
- `schemaVersion` mismatch は safe error。
- `events` が配列でない場合は safe error。
- event count limit を超えた場合は safe error。初期候補は 30 events。
- `offsetMs` は0以上の有限数だけを扱う。
- event order は `offsetMs` 昇順に normalize される。
- overly long `displayText` / `keyword` は reject、truncate、または safe fallback。初期候補は `displayText` 160 code points、`keyword` 80 code points。
- HTML-like text は `textContent` などの text API で inert text として扱う。
- secret-like value は入力実値を status、DOM、URL、console に出さず reject または fallback する。
- unknown fields は drop する。
- playback start / stop / reset 後に古い timer が残らない。
- generated URL に fixture event data、raw fixture JSON、displayText array が入らない。
- 390px / 768px / 1280px で editor preview、controls、generated URL 欄が破綻しない。
- `/overlay/keyword-reaction/` skeleton、`/clock/`、`/clock/?c=...` に回帰がない。

fixture parsing で reject または normalize すべきもの:

- missing `schemaVersion`。
- unsupported `overlayType`。
- unsupported `displayPattern`。
- missing / duplicate event ids。
- negative `offsetMs`。
- overly large `offsetMs`。
- overly long `displayText`。
- overly long `keyword`。
- unsupported `reactionStyle`。
- unsupported `matchMode`。
- non-numeric `intensity`。
- HTML-like text。

fixture samples は artificial かつ public-safe にする。

## Text-Not-HTML Checks

tests と manual QA に入れたい sample:

```text
<img src=x onerror=alert(1)>
javascript:alert(1)
");background:url(javascript:alert(1));/*
hello <strong>overlay</strong>
```

期待結果: 入力は inert text として表示されるか、安全に normalize される。実行されたり、page structure を変えたりしてはいけない。

manual input + toast PR では、少なくとも manual input text と keyword についてこの境界を確認する。HTML-like input を `innerHTML` へ渡さず、`textContent` などの text API で表示する。

## OBS Browser Source QA

overlay-only surface:

- transparent background。
- body margin なし。
- editor controls なし。
- recommended width / height が分かる。
- toast が端で clipping しない。
- repeated events が配信画面を恒久的に覆わない。
- invalid config は safe default または empty state。
- config-aware skeleton では、イベントがない通常idle時に画面を覆う default text を出さない。
- debug表示は明示query時だけ出し、OBS本番利用の既定にはしない。

OBS checks:

```text
OBS version:
OS:
Overlay URL:
Recommended width:
Recommended height:
OBS width:
OBS height:
Transparent background: OK / NG
Toast visible: OK / NG
Text clipping: none / present
Animation distracting: no / yes
URL reload reproducible: OK / NG
Final judgment: pass / needs fix / blocked
```

## Editor Viewport QA

editor surface を実装する場合の確認:

- 390px 前後の smartphone width。
- 768px 前後の tablet width。
- 1280px 以上の desktop width。
- unexpected horizontal scroll がない。
- manual input と generated URL が使いやすい。
- generated URL が manual input text を含まないことを確認できる。
- generated URL に保存される keyword と preview 判定の keyword が同じ normalized config 由来であることを確認できる。
- preview が重要 controls を押し出さない。
- controls に visible focus states がある。
- buttons / inputs が tap-friendly。

## Keyboard And Accessibility

minimum checks:

- manual input に keyboard focus できる。
- trigger / play / pause / reset controls に labels がある。
- display pattern selector が keyboard accessible。
- generated URL を select / copy できる。
- focus order が task flow に沿う。
- visual settings には color contrast guidance を検討する。
- motion は default で強すぎない。

## Generated URL Import/Export QA

import/export は初回 manual input + toast PR の必須範囲にしない。実装する場合の確認項目:

- generated URL が visual config と keyword rules を round-trip する。
- full URL import が動く。
- query string import が動く。
- config-only import が動く。
- invalid URL config は safe fallback。
- default omission が overlay output を変えない。
- generated URL は manual event text を default で含めない。
- generated URL は fixture event payloads を default で含めない。
- overlay runtime は generated URL の config fields だけを読み、event payload、manual input text、raw JSON を読まない。

## Privacy Checklist

実装PR review 前に確認すること:

- no YouTube API。
- no OAuth。
- no API keys。
- no scraping。
- no real viewer data。
- no real comment data。
- no external sending。
- no backend storage。
- no private dashboard data。
- no raw comment / live chat data。
- fixtures are artificial。

## Recommended Validation Commands

将来の実装PRでは次を実行する。

```bash
npm run format:check
git diff --check
npm run lint
npm run typecheck
npm test
npm run build
```

UI または overlay page を実装した場合は Browser / OBS QA も追加する。
