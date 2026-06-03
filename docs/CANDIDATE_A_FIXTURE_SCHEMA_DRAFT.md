# Candidate A Fixture Schema Draft

## Status

この文書は Candidate A keyword reaction overlay のテスト用 synthetic fixture JSON 形状案です。

この文書では fixture file を追加しません。将来 repository に fixture を置く場合も、完全な人工データだけを使います。fixture playback は manual input + toast が安定した後の後続PRに分ける。

関連するスコープ固定記録: [CANDIDATE_A_IMPLEMENTATION_SCOPE_DECISION.md](CANDIDATE_A_IMPLEMENTATION_SCOPE_DECISION.md)

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
- `matchMode`。
- `reactionStyle`。
- `intensity` values。
- tests 用の expected match outcomes。

## Vocabulary

URL config と fixture schema は次の語彙を共有する。

| Term | Meaning |
|---|---|
| `schemaVersion` | fixture schema version。URL config の `schemaVersion` と同じ命名に揃えるが、互換性は別々に判断してよい。 |
| `overlayType` | Candidate A では `keyword-reaction`。 |
| `displayPattern` | fixture が想定する visual pattern。初期実装は `toast`。 |
| `keyword` | matching target keyword。 |
| `matchMode` | matching mode。候補は `contains` / `exact`。 |
| `reactionStyle` | reaction visual style。候補は `spark` / `pulse` / `soft` / `none`。 |
| `intensity` | reaction animation / emphasis strength。 |

旧draftで分かれていた reaction visual style の呼び方は `reactionStyle` に寄せる。fixture側だけ別名にしない。

## Draft Schema

top-level shape:

```json
{
  "schemaVersion": 1,
  "overlayType": "keyword-reaction",
  "displayPattern": "toast",
  "fixtureId": "synthetic-basic",
  "description": "Artificial keyword reaction demo events.",
  "events": [
    {
      "id": "evt-001",
      "offsetMs": 0,
      "displayText": "hello overlay",
      "keyword": "hello",
      "matchMode": "contains",
      "reactionStyle": "spark",
      "intensity": 1
    }
  ]
}
```

field notes:

- `schemaVersion`: fixture schema version。breaking schema change では increment を検討する。
- `overlayType`: Candidate A では `keyword-reaction`。他 overlay type の fixture と混ぜない。
- `displayPattern`: fixture が想定する display pattern。初期は `toast`。
- `fixtureId`: stable synthetic identifier。
- `description`: public-safe explanation。
- `events`: ordered artificial events。
- `id`: synthetic event id。YouTube message id ではない。
- `offsetMs`: fixture start からの playback offset。
- `displayText`: artificial text。HTML ではなく text として表示する。
- `keyword`: matching tests の想定 keyword。
- `matchMode`: matching mode。初期候補は `contains` / `exact`。
- `reactionStyle`: `spark`、`pulse`、`soft`、`none` などの optional visual style。
- `intensity`: animation strength の optional numeric hint。

## Larger Synthetic Sample

```json
{
  "schemaVersion": 1,
  "overlayType": "keyword-reaction",
  "displayPattern": "toast",
  "fixtureId": "synthetic-toast-demo",
  "description": "Artificial events for toast reaction QA.",
  "events": [
    {
      "id": "evt-001",
      "offsetMs": 0,
      "displayText": "hello stream",
      "keyword": "hello",
      "matchMode": "contains",
      "reactionStyle": "spark",
      "intensity": 1
    },
    {
      "id": "evt-002",
      "offsetMs": 1800,
      "displayText": "nice clock",
      "keyword": "nice",
      "matchMode": "contains",
      "reactionStyle": "pulse",
      "intensity": 2
    },
    {
      "id": "evt-003",
      "offsetMs": 4200,
      "displayText": "quiet moment",
      "keyword": "none",
      "matchMode": "exact",
      "reactionStyle": "none",
      "intensity": 0
    }
  ]
}
```

この sample は完全な人工データです。YouTube、配信、chat log、viewer、private account からコピーしたものではありません。

## Validation案

将来の implementation tests で確認したいこと:

- valid fixture が parse できる。
- unknown fields は documented policy に従って ignore または reject される。
- required fields missing の場合に分かりやすい error になる。
- unsupported `schemaVersion` が safe error または fallback になる。
- unsupported `overlayType` が reject または safe fallback になる。
- unknown `displayPattern` が reject または `toast` fallback になる。
- overly long `displayText` が安全に truncate される。
- negative `offsetMs` が reject または clamp される。
- non-numeric `intensity` が safe fallback になる。
- unsupported `reactionStyle` が safe fallback になる。
- unsupported `matchMode` が safe fallback になる。
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

## Implementation Sequence

fixture playback は route/static skeleton と manual input + toast の後続PRに分ける。

順序:

1. `/overlay/keyword-reaction/` route/static skeleton。
2. manual input + toast。
3. synthetic fixture playback。

fixture schema は2番目のPRで必要な runtime event shape から学び、3番目のPRで validation と playback timing を加える。

## Future YouTube Data Boundary

将来の real YouTube integration は、この fixture schema の単純な延長として扱わない。

real data を検討する前に必要なこと:

- official YouTube documentation review。
- data を display / store / replay できるかの設計。
- retention / deletion expectation の記録。
- credentials を generated URLs と Git に入れない設計。
- API/OAuth work への separate human approval。
- privacy and safety review。

未確定: future real events は fixture JSON を再利用するのではなく、別の sanitized runtime event shape へ変換すべきか。
