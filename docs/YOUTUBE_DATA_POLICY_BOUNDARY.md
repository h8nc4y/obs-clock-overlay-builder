# YouTube Data Policy Boundary

## Status

This document records safety boundaries for any future YouTube Live focused overlay work.

It is not legal advice, policy approval, or a claim of YouTube API compliance. It does not authorize YouTube API calls, OAuth setup, API key creation, data scraping, live chat access, comment access, external sending, storage of real user data, deployment, or production integration.

## Current Safe Boundary

Approved for early MVP planning:

- Static/local/manual input.
- Public-safe fixtures that contain no real viewer or private account data.
- OBS Browser Source rendering with local configuration.
- Generated URLs or importable config that do not contain secrets.
- Documentation and issue triage.

Not approved by this document:

- YouTube API calls.
- YouTube API key creation.
- OAuth/login/token entry.
- Live chat or comment scraping.
- Real viewer, commenter, or broadcaster data collection.
- Storing external data in this repository.
- Sending private data to external services.
- Claiming compliance with YouTube API policy without review.

## Data Classes To Separate

These classes must be considered separately before implementation:

- Visual configuration: colors, labels, layout, animation, size, keyword rules.
- Public-safe local test input: synthetic text or maintainer-written fixtures.
- Public YouTube data: any data that appears public but may still have API and policy obligations.
- Live chat data: messages, author display names, badges, moderation states, timestamps, and message IDs.
- Replay or archived chat data: availability, retention, and context may differ from live data.
- Comment data: comments, replies, author metadata, moderation state, and deletion expectations.
- Author-centric browsing: views organized around a channel, author, or user identity.
- Private account data: OAuth grants, channel management data, account identifiers, analytics, dashboard values.
- Credentials and secrets: API keys, OAuth client secrets, access tokens, refresh tokens, private keys.

The project must not mix visual configuration with credentials or raw user data in generated URLs.

## Official Documentation To Review Later

Before any YouTube integration is designed or implemented, review current official documentation. Candidate review areas include:

- YouTube Data API overview and quota documentation.
- YouTube Live Streaming API documentation.
- Live chat messages and moderation-related API documentation.
- YouTube API Services Terms of Service.
- YouTube API Services User Data Policy.
- Google API OAuth consent, scope, token storage, and verification requirements.
- API key restrictions and credential management guidance.
- Data retention, deletion, and user revocation requirements.

This list is a review checklist, not a statement that the project already satisfies those requirements.

## API Key And OAuth Boundary

Any feature that needs an API key, OAuth client, OAuth scope, access token, refresh token, or private account data requires a separate human approval step before work begins.

Required preconditions before such work:

- A written design for why credentials are needed.
- A credential storage plan that keeps secrets out of Git.
- A local development plan that does not print or commit token values.
- A data minimization plan.
- A deletion and revocation plan if user data is involved.
- A cost and quota review.
- A policy review against current official documentation.

## Privacy And Safety Questions

Open questions before any real YouTube data integration:

- Which data is displayed only in the OBS overlay?
- Which data is stored, if any?
- How long is data retained?
- How can users delete or revoke access?
- Does the feature expose viewer names, messages, moderation state, or channel identity?
- How does the overlay behave when chat includes harassment, personal data, spam, or unsafe content?
- Are moderation controls needed before display?
- Can the feature work with synthetic fixtures instead of real data?

## Safe MVP Preference

The first MVP should prefer local/manual/fixture-driven behavior:

- Manual test input for keyword matching.
- Synthetic fixture messages for repeatable tests.
- No YouTube API.
- No OAuth.
- No API keys.
- No real viewer data.
- No external sending.

This lets the project validate whether a keyword reaction overlay is useful in OBS before taking on credential, policy, quota, privacy, and compliance complexity.

## Repository Boundary

Do not commit:

- API keys.
- OAuth client secrets.
- Access tokens or refresh tokens.
- Private keys.
- Private account identifiers.
- Billing or payment details.
- Raw viewer, commenter, broadcaster, customer, or user data.
- Private dashboard screenshots.

If a future feature requires any of these, stop and create a separate design and approval task.
