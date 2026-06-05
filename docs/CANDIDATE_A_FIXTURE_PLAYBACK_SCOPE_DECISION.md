# Candidate A Fixture Playback Scope Decision

## Status

この文書は Candidate A: keyword reaction overlay の次段階である fixture playback + schema validation のスコープ固定記録です。

これは implementation planning evidence です。PR #42 で built-in artificial fixture + schema validation + editor preview playback は実装済みだが、paste JSON import、overlay runtime、fixture event linkage、YouTube API integration、OAuth、API key、scraping、実データ取得、deploy、Codex for OSS 申請を実装または承認するものではありません。

関連:

- [CANDIDATE_A_FIXTURE_SCHEMA_DRAFT.md](CANDIDATE_A_FIXTURE_SCHEMA_DRAFT.md)
- [CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md](CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md)
- [CANDIDATE_A_MANUAL_TOAST_SCOPE_DECISION.md](CANDIDATE_A_MANUAL_TOAST_SCOPE_DECISION.md)
- [CANDIDATE_A_MATCHING_NORMALIZATION_DECISION.md](CANDIDATE_A_MATCHING_NORMALIZATION_DECISION.md)
- [CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md](CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md)
- [CANDIDATE_A_SECURITY_AND_QA_PLAN.md](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- [YOUTUBE_DATA_POLICY_BOUNDARY.md](YOUTUBE_DATA_POLICY_BOUNDARY.md)

## Scope Decision

Candidate A の次段階は、manual input + toast preview の後続として fixture playback + schema validation を扱う。

fixture はテスト用・デモ用の人工データだけに限定する。実YouTube live chat、comment、replay data、実視聴者名、実コメント、チャンネルID、private account data は扱わない。

fixture playback は実YouTube連携の代替ではない。表示、タイミング、密度、QA を安全にローカルで確認するための検証機能として扱う。

## Initial Implementation Scope

初回 fixture playback 実装PRは editor preview 内に限定する。

入れてよいもの:

- Candidate A 実験セクション内の fixture playback controls。
- built-in artificial fixture の選択または読み込み。
- 再生 / 停止 / リセット。
- fixture schema validation。
- validation結果を日本語で分かるように表示する status。
- 既存 manual toast preview と同じ text-not-HTML 方針の toast preview。

初回でどちらか一方に絞る場合は、built-in artificial fixture を優先する。paste JSON input は後続PRに分けてよい。

初回に入れないもの:

- paste JSON import。
- fixture JSON file 追加。
- `/overlay/keyword-reaction/` 本体のイベントruntime。
- ticker / badge runtime。
- import/export UI。
- speed control。
- loop playback。
- YouTube API / OAuth / API key / scraping / real data。

## Post-PR #42 Boundary

PR #42 時点の built-in fixture playback は editor preview 内の artificial data only です。

現時点で実装済みと扱うもの:

- built-in artificial fixture `demo-basic`。
- fixture schema validation / normalize / playback schedule helper。
- editor preview 内の再生 / 停止 / リセット。
- generated URL config-only 境界。

現時点で未実装のまま扱うもの:

- `/overlay/keyword-reaction/` 本体runtimeで fixture event を読むこと。
- fixture event を overlay本体へ流す event source。
- paste JSON import。
- fixture file保存。
- ticker / badge runtime。
- YouTube API / OAuth / API key / scraping / real data。

次の overlay runtime PR は config-aware skeleton に限定し、fixture event linkage は後続PRへ分ける。

## Fixture Schema Policy

初回 schema は小さく保つ。

top-level fields:

- `schemaVersion`: `1`。
- `fixtureId`: public-safe synthetic id。
- `description`: public-safe synthetic description。
- `events`: artificial events array。

event fields:

- `id`: synthetic event id。
- `offsetMs`: playback start からの相対 milliseconds。
- `displayText`: artificial display text。
- `keyword`: artificial keyword。
- `intensity`: `0` から `3`。
- `reactionStyle`: `spark` / `pulse` / `soft` / `none`。

旧 `styleHint` 語彙は使わず、`reactionStyle` へ寄せる。sample は `hello`、`配信開始`、`888` のような人工的で安全な文言だけにする。

## Event Shape Follow-Up

fixture event は、将来 [CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md](CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md) の normalized event shape へ寄せる。

初期方針:

- `sourceType: "fixture"` を使う。
- built-in artificial fixture 由来の event だけを扱う。
- raw fixture JSON を render layer へ直接渡さない。
- fixture event data、`displayText` arrays、raw JSON は generated URL へ入れない。
- paste JSON import、fixture file保存、overlay本体へのfixture linkageは後続PRへ分ける。
- fixture sample は real viewer data、raw comment data、private account data を含めない。

## Validation Policy

fixture validation は safe error または safe normalization を返す。入力実値をそのまま status、DOM、URL、console に出さない。

必須確認:

- invalid JSON は safe error。
- `schemaVersion` 不一致は safe error。
- `events` が配列でない場合は safe error。
- `offsetMs` は 0 以上の有限数だけを許可する。
- event数上限を設ける。初期候補は 30 events。
- `displayText` / `keyword` は長さ制限する。初期候補は `displayText` 160 code points、`keyword` 80 code points。
- HTML-like input は text として扱う。
- secret-like value は reject または safe fallback。
- unknown fields は drop。
- event order は `offsetMs` 昇順に normalize する。
- validation結果は日本語statusで説明する。

## Playback Policy

初回 playback は editor preview 内だけで動かす。

- 再生 / 停止 / リセットを最小操作にする。
- timer cleanup を行い、停止やページ遷移後に古い timer が残らないようにする。
- toast 表示は既存 manual toast preview と同じ safe DOM API を使う。
- `textContent` を使い、`innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、inline event handler は使わない。
- preview 外へはみ出さない。
- 390px / 768px / 1280px で操作と表示が破綻しないことを確認する。

## Generated URL Policy

初回 generated URL は config-only を維持する。

URLへ入れないもの:

- raw fixture JSON。
- fixture event payloads。
- `displayText` 配列。
- manual input text。
- real viewer identifiers。
- raw real chat / comment data。
- API keys。
- OAuth tokens。
- client secrets。
- private account data。
- secret-like values。

将来、`fixtureId` のような public-safe reference だけを URL に含めるかは後続検討とする。初回PRでは fixture event data を generated URL に含めない。

## Non-Goals

- YouTube API integration。
- OAuth login。
- API key creation or storage。
- scraping。
- 実視聴者データ。
- 実コメントデータ。
- 実YouTube replay data。
- overlay runtime 本格化。
- paste JSON import。
- fixture file 保存。
- ticker / badge。
- import/export UI。
- NFKC / 全角半角 / かな / カナ normalization。
- deploy。
- Codex for OSS application submission。

## Done Criteria For The Next Implementation PR

- built-in artificial fixture または paste JSON のどちらか一方に限定されている。
- fixture は artificial data only。
- schema validation が invalid JSON、schema mismatch、events shape、offset、長さ、event limit、secret-like value、unknown fields、ordering を扱う。
- playback は editor preview 内だけ。
- start / stop / reset ができる。
- generated URL は config-only で fixture event data を含めない。
- text-not-HTML 境界が tests または manual QA で確認される。
- `/overlay/keyword-reaction/` skeleton を壊さない。
- `/clock/` と `/clock/?c=...` を壊さない。
- no YouTube API / no OAuth / no API key / no scraping / no real data / no deploy。

## Follow-Up Split

後続PRへ分けるもの:

- paste JSON import。
- fixture files under repository。
- overlay 本体 runtime の event rendering。
- fixture event を overlay 本体 runtime へ流す linkage。
- ticker / badge。
- import/export UI。
- speed control。
- loop playback。
- NFKC / 全角半角 / かな / カナ normalization。
- real YouTube integration design。

## Open Questions

- 初回実装を built-in artificial fixture のみにするか、paste JSON input まで含めるか。
- event数上限を 30 events で始めるか。
- `offsetMs` の最大値。
- `displayText` と `keyword` の最大長を既存 helper の上限と完全に揃えるか。
- validation error を単一statusにまとめるか、field別に表示するか。
- playback中に manual input controls を無効化するか。
- 将来 `fixtureId` を generated URL に public-safe reference として含めるか。
