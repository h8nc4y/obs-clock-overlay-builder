# Candidate A Fixture Schema Draft

## Status

この文書は Candidate A keyword reaction overlay の fixture playback + schema validation に向けた schema draft です。

この文書では fixture file を追加しません。fixture playback、paste JSON import、overlay runtime、YouTube API integration、OAuth、API key、scraping、実データ取得を実装または承認するものでもありません。

fixture は完全な人工データだけを扱う。実YouTube live chat、comment、replay data、実視聴者名、実コメント、チャンネルID、private account data、dashboard data は扱わない。

関連:

- [CANDIDATE_A_FIXTURE_PLAYBACK_SCOPE_DECISION.md](CANDIDATE_A_FIXTURE_PLAYBACK_SCOPE_DECISION.md)
- [CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md](CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md)
- [CANDIDATE_A_SECURITY_AND_QA_PLAN.md](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- [YOUTUBE_DATA_POLICY_BOUNDARY.md](YOUTUBE_DATA_POLICY_BOUNDARY.md)

## Fixture Purpose

- YouTube API、OAuth、API key、scraping、real viewer data を使わずに keyword reaction behavior を確認する。
- local tests と OBS QA で timing、display density、repeated events を再現しやすくする。
- real integration 前に safe DOM rendering、event ordering、validation boundary を固める。
- sample data を public-safe synthetic に保つ。

fixture playback は実YouTube連携の代替ではない。安全なローカル検証機能として扱う。

## Data Policy

fixture に含めてはいけないもの:

- real viewer names。
- real comments / live chat messages。
- YouTube channel IDs / account identifiers。
- private stream titles。
- dashboard data。
- API keys。
- OAuth tokens。
- secrets / private keys。
- private account data。
- ユーザーが公開する意図のない personal data。

fixture に含めてよいもの:

- synthetic fixture IDs。
- synthetic event IDs。
- synthetic offsets。
- artificial display text。
- artificial keywords。
- `reactionStyle`。
- `intensity` values。
- tests用の expected display / ordering notes。

## Vocabulary

URL config と fixture schema は語彙をできるだけ揃える。ただし fixture event payload は generated URL に入れない。

| Term | Meaning |
|---|---|
| `schemaVersion` | fixture schema version。初回は `1`。URL config の `schemaVersion` と同じ命名に揃えるが、互換性は別々に判断する。 |
| `fixtureId` | public-safe synthetic identifier。YouTube id ではない。 |
| `description` | public-safe synthetic description。 |
| `events` | artificial events array。 |
| `id` | synthetic event id。YouTube message id ではない。 |
| `offsetMs` | playback start からの相対 milliseconds。 |
| `displayText` | artificial display text。HTML ではなく text として表示する。 |
| `keyword` | artificial keyword。 |
| `intensity` | reaction emphasis strength。`0` から `3`。 |
| `reactionStyle` | reaction visual style。`spark` / `pulse` / `soft` / `none`。 |

旧 `styleHint` 語彙は使わない。fixture 側だけ別名にせず、`reactionStyle` に寄せる。

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
      "reactionStyle": "spark",
      "intensity": 1
    }
  ]
}
```

field notes:

- `schemaVersion`: required。`1` 以外は初回実装では safe error。
- `fixtureId`: required。public-safe synthetic id。
- `description`: optional。public-safe synthetic description。
- `events`: required。array。
- `id`: required。synthetic event id。重複は safe error または重複排除。
- `offsetMs`: required。0以上の有限数。
- `displayText`: required。人工テキスト。HTML として解釈しない。
- `keyword`: required。人工keyword。secret-like value は reject または safe fallback。
- `reactionStyle`: optional。unsupported value は `spark` など safe fallback。
- `intensity`: optional。0から3へ clamp または safe fallback。

`matchMode` は fixture event の必須fieldにしない。初回 playback は既存 generated URL config の normalized `keyword` / `matchMode` と fixture event の `displayText` を使って判定する方針を優先する。event ごとの `keyword` は QA sample や expected case の説明に使えるが、runtime source of truth を増やしすぎないよう実装PRで最終判断する。

## Synthetic Sample

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
      "reactionStyle": "spark",
      "intensity": 1
    },
    {
      "id": "evt-002",
      "offsetMs": 1800,
      "displayText": "配信開始です",
      "keyword": "配信開始",
      "reactionStyle": "pulse",
      "intensity": 2
    },
    {
      "id": "evt-003",
      "offsetMs": 4200,
      "displayText": "888",
      "keyword": "888",
      "reactionStyle": "soft",
      "intensity": 3
    }
  ]
}
```

この sample は完全な人工データです。YouTube、配信、chat log、viewer、private account からコピーしたものではありません。

## Validation Policy

初回実装で確認したい validation:

- invalid JSON は safe error。
- required fields missing は分かりやすい日本語 error。
- unsupported `schemaVersion` は safe error。
- `events` が配列でない場合は safe error。
- event count は上限を設ける。初期候補は 30 events。
- unknown fields は drop。
- `offsetMs` は0以上の有限数だけを許可する。
- event order は `offsetMs` 昇順に normalize する。
- duplicate `id` は safe error または deterministic に重複排除する。
- overly long `displayText` と `keyword` は reject、truncate、または safe fallback。初期候補は `displayText` 160 code points、`keyword` 80 code points。
- secret-like `displayText` / `keyword` は reject または safe fallback。
- unsupported `reactionStyle` は safe fallback。
- non-numeric `intensity` は safe fallback。
- HTML-like text は inert text として扱う。

validation結果は入力実値をそのまま status、DOM、URL、console に出さない。特に secret-like value は値を表示しない。

## Generated URL Boundary

generated URL は config-only を維持する。

初回 generated URL に入れないもの:

- raw fixture JSON。
- fixture event payloads。
- `displayText` arrays。
- manual input text。
- API keys。
- OAuth tokens。
- client secrets。
- private account identifiers。
- real viewer identifiers。
- raw real chat / comment data。
- secret-like values。

将来、`fixtureId` のような public-safe reference を generated URL に含めるかは後続検討とする。初回 fixture playback 実装では event payload を URL に入れない。

## Repository Placement Notes

将来 fixture files を追加する場合:

- test/demo fixture directory を明確に分ける。
- synthetic data のみを含める。
- fixture が real viewer data ではないことを明記する。
- fixture file は小さく保つ。
- private account、dashboard、stream identifiers を含めない。
- unsafe fixture content を防ぐ tests を追加する。

今回の docs-only PR では fixture JSON file は追加しない。

## Implementation Sequence

現在の順序:

1. `/overlay/keyword-reaction/` route/static skeleton。
2. config helper。
3. manual input + toast preview。
4. preview/config consistency fix。
5. fixture playback + schema validation。

次の実装PRは built-in artificial fixture を優先し、paste JSON import は後続でもよい。

## Future YouTube Data Boundary

将来の real YouTube integration は、この fixture schema の単純な延長として扱わない。

real data を検討する前に必要なもの:

- official YouTube documentation review。
- data を display / store / replay できるかの設計。
- retention / deletion expectation の記録。
- credentials を generated URLs や Git に入れない設計。
- API/OAuth work への separate human approval。
- privacy and safety review。

未確定: future real events は fixture JSON を再利用するのではなく、別の sanitized runtime event shape へ変換すべきか。
