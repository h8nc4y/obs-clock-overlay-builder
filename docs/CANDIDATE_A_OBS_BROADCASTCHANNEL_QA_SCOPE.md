# Candidate A OBS Browser Source BroadcastChannel QA Scope

## Status

この文書は Candidate A: keyword reaction overlay の overlay本体fixture transport で `BroadcastChannel` を実装する前に、OBS Browser Source 上で何を確認するかを固定する docs / static QA 記録です。

これは implementation planning evidence です。`BroadcastChannel` runtime、`postMessage`、`localStorage` transport、overlay本体fixture transport、paste JSON import、YouTube API integration、OAuth、API key、scraping、実データ取得、deploy、Cloudflare操作、Codex for OSS 申請を実装または承認するものではありません。

関連:

- [CANDIDATE_A_BROADCASTCHANNEL_FEASIBILITY.md](CANDIDATE_A_BROADCASTCHANNEL_FEASIBILITY.md)
- [CANDIDATE_A_OBS_BROADCASTCHANNEL_HUMAN_QA_PACKET.md](CANDIDATE_A_OBS_BROADCASTCHANNEL_HUMAN_QA_PACKET.md)
- [CANDIDATE_A_OVERLAY_FIXTURE_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_FIXTURE_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_SECURITY_AND_QA_PLAN.md](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- [CANDIDATE_A_URL_CONTRACT_DRAFT.md](CANDIDATE_A_URL_CONTRACT_DRAFT.md)
- [CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md](CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md)

## Purpose

PR #70 で `BroadcastChannel` は overlay本体fixture transport の有力候補だが、OBS Browser Source 固有の availability / reload / lifecycle / multi-source behavior は未確認とした。

この文書の目的:

- OBS Browser Source で確認すべき `BroadcastChannel` QA項目を固定する。
- 人間が OBS で確認する範囲と、Codex が local browser / static checks で確認できる範囲を分ける。
- `BroadcastChannel` 実装前に pass / fail 基準と fail 時の停止手順を固定する。
- generated URL config-only 境界を維持する。
- fixture event data、event payload、queue state、transport payload を URLへ入れない方針を維持する。
- synthetic fixture / demo event のみでQAし、real YouTube data、real viewer data、raw comment data を扱わない。

## Human QA Packet Handoff

この文書は「何を確認するか」を固定する scope record であり、[CANDIDATE_A_OBS_BROADCASTCHANNEL_HUMAN_QA_PACKET.md](CANDIDATE_A_OBS_BROADCASTCHANNEL_HUMAN_QA_PACKET.md) は人間が OBS Browser Source で実施して結果を貼り戻すための checklist / result template である。

人間QA packet は OBS QA 実施済み evidence ではない。Codex は OBS を起動・操作しない。packet の PASS は即実装承認ではなく、限定prototype scope decision へ進むための入力に留める。

## Why This Is Not Implementation

この段階では `BroadcastChannel` を作らない。

理由:

- OBS Browser Source は通常ブラウザと異なる lifecycle / reload / visibility 設定を持つ可能性がある。
- same-origin に見えるURLでも、OBS Browser Source側の storage key / process / CEF behavior が通常ブラウザと同じとは未確認。
- channel cleanup を誤ると stale listener、duplicate delivery、古いfixture event表示が起き得る。
- channel name / payload 設計を誤ると、fixture event data、secret-like value、transport payload が URL / debug / console / storage 相当に漏れる可能性がある。

そのため、次のruntime PRへ進む前に OBS QA scope を固定する。

## QA Data Boundary

QAで使ってよいもの:

- built-in artificial fixture event。
- `demo=1` の fixed synthetic event。
- public-safe `eventId` / `displayText` / `reactionStyle` / `intensity` / `offsetMs`。
- generated URL の config fields。
- local server または production URL の public static app。

QAで使わないもの:

- real YouTube comment / live chat data。
- real viewer identifier。
- manual input text from an actual viewer。
- raw fixture JSON。
- pasted JSON import。
- queue state。
- raw transport payload。
- API key / OAuth token / access token / refresh token / client secret / private key。
- secret-like values。
- private account data。
- billing / payment info。

## Human OBS QA Scope

OBS Browser Source でのみ確認する項目:

1. `BroadcastChannel` availability。
   - OBS Browser Source の overlay page context で constructor が存在するか。
   - availability がない場合は実装へ進まず、結果をdocsへ追記する。

2. channel open / close。
   - receiver mount相当で channel を open できるか。
   - receiver cleanup相当で `close()` できるか。
   - close後に duplicate delivery が起きないか。

3. reload後の listener cleanup。
   - Browser Source reload 後に古いlistenerが残らないか。
   - reload直後に stale fixture event が表示されないか。

4. scene切替 / source再読み込み。
   - scene切替で source が非表示になった場合のchannel lifetime。
   - source再読み込み後に再接続できるか。
   - "Shutdown source when not visible" や "Refresh browser source when scene becomes active" 相当設定で破綻しないか。

5. 複数Browser Sourceの channel 分離。
   - 同一channel名で複数overlayが同時受信するか。
   - 将来、overlayごとの public-safe routing key が必要か。
   - 意図しないoverlayへfixture eventが届かない設計にできるか。

6. 通常ブラウザtabとの通信可否。
   - editor側通常ブラウザtabとOBS Browser Source overlayが同じ origin として通信できるか。
   - production URL と local server URL で結果が変わるか。

7. page hidden / visible。
   - Browser Sourceの表示/非表示、scene active/inactiveで delivery / cleanup がどう変わるか。
   - hidden状態でキューされた古いeventがvisible時にまとめて表示されないか。

8. stale listener / duplicate delivery。
   - repeated reload、scene切替、source再作成後に1eventが複数回表示されないか。
   - stop/reset相当の操作後に古いtimerやlistenerが残らないか。

## Codex-Checkable Scope

Codex がこのrepo内で確認できる項目:

- docs に OBS Browser Source固有の未確認事項が未確認として記録されていること。
- runtime / helper modules に `BroadcastChannel`、`postMessage`、`localStorage` transport、external network transport が混入していないこと。
- generated URL helper が fixture event data、event payload、queue state、transport payload を扱わないこと。
- fixture linkage readiness helper が DOM / storage / network / transport に依存しないこと。
- unsafe sink (`innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler) が入っていないこと。
- docs / tests のみのPRで app behavior が変わらないこと。

Codex が今回確認しない項目:

- OBSアプリの起動。
- OBS Browser Sourceの実測。
- Cloudflare dashboard / API。
- production deploy。
- external network transport。
- YouTube API / OAuth / API key / real data。

## Local Browser QA Scope

local browser で後続prototype時に確認できる項目:

- `BroadcastChannel` が通常ブラウザtab間で使えるか。
- same-origin local server URL同士で synthetic fixture event candidate が届くか。
- channel close 後に delivery されないか。
- reload後に stale event が出ないか。
- console error/warn が出ないか。
- app由来の unexpected network が出ないか。
- generated URL が config-only のままか。

local browser だけでは確認済みにしない項目:

- OBS Browser Source上の availability。
- OBS Browser Sourceの visibility / shutdown / refresh behavior。
- OBS Browser Sourceと通常ブラウザtab間の channel sharing。
- 複数OBS Browser Sourceでの同時受信と分離。

## URL Boundary

generated URL は config-only を維持する。

URLへ入れないもの:

- `BroadcastChannel` payload。
- transport payload。
- fixture event data。
- event payload。
- local intake payload。
- queue state。
- event `eventId`。
- event `displayText`。
- raw fixture JSON。
- pasted fixture JSON。
- raw `c`。
- API key / OAuth token / secret-like values。
- real viewer id。
- raw comment data。

URLはOBS再現用configのsource of truthであり、event transportではない。

## Debug And Rendering Boundary

- debug/status は public-safe status に限定する。
- raw channel payload、raw fixture data、manual input text、keyword実値、secret-like values を debug/status/DOM/console へ出さない。
- 表示するtextは `textContent` など safe DOM API で扱う。
- HTML-like text は inert text として扱う。
- `innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler は使わない。

## Local Server QA Notes

後続prototypeで local server を使う場合:

- foreground dev serverは禁止。
- serverはbackgroundで起動し、PIDとlog pathを記録する。
- health checkはbounded retryにする。
- QA後はserverを停止する。
- local server URL と production URL の結果を混同しない。
- deployやCloudflare設定変更は行わない。

## Pass Criteria

`BroadcastChannel` prototype または overlay本体fixture transport実装へ進む前に、少なくとも次を満たす。

- OBS Browser Sourceで `BroadcastChannel` availability が確認される。
- 通常ブラウザtabとOBS Browser Source overlay間で same-origin channel sharing が確認される。
- reload / scene切替 / source再読み込み後に stale event が表示されない。
- repeated reload / repeated subscribe で duplicate delivery がない。
- 複数Browser Source時の配送範囲が理解され、必要なら public-safe routing key 方針が固定される。
- generated URL config-only が維持される。
- fixture event data / event payload / queue state / transport payload はURLへ入らない。
- raw payload / raw fixture data / secret-like values は debug/status/DOM/consoleへ出ない。
- no localStorage transport。
- no external network transport。
- no YouTube API / no OAuth / no API key / no real data。

## Fail Criteria And Next Step

次のいずれかに該当した場合は、`BroadcastChannel` 実装へ進まない。

- OBS Browser Sourceで `BroadcastChannel` constructor が使えない。
- 通常ブラウザtabとOBS Browser Source overlay間で channel sharing が成立しない。
- reload / scene切替で stale listener または duplicate delivery が残る。
- fixture event dataやtransport payloadをURLへ入れないと成立しない。
- raw payloadやsecret-like valuesをdebug/statusへ出さないと診断できない。
- localStorage transportやexternal network transportが必要になる。
- YouTube API / OAuth / API key / real data が必要になる。

fail時の最小手順:

1. 実装PRを止める。
2. OBS QA結果をdocsへ追記する。
3. `postMessage` feasibility、same-window限定、または no transport継続を再比較する。
4. generated URL config-only と text-not-HTML 方針を維持する。

## Non-Goals

- `BroadcastChannel` implementation。
- `postMessage` implementation。
- `localStorage` transport。
- overlay本体fixture transport。
- paste JSON import。
- event source runtime。
- external network transport。
- Cloudflare deploy / dashboard / API operation。
- OBS操作。
- YouTube API integration。
- OAuth login。
- API key creation or storage。
- scraping。
- 実視聴者データ。
- 実コメントデータ。
- Codex for OSS application submission。

## Follow-Up Split

後続PRへ分けるもの:

1. OBS BroadcastChannel QA scope。この文書。
2. OBS BroadcastChannel human QA packet。
3. OBS Browser Source human QA result docs、または local browser prototype scope decision。
4. `BroadcastChannel` design / prototype only after OBS QA result is recorded。
5. overlay本体fixture transport implementation only after transport candidate and QA pass criteria are fixed。
6. `postMessage` feasibility if `BroadcastChannel` fails or remains ambiguous。
7. paste JSON import design and validation。
8. YouTube integration design after official docs review, data boundary review, and human approval。

## Open Questions

- OBS Browser Source と通常ブラウザtabが同じ origin / storage key として扱われるか。
- scene visibility / source shutdown時に channel close が必ず呼べるか。
- 複数Browser Sourceへ同じ fixture event を同報してよいか。
- channel name に public-safe routing key が必要か。
- local browser prototype を先に作るか、人間OBS QA結果docsを先に作るか。
