# Manual QA Checklist

公開前に実ブラウザとOBSで確認するためのチェックリストです。自動テストではDOMの実描画、OSフォント、OBSブラウザソース固有の挙動までは保証しません。

## Local Server

1. `npm run dev` を実行する。
2. `http://localhost:4173/` を開く。
3. `http://localhost:4173/clock/` と `http://localhost:4173/clock` を開く。
4. `http://localhost:4173/api/defaults` が静的fallback JSONを返すことを確認する。

## Builder

- 8テンプレートをすべてクリックし、ライブプレビューへ即時反映される。
- 背景確認を `透過チェッカー`、`明るい背景`、`暗い背景`、`任意色` へ切り替えられる。
- 文字色、背景色、不透明度、角丸、余白、文字サイズ、文字間隔、行間、太さ、影、縁取り、枠線が反映される。
- コントラストが低い設定で警告が表示される。
- 生成URLが `/clock/?c=...` 形式で、コピーできる。
- `デフォルト値を省略して短くする` をオンにしても、時計画面で同じ表示になる。
- 推奨幅・高さが表示され、テンプレートやサイズ変更後に更新される。

## Import And URL Compatibility

- 生成URL全体をインポートできる。
- `?c=...` のクエリ文字列をインポートできる。
- `c` パラメータの値だけをインポートできる。
- JSONとURLエンコード済みJSONをインポートできる。
- `?tz=UTC&hour12=1&seconds=0&date=1&weekday=1&font=Poppins&theme=soda` のようなフラットGETパラメータで時計画面が表示される。
- 壊れた `c`、壊れたJSON、不正timezone、不正色、不正数値では初期値または安全な範囲へ戻る。
- localStorageを削除しても、生成URLだけで同じ表示になる。
- localStorageへ壊れたJSONが入っていても編集画面が起動する。

## OBS Clock Surface

- `/clock/` は時計だけを表示し、編集UIや余分な本文が出ない。
- ページ背景は透明で、`body` の余白がない。
- 24時間の `HH:MM:SS` がデフォルトで毎秒更新される。
- `Asia/Tokyo` がデフォルトタイムゾーン。
- 12時間表記、秒なし、日付あり、曜日あり、長いラベル、背景不透明度0をそれぞれ確認する。
- 小さいviewport、横長viewport、縦長viewportで時計が意図せず切れないか確認する。切れる場合はOBS側の幅・高さを推奨値より大きめにする。
- OBSでブラウザソースに生成URLを貼り、推奨幅・高さを入力して表示される。
- OBSで表示/非表示を切り替えても、再表示後の次tickで現在時刻になる。

## OBS実機確認

OBS実機では、編集画面ではなく生成URLそのものをブラウザソースに貼って確認する。

### 事前準備

1. `npm run dev` を起動する。
2. 編集画面 `http://localhost:4173/` を開く。
3. 任意のテンプレートを選び、`OBS用URL` の生成URLをコピーする。
4. `別タブで確認` で時計だけの画面を開き、背景が透明で編集UIが出ないことを確認する。
5. 推奨幅と推奨高さをメモする。

### OBS設定

1. OBSで `ソース` の `+` を押す。
2. `ブラウザ` を選ぶ。
3. URL欄へ生成URLを貼る。
4. 幅へ推奨幅、高さへ推奨高さを入力する。
5. 背景を透過したい場合、OBS側の背景色やカスタムCSSで白背景を足していないことを確認する。
6. 表示が切れる場合は、幅と高さを推奨値より20pxから80pxほど大きくする。

### 合格基準

- 時計だけが表示され、編集画面のボタンや説明文が出ない。
- 背景が透明で、配信画面の映像や画像の上に時計だけが重なる。
- 秒表示ありの設定では、秒が毎秒進む。
- OBSのソースを非表示から再表示したあと、1秒以内に現在時刻へ戻る。
- 生成URLをOBSに貼り直しても同じ見た目になる。
- ラベル、日付、曜日、12時間表示、秒なしなど、編集画面で選んだ設定が反映される。
- OBS上で文字が切れず、配信画面の主要UIを隠しすぎない。

### 記録欄

```text
確認日:
OBS version:
OS:
生成URL:
テンプレート:
推奨幅:
推奨高さ:
OBSに入れた幅:
OBSに入れた高さ:
透明背景: OK / NG
毎秒更新: OK / NG
表示/非表示後の復帰: OK / NG
URL再貼り付け再現: OK / NG
文字切れ: なし / あり
気になった点:
最終判断: 公開可 / 修正後に再確認 / 公開保留
```

