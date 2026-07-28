# HANDOFF — OBS Clock Overlay Builder

最終更新: 2026/07/29 JST

このファイルは現況だけを持つ短い引き継ぎです。要件は
[docs/PRODUCT_REQUIREMENTS.md](docs/PRODUCT_REQUIREMENTS.md)、過去の実施記録は
[docs/HANDOFF_HISTORY.md](docs/HANDOFF_HISTORY.md) を正とします。

## Current goal

公開済み v1.7.1 を安定運用し、`/clock/?c=...` の再現性と時計専用面を守る。
新機能・新テンプレは利用者 feedback またはオーナーが task を確定するまで着手しない。

## Current state

- product/tooling baseline: `14e5852`（PR #142、PC内フォント再読み込み状態の修正）。
- release: v1.7.1。production は 2026-07-11 に v1.7.1 と一致を実測済み。
- local baseline: Node.js 22以上、Wrangler 4.114.0、runtime dependency 0、
  `DEFAULT_CONFIG` 51 fields、18 templates。
- 2026-07-28: Issue #10 のPC内フォント再読み込みで、拒否・空状態後に
  以前の選択肢を残さず、応答順が逆転しても最後の取得結果だけを表示するよう修正。
  lint 42 files、typecheck、format 108 files、`node --test` 188 pass / 0 fail、
  build、local HTTP smoke 6 routes、
  `npm audit` 0件。
  `npm run release:check`（Wrangler staging dry-runを含む）もpass。
- 2026-07-29: local server は malformed percent / UTF-8 path をfilesystem参照前に
  固定400と既存security headersへ閉じ、同じprocessで正常GETを継続する。
  二重decodeはせず、encoded separator / NUL / traversalの既存境界を維持。
  lint 43 files、typecheck、format 78 files、`node --test` 192 pass / 0 fail、
  build、local HTTP smoke 6 routes、Wrangler staging dry-runがpass。
- PR #135〜#142 は merge済み。PR #136 の OGP asset はproduction未反映で、
  2026-07-21 のremote smokeでは既存5経路が200、`/assets/og-image.png`が404。

## Hard contracts

- 生成した `/clock/?c=...` がOBS再現のsource of truth。`/clock/` は時計専用・
  透明背景対応で、editor `localStorage` に依存させない。
- URL・label・fontなど未信頼値を正規化し、`innerHTML` 等へ渡さない。
- `assets/js/share.js` の `PUBLIC_BUILDER_URL` が公開共有URLの正本。
- live表示は `assets/css/clock.css` が正で、共有Canvasはその見た目へ追従させる。
- 時刻補正値は `?c=` に保存しない。OBS埋め込み維持のためCSPに
  `frame-ancestors`を追加しない。
- backend、認証、DB、有料Cloudflare binding、font file、runtime dependencyを
  無承認で追加しない。GitHub Actionsは費用管理のため意図的に置かない。
- `docs/HOW_WE_USE_CODEX.md` の歴史的な公開文面はオーナー承認なく変更しない。

## Key files

- 入口と公開説明: `CODEX_START_HERE.md` / `README.md`
- 要件・非目標: `docs/PRODUCT_REQUIREMENTS.md`
- 実機・release・運用: `docs/manual-qa.md` / `docs/pre-release-qa.md` /
  `docs/post-launch-ops.md`
- URL/config互換: `assets/js/config.js` /
  `tests/fixtures/template-compat.golden.json`
- build / smoke: `scripts/build.mjs` / `scripts/release-check.mjs` /
  `scripts/release-http-smoke.mjs` / `scripts/release-remote-smoke.mjs`

## Verification

通常のlocal-safe gate:

```bash
npm run lint
npm run typecheck
npm run format:check
npm test
npm run build
npm run release:http-smoke
git diff --check
```

`npm run release:check` はWrangler staging dry-runを含む。production deploy、
production remote smoke、rollback、OBS実機確認は下記gateを越えてから行う。

## Known issues / owner gates

1. P1: production URLをOBS Browser Sourceへ貼る実機QAと公開記録。
2. P3: 現行masterのrelease scope/versionを確定し、`package.json` / `CHANGELOG.md`、
   tag、GitHub Releaseを揃えた後のproduction deployとremote smoke。
3. 新機能・新テンプレ・意匠変更: Issue #10 / #29等の利用者feedbackまたは
   オーナーがscopeを確定してから。

OBS実接続・実配信、secret/OAuth、実データ、費用、production操作は人間gate。

## Next steps

- local checks、依存・security health、docs driftを保守する。
- P1はオーナー実機結果を受けて `docs/manual-qa.md` を更新する。
- P3はversion / `CHANGELOG.md` → preflight → merge → tag / GitHub Releaseを
  確定し、オーナーGO後にproduction deploy → remote smokeを行う。未リリースの
  `master`を直接productionへ出さない。

## Do not re-read

現況確認だけなら `docs/HANDOFF_HISTORY.md`、旧review資料、過去のrelease記録は
再読不要。履歴根拠や回帰時だけ最小rangeを参照する。
