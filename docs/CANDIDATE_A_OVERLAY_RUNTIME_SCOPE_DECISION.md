# Candidate A Overlay Runtime Scope Decision

## Status

この文書は Candidate A: keyword reaction overlay の次段階である `/overlay/keyword-reaction/` overlay runtime のスコープ固定記録です。

これは docs-only の implementation planning evidence です。overlay runtime、event source、fixture linkage、YouTube API integration、OAuth、API key、scraping、実データ取得、deploy、Codex for OSS 申請を実装または承認するものではありません。

関連:

- [CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md](CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md)
- [CANDIDATE_A_URL_CONTRACT_DRAFT.md](CANDIDATE_A_URL_CONTRACT_DRAFT.md)
- [CANDIDATE_A_FIXTURE_PLAYBACK_SCOPE_DECISION.md](CANDIDATE_A_FIXTURE_PLAYBACK_SCOPE_DECISION.md)
- [CANDIDATE_A_FIXTURE_SCHEMA_DRAFT.md](CANDIDATE_A_FIXTURE_SCHEMA_DRAFT.md)
- [CANDIDATE_A_SINGLE_SYNTHETIC_EVENT_SCOPE_DECISION.md](CANDIDATE_A_SINGLE_SYNTHETIC_EVENT_SCOPE_DECISION.md)
- [CANDIDATE_A_SECURITY_AND_QA_PLAN.md](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- [YOUTUBE_DATA_POLICY_BOUNDARY.md](YOUTUBE_DATA_POLICY_BOUNDARY.md)

## Purpose

次の実装PRでは、現在 transparent static skeleton である `/overlay/keyword-reaction/` を config-aware な overlay runtime skeleton に進める。

目的は、OBS Browser Source で開かれる overlay-only page が generated URL の `?c=...` を読めるようにし、将来の event rendering の前に URL、fallback、debug、transparent idle、text-not-HTML の境界を固定することです。

## Post-PR #44 Boundary

PR #44 で config-aware overlay runtime skeleton は実装済みです。

現時点で実装済みと扱うもの:

- `/overlay/keyword-reaction/` が `?c=...` を読み、既存 helper で safe normalized config へ寄せる。
- 通常 idle は transparent / no visible text。
- `debug=1` の時だけ public-safe status を表示する。
- raw `c`、keyword実値、manual input text、fixture event data、secret-like value を debug 表示しない。

次段階は [CANDIDATE_A_SINGLE_SYNTHETIC_EVENT_SCOPE_DECISION.md](CANDIDATE_A_SINGLE_SYNTHETIC_EVENT_SCOPE_DECISION.md) で固定する single synthetic event rendering です。

次段階で扱う `demo=1` は public-safe demo flag であり、event source、fixture linkage、YouTube integration ではありません。通常 idle は引き続き transparent / no visible text とする。

## Next Implementation PR Scope

次の実装PRは config-aware overlay runtime skeleton に限定する。

入れてよいもの:

- `/overlay/keyword-reaction/` が `?c=...` を読む。
- `assets/js/keyword-reaction-config.js` の helper で config を normalize する。
- `schemaVersion`、`overlayType`、`displayPattern`、`reactionStyle`、`intensity`、`keyword`、`matchMode` の safe normalized config を runtime state として持つ。
- invalid / missing `c` は safe default へ fallback する。
- idle時は基本透明で何も表示しない。
- `debug=1` のような明示的な debug query がある場合だけ、小さな status text を表示する。
- editor UI、manual input text、fixture event data、raw JSON を読まないことを tests / static checks / manual QA で確認する。

入れないもの:

- toast event発火runtime。
- event queue。
- fixture event playback。
- editor preview の fixture を overlay本体へ流す仕組み。
- paste JSON import。
- fixture file保存。
- ticker runtime。
- badge runtime。
- import/export UI。
- YouTube API / OAuth / API key / scraping / real data。

## Config-Aware Overlay Runtime Skeleton

config-aware overlay runtime skeleton とは、overlay本体が visual/event rendering を始める前の最小runtimeです。

この段階の責務:

- URL query から `c` を読む。
- config helper で safe default / normalized config に寄せる。
- overlay page contract を守る。
- debug mode の有無で status 表示を切り替える。
- invalid config fallback 時に入力実値や secret-like value を画面、DOM、console、URLへ出さない。

この段階で event text を表示しないため、keyword match や reaction animation の正しさは editor preview と helper tests の範囲に留める。

## Idle Display Policy

OBS向け overlay は、イベントがない時に配信画面を邪魔しないことを優先する。

採用方針:

- 通常 idle: transparent / no visible text。
- debug idle: `debug=1` のような明示queryがある場合だけ、小さく `Keyword reaction overlay ready` 相当の status を出す。
- debug 表示はOBS本番利用の既定ではない。
- debug 表示にも private data、secret-like value、raw config value を出さない。

safe default text を常時表示し続ける案は、OBS画面の邪魔になりやすいため初回runtimeでは採用しない。

## Debug / Status Display Policy

debug/status 表示は local QA と reviewer 確認用に限定する。

表示してよいもの:

- overlay が読み込まれたこと。
- normalized `overlayType` や `displayPattern` のような public-safe enum。
- config が fallback されたことを示す generic status。

表示しないもの:

- raw `c` value。
- manual input text。
- fixture event data。
- `displayText` 配列。
- API key / OAuth token / secret-like value。
- real viewer id。
- raw comment data。
- private account data。

## Event Source Policy

次の実装PRでは event source を実装しない。

将来候補としてのみ整理する:

- editor preview 内の manual input。
- editor preview 内の built-in fixture playback。
- built-in fixture demo を overlay runtime へ接続する follow-up。
- same-origin local event channel。
- future YouTube integration。

event source を後続にする理由:

- runtime が config-only URL と transparent idle を安全に扱えることを先に確認するため。
- event text rendering は `textContent` 境界を別PRで重点レビューする必要があるため。
- fixture linkage と real integration を同じPRへ混ぜると、URL契約とdata boundaryが曖昧になるため。
- YouTube integration は official documentation review、人間承認、credential/data handling設計が必要なため。

## URL Config-Only Boundary

`/overlay/keyword-reaction/?c=...` は config-only を維持する。

`c` に入れてよいもの:

- `schemaVersion`
- `overlayType`
- `displayPattern`
- `reactionStyle`
- `intensity`
- `keyword`
- `matchMode`
- public-safe visual config

`c` に入れないもの:

- manual input text
- fixture event data
- raw fixture JSON
- raw user JSON
- `displayText` arrays
- API key
- OAuth token
- client secret
- private key
- real viewer id
- raw comment / live chat data
- private account data
- payment / billing data
- secret-like values

invalid `c` は safe default へ fallback する。fallback時も入力実値や secret-like value を画面、status、console、generated URL に出さない。

## Text-Not-HTML Policy

将来 overlay runtime が `event.displayText` を表示する場合も、必ず HTML ではなく text として扱う。

必須方針:

- DOMへ表示する時は `textContent` など safe DOM API を使う。
- `innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler は使わない。
- HTML-like text は inert text として表示する。
- style attribute や CSS custom property へ untrusted text を直接流さない。
- class名、dataset、style値は enum / bounded numeric / validated color など public-safe normalized values から作る。

この方針は次の実装PRの skeleton でも、後続の event rendering PR でも review blocker として扱う。

## Overlay Page Contract

`/overlay/keyword-reaction/` は OBS Browser Source 向け overlay-only page として次を守る。

- `body` margin 0。
- transparent background。
- editor UI なし。
- no editor `localStorage` dependency。
- no external network。
- no YouTube API。
- no OAuth。
- no API key。
- no scraping。
- no real viewer/comment data。
- no dependency additions。
- no backend storage。
- generated URL が source of truth。
- `/clock/` と `/clock/?c=...` へ影響しない。

## Non-Goals

- YouTube API integration。
- OAuth login。
- API key creation or storage。
- scraping。
- 実視聴者データ。
- 実コメントデータ。
- 実YouTube replay data。
- event source runtime。
- fixture event linkage。
- paste JSON import。
- fixture file保存。
- ticker / badge runtime。
- import/export UI。
- deploy。
- Codex for OSS application submission。

## Done Criteria For The Next Implementation PR

- `/overlay/keyword-reaction/?c=...` が safe normalized config を読む。
- missing / invalid `c` が safe default へ fallback する。
- 通常 idle は transparent / no visible text。
- `debug=1` の時だけ public-safe status を表示する。
- debug/status に raw config、manual input text、fixture event data、secret-like value を出さない。
- generated URL は config-only のまま。
- no event source / no fixture linkage / no toast event runtime。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- no external network / no localStorage dependency。
- no `innerHTML` / no unsafe sink。
- 390px / 768px / 1280px で unexpected horizontal scroll がない。
- `/clock/` と `/clock/?c=...` に回帰がない。
- validation が通る。

## Follow-Up Split

後続PRへ分けるもの:

1. overlay runtime event rendering for a single synthetic event shape, scoped by [CANDIDATE_A_SINGLE_SYNTHETIC_EVENT_SCOPE_DECISION.md](CANDIDATE_A_SINGLE_SYNTHETIC_EVENT_SCOPE_DECISION.md)。
2. built-in fixture linkage from safe artificial fixture to overlay runtime。
3. paste JSON import design and validation。
4. ticker / badge runtime。
5. import/export UI。
6. same-origin local event channel design。
7. YouTube integration design after boundary review and human approval。

## Open Questions

- `debug=1` の query名を最終的に `debug` にするか、`status` など別名にするか。
- debug status に normalized config のどの enum まで表示してよいか。
- idle時の DOM は完全空にするか、visually hidden status を残すか。
- 後続 event rendering PR の synthetic event shape を fixture schema と同一にするか、runtime event shape として分けるか。
- built-in fixture linkage を overlay runtime に入れる場合、URLへ `fixtureId` を入れるか、それとも editor-only QA に留めるか。
