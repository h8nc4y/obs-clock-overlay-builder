# Candidate A URL Contract Draft

## Status

この文書は Candidate A keyword reaction overlay のURL再現性契約案です。

この文書では route を実装しません。Candidate A の初回実装方針として `/overlay/keyword-reaction/?c=...` を採用するが、将来 overlay suite 化が進んだ場合は path 再編の可能性を残す。

関連するスコープ固定記録:

- [CANDIDATE_A_IMPLEMENTATION_SCOPE_DECISION.md](CANDIDATE_A_IMPLEMENTATION_SCOPE_DECISION.md)
- [CANDIDATE_A_MANUAL_TOAST_SCOPE_DECISION.md](CANDIDATE_A_MANUAL_TOAST_SCOPE_DECISION.md)
- [CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_SINGLE_SYNTHETIC_EVENT_SCOPE_DECISION.md](CANDIDATE_A_SINGLE_SYNTHETIC_EVENT_SCOPE_DECISION.md)
- [CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md](CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md)
- [CANDIDATE_A_QUEUE_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_QUEUE_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_LOCAL_INTAKE_QUEUE_CONNECTION_SCOPE_DECISION.md](CANDIDATE_A_LOCAL_INTAKE_QUEUE_CONNECTION_SCOPE_DECISION.md)
- [CANDIDATE_A_LOCAL_INTAKE_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_LOCAL_INTAKE_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_FIRST_TRANSPORT_DECISION.md](CANDIDATE_A_FIRST_TRANSPORT_DECISION.md)

## 契約の目的

- OBS setup を generated URL から再現できるようにする。
- overlay-only playback を editor `localStorage` から独立させる。
- visual configuration と keyword rules を encode し、credentials や real user data を encode しない。
- missing / invalid / unsupported / too-long config を safe defaults へ normalize する。
- 時計ツールと同じく、generated overlay URL を OBS の source of truth として扱う。

## Path決定

Candidate A の初回実装方針では次を使う。

```text
/overlay/keyword-reaction/?c=...
```

理由:

- keyword reaction overlay であることが URL から分かる。
- 汎用 `/overlay/` 契約を早く固定しすぎない。
- 将来の overlay type と衝突しにくい。
- docs / review / OBS QA で説明しやすい。

将来 suite navigation、shared overlay router、複数 overlay type の共通入口が必要になった場合は、別PRで path 再編を検討する。

## 初回Route Skeletonでの扱い

最初の実装PRは route/static skeleton のみを対象にするため、`c` parser は未実装または最小 fallback でよい。

初回 skeleton の期待:

- `/overlay/keyword-reaction/` が 200 で開く。
- transparent background。
- `body` margin 0。
- editor UI なし。
- safe default text のみ表示。
- external network request なし。
- editor `localStorage` dependency なし。
- `innerHTML` なし。

本格的な config encode/decode、keyword rules、generated URL round-trip は manual input + toast 以降のPRで扱う。

## Overlay Runtime Config Scope

PR #44 の overlay runtime 実装PRは config-aware skeleton に限定した。`/overlay/keyword-reaction/` は `?c=...` を読み、`assets/js/keyword-reaction-config.js` の helper で safe normalized config へ寄せる。

overlay runtime が読む範囲:

- `schemaVersion`。
- `overlayType`。
- `displayPattern`。
- `reactionStyle`。
- `intensity`。
- `keyword`。
- `matchMode`。
- public-safe visual config。

overlay runtime が config-aware skeleton で読まないもの:

- manual input text。
- fixture event data。
- raw fixture JSON。
- raw user JSON。
- `displayText` array。
- event source。
- YouTube API response。
- OAuth token / API key / secret-like value。

config-aware skeleton の overlay runtime は event source を実装しない。configを読める transparent idle surface として振る舞い、toast event発火runtime、fixture linkage、ticker、badge、import/exportは後続へ分ける。

## Invalid Config And Debug Display

missing / invalid / unsupported `c` は safe default へ fallback する。

fallback時の方針:

