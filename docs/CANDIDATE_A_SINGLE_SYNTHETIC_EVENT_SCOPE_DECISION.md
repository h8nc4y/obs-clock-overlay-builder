# Candidate A Single Synthetic Event Scope Decision

## Status

この文書は Candidate A: keyword reaction overlay の次段階である single synthetic event rendering のスコープ固定記録です。

これは docs-only の implementation planning evidence です。single synthetic event rendering、`demo=1` runtime、event source、fixture linkage、YouTube API integration、OAuth、API key、scraping、実データ取得、deploy、Codex for OSS 申請を実装または承認するものではありません。

関連:

- [CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md](CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md)
- [CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md](CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md)
- [CANDIDATE_A_URL_CONTRACT_DRAFT.md](CANDIDATE_A_URL_CONTRACT_DRAFT.md)
- [CANDIDATE_A_FIXTURE_PLAYBACK_SCOPE_DECISION.md](CANDIDATE_A_FIXTURE_PLAYBACK_SCOPE_DECISION.md)
- [CANDIDATE_A_SECURITY_AND_QA_PLAN.md](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- [YOUTUBE_DATA_POLICY_BOUNDARY.md](YOUTUBE_DATA_POLICY_BOUNDARY.md)

## Purpose

次の実装PRでは、PR #44 で追加された config-aware overlay runtime skeleton の後続として、`/overlay/keyword-reaction/` 本体で 1 件だけの人工イベントを表示できるようにする。

目的は、OBS Browser Source 上で toast 表示、transparent background、config 由来の `displayPattern` / `reactionStyle` / `intensity` 反映を安全に確認することです。

これは実YouTube連携、fixture playback、event source、real chat/comment rendering ではありません。

## Next Implementation PR Scope

次の実装PRは single synthetic event rendering に限定する。

入れてよいもの:

- `/overlay/keyword-reaction/` が `demo=1` を読む。
- `demo=1` の時だけ、コード内に固定された public-safe synthetic event を 1 件表示する。
- 通常 idle は引き続き transparent / no visible text。
- `debug=1` は既存どおり public-safe status 表示用として扱う。
- `demo=1` と `debug=1` が共存しても、raw値やsecret-like valueを表示しない。
- `displayPattern` は初回 `toast` のみを表示対象にする。
- `reactionStyle` / `intensity` は normalized config 由来の public-safe enum / bounded numeric として扱う。
- event text は `textContent` など safe DOM API で表示する。
- demo event の timer cleanup を行う。

入れないもの:

- event source。
- event queue。
- fixture event playback。
- built-in fixture を overlay本体へ流す仕組み。
- paste JSON import。
- ticker runtime。
- badge runtime。
- import/export UI。
- YouTube API / OAuth / API key / scraping / real data。

## `demo=1` Policy

`demo=1` は public-safe display test flag です。

`demo=1` の意味:

- OBS Browser Source 上で single synthetic event の見え方を確認する。
- 実YouTubeデータ、manual input text、fixture event data を使わない。
- URL config の `c` とは別の query flag として扱う。
- generated URL の config-only 境界を壊さない。

`demo=1` は event source ではありません。実装PRで polling、message channel、fixture playback、YouTube integration を追加しない。

## Event Shape Follow-Up

PR #46 で `demo=1` fixed synthetic event rendering は実装済みです。ただし、これは event source 実装ではなく public-safe display test flag として扱う。

次の event shape helper PR では、`demo=1` の固定人工eventも [CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md](CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md) の normalized event shape へ寄せる方針とする。

維持する境界:

- demo event text はコード内固定の人工データだけにする。
- `demo=1` は generated URL の `c` に入れない。
- demo event payload、raw `c`、keyword実値、manual input text、fixture event data、secret-like value を debug/status 表示に出さない。
- `demo` は `sourceType` の一候補だが、event transport や実データ入力を意味しない。

## `debug=1`との関係

`debug=1` は引き続き public-safe status 表示用です。

`demo=1` と `debug=1` は共存してよい。ただし表示してよい情報は次に限定する。

- overlay ready。
- config valid / fallback。
- `displayPattern` など public-safe enum。
- demo event が表示中または完了したことを示す generic status。

表示してはいけないもの:

- raw `c` value。
- keyword 実値。
- manual input text。
- fixture event data。
- synthetic event の raw payload。
- `displayText` arrays。
- secret-like value。
- real viewer id。
- raw comment / live chat data。
- private account data。

## Idle Display Policy

通常 `/overlay/keyword-reaction/` は引き続き transparent / no visible text とする。

表示が出る条件:

- `debug=1`: public-safe status。
- `demo=1`: public-safe synthetic event を短時間表示。

`demo=1` がない状態で demo event を自動表示しない。OBS本番利用で配信画面を邪魔しないことを優先する。

## Synthetic Event Content

synthetic event はコード内の固定人工データだけを使う。

候補:

```text
キーワード反応デモ
```

または:

```text
Keyword reaction demo
```

禁止:

- 実視聴者名に見える文字列。
- 実コメントに見える文字列。
- 実チャンネルID。
- 実配信由来に見える文脈。
- manual input text。
- fixture event data。
- URLや`c`に入った `displayText`。

## Display Pattern / Reaction Style / Intensity

初回表示対象は `displayPattern: "toast"` のみとする。

- `ticker` / `badge` は URL config 語彙として存在しても、このPRでは実装済み表示として扱わない。
- `reactionStyle` は `spark` / `pulse` / `soft` / `none` の normalized enum だけを使う。
- `intensity` は `0` から `3` の bounded numeric として扱う。
- style差分は最小でよい。config反映を確認できる程度に留める。
- 配信画面を覆いすぎない位置、サイズ、motionにする。

## Duration / Timer Cleanup Policy

demo event は短時間表示して消す。

初回候補:

- runtime内固定 duration: `2400ms` 程度。

初回PRでは既存 config model を不用意に広げない。`durationMs` を `c` に追加するかどうかは後続検討とし、まずは runtime 内固定値でよい。

必須:

- timer id を保持し、再mount / reload / cleanup時に古い timer が残らないようにする。
- demo終了後は transparent / no visible text へ戻る。
- debug表示がある場合も、secret-like値やraw値を出さない。

## Generated URL Config-Only Boundary

generated URL は config-only を維持する。

`demo=1` は表示確認用の public-safe flag であり、event data ではない。

`c` に入れないもの:

- synthetic event `displayText`。
- manual input text。
- fixture event data。
- raw fixture JSON。
- raw user JSON。
- `displayText` arrays。
- API key。
- OAuth token。
- client secret。
- private key。
- real viewer id。
- raw comment / live chat data。
- private account data。
- payment / billing data。
- secret-like values。

invalid `c` は safe default へ fallback する。fallback時も raw `c`、keyword実値、secret-like value を画面、status、console、generated URL に出さない。

## Text-Not-HTML Policy

synthetic event の表示も、将来のevent表示も、HTMLではなくtextとして扱う。

必須方針:

- DOMへ表示する時は `textContent` など safe DOM API を使う。
- `innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler は使わない。
- HTML-like text は inert text として表示する。
- style attribute や CSS custom property へ untrusted text を直接流さない。
- class名、dataset、style値は enum / bounded numeric / validated value だけから作る。

## Non-Goals

- YouTube API integration。
- OAuth login。
- API key creation or storage。
- scraping。
- 実視聴者データ。
- 実コメントデータ。
- event source runtime。
- fixture event linkage。
- fixture playback in overlay runtime。
- paste JSON import。
- ticker / badge runtime。
- import/export UI。
- NFKC / 全角半角 / かな / カナ normalization。
- deploy。
- Codex for OSS application submission。

## Done Criteria For The Next Implementation PR

- 通常 `/overlay/keyword-reaction/` は transparent / no visible text。
- `demo=1` の時だけ public-safe synthetic event を 1 件表示する。
- demo event は短時間表示後に消える。
- `debug=1` は public-safe status 表示に限定される。
- `demo=1` と `debug=1` が共存しても raw値、keyword実値、secret-like valueを出さない。
- generated URL は config-only のまま。
- no event source / no fixture linkage / no toast event queue。
- no ticker / no badge / no paste JSON import。
- no YouTube API / no OAuth / no API key / no scraping / no real data。
- no external network / no localStorage dependency。
- no `innerHTML` / no unsafe sink。
- 390px / 768px / 1280px で unexpected horizontal scroll がない。
- `/clock/` と `/clock/?c=...` に回帰がない。
- validation が通る。

## Follow-Up Split

後続PRへ分けるもの:

1. event source shape decision。
2. overlay runtime event rendering for more than one synthetic event。
3. built-in fixture linkage from safe artificial fixture to overlay runtime。
4. paste JSON import design and validation。
5. ticker / badge runtime。
6. import/export UI。
7. same-origin local event channel design。
8. YouTube integration design after boundary review and human approval。

## Open Questions

- synthetic event text を日本語にするか英語にするか。
- `demo=1` を generated URL UI から出すか、manual QA専用に留めるか。
- demo duration を runtime固定値にする期間。
- `displayPattern` が `ticker` / `badge` の config で `demo=1` が来た場合に toast fallback とするか、no-op とするか。
- demo event終了後に debug status を残すか、debug statusのみ残すか。
- 後続 event source shape を fixture schema と同一にするか、runtime event shape として分けるか。
