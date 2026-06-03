# Candidate A Keyword Reaction Overlay Design

## Status

この文書は Candidate A: manual / fixture keyword reaction overlay の設計ドラフトです。

この文書は、YouTube API、OAuth、API key、scraping、live chat 取得、実視聴者データ、deploy、Codex for OSS申請を承認するものではありません。次の小さな実装PRへ渡すための docs-only 設計です。

関連:

- Issue #30: <https://github.com/h8nc4y/obs-clock-overlay-builder/issues/30>
- Safe MVP comment: <https://github.com/h8nc4y/obs-clock-overlay-builder/issues/30#issuecomment-4613411826>
- Suite concept: [YOUTUBE_LIVE_OVERLAY_SUITE_CONCEPT.md](YOUTUBE_LIVE_OVERLAY_SUITE_CONCEPT.md)
- MVP requirements: [HEADLINE_FEATURE_MVP_REQUIREMENTS.md](HEADLINE_FEATURE_MVP_REQUIREMENTS.md)
- Data boundary: [YOUTUBE_DATA_POLICY_BOUNDARY.md](YOUTUBE_DATA_POLICY_BOUNDARY.md)

## 目的

Candidate A の目的は、YouTube連携に入る前に「キーワードに反応してOBS向けオーバーレイを出す体験」が有用かを安全に検証することです。

このMVPで確認したいこと:

- 配信者がプログラムを書かずに keyword rule を設定できるか。
- 手入力イベントで分かりやすい reaction overlay を出せるか。
- overlay-only page が透明背景の OBS Browser Source として使えるか。
- 生成URLまたは importable config で表示設定を再現できるか。
- untrusted text を HTML として扱わず、安全に表示できるか。

## 対象ユーザー

- バックエンドやAPI設定なしで小さな配信用オーバーレイを試したい日本語圏のOBS利用者。
- YouTube Live向けのchat-reactive visualを検討しているが、まだYouTube account接続はしたくない配信者。
- 実YouTube連携前に、overlay UX、URL契約、fixture形式、QA境界を固めたい maintainer。

## ユースケース

- 配信者が editor で keyword と reaction style を設定し、手入力で反応を試す。
- maintainer が synthetic fixture を再生して、表示密度やタイミングを確認する。
- reviewer が generated overlay URL を通常ブラウザまたは OBS Browser Source で開き、同じ設定が再現されることを確認する。
- 将来の実装PRで、keyword matching、animation timing、sanitization を fixture で検証する。

## OBS Workflow

1. editor / builder page を開く。
2. reaction display pattern と keyword rules を設定する。
3. manual input または synthetic fixture で反応を試す。
4. generated overlay URL をコピーする。
5. OBS Browser Source を追加する。
6. 生成URLを貼る。
7. 推奨 width / height を入力する。
8. overlay-only page が透明背景で、editor UI を含まないことを確認する。

時計ツールと同じく、設定用の editor surface と OBS用の overlay-only surface を分ける。

## MVP範囲

含めるもの:

- keyword testing 用の manual event input。
- demo / QA 用の synthetic fixture playback。
- 最初の表示パターンは1種類に絞る。
- visual reproducibility のための generated URL または importable config。
- 透明背景の overlay-only page。
- user-provided label / event text の text-only rendering。
- local validation と manual OBS QA checklist。

含めないもの:

- YouTube API calls。
- OAuth login。
- API key 作成または保存。
- live chat / comment fetching。
- scraping。
- 実視聴者、実コメント、配信者データ。
- moderation workflow。
- author-centric browsing。
- backend persistence。
- Codex for OSS application submission。

## 画面構成案

### Editor / Builder Page

editor は設定とテストに集中する。

- keyword rule editor。
- reaction style controls。
- display pattern selector。
- manual event input。
- fixture playback controls。
- preview area。
- generated URL area。
- recommended OBS size。

editor は下書き復元のために localStorage を使ってもよいが、overlay-only page は editor localStorage に依存してはいけない。

### Overlay-Only Page

