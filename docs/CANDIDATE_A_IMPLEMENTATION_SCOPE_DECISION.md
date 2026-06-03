# Candidate A Implementation Scope Decision

## Status

この文書は Candidate A: manual / fixture keyword reaction overlay の実装前スコープ固定記録です。

これは planning / implementation planning evidence です。Candidate A が実装済みであること、YouTube API 連携が承認済みであること、Codex for OSS 申請済みまたは採択済みであること、利用者が多数いることを示す証拠ではありません。

この決定は、最初の実装PRを小さくし、URL config と fixture schema の語彙を揃え、YouTube API / OAuth / API key / scraping / 実視聴者データ / 実コメントデータを引き続き非対象にするためのものです。

## 決定

### Path

Candidate A の overlay-only page は、初回実装方針として次の path を採用する。

```text
/overlay/keyword-reaction/?c=...
```

理由:

- keyword reaction overlay であることが URL から分かる。
- 汎用 `/overlay/` 契約を早く固定しすぎない。
- 将来 overlay suite が増えた場合でも衝突しにくい。

ただし、将来 suite 化が進み、複数 overlay type の navigation や shared route が必要になった場合は path 再編の可能性を残す。

### PR分割

Candidate A は次の順で小さく進める。

1. Route/static skeleton。
2. Manual input + toast。
3. Fixture playback。
4. Ticker / badge。
5. URL import/export refinement。
6. YouTube integration design。

この順序は、OBS Browser Source 向けの overlay surface と安全境界を先に固め、実YouTube連携やデータ取得に進む前にローカル・静的・人工入力だけで価値を検証するためのもの。

## First Implementation PR: Route/Static Skeleton

最初の実装PRは route/static skeleton のみを対象にする。

含めるもの:

- `/overlay/keyword-reaction/` の静的 HTML entry。
- overlay-only transparent surface。
- 最小CSS。
- safe default text の表示。
- clock editor とは独立した overlay-only surface。
- route / static assets / smoke tests の最小確認。

含めないもの:

- editor integration。
- manual input。
- fixture playback。
- generated URL editor。
- config import/export UI。
- YouTube API。
- OAuth。
- API key。
- scraping。
- live chat / comment fetching。
- 実視聴者データ、実コメントデータ、配信者データ。

### Route/Static Skeleton 完了条件

- `/overlay/keyword-reaction/` が 200 で開く。
- `body` margin が 0。
- page background が transparent。
- editor UI が出ない。
- safe default text だけが表示される。
- external network request がない。
- editor `localStorage` dependency がない。
- `innerHTML` を使わない。
- tests / build / local smoke が通る。
- `/clock/` と `/clock/?c=...` の既存契約を変えない。

初回 skeleton では `c` parser は未実装または最小 fallback でよい。`c` contract の完成は manual input + toast 以降の実装で扱う。

## Second Implementation PR: Manual Input + Toast

route/static skeleton の次は manual input + toast を優先する。

含めるもの:

- editor から人工テキストを入力できる。
- keyword に一致したら toast 表示する。
- toast は短時間表示され、配信画面を恒久的に覆わない。
- generated URL で visual config と keyword rules が再現できる。
- user-provided text は HTML ではなく text として扱う。
- no YouTube API / no OAuth / no API key / no real data を維持する。

含めないもの:

- fixture playback。
- ticker。
- badge。
- YouTube integration。
- live chat / comment fetching。
- OAuth login。
- API key storage。
- raw real comments。

### Manual Input + Toast 完了条件

- editor から人工テキストを入力できる。
- keyword に一致したら toast が表示される。
- generated URL で設定が再現できる。
- 実YouTubeデータを使わない。
- API / OAuth / key を使わない。
- text-not-HTML tests が通る。
- 390px / 768px / 1280px で editor が破綻しない。
- OBS Browser Source で overlay-only page が透明背景として確認できる。

## Fixture Playback の位置づけ

fixture playback は manual input + toast の次段階に分ける。

理由:

- route、transparent surface、toast behavior、config reproducibility を先に安定させる。
- fixture schema validation と playback timing は別の複雑さを持つ。
- fixture は public-safe synthetic data だけを使う必要がある。

fixture playback PR では、built-in synthetic fixture または pasted synthetic JSON の扱いを別途決める。実視聴者名、実コメント、channel ID、private dashboard、API token、OAuth token、raw user data は fixture に含めない。

## Ticker / Badge の位置づけ

`displayPattern` は `toast` / `ticker` / `badge` を語彙として持つが、初回の実装対象は `toast` に絞る。

- `ticker` は repeated events と相性がよいが、queueing / overflow / readability の仕様が増える。
- `badge` は低密度表示に向くが、count / reset behavior の仕様が必要になる。

どちらも toast が安定した後の follow-up とする。

## Import / Export の位置づけ

import/export は初回 manual input + toast PR の必須範囲にしない。

まずは generated URL の config encode/decode と safe fallback を安定させる。full URL import、query string import、config-only import、large config fallback は後続で扱う。

## Keyword Normalization 初期方針

初回は最小の matching から始める。

- 英数字は case-insensitive を対象にする。
- 日本語は完全一致または単純包含から始める。
- 全角半角 normalization は初回MVPでは未実装または後続検討。
- かな / カナ normalization は初回MVPでは未実装または後続検討。
- Unicode normalization は初回MVPでは未実装または後続検討。

日本語 normalization を実装済み、YouTube chat 向けに十分、または policy compliant と書かない。

## 語彙統一

URL config と fixture schema は次の語彙に寄せる。

| Term | Meaning |
|---|---|
| `schemaVersion` | config / fixture schema の version。 |
| `overlayType` | overlay kind。Candidate A では `keyword-reaction`。 |
| `displayPattern` | visual pattern。初期実装は `toast`、後続候補は `ticker` / `badge`。 |
| `reactionStyle` | reaction visual style。候補は `spark` / `pulse` / `soft` / `none` など。 |
| `intensity` | animation / emphasis strength。 |
| `keyword` | matching target keyword。 |
| `matchMode` | matching mode。候補は `contains` / `exact` など。 |

旧draftで分かれていた reaction visual style の呼び方は `reactionStyle` に寄せる。既存draft内の例もこの語彙へ更新する。

## Non-Goals

- YouTube API integration。
- YouTube API key 作成。
- OAuth login / token entry。
- scraping。
- live chat / comment fetching。
- real viewer / commenter / broadcaster data。
- moderation / author-centric browsing。
- backend persistence。
- external sending。
- Codex for OSS application submission。
- production deploy。
- Cloudflare dashboard/API 操作。

## 未確定事項

- Candidate A を長期的にこの repository に置くか、将来 suite / umbrella repository に分けるか。
- `matchMode` の最終enum。
- `reactionStyle` の最終enum。
- toast animation duration / queueing / cooldown の細部。
- fixture playback で built-in fixture と pasted JSON のどちらを先に扱うか。
- import/export の最小UIと長いconfigのfallback。
- 実YouTube integration を扱う場合の official documentation review、credential storage、quota/cost、privacy、data deletion / revocation 設計。
