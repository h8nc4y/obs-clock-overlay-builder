# Candidate A URL Contract Draft

## Status

この文書は Candidate A keyword reaction overlay のURL再現性契約案です。

この文書では route を実装しません。Candidate A の初回実装方針として `/overlay/keyword-reaction/?c=...` を採用するが、将来 overlay suite 化が進んだ場合は path 再編の可能性を残す。

関連するスコープ固定記録: [CANDIDATE_A_IMPLEMENTATION_SCOPE_DECISION.md](CANDIDATE_A_IMPLEMENTATION_SCOPE_DECISION.md)

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

## Manual / Fixture MVPでのURLモデル

Candidate A では configuration と runtime event input を分ける。

- URL config は visual settings と keyword rules を保持する。
- manual event text は runtime test input であり、generated OBS URL に入れる必要はない。
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
  },
  "fixture": {
    "mode": "built-in",
    "id": "synthetic-basic"
  }
}
```

この sample は人工データであり、real viewer data を含まない。

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
