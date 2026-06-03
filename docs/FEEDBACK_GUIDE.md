# Feedback Guide

Feedback is welcome in Japanese or English. Please use GitHub Issues when possible so the project can keep public, linkable maintenance evidence.

- Bug report: <https://github.com/h8nc4y/obs-clock-overlay-builder/issues/new?template=bug_report.yml>
- Feature request: <https://github.com/h8nc4y/obs-clock-overlay-builder/issues/new?template=feature_request.yml>
- General feedback: <https://github.com/h8nc4y/obs-clock-overlay-builder/issues/new?template=feedback.yml>
- Demo: <https://obs-clock-overlay-builder.h8nc4y.workers.dev>

## Useful Feedback

- OBS Browser Source behavior that differs from a normal browser.
- Clock text, glow, border, or background clipping.
- Template names, visual style, and readability.
- Japanese wording that is unclear for non-programmer OBS users.
- Accessibility, keyboard operation, color contrast, or mobile layout issues.
- Documentation gaps in README, OBS setup, or troubleshooting.

## OBS Environment Details

For OBS-specific feedback, include only details you are comfortable making public:

```text
OS:
OBS version:
Browser or OBS Browser Source:
Template:
Recommended width and height:
Actual OBS Browser Source width and height:
Transparent background: OK / NG / not checked
Text or glow clipping: none / present / not checked
What you expected:
What happened:
```

## Generated URL Safety

The generated `/clock/?c=...` URL can contain your visible clock label, font name, color choices, and other display settings.

- Share the generated URL only when it is safe to make those settings public.
- Do not include personal names, private stream titles, event names, internal project names, or other sensitive labels.
- If the URL contains private information, describe the settings instead of pasting the full URL.

## Screenshot Safety

Screenshots are useful, but please check them before uploading:

- Crop or blur private OBS scenes, desktop notifications, usernames, account names, analytics, chat messages, and stream keys.
- Do not upload screenshots that show private dashboards, paid account details, tokens, OAuth screens, or billing information.
- A screenshot of only the clock overlay or the public demo editor is usually enough.

## What Not To Share

Do not include secrets or private data in issues:

- API keys, tokens, OAuth credentials, refresh tokens, or private keys.
- Passwords or recovery codes.
- Payment, billing, or account identifiers.
- Private customer, viewer, or user data.
- Stream keys or private dashboard URLs.
