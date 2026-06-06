# Candidate A OBS BroadcastChannel Human QA Packet

## Status

この文書は Candidate A: keyword reaction overlay の overlay本体fixture transport で `BroadcastChannel` を実装する前に、人間が OBS Browser Source で確認するための実施パケットです。

これは human QA handoff / result template です。OBS QA を実施済みと記録するものではなく、`BroadcastChannel` runtime、`postMessage`、`localStorage` transport、overlay本体fixture transport、paste JSON import、YouTube API integration、OAuth、API key、scraping、実データ取得、deploy、Cloudflare操作、Codex for OSS 申請を実装または承認するものではありません。

関連:

- [CANDIDATE_A_OBS_BROADCASTCHANNEL_QA_SCOPE.md](CANDIDATE_A_OBS_BROADCASTCHANNEL_QA_SCOPE.md)
- [CANDIDATE_A_OBS_BROADCASTCHANNEL_HUMAN_QA_RESULT.md](CANDIDATE_A_OBS_BROADCASTCHANNEL_HUMAN_QA_RESULT.md)
- [CANDIDATE_A_BROADCASTCHANNEL_FEASIBILITY.md](CANDIDATE_A_BROADCASTCHANNEL_FEASIBILITY.md)
- [CANDIDATE_A_LIMITED_BROADCASTCHANNEL_PROTOTYPE_SCOPE_DECISION.md](CANDIDATE_A_LIMITED_BROADCASTCHANNEL_PROTOTYPE_SCOPE_DECISION.md)
- [CANDIDATE_A_OVERLAY_FIXTURE_TRANSPORT_SCOPE_DECISION.md](CANDIDATE_A_OVERLAY_FIXTURE_TRANSPORT_SCOPE_DECISION.md)
- [CANDIDATE_A_SECURITY_AND_QA_PLAN.md](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- [CANDIDATE_A_URL_CONTRACT_DRAFT.md](CANDIDATE_A_URL_CONTRACT_DRAFT.md)
- [CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md](CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md)

## Purpose

このパケットの目的:

- OBS Browser Source で `BroadcastChannel` を transport候補にできるか、人間が同じ観点で確認できるようにする。
- OBS version、OS、Browser Source設定、URL種別、pass / fail / blocked を貼り戻せる形式で固定する。
- synthetic fixture / fixed demo event だけを使い、real YouTube data、real viewer data、raw comment data を使わない。
- generated URL config-only 境界を確認し、fixture event data、event payload、queue state、transport payload を URLへ入れない。
- raw payload、raw fixture data、manual input text、secret-like values を debug/status/DOM/console へ出さない方針を確認する。
- `BroadcastChannel` 実装前の pass / fail / stop 判断を public-safe に残す。

## Preconditions

人間QAを始める前に確認すること:

- OBS を操作するのは人間テスターであり、Codex は OBS を起動・操作しない。
- production URL または bounded local server URL のどちらを使ったか記録する。
- YouTube login、YouTube API、OAuth、API key、scraping、real stream / viewer / comment data を使わない。
- built-in artificial fixture または fixed synthetic demo event のみを使う。
- generated URL は config-only とし、event payload や fixture event data を入れない。
- private dashboard、account、billing、payment、secret values が映るスクリーンショットを保存しない。

## Environment Template

```text
Date:
Tester:
OBS version:
OS:
URL type: production / local
Page URL:
Normal browser used:
Number of OBS Browser Sources:

Browser Source settings:
- Width:
- Height:
- Shutdown source when not visible: on / off / unknown
- Refresh browser source when scene becomes active: on / off / unknown
- Custom CSS: none / described below
- Other relevant settings:

Synthetic data only: yes / no
Secret, OAuth, API key, real viewer data, or raw comment data used: no / yes
```

If the final line is `yes`, stop and do not paste values. Report only the concern type.

## QA Steps

### 1. Baseline

- Open the overlay URL in a normal browser and in OBS Browser Source.
- Confirm idle overlay is transparent / no visible text unless an explicit demo or debug flag is used.
- Confirm generated URL does not contain fixture event data, event payload, queue state, transport payload, API key, OAuth token, or raw comment data.
- Confirm debug/status does not show raw payload, raw fixture data, manual input text, keyword実値, or secret-like values.

Record:

```text
Baseline result:
Notes:
```

### 2. BroadcastChannel Availability

If a future test page or prototype provides an availability check, confirm:

- `BroadcastChannel` constructor is available in OBS Browser Source.
- `BroadcastChannel` constructor is available in the normal browser used for comparison.
- Availability result differs between production URL and local URL, if both are tested.

Record:

```text
OBS BroadcastChannel availability: pass / fail / unknown
Normal browser availability: pass / fail / unknown
Production/local difference:
Notes:
```

### 3. Single Browser Source Delivery

With one OBS Browser Source:

- Send or trigger only a synthetic fixture/demo candidate if a future prototype provides controls.
- Confirm one intended event is displayed once.
- Confirm no stale event appears on first load.
- Confirm no raw payload or queue state appears in UI, debug/status, console, or URL.

Record:

```text
Single source delivery: pass / fail / not run
Duplicate delivery: none / present / unknown
Stale event on load: none / present / unknown
Notes:
```

### 4. Two Browser Sources

With two OBS Browser Sources using the same URL:

- Check whether both receive the event, only one receives it, neither receives it, or duplicates appear.
- Note whether a public-safe routing key appears necessary.
- Do not put routing keys derived from user input, keyword実値, fixture id, event id, manual input text, or secret-like values into channel names.

Record:

```text
Two source behavior: both / one / none / duplicate / unknown
Routing key needed: yes / no / unknown
Notes:
```

### 5. Reload, Scene, And Source Lifecycle

Check the following:

- Refresh Browser Source.
- Switch away from and back to the scene.
- Toggle source visibility.
- Test with "Shutdown source when not visible" on/off when practical.
- Test with "Refresh browser source when scene becomes active" on/off when practical.
- Restart OBS only if safe and convenient.

For each action, confirm:

- No stale event appears after reload or scene return.
- No duplicate delivery appears after repeated actions.
- Cleanup expectation remains understandable before implementation.

Record:

```text
Browser Source refresh:
Scene switch:
Source visibility toggle:
Shutdown when not visible:
Refresh when scene active:
OBS restart:
Duplicate/stale summary:
```

### 6. Normal Browser And OBS Sharing

If a future test page or prototype provides a normal browser sender/receiver:

- Check whether a normal browser tab and OBS Browser Source share the same-origin channel.
- Record production URL and local URL separately if both are tested.
- If sharing does not work, do not workaround by putting event payload into generated URL or localStorage.

Record:

```text
Normal browser -> OBS sharing: pass / fail / unknown
OBS -> normal browser sharing: pass / fail / unknown
Production/local difference:
Notes:
```

### 7. Hidden / Visible Behavior

- Hide and show the Browser Source or switch scenes.
- Confirm hidden time does not accumulate old fixture events that all display on return.
- Confirm source reactivation does not duplicate existing listeners.

Record:

```text
Hidden/visible behavior:
Queued stale display: none / present / unknown
Duplicate listener evidence: none / present / unknown
Notes:
```

### 8. Console And Network

If console or network information is available:

- Record only public-safe summaries.
- Do not copy raw payload, token, account, stream, dashboard, billing, or private data.
- Confirm no app-origin external network transport is needed for the test.

Record:

```text
Console errors/warnings: none / present / unknown
Network failures: none / present / unknown
Unexpected external network from app: none / present / unknown
Notes without raw payload:
```

## Pass Criteria

All of the following should be true before `BroadcastChannel` prototype or overlay本体fixture transport implementation is considered:

- OBS Browser Source `BroadcastChannel` availability is confirmed.
- Normal browser and OBS Browser Source same-origin sharing is confirmed if the future design requires that path.
- Single Browser Source delivery behavior is understood.
- Two Browser Source behavior is understood, including whether routing is needed.
- Reload / scene switch / source refresh / visibility changes do not create stale or duplicate delivery.
- generated URL remains config-only.
- fixture event data, event payload, queue state, transport payload, and raw JSON are not put into URL.
- raw payload, raw fixture data, manual input text, keyword実値, and secret-like values are not shown in debug/status/DOM/console.
- QA uses only synthetic fixture/demo data.
- No YouTube API / no OAuth / no API key / no scraping / no real data.
- No `localStorage` transport or external network transport is needed.

## Fail Criteria

Stop before implementation if any of the following are true:

- `BroadcastChannel` is unavailable in OBS Browser Source.
- Required normal browser to OBS Browser Source channel sharing does not work.
- Reload, scene switch, source refresh, source visibility, or OBS restart causes stale or duplicate delivery.
- The path only works by putting fixture event data, event payload, transport payload, or queue state into generated URL.
- The path requires `localStorage` transport or external network transport.
- Diagnosis requires exposing raw payload, raw fixture data, secret-like values, account data, or real user data.
- YouTube API, OAuth, API key, scraping, real viewer data, or real comment data becomes necessary.

## Result Template

```text
Overall: PASS / FAIL / BLOCKED / NOT RUN
Date:
Tester:
OBS version:
OS:
URL type:
Page URL:
Normal browser:
Browser Source settings:

Checks:
- Baseline idle / URL boundary:
- BroadcastChannel availability:
- Single Browser Source:
- Two Browser Sources:
- Browser Source refresh:
- Scene switch:
- Source visibility:
- OBS restart:
- Normal browser sharing:
- Hidden/visible behavior:
- Duplicate/stale delivery:
- Raw value boundary:
- Console/network:

Evidence retained:
- Screenshots: none / public-safe / contains private data and must not be shared
- Console summary: none / public-safe / contains raw values and must not be shared

Final decision:
- Proceed to limited prototype scope decision: yes / no
- Reason:
- Docs update required before implementation: yes / no
```

## Evidence Allowed

- OBS version、OS、Browser Source settings。
- production / local URL type and public path.
- Redacted query string when it may contain unreviewed values.
- Synthetic fixture/demo result summaries.
- Screenshots that contain no account, stream, private dashboard, billing, payment, token, or real viewer/comment data.
- Public-safe console/network summaries without raw payload.

## Evidence Not Allowed

- API key、OAuth token、access token、refresh token、client secret、private key。
- real viewer id。
- raw YouTube comment / live chat content。
- private account, dashboard, billing, or payment data。
- raw fixture JSON if it contains unreviewed data.
- raw `BroadcastChannel` payload.
- Screenshots containing private stream/account information.

## Next Steps After PASS

PASS does not approve immediate production transport implementation.

Human OBS Browser Source QA is recorded as PASS in [CANDIDATE_A_OBS_BROADCASTCHANNEL_HUMAN_QA_RESULT.md](CANDIDATE_A_OBS_BROADCASTCHANNEL_HUMAN_QA_RESULT.md). That result is an input to [CANDIDATE_A_LIMITED_BROADCASTCHANNEL_PROTOTYPE_SCOPE_DECISION.md](CANDIDATE_A_LIMITED_BROADCASTCHANNEL_PROTOTYPE_SCOPE_DECISION.md), not approval for immediate runtime transport implementation.

Next step after PASS:

1. Record the public-safe QA result in docs.
2. Create a limited `BroadcastChannel` prototype scope decision PR.
3. Keep prototype synthetic-only.
4. Keep generated URL config-only.
5. Keep raw payload and secret-like values out of debug/status/DOM/console.

## Next Steps After FAIL Or BLOCKED

1. Do not implement `BroadcastChannel` runtime.
2. Record only public-safe fail/blocker categories in docs.
3. Recompare `postMessage`, no transport, same-window-only, or local-only alternatives.
4. Keep fixture event data out of generated URL.
5. Keep YouTube API / OAuth / API key / real data out of scope.

## Non-Goals

- Codex OBS operation.
- OBS automation.
- `BroadcastChannel` implementation.
- `postMessage` implementation.
- `localStorage` transport.
- overlay本体fixture transport.
- paste JSON import.
- external network transport.
- YouTube API integration.
- OAuth login.
- API key creation or storage.
- scraping.
- 実視聴者データ.
- 実コメントデータ.
- deploy.
- Cloudflare dashboard/API operation.
- Codex for OSS application submission.