- raw `c` value を画面、status、consoleへ出さない。
- secret-like value や入力実値を表示しない。
- generated URL は config-only のままにする。
- normal idle では何も表示しない。

debug/status 表示は `debug=1` のような明示queryがある場合だけ使う。debug表示に出してよいのは、overlay ready、fallback発生、public-safe enum などの低リスク情報だけにする。

debug表示に出さないもの:

- raw config。
- manual input text。
- fixture event data。
- `displayText` array。
- API key。
- OAuth token。
- real viewer id。
- raw comment data。
- private account data。

## Demo Flag Boundary

config-aware overlay runtime skeleton の後続では、single synthetic event rendering の確認用に `demo=1` を使う方針とする。

`demo=1` は event data ではなく public-safe display test flag です。

- `demo=1` は `c` parameter の一部にしない。
- `demo=1` は synthetic event `displayText` をURLへ入れる仕組みではない。
- `demo=1` は manual input text、fixture event data、raw JSON、YouTube data を読む許可ではない。
- `demo=1` は event source、fixture linkage、YouTube integration ではない。
- `debug=1` と共存してよいが、debug表示に raw `c`、keyword実値、synthetic event raw payload、secret-like value を出さない。

single synthetic event の text はコード内の固定人工データだけにする。generated URL は config-only を維持し、`c` には visual config と keyword rules だけを入れる。

## Event Payload Boundary

event source shape の次段階でも、generated URL は config-only を維持する。

URLへ入れないもの:

- normalized event payload。
- `eventId`。
- event `displayText`。
- manual input text。
- fixture event data。
- raw fixture JSON。
- raw user JSON。
- `displayText` arrays。
- event queue state。
- raw YouTube API response。
- real viewer id。
- raw comment / live chat data。
- secret-like values。

`eventId` や `fixtureId` を将来 public-safe reference として URL に含めるかは未確定です。初期 event shape helper PR では、event payload と event reference を URL へ入れない。

詳細は [CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md](CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md) に分ける。

## Queue / Transport URL Boundary

queue / transport の次段階でも、generated URL は config-only を維持する。

URLへ入れないもの:

- queue state。
- queue length / current index。
- playback schedule state。
- transport payload。
- event payload。
- `eventId`。
- event `displayText`。
- manual input text。
- fixture event data。
- raw fixture JSON。
- raw user JSON。
- `displayText` arrays。
- raw `postMessage` payload。
- `BroadcastChannel` payload。
- real viewer id。
- raw comment / live chat data。
- secret-like values。

将来、`eventId`、`fixtureId`、queue id のような public-safe reference を URL に含めるかは未確定です。次の queue helper + tests PR では、event reference や queue state を URL へ入れない。

transport を設計する場合も、URL を raw event transport にしない。URL は visual config と keyword rules の再現性契約に留める。

## Transport Scope URL Boundary

transport scope decision 後も、generated URL は config-only を維持する。

URLへ入れないもの:

- transport payload。
- event payload。
- queue state。
- queue length / current index。
- same-window internal dispatch payload。
- raw `postMessage` payload。
- `BroadcastChannel` payload。
- `localStorage` transport state。
- manual input text。
- fixture event data。
- raw fixture JSON。
- raw user JSON。
- `displayText` arrays。
- API key / OAuth token / access token / refresh token / client secret / private key。
- real viewer identifier。
- raw YouTube comment / live chat content。
- private account data。
- billing / payment info。
- secret-like values。

URL config は OBS再現性のための設定だけを持つ。event transportやqueue stateはURLの責務ではない。

## Local Intake Queue URL Boundary

local intake to queue connection の次段階でも、generated URL は config-only を維持する。

URLへ入れないもの:

- local intake payload。
- normalized event payload。
- queue state。
- queue length / current index。
- queue schedule state。
- transport payload。
- event `eventId`。
- event `displayText`。
- `displayText` arrays。
- raw manual input text。
- raw fixture JSON。
- fixture event data。
- raw user JSON。
- unsupported sourceType input。
- API key / OAuth token / access token / refresh token / client secret / private key。
- real viewer identifier。
- raw YouTube comment / live chat content。
- private account data。
- billing / payment info。
- secret-like values。

