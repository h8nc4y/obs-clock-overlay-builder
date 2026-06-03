# Candidate A Security And QA Plan

## Status

この文書は、将来の Candidate A keyword reaction overlay 実装PRに求める security / QA expectations を整理します。

この文書は、実装、YouTube API calls、OAuth、API keys、scraping、real viewer data、deploy、external data sending を承認するものではありません。

## Security Principles

- URL config、manual input、fixture text は untrusted として扱う。
- text は HTML ではなく text として表示する。
- untrusted values に `innerHTML` を使わない。
- invalid config は safe defaults へ normalize する。
- overlay playback は editor localStorage に依存しない。
- generated URLs に secrets、tokens、private account data、raw user data を入れない。
- manual input、fixture data、generated config を external services へ送信しない。

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
- unknown enum values の safe fallback。

## URL Config Sanitization

実装前に設計したい checks:

- invalid base64url config は safe fallback。
- unsupported schema version は safe fallback。
- unknown theme は default。
- unknown display pattern は `toast`。
- unsafe color / style values は reject または normalize。
- keyword rules は length-limited。
- text は text APIs で代入し、HTML として解釈しない。
- config は external URLs や script-like values を許可しない。

## Fixture Sanitization

fixture parsing で reject または normalize すべきもの:

- missing `schemaVersion`。
- missing / duplicate event ids。
- negative `offsetMs`。
- overly large `offsetMs`。
- overly long `displayText`。
- overly long `keyword`。
- unsupported `styleHint`。
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

確認項目:

- generated URL が visual config と keyword rules を round-trip する。
- full URL import が動く。
- 実装する場合は query string import が動く。
- 実装する場合は config-only import が動く。
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
