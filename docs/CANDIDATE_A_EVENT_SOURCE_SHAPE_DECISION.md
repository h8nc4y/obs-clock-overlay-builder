# Candidate A Event Source Shape Decision

## Status

この文書は Candidate A: keyword reaction overlay の event source shape 方針を固定する docs-only 記録です。

これは implementation planning evidence です。event shape helper、event transport、overlay runtime 追加実装、fixture linkage、toast queue、ticker、badge、YouTube API integration、OAuth、API key、scraping、実データ取得、deploy、Codex for OSS 申請を実装または承認するものではありません。

関連:

- [CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md](CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md)
- [CANDIDATE_A_MANUAL_TOAST_SCOPE_DECISION.md](CANDIDATE_A_MANUAL_TOAST_SCOPE_DECISION.md)
- [CANDIDATE_A_FIXTURE_PLAYBACK_SCOPE_DECISION.md](CANDIDATE_A_FIXTURE_PLAYBACK_SCOPE_DECISION.md)
- [CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_SINGLE_SYNTHETIC_EVENT_SCOPE_DECISION.md](CANDIDATE_A_SINGLE_SYNTHETIC_EVENT_SCOPE_DECISION.md)
- [CANDIDATE_A_URL_CONTRACT_DRAFT.md](CANDIDATE_A_URL_CONTRACT_DRAFT.md)
- [CANDIDATE_A_SECURITY_AND_QA_PLAN.md](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- [YOUTUBE_DATA_POLICY_BOUNDARY.md](YOUTUBE_DATA_POLICY_BOUNDARY.md)

## Purpose

次の実装PRへ渡す前に、overlay本体runtimeが将来受け取る event payload の正規形を決める。

目的:

- manual input、built-in fixture、`demo=1` の固定人工eventを同じ normalized event shape へ寄せる。
- sourceごとの境界を明確にし、event source実装やfixture linkageを早く混ぜすぎない。
- generated URL config-only 境界を維持する。
- `displayText` を HTML ではなく text として描画する方針を固定する。
- YouTube API / OAuth / API key / scraping / real data を後続の別reviewと人間承認まで扱わない。

## Normalized Event Shape

将来の helper は、入力sourceごとの raw payload を次の normalized event shape へ寄せる方針とする。

```json
{
  "schemaVersion": 1,
  "eventType": "keyword-reaction-event",
  "sourceType": "manual",
  "eventId": "manual-1",
  "displayText": "キーワード反応デモ",
  "keyword": "hello",
  "displayPattern": "toast",
  "reactionStyle": "spark",
  "intensity": 1,
  "durationMs": 2400,
  "offsetMs": 0
}
```

初期field候補:

- `schemaVersion`: `1`。
- `eventType`: `keyword-reaction-event`。
- `sourceType`: `manual` / `fixture` / `demo`。
- `eventId`: public-safe synthetic id。実視聴者IDや実コメントIDにしない。
- `displayText`: textとして表示する文字列。HTMLとして実行しない。
- `keyword`: public-safe keyword。secret-like値は reject または safe fallback。
- `displayPattern`: 初期表示対象は `toast`。
- `reactionStyle`: `spark` / `pulse` / `soft` / `none`。
- `intensity`: `0` から `3` の bounded number。
- `durationMs`: bounded number。初期候補は `2400ms`。
- `offsetMs`: fixture / replay-like internal scheduling 用の相対値。実ユーザー時刻や個人情報にしない。

初期shapeに入れないもの:

- raw source payload。
- raw `c` value。
- manual input の raw form state。
- raw fixture JSON。
- `displayText` arrays。
- API key / OAuth token / client secret。
- real viewer id。
- raw comment / live chat data。
- private account data。
- payment / billing data。

## SourceType Boundaries

### `manual`

`manual` は editor preview の人工manual input由来のeventを表す。

- maintainer / reviewer が入力した人工テキストだけを扱う。
- manual input text は generated URL へ含めない。
- overlay本体へmanual eventを送る transport はまだ未実装とする。
- 将来の helper は raw manual form state ではなく、normalized eventだけをrender layerへ渡す。

### `fixture`

`fixture` は built-in artificial fixture 由来のeventを表す。

- artificial data only。
- fixture event data は generated URL へ含めない。
- paste JSON import、fixture file保存、overlay本体へのfixture linkageは後続PRへ分ける。
- fixture sample は real viewer name、real comment、channel ID、private account data を含めない。

### `demo`

`demo` は `demo=1` の固定人工eventを表す。

- `demo=1` は public-safe display test flag。
- `demo=1` は event source ではなく、実データ入力でもない。
- event text はコード内固定の人工データだけを使う。
- generated URL の `c` に demo event payload を入れない。

### Future Integration

future integration は現段階の normalized event source として扱わない。

- YouTube API / OAuth / API key / scraping / real data は別途 boundary review と人間承認が必要。
- YouTube API仕様や規約適合はこの文書で断定しない。
- future integration を扱う場合も、raw API response をrender layerやgenerated URLへ直接渡さない設計が必要。

## Generated URL Config-Only Boundary

generated URL は config-only を維持する。

URLへ入れてよいもの:

- `schemaVersion`。
- `overlayType`。
- `displayPattern`。
- `reactionStyle`。
- `intensity`。
- `keyword`。
- `matchMode`。
- public-safe visual config。

URLへ入れないもの:

- event payload。
- event `displayText`。
- manual input text。
- fixture event data。
- raw fixture JSON。
- raw user JSON。
- `displayText` arrays。
- event queue state。
- raw `c` fallback data。
- API key / OAuth token / client secret。
- real viewer id。
- raw comment / live chat data。
- private account data。
- secret-like values。

`eventId` と `fixtureId` を将来 public-safe reference として URL へ入れるかは未確定です。初期PRでは入れない。

## Rendering Boundary

event rendering は text-not-HTML を守る。

必須方針:

- `displayText` は `textContent` など safe DOM API で表示する。
- HTML-like text は inert text として扱う。
- `innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler は使わない。
- CSS class、dataset、style値に入れる値は enum / bounded number / normalized value だけにする。
- raw `c`、keyword実値、manual text、fixture data、secret-like値を debug/status 表示に出さない。

## Queue And Timer Policy

初期event renderingは単一eventから始める。

- queueは後続PR。
- 複数eventを扱う場合は bounded queue、最大件数、drop policy、timer cleanup、stop/reset を設計してから実装する。
- `setInterval` や無限loopは禁止。
- `setTimeout` を使う場合は timer id を保持し、`clearTimeout` 管理を必須にする。
- page reload / remount / stop / reset 後に古いtimerが残らないことを tests または manual QA で確認する。

## Next Implementation PR Candidate

次の小実装PR候補は event shape helper + tests に限定する。

候補helper:

- `normalizeKeywordReactionEvent`
- `buildDemoKeywordReactionEvent`
- `normalizeManualKeywordReactionEvent`
- `normalizeFixtureKeywordReactionEvent`
- `buildKeywordReactionEventRenderModel`

初回helper PRで入れないもの:

- event transport。
- overlay本体へのmanual event送信。
- fixture linkage。
- toast queue。
- ticker / badge runtime。
- paste JSON import。
- YouTube API / OAuth / API key / scraping / real data。

## Security And Privacy Rules

- secret-like value は reject または safe fallback。
- raw値を status、DOM、console、generated URL に出さない。
- personal data、real viewer data、raw comment data、private account data をevent shapeへ入れない。
- external networkへ送信しない。
- editor `localStorage` を overlay playback の必須条件にしない。

## Non-Goals

- event shape helper実装。
- event source runtime。
- overlay runtime追加実装。
- fixture linkage。
- toast queue。
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

- normalized event shape が helper tests で固定される。
- `manual` / `fixture` / `demo` の `sourceType` 境界が tests で確認される。
- generated URL に event payload が入らないことが維持される。
- `displayText` は text rendering 前提として扱われる。
- secret-like values、raw JSON、raw comment、real viewer data が normalized event へ残らない。
- no event transport / no fixture linkage / no toast queue。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- validation が通る。

## Open Questions

- `eventId` の形式を sourceごとに分けるか。
- `createdAtMs` を持つか、初期は `offsetMs` のみにするか。
- `durationMs` を event側で持つか、config側のtimingへ寄せるか。
- `keyword` を event payloadに残すか、render modelでは落とすか。
- `sourceType` に将来 `local-channel` などを追加するか。
- public-safe `fixtureId` を URL reference として許可する時期。
- `displayPattern: ticker` / `badge` を event shapeで受ける時期。