overlay-only page は OBS に貼る面。

- editor controls を表示しない。
- page background は透明。
- body margin は 0。
- visual state は URL/config driven。
- config が missing / invalid / too long の場合は safe fallback。
- Candidate A では external data fetching をしない。

### Manual Event Input

manual input は、maintainer または配信者が synthetic event text を入力して reaction を試すためのもの。real chat integration を意味しない。

候補フィールド:

- event text。
- optional keyword override。
- optional intensity。
- trigger button。
- clear/reset button。

### Fixture Playback

fixture playback は artificial events だけを扱う。timing、repeated events、missed keyword、visual density を確認するために使う。

最小 controls:

- built-in synthetic fixture の選択。
- play。
- pause。
- restart。
- 必要になった場合のみ playback speed。

### Generated URL Area

generated URL area では再現性の境界を明確にする。

- visual config と keyword rules は encode してよい。
- secrets、API keys、OAuth tokens、private identifiers、raw real comments は encode してはいけない。
- 長いconfigは将来 import/export fallback を検討する。

## 表示パターン案

### Toast

短時間の reaction が画面端や指定位置に出る形式。

利点:

- 初見で理解しやすい。
- layout pressure が小さい。
- manual / fixture MVP に向く。
- OBS確認がしやすい。

リスク:

- イベントが多いと重なる可能性がある。
- animation timing は控えめな初期値が必要。

### Ticker

イベントを横方向の帯で流す形式。

利点:

- repeated events と相性がよい。
- broadcast UI として馴染みがある。

リスク:

- 配信画面の邪魔になりやすい。
- 小さいサイズで読みにくい。
- queueing / overflow の仕様が増える。

### Badge

keyword reaction を小さな badge や count として見せる形式。

利点:

- 表示密度が低い。
- 長時間の状態表示に向く。

リスク:

- 初回 demo としては反応が分かりにくい可能性がある。
- reset / count behavior の仕様が必要。

## MVP推奨

最初は Toast を推奨する。

理由:

- 最小の behavior surface で reaction overlay の価値を検証できる。
- manual input と fixture playback で確認しやすい。
- 時計ツールで学んだ safe inset、transparent background、generated URL reproducibility を活かしやすい。
- Ticker と Badge は、config と overlay contract が安定した後の follow-up に分けられる。

## 再現性契約の適用方針

時計ツールでは `/clock/?c=...` が source of truth になっている。Candidate A も、visual configuration については同じ考え方を採用する。

- generated URL が OBS playback の source of truth。
- overlay-only page は editor localStorage に依存しない。
- invalid config は safe defaults に normalize する。
- user-provided strings は HTML ではなく text として表示する。
- runtime manual input と fixture events は、private external data とは分離する。

未確定: path を `/overlay/?c=...` のような汎用形にするか、`/overlay/keyword-reaction/?c=...` のような具体形にするか。詳細は [CANDIDATE_A_URL_CONTRACT_DRAFT.md](CANDIDATE_A_URL_CONTRACT_DRAFT.md) に分ける。

## 今後のPR分割案

この docs PR の後に想定する小さな実装PR:

1. local-only keyword reaction editor と overlay surface の route / static page skeleton。
2. config encode/decode helper と tests。
3. manual input MVP と toast display。
4. synthetic fixture playback と fixture schema validation。
5. Browser / OBS QA と docs 更新。
6. toast が安定した後、ticker または badge を追加検討。
7. YouTube integration design は data boundary review 後の別タスク。

## 未確定事項

- Candidate A を長期的にこの repository に置くか、将来 suite / umbrella repo に分けるか。
- 最初の overlay path を generic にするか keyword-specific にするか。
- fixture playback は built-in fixture list、pasted JSON、または両方にするか。
- toast animation はどの程度なら便利で邪魔にならないか。
- keyword matching は exact match、case-insensitive、または日本語/英語 normalization を含めるか。
- 初回MVPの完了条件を local browser のみにするか、OBS Browser Source manual QA まで含めるか。
