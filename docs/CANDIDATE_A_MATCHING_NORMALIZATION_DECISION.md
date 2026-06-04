# Candidate A Matching Normalization Decision

## Status

この文書は Candidate A: keyword reaction overlay の matching normalization と preview/config consistency の方針固定記録です。

これは docs-only の implementation planning evidence です。新しい matching helper、UI、toast runtime、fixture playback、YouTube integration、deploy、Codex for OSS 申請を実装または承認するものではありません。

関連:

- [CANDIDATE_A_MANUAL_TOAST_SCOPE_DECISION.md](CANDIDATE_A_MANUAL_TOAST_SCOPE_DECISION.md)
- [CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md](CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md)
- [CANDIDATE_A_URL_CONTRACT_DRAFT.md](CANDIDATE_A_URL_CONTRACT_DRAFT.md)
- [CANDIDATE_A_SECURITY_AND_QA_PLAN.md](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)

## Current Matching Behavior

PR #38 時点の editor preview では、manual input + toast preview の最小matchingだけを扱う。

- `matchMode: "contains"` と `"exact"` のみ。
- 英数字は case-insensitive。
- 日本語は単純包含または完全一致。
- manual input text は preview 判定だけに使い、generated URL へ含めない。
- generated URL は `/overlay/keyword-reaction/?c=...` の config-only URL。

この挙動は、YouTube chat 向けに十分なmatching仕様であることを意味しない。実YouTube連携前の editor preview 検証用の最小挙動として扱う。

## Initial Normalization Policy

次の実装PRでも、初期matching方針は維持する。

- 英数字: case-insensitive。
- 日本語: 単純包含 / 完全一致。
- NFKC normalization: 後続検討。
- 全角半角 normalization: 後続検討。
- かな / カナ normalization: 後続検討。
- 正規表現matching: 後続検討。初期対象外。

この文書は NFKC、全角半角、かな / カナ normalization が実装済みであることを示さない。

## Why Advanced Normalization Is Deferred

初期実装で高度normalizationを入れない理由:

- 日本語の全角半角、かな / カナ、濁点、絵文字、記号の扱いは UX 期待値が分かれやすい。
- 早期に強いnormalizationを入れると、配信者が意図した表記差を区別できなくなる可能性がある。
- YouTube chat の実データを扱わない段階では、実際に必要な normalization の範囲を断定できない。
- Candidate A の次PRでは、まず preview 判定と generated URL config の不一致を減らすことを優先する。
- 高度normalizationは fixture playback や public feedback を見てから、tests と docs を増やして導入した方が安全。

## When To Revisit Advanced Normalization

高度normalizationは、次のいずれかが起きた後に再検討する。

- fixture playback で人工データの表記ゆれを扱う必要が出た。
- public feedback で全角半角、かな / カナ、大小文字、記号の期待値が具体化した。
- OBS画面上の反応漏れや誤反応を再現できる public-safe QA case が増えた。
- YouTube integration design に進む前の data/policy boundary review で、入力仕様を再設計する必要が出た。

再検討時も、YouTube API、OAuth、API key、実コメントデータ、実視聴者データを使う場合は別途承認と設計が必要。

## Preview / Config Consistency Policy

次の実装PRでは、preview 判定と generated URL に保存される config の source of truth を揃える。

方針:

- editor input から `buildManualKeywordReactionConfig` または同等の config helper を通して normalized config を作る。
- generated URL はその normalized config から作る。
- preview 判定も同じ normalized config の `keyword` と `matchMode` を使う。
- manual input text は normalized config に含めない。
- manual input text は runtime test input としてだけ扱う。

この方針により、keyword が空、長すぎる、unsupported、secret-like などで fallback される場合も、URL保存値と preview 判定値の分岐を減らす。

## Manual Input URL Boundary

manual input text は generated URL へ含めない。

URLに含めてよいもの:

- normalized `schemaVersion`。
- normalized `overlayType`。
- normalized `displayPattern`。
- normalized `reactionStyle`。
- normalized `intensity`。
- normalized `keyword`。
- normalized `matchMode`。
- 将来必要になる public-safe visual config。

URLに含めないもの:

- manual input text。
- fixture event payloads。
- API keys。
- OAuth tokens。
- access tokens / refresh tokens。
- client secrets。
- private account identifiers。
- real viewer identifiers。
- raw real chat / comment data。
- billing / payment details。
- ユーザーが公開する意図のない personal data。

## Secret-Like Keyword Fallback Policy

keyword が空または secret-like と判定される場合は、config helper の safe fallback を source of truth にする。

次PRのUI/status方針:

- preview 判定は fallback 後の normalized `keyword` を使う。
- fallback が起きた場合、UI status で「キーワードは安全な初期値へfallbackした」ことを明示する。
- status には入力された secret-like keyword の実値を出さない。
- generated URL には fallback 後の safe keyword だけを含める。
- manual input text は引き続き generated URL に含めない。

fallback を error とするか safe default とするかは、既存 helper 方針に合わせる。少なくとも、preview と generated URL の値が別々に見える状態は避ける。

## Next Implementation PR Scope

次の実装PRの範囲:

- preview 判定が normalized config の `keyword` と `matchMode` を使うように寄せる。
- generated URL と preview 判定が同じ normalized config から作られることを tests で確認する。
- keyword fallback 時の status を追加または整理する。
- manual input text が generated URL に含まれないことを維持する。
- NFKC / 全角半角 / かな / カナ normalization は実装しない。

## Non-Goals

- NFKC normalization 実装。
- 全角半角 normalization 実装。
- かな / カナ normalization 実装。
- 正規表現matching。
- fixture playback。
- ticker / badge runtime。
- import/export UI。
- YouTube API。
- OAuth。
- API key。
- scraping。
- 実視聴者データ。
- 実コメントデータ。
- external sending。
- deploy。
- Codex for OSS application submission。
