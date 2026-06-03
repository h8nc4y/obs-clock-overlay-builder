# Candidate A URL Contract Draft

## Status

この文書は Candidate A keyword reaction overlay のURL再現性契約案です。

この文書では route を実装しません。`/overlay/`、`/overlay/?c=...`、その他の path は候補にすぎません。

## 契約の目的

- OBS setup を generated URL から再現できるようにする。
- overlay-only playback を editor localStorage から独立させる。
- visual configuration と keyword rules を encode し、credentials や real user data を encode しない。
- missing / invalid / unsupported / too-long config を safe defaults へ normalize する。
- 時計ツールと同じく、generated overlay URL を OBS の source of truth として扱う。

## Path候補

### Option A: `/overlay/?c=...`

利点:

- 短く説明しやすい。
- 将来の overlay suite entry point として使いやすい。

リスク:

- overlay type が増えたときに曖昧になる。
- 将来は config 内の type field が必要になる。

### Option B: `/overlay/keyword-reaction/?c=...`

利点:

- 目的が明確。
- future overlay types と衝突しにくい。
- MVP docs と実装レビューで説明しやすい。

リスク:

- URL が長くなる。
- suite navigation は将来別に必要になる可能性がある。

### Option C: `/reaction/?c=...`

利点:

- 短く、MVPとしては具体的。

リスク:

- overlay suite の一部であることが伝わりにくい。
- 将来の broader reaction tools と衝突する可能性がある。

## 初期推奨

初回実装案では `/overlay/keyword-reaction/?c=...` を推奨する。

理由:

- reviewer と OBS user に用途が伝わりやすい。
- 汎用 `/overlay/` 契約を早く固定しすぎない。
- 将来 suite に含める余地を残せる。

これは最終決定ではない。実装PRの前に route 構造を再確認する。

## `c` に入れてよいもの

encoded config に含めてよい候補:

- schema version。
- overlay type、例: `keyword-reaction`。
- theme name。
- visual style tokens。
- display pattern、初期候補は `toast`。
- keyword rules。
- matching mode。
- behavior / timing。
- animation intensity。
- safe inset / padding。
- recommended width / height。
- synthetic demo fixture の reference mode。
- public-safe label text。

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

Candidate A では configuration と event input を分ける。

- URL config は visual settings と keyword rules を保持する。
- manual event text は runtime test input であり、generated OBS URL に入れる必要はない。
- built-in synthetic fixture name は public-safe かつ stable な場合のみ参照してよい。
- pasted fixture JSON は大きくなりやすく、private data が混ざる危険もあるため、初期状態では share URL に encode しない。

config outline:

```json
{
  "v": 1,
  "type": "keyword-reaction",
  "pattern": "toast",
  "theme": "soda",
  "rules": [
    {
      "id": "rule-1",
      "keyword": "hello",
      "match": "contains",
      "reaction": "spark"
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

## 時計ツールとの共通化候補

Candidate A が reuse または mirror できるもの:

- base64url JSON config。
- schema version。
- default omission。
- safe default normalization。
- full URL / query string / config value からの import。
- generated URL を OBS source of truth とする考え方。
- invalid config fallback の tests。

ただし、shape が固まる前に共通化しすぎない。最初の実装PRでは、reuse が複雑さを減らすのか、早すぎる結合を生むのかを確認する。

## 未確定事項

- route が keyword-specific でも overlay type を encode するか。
- keyword rules の数と長さにどの上限を置くか。
- 初回MVPで日本語 normalization を扱うか、後続に送るか。
- built-in fixture IDs を stable public API とするか、QA helper に留めるか。
- import/export support を初回MVPに含めるか、manual input の後にするか。