### 失敗時の切り分け

- 背景が白い: 生成URLを通常ブラウザで開き、透明背景か確認する。通常ブラウザで透明なら、OBSのブラウザソース設定、カスタムCSS、シーン背景を確認する。
- 文字が切れる: OBSの幅と高さを大きくする。影、縁取り、太字、長いラベルは必要サイズが増える。
- 時計が動かない: URLを通常ブラウザで開き、秒が進むか確認する。通常ブラウザで動くなら、OBSのブラウザソースを再読み込みする。
- 見た目が違う: OBSを動かすPCに同じフォントが入っているか確認する。未インストールなら別フォントへ置き換える。
- 設定が戻らない: OBSに貼ったURLが `/clock/?c=...` 形式か確認する。編集画面のlocalStorageではなく、生成URLが再現の正。
- ローカルURLがOBSで開けない: OBSとローカルサーバーが同じPC上で動いているか、`npm run dev` が起動中か確認する。

## Fonts

- `PC内フォントを読み込む` はユーザー操作後だけ実行される。
- `queryLocalFonts` 非対応環境では、手入力案内が表示される。
- 権限拒否時も編集画面が壊れない。
- フォント欄の説明で、フォントファイルは同梱されず、OBSを動かすPCに同じフォントが必要なことが分かる。
- `LightNovelPopV2 V2` は `ラノベPOP v2（LightNovelPopV2 V2）` のように、日本語名を先にした表示になる。
- 日本語表示名を選んでも、手入力フォント名、生成URL、`/clock/` のCSSには実際のフォント名が入る。
- OBSを動かすPCに無いフォント名を指定した場合、system fallbackで表示される。
- 同じ生成URLでも、OBSを動かすPCに対象フォントが無い場合は別の書体に見える。配信に使うPCで最後に確認する。

## Sharing

- 投稿文コピーが動く。
- PNG画像生成が動く。
- X投稿画面がテキスト、URL、ハッシュタグ付きで開く。
- X Web Intentでは画像が自動添付されないことが画面とREADMEから分かる。
- Web Share API非対応環境では、PNG保存、投稿文コピー、X投稿画面を開く流れが表示される。

## Security Samples

次のような値をラベル、フォント名、URLインポートへ入れても、HTMLとして実行されず表示またはfallbackされることを確認する。

```text
<img src=x onerror=alert(1)>
javascript:alert(1)
");background:url(javascript:alert(1));/*
Bad"; color:red;
😀😀😀😀😀😀😀😀😀😀
```

## Cloudflare Workers

- `npm run build` で `dist/` が生成される。
- `npm run cf:dry-run` が成功する。
- Workers Static Assets で `/`、`/clock/`、`/clock`、`/api/defaults`、`/favicon.ico` が動作する。
- `/api/defaults` は Worker-first ではなく静的JSONとして配信される。
- rollback path は Cloudflare の直近 Worker version へ戻すか、直前の git commit を再デプロイする。

### 実deploy前の承認条件

Cloudflare staging/production deployは、次を確認してから実行する。

- Cloudflare Freeまたは既存契約内で実行できる。
- 支出上限または課金アラートを確認済み。
- paid plan変更、Workers AI、AI Gateway、R2、D1、KV、Queues、Durable Objects、Workflows、Hyperdriveを使わない。
- secret、token、OAuth credential、実ユーザーデータをdeploy操作で外部送信しない。
- `npm run cf:dry-run` が成功している。

承認文言:

```text
Cloudflare Freeまたは既存契約内で、obs-clock-overlay-builder の staging deploy と production deploy を許可します。paid plan変更、Workers AI、AI Gateway、R2、D1、KV、Queues、Durable Objects、Workflows、Hyperdrive、secret送信は禁止します。
```

### 実deploy後の確認

- `/` が編集画面を表示する。
- `/clock/` が時計だけを表示する。
- `/clock` が時計画面へ到達する。
- `/api/defaults` が `{"timezone":null,"country":null,"source":"static"}` を返す。
- `/api/defaults` の `Content-Type` が `application/json` になる。
- Browser Console error/warning がない。
- OBSのブラウザソースでproduction URLの生成URLが表示される。
- 問題があれば、Cloudflareの直近Worker versionへrollbackするか、直前のgit commitを再デプロイする。

## Cloudflare Pages

- Build command は空欄。
- Build output directory は `.` または `/`。
- Functions directory は `functions`。
- `/api/defaults` が使えない環境でも編集画面と時計画面が壊れない。
- GitHub Release writes はこのQAでは実行しない。