local intake to queue helper は URL契約を広げない。raw local input は helper内で normalized event へ寄せるが、その payload や queue state は OBS再現用URLの責務にしない。

## Local Intake Overlay Runtime URL Boundary

local intake to overlay runtime connection の次段階でも、generated URL は config-only を維持する。

`demo=1` は public-safe display test flag であり、event payload や queue state を `c` へ入れる仕組みではない。

URLへ入れないもの:

- local intake payload。
- normalized event payload。
- queue state。
- queue length / current index。
- event `eventId`。
- event `displayText`。
- raw manual input text。
- raw fixture JSON。
- fixture event data。
- transport payload。
- raw `postMessage` payload。
- `BroadcastChannel` payload。
- `localStorage` transport state。
- API key / OAuth token / access token / refresh token / client secret / private key。
- real viewer identifier。
- raw YouTube comment / live chat content。
- secret-like values。

overlay runtime が `demo=1` を local intake helper と queue helper 経由へ寄せる場合も、URL契約を広げない。manual / fixture runtime connection、transport、fixture linkage は後続PRへ分ける。

## First Transport Decision URL Boundary

first transport decision 後も、generated URL は config-only を維持する。

次PR候補の same-window internal dispatch helper + tests でも、URLへ入れないもの:

- same-window internal dispatch payload。
- transport payload。
- normalized event payload。
- queue state。
- queue length / current index。
- manual input text。
- fixture event data。
- raw fixture JSON。
- raw user JSON。
- `displayText` arrays。
- raw `postMessage` payload。
- `BroadcastChannel` payload。
- `localStorage` transport state。
- API key / OAuth token / access token / refresh token / client secret / private key。
- real viewer identifier。
- raw YouTube comment / live chat content。
- private account data。
- secret-like values。

`postMessage`、`BroadcastChannel`、`localStorage` transport、external network transport を採用する場合も、URLをevent transportにしない。URLはvisual configとkeyword rulesの再現性契約に留める。

## Config Helper実装範囲

`assets/js/keyword-reaction-config.js` に、URL config の土台として次の helper を追加する。

- `DEFAULT_KEYWORD_REACTION_CONFIG`
- `normalizeKeywordReactionConfig`
- `encodeKeywordReactionConfig`
- `decodeKeywordReactionConfig`
- `parseKeywordReactionConfigFromQuery`

初期 helper は、`schemaVersion`、`overlayType`、`displayPattern`、`reactionStyle`、`intensity`、`keyword`、`matchMode` だけを保持する。unknown fields、secret-like fields、private account data、raw user data に相当する fields は保持しない。

`displayPattern` は URL config 語彙として `toast` / `ticker` / `badge` を受け付ける。ただし、現時点の overlay runtime はまだ static skeleton であり、ticker / badge 表示を実装済みとは扱わない。

`matchMode` は `contains` / `exact` を正規語彙とする。入力互換として `includes` は `contains` へ normalize する。

`intensity` は helper 上では `0` から `3` の連続値を許容する。初回 manual input UI は理解しやすさを優先し、`0` / `1` / `2` / `3` の整数stepだけを生成する。runtime は連続値にも耐えるが、初回UIが生成する値は整数にする。

## 語彙

URL config と fixture schema は次の語彙に寄せる。

| Term | Meaning |
|---|---|
| `schemaVersion` | config schema version。 |
| `overlayType` | Candidate A では `keyword-reaction`。 |
| `displayPattern` | visual pattern。初期実装は `toast`。後続候補は `ticker` / `badge`。 |
| `reactionStyle` | reaction visual style。候補は `spark` / `pulse` / `soft` / `none`。 |
| `intensity` | reaction animation / emphasis strength。 |
| `keyword` | matching target keyword。 |
| `matchMode` | matching mode。候補は `contains` / `exact`。 |

新規docsでは reaction visual style の呼び方を `reactionStyle` に揃える。

## `c` に入れてよいもの

encoded config に含めてよい候補:

