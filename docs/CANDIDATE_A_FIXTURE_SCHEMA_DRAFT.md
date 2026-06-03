# Candidate A Fixture Schema Draft

## Status

この文書は Candidate A keyword reaction overlay のテスト用 synthetic fixture JSON 形状案です。

この文書では fixture file を追加しません。将来 repository に fixture を置く場合も、完全な人工データだけを使います。

## Fixtureの目的

- YouTube API、OAuth、API key、scraping、real viewer data を使わずに keyword reaction behavior を試す。
- local tests と OBS QA で timing を再現できるようにする。
- real integration 前に display density を確認する。
- sample data を public-safe かつ synthetic に保つ。

## Data Policy

fixture に含めてはいけないもの:

- real viewer names。
- real comments / live chat messages。
- channel IDs / account identifiers。
- private stream titles。
- dashboard data。
- API keys、OAuth tokens、secrets、private keys。
- 実ユーザーからコピーした personal data。

fixture に含めてよいもの:

- synthetic event IDs。
- synthetic timestamps / offsets。
- artificial display text。
- artificial keywords。
- intensity values。
- visual style hints。
- tests 用の expected match outcomes。

## Draft Schema

top-level shape:

```json
{
  "schemaVersion": 1,
  "fixtureId": "synthetic-basic",
  "description": "Artificial keyword reaction demo events.",
  "events": [
    {
      "id": "evt-001",
      "offsetMs": 0,
      "displayText": "hello overlay",
      "keyword": "hello",
      "intensity": 1,
      "styleHint": "spark"
    }
  ]
}
```

field notes:

- `schemaVersion`: fixture schema version。
- `fixtureId`: stable synthetic identifier。
- `description`: public-safe explanation。
- `events`: ordered artificial events。
- `id`: synthetic event id。YouTube message id ではない。
- `offsetMs`: fixture start からの playback offset。
- `displayText`: artificial text。HTML ではなく text として表示する。
- `keyword`: matching tests の想定 keyword。
- `intensity`: animation strength の optional numeric hint。
- `styleHint`: `spark`、`pulse`、`soft` などの optional visual hint。

## Larger Synthetic Sample

```json
{
  "schemaVersion": 1,
  "fixtureId": "synthetic-toast-demo",
  "description": "Artificial events for toast reaction QA.",
  "events": [
    {
      "id": "evt-001",
      "offsetMs": 0,
      "displayText": "hello stream",
      "keyword": "hello",
      "intensity": 1,
      "styleHint": "spark"
    },
    {
      "id": "evt-002",
      "offsetMs": 1800,
      "displayText": "nice clock",
      "keyword": "nice",
      "intensity": 2,
      "styleHint": "pulse"
    },
    {
      "id": "evt-003",
      "offsetMs": 4200,
      "displayText": "quiet moment",
      "keyword": "none",
      "intensity": 0,
      "styleHint": "none"
    }
  ]
}
```

この sample は完全な人工データです。YouTube、配信、chat log、viewer、private account からコピーしたものではありません。

## Validation案

将来の実装 tests で確認したいこと:

- valid fixture が parse できる。
- unknown fields は documented policy に従って ignore または reject される。
- required fields missing の場合に分かりやすい error になる。
- overly long `displayText` が安全に truncate される。
- negative `offsetMs` が reject または clamp される。
- non-numeric `intensity` が safe fallback になる。
- HTML-like text が text としてのみ表示される。
- fixture playback order が deterministic。

## Repository Placement Notes

将来 fixture files を追加する場合:

- test/demo fixture directory を明確に分ける。
- synthetic data のみを含める。
- fixture が real viewer data ではないことを明記する。
- fixture file は小さく保つ。
- private account、dashboard、stream identifiers を含めない。
- 可能なら unsafe fixture content を防ぐ tests を追加する。

## Future YouTube Data Boundary

将来の real YouTube integration は、この fixture schema の単純な延長として扱わない。

real data を検討する前に必要なこと:

- official YouTube documentation review。
- data を display / store / replay できるかの設計。
- retention / deletion expectation の記録。
- credentials を generated URLs と Git に入れない設計。
- API/OAuth work への separate human approval。

未確定: future real events は fixture JSON を再利用するのではなく、別の sanitized runtime event shape へ変換すべきか。
