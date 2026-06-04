# Candidate A Security And QA Plan

## Status

この文書は、将来の Candidate A keyword reaction overlay 実装PRに求める security / QA expectations を整理します。

この文書は、実装、YouTube API calls、OAuth、API keys、scraping、real viewer data、deploy、external data sending を承認するものではありません。

関連するスコープ固定記録:

- [CANDIDATE_A_IMPLEMENTATION_SCOPE_DECISION.md](CANDIDATE_A_IMPLEMENTATION_SCOPE_DECISION.md)
- [CANDIDATE_A_MANUAL_TOAST_SCOPE_DECISION.md](CANDIDATE_A_MANUAL_TOAST_SCOPE_DECISION.md)
- [CANDIDATE_A_MATCHING_NORMALIZATION_DECISION.md](CANDIDATE_A_MATCHING_NORMALIZATION_DECISION.md)

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