- `schemaVersion`。
- `overlayType`: `keyword-reaction`。
- visual theme name。
- visual style tokens。
- `displayPattern`: 初期実装は `toast`。
- keyword rules。
- `matchMode`。
- behavior / timing。
- `reactionStyle`。
- `intensity`。
- safe inset / padding。
- recommended width / height。
- public-safe label text。
- 将来、stable public-safe built-in fixture id の参照。

## `c` に入れてはいけないもの

encoded config に含めてはいけないもの:

- API keys。
- OAuth tokens。
- access tokens / refresh tokens。
- client secrets。
- private keys。
- private account identifiers。
- real viewer identifiers。
- raw real chat / comment data。
- private dashboard values。
- billing / payment details。
- ユーザーが公開する意図のない personal data。
- manual input text。
- fixture event payloads。
- raw fixture JSON。
- `displayText` arrays。
- event payloads。
- event queue state。
- transport payloads。

## Manual / Fixture MVPでのURLモデル

Candidate A では configuration と runtime event input を分ける。

- URL config は visual settings と keyword rules を保持する。
- manual event text は runtime test input であり、初回 manual input + toast PR の generated OBS URL には入れない。
- generated URL は config-only とし、manual input text そのものを再現対象にしない。
- built-in synthetic fixture id は public-safe かつ stable な場合のみ参照してよい。
- pasted fixture JSON は大きくなりやすく、private data が混ざる危険もあるため、初期状態では share URL に encode しない。
- fixture playback は manual input + toast の次段階に分ける。

config outline:

```json
{
  "schemaVersion": 1,
  "overlayType": "keyword-reaction",
  "displayPattern": "toast",
  "theme": "soda",
  "rules": [
    {
      "id": "rule-1",
      "keyword": "hello",
      "matchMode": "contains",
      "reactionStyle": "spark",
      "intensity": 1
    }
  ],
  "timing": {
    "durationMs": 2400,
    "cooldownMs": 800
  }
}
```

この sample は人工データであり、real viewer data を含まない。

config-aware overlay runtime skeleton では、上記のような config fields を読むだけに留める。fixture event data、manual input text、raw JSON、`displayText` arrays は `c` に入れず、overlay本体も読まない。

## Keyword Normalization

初回は最小の matching から始める。

- 英数字は case-insensitive を対象にする。
- 日本語は完全一致または単純包含から始める。
- 全角半角 normalization は初回MVPでは未実装または後続検討。
- かな / カナ normalization は初回MVPでは未実装または後続検討。
- Unicode normalization は初回MVPでは未実装または後続検討。

この文書は日本語 normalization が実装済みであることを示さない。

## URL長とfallback

想定される制約:

- keyword rules は増えやすい。
- visual themes は config fields を増やす。
- pasted fixture data は URL を長くしすぎる。
- OBS Browser Source setup は copy しやすく復元しやすい必要がある。

fallback候補:

- defaults を省略する compact encoding。
- 大きい config 用の import/export textarea。
- maximum length を超えた場合の safe error state。
- editor draft storage は convenience のみで、overlay playback の必須条件にしない。

import/export は初回 manual input + toast PR の必須範囲にしない。config encode/decode と safe fallback が安定した後に追加する。

## 時計ツールとの共通化候補

Candidate A が reuse または mirror できるもの:

- base64url JSON config。
- `schemaVersion`。
- default omission。
- safe default normalization。
- full URL / query string / config value からの import。
- generated URL を OBS source of truth とする考え方。
- invalid config fallback の tests。

ただし、shape が固まる前に共通化しすぎない。最初の route/static skeleton では、reuse が複雑さを減らすのか、早すぎる結合を生むのかを確認する。

## 未確定事項

- keyword-specific route でも `overlayType` を encode するか。
- keyword rules の数と長さにどの上限を置くか。
- `matchMode` の最終enum。
- `reactionStyle` の最終enum。
- built-in fixture IDs を stable public API とするか、QA helper に留めるか。
- import/export support を manual input + toast の直後に入れるか、fixture playback 後に入れるか。
