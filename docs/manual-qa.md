# Manual QA Checklist

公開前に実ブラウザとOBSで確認するためのチェックリストです。自動テストではDOMの実描画、OSフォント、OBSブラウザソース固有の挙動までは保証しません。

## Local Server

1. `npm run dev` を実行する。
2. `http://localhost:4173/` を開く。
3. `http://localhost:4173/clock/` と `http://localhost:4173/clock` を開く。
4. `http://localhost:4173/api/defaults` がローカルfallback JSONを返すことを確認する。

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

## Fonts

- `PC内フォントを読み込む` はユーザー操作後だけ実行される。
- `queryLocalFonts` 非対応環境では、手入力案内が表示される。
- 権限拒否時も編集画面が壊れない。
- OBSを動かすPCに無いフォント名を指定した場合、system fallbackで表示される。

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
- Workers Static Assets で `/`、`/clock/`、`/clock`、`/api/defaults` が動作する。
- rollback path は Cloudflare の直近 Worker version へ戻すか、直前の git commit を再デプロイする。

## Cloudflare Pages

- Build command は空欄。
- Build output directory は `.` または `/`。
- Functions directory は `functions`。
- `/api/defaults` が使えない環境でも編集画面と時計画面が壊れない。
- GitHub Release writes はこのQAでは実行しない。
