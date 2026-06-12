# Candidate A Limited BroadcastChannel Prototype Scope Decision

## Status

この文書は Candidate A: keyword reaction overlay の overlay本体fixture transport 実装へ進む前に、限定的な `BroadcastChannel` prototype の範囲を固定する docs-only scope decision です。

OBS Browser Source human QA は [CANDIDATE_A_OBS_BROADCASTCHANNEL_HUMAN_QA_RESULT.md](CANDIDATE_A_OBS_BROADCASTCHANNEL_HUMAN_QA_RESULT.md) で PASS と記録された。ただし、この文書は `BroadcastChannel` runtime、`postMessage`、`localStorage` transport、overlay本体fixture transport、paste JSON import、YouTube API integration、OAuth、API key、scraping、実データ取得、deploy、Cloudflare操作、Codex for OSS 申請を実装または承認するものではありません。

Limited prototype の実装結果は [CANDIDATE_A_LIMITED_BROADCASTCHANNEL_PROTOTYPE_RESULT.md](CANDIDATE_A_LIMITED_BROADCASTCHANNEL_PROTOTYPE_RESULT.md) に記録した。この結果も production transport や外部データ連携を承認しない。

## Decision

判断: **次の実装候補は limited BroadcastChannel prototype に限定する**。

この prototype は production transport ではない。目的は OBS Browser Source PASS 結果を踏まえ、repo内で安全に `BroadcastChannel` の channel boundary、payload boundary、cleanup boundary、URL boundary を最小検証することに限定する。

## Prototype Scope

将来の prototype PR で許可する候補:

- fixed public-safe channel name。
- synthetic fixture/demo candidate のみ。
- sender / receiver の明示的な setup / cleanup。
- `BroadcastChannel.close()` の cleanup。
- duplicate delivery / stale listener を検出する focused tests。
- invalid payload の safe reject。
- payload を existing local intake / normalized event boundary へ寄せる helper。
- generated URL config-only を守る static tests。
- raw payload、fixture event data、queue state、secret-like values を debug/status/DOM/consoleへ出さない static tests。
- local browser smoke または bounded local server verification。

将来の prototype PR でも禁止するもの:

- production overlay本体fixture transport として扱うこと。
- editor fixture UI から production overlay へ送る本接続。
- paste JSON import。
- `postMessage`。
- `localStorage` transport。
- external network transport。
- YouTube API / OAuth / API key / scraping / real data。
- generated URL への event payload / fixture event data / queue state / transport payload 混入。
- raw payload や secret-like values の debug/status/DOM/console 表示。

## Channel Boundary

- channel name は public-safe fixed namespace から始める。
- channel name に user input、keyword実値、fixture id、event id、manual input text、secret-like value を混ぜない。
- routing key が必要な場合も public-safeで、URL/event payload/raw dataから派生させない。
- invalid channel setup は public-safe status または safe reject とし、raw値を出さない。

## Payload Boundary

prototype payload は最小にする。

候補:

- message type。
- schemaVersion。
- `sourceType: "fixture"` または `sourceType: "demo"`。
- normalized event または local intake input candidate。
- public-safe `displayText`。
- bounded style/duration fields。

入れないもの:

- raw fixture JSON。
- pasted JSON。
- unknown fixture fields。
- queue state。
- generated URL。
- raw `c`。
- keyword実値。
- manual input text。
- API key / OAuth token / access token / refresh token / client secret / private key。
- real viewer identifier。
- raw YouTube comment / live chat content。
- private account data。
- billing / payment info。
- secret-like values。

## URL Boundary

generated URL は config-only を維持する。

URLへ入れないもの:

- `BroadcastChannel` payload。
- fixture event data。
- event payload。
- queue state。
- transport payload。
- raw fixture JSON。
- pasted fixture JSON。
- `displayText` arrays。
- secret-like values。
- API key / OAuth token。
- real viewer / raw comment data。

URLはOBS再現用configのsource of truthであり、event transportではない。

## Rendering And Debug Boundary

- 表示する text は `textContent` など safe DOM API で扱う。
- HTML-like text は inert text として扱う。
- `innerHTML`、`insertAdjacentHTML`、`eval`、`new Function`、`document.write`、inline event handler は使わない。
- debug/status は public-safe status に限定する。
- raw channel payload、raw fixture data、manual input text、keyword実値、secret-like values を debug/status/DOM/console へ出さない。

## Cleanup And Lifecycle Boundary

prototype では少なくとも次を確認対象にする:

- receiver setup 後に expected single delivery が成立する。
- receiver cleanup 後に later delivery が届かない。
- sender cleanup 後に later delivery が発生しない。
- repeated setup / cleanup で duplicate delivery が起きない。
- reload / remount 相当で stale listener が残らない。
- `setInterval` や unbounded loop を使わない。
- timer が必要な場合は bounded `setTimeout` と明示cleanupに限定する。

## Validation Expectations For Future Prototype

将来の prototype PR では少なくとも次を確認する:

- focused node tests。
- static scan for no `postMessage` / no `localStorage` transport / no external network。
- static scan for no unsafe HTML sinks。
- generated URL config-only tests。
- duplicate delivery / stale listener cleanup tests。
- invalid payload safe reject tests。
- `npm run format:check`。
- `git diff --check`。
- `npm run lint`。
- `npm run typecheck`。
- `npm test`。
- `npm run build`。

## Non-Goals

- production `BroadcastChannel` transport。
- overlay本体fixture transport。
- editor fixture UI から production overlay への本接続。
- `postMessage` implementation。
- `localStorage` transport。
- external network transport。
- paste JSON import。
- event source runtime。
- toast queue runtime for multiple real sources。
- ticker / badge runtime。
- YouTube API integration。
- OAuth login。
- API key creation or storage。
- scraping。
- 実視聴者データ。
- 実コメントデータ。
- deploy。
- Cloudflare dashboard/API operation。
- Codex for OSS application submission。

## Follow-Up Split

後続PRへ分けるもの:

1. limited BroadcastChannel prototype implementation, if scoped as above。
2. prototype result docs / QA notes。記録先: [CANDIDATE_A_LIMITED_BROADCASTCHANNEL_PROTOTYPE_RESULT.md](CANDIDATE_A_LIMITED_BROADCASTCHANNEL_PROTOTYPE_RESULT.md)
3. overlay本体fixture transport scope decision after prototype result。
4. overlay本体fixture transport implementation only after prototype result and transport scope are stable。
5. `postMessage` comparison only if `BroadcastChannel` prototype fails or remains ambiguous。
6. paste JSON import design and validation。
7. YouTube integration design after official docs review, data boundary review, and human approval。
