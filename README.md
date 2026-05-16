# OBS Clock Overlay Builder

OBSのブラウザソースで使う、毎秒更新の時計オーバーレイURLを生成する静的Webサイトです。トップページで見た目を調整し、生成された `/clock/?c=...` のURLをOBSへ貼るだけで使えます。

## 機能

- 8種類のテンプレート: Minimal Clear、Milk Tea、Pastel Pop、Soda、Sakura、Night Studio、Neon HUD、Mono Compact
- `/clock/` の時計専用画面。背景はデフォルト透明、`body margin: 0`、`overflow: hidden`
- デフォルトタイムゾーンは `Asia/Tokyo`
- 24時間/12時間、秒、日付、曜日、ラベル、ラベル位置をURLに保存
- 色、背景不透明度、角丸、余白、文字サイズ、文字間隔、行間、太さ、影、縁取り、枠線を調整
- 生成URL、クエリ文字列、JSON、`c`パラメータ文字列からインポート
- 編集画面だけ localStorage へ最後の設定を保存。OBS表示の再現性はURLパラメータが正です
- PC内フォント読み込みボタン。`window.queryLocalFonts` 非対応時は手入力
- CanvasによるSNS向けPNGプレビュー画像生成、投稿文コピー、X Web Intent
- Cloudflare Pages Functions が使える場合だけ `/api/defaults` で `request.cf` の候補を返します。時計表示はAPIに依存しません

## ローカル起動

依存追加は不要です。Node.js が使える環境で次を実行します。

```bash
npm run dev
```

表示先:

- 編集画面: `http://localhost:4173/`
- OBS用時計画面: `http://localhost:4173/clock/`

単体ファイルとして `index.html` を開いても編集画面は動きますが、`/clock/` のパス確認にはローカルサーバーを使うのが確実です。

## Cloudflare Pages 公開

静的配信を第一候補にしています。

- Build command: 空欄
- Build output directory: `.` または `/`
- Functions directory: `functions`

`functions/api/defaults.js` は任意機能です。Cloudflare外やローカルで `/api/defaults` が使えなくても、編集画面は壊れず、OBS用時計画面はAPIへアクセスしません。

## OBS設定手順

1. OBSでソースを追加
2. `ブラウザ` を選択
3. 編集画面でコピーした生成URLをURL欄へ貼り付け
4. 編集画面に表示された推奨幅・高さを入力
5. 必要なら「表示されていないときにソースをシャットダウン」をオフ
6. 透過されない場合はOBS側カスタムCSSや背景設定を確認

PCのシステム時刻がずれている場合は時計表示もずれます。MVPではサーバー時刻補正は行いません。

## URL設計

標準形式は次です。

```text
/clock/?c=<base64url encoded config>
```

設定オブジェクトには `version` を含みます。`c` が無い場合は、後方互換用に次のようなフラットGETパラメータも読みます。

```text
/clock/?tz=Asia/Tokyo&hour12=0&seconds=1&date=0&weekday=0&font=Poppins&theme=soda
```

不正な値は安全なデフォルトへ戻します。URL由来の任意文字列は `innerHTML` に入れず、時計表示は `textContent` で更新します。

## フォント

このリポジトリはフォントファイルを同梱していません。候補リストはフォント名だけを提示し、OBS側PCにインストール済みならその名前で表示されます。未インストール時は `system-ui` などへフォールバックします。

セルフホストする場合は、各フォントの公式ライセンスを確認し、`public/fonts` などへフォントファイルを置いたうえで `docs/licenses` にライセンス表示を追加してください。

## X共有

X Web Intent は画像を直接添付できません。このサイトでは次の流れにしています。

1. CanvasでPNGプレビュー画像を生成
2. 投稿文をコピー
3. X投稿画面を開く
4. 保存したPNGを手動添付

Web Share API が画像ファイル共有に対応する環境では、共有ボタンから画像付き共有を試します。

## よくある問題

- 背景が白い: 時計画面は透明です。OBSのブラウザソース設定やカスタムCSSを確認してください
- フォントが反映されない: OBSを動かすPCにそのフォントが無い可能性があります
- URLをなくした: 別ブラウザで再現するには生成URLが必要です。localStorageは編集画面の補助です
- PC時刻が違う: システム時刻を修正してください
- OBSで表示が切れる: 推奨幅・高さより少し大きめにしてください
- Xに画像が付かない: X Web Intentでは画像の自動添付ができません。手動添付してください

## 品質確認

```bash
npm run lint
npm run typecheck
npm run format:check
npm run test
git diff --check
```

テスト対象:

- config encode/decode
- query parse
- default/invalid config fallback
- time formatting
- CSS string escaping

## 手動確認

- 編集画面で各テンプレートをクリックし、ライブプレビューへ即時反映されること
- 背景確認を「透過チェッカー」「明るい背景」「暗い背景」「任意色」で切り替えられること
- 生成URLを `/clock/` で開き、背景が透明で時計だけ表示されること
- 秒境界付近で毎秒更新されること
- 生成URLをインポート欄へ貼って同じ設定へ戻ること
- URLを別ブラウザへ貼っても同じ見た目になること
