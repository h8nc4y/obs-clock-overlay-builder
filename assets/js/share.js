// 共有まわりの「純粋ロジック」だけを集めたモジュール。
// Canvas / navigator.share / DOM はブラウザ依存のため builder.js 側に置き、
// テストしやすい文字列生成(投稿文・Xインテントリンク)はここに切り出して
// Node の node:test から直接検証できるようにする。

// 配信者向けに、ツールの存在を広めることを目的とした既定の投稿文。
// 末尾に必ずビルダーURLを含め、画像が無くても文章だけで導線になるようにする。
export const SHARE_HASHTAGS = ["OBS", "配信素材", "VTuber"];

export function buildShareText(builderUrl) {
  const url = normalizeBuilderUrl(builderUrl);
  const hashtagLine = SHARE_HASHTAGS.map((tag) => `#${tag}`).join(" ");
  return [
    "配信用の透明な時計オーバーレイを作ったよ！🕐",
    "OBSにURLを貼るだけ。自分だけの時計も無料で作れる👇",
    url,
    hashtagLine
  ].join("\n");
}

// 投稿に使う本文を確定する。ユーザーが編集していればその文字列、空/空白だけなら
// 既定文(URL+ハッシュタグ入り)にフォールバックする。X インテント生成と画像共有の
// 両方で同じルールを使い、文脈ごとに `value || buildShareText(...)` を重複させない。
export function resolveShareText(userText, builderUrl) {
  return String(userText ?? "").trim() || buildShareText(builderUrl);
}

export function buildShareLines(config, formatted) {
  const label = config.labelPosition === "hidden" ? "" : config.label;
  const dateLine = [
    config.showDate ? formatted.date : "",
    config.showWeekday ? formatted.weekday : ""
  ].filter(Boolean).join("  ");

  const labelAbove = config.labelPosition === "top" || config.labelPosition === "left";
  const labelBelow = config.labelPosition === "bottom" || config.labelPosition === "right";
  const lines = [];
  if (label && labelAbove) {
    lines.push({ text: label, size: config.labelSize, isLabel: true });
  }
  if (dateLine) {
    lines.push({ text: dateLine, size: config.dateSize });
  }
  lines.push({ text: formatted.time, size: config.fontSize, isTime: true });
  if (label && labelBelow) {
    lines.push({ text: label, size: config.labelSize, isLabel: true });
  }
  return lines;
}

// 共有カードのデジタル時計テンプレ装飾を「種類と色」の純粋データで返す。
// 実際の描画(下線・バッジ・角ブラケット・モチーフ・上部帯)は builder.js が
// この戻り値とパネル幾何から行う。clock.css の `.template-<id>` 装飾を正とし、
// 共有カード側を実時計へ合わせる(実時計の CSS は変更しない)。
//
// 戻り値の形:
//   timeUnderline: { color, px } | null   … 時刻の下線(studio-live / night-studio)
//   badge:         { mode, fill?, ink?, dot } | null
//                    mode='fill'    … 塗りバッジ。fill=背景色 / ink=文字色
//                    mode='outline' … 枠バッジ。色は config.textColor を builder 側で解決
//                    dot=true のときだけ左に白丸ドットを描く
//   brackets:      { color, px } | null   … パネル左上+右下の角ブラケット(neon-hud)
//   motif:         { kind } | null        … パネル右上のワンポイント
//                    'bubbles'(soda) / 'dots'(pastel-pop) / 'sakura'(sakura)
//                    各色は kind ごとに固定のため builder 側が持つ
//   topBar:        { from, to, px } | null … パネル上辺のグラデ帯(aqua-deck)
export function templateDecoration(template) {
  switch (String(template ?? "")) {
    case "studio-live":
      return {
        timeUnderline: { color: "#ff3b5c", px: 3 },
        badge: { mode: "fill", fill: "#ff3b5c", ink: "#ffffff", dot: true },
        brackets: null,
        motif: null,
        topBar: null
      };
    case "night-studio":
      return {
        timeUnderline: { color: "#5fd0e0", px: 2 },
        badge: { mode: "outline", dot: false },
        brackets: null,
        motif: null,
        topBar: null
      };
    case "neon-hud":
      return {
        timeUnderline: null,
        badge: null,
        brackets: { color: "#48ffe2", px: 2 },
        motif: null,
        topBar: null
      };
    case "soda":
      return {
        timeUnderline: null,
        badge: null,
        brackets: null,
        motif: { kind: "bubbles" },
        topBar: null
      };
    case "pastel-pop":
      return {
        timeUnderline: null,
        badge: null,
        brackets: null,
        motif: { kind: "dots" },
        topBar: null
      };
    case "sakura":
      return {
        timeUnderline: null,
        badge: null,
        brackets: null,
        motif: { kind: "sakura" },
        topBar: null
      };
    case "aqua-deck":
      return {
        timeUnderline: null,
        badge: { mode: "fill", fill: "#aedded", ink: "#1b3a45", dot: false },
        brackets: null,
        motif: null,
        topBar: { from: "#aedded", to: "#5fd0e0", px: 4 }
      };
    default:
      // mono-compact / minimal-clear / milk-tea など装飾なし(影のみ)。
      return {
        timeUnderline: null,
        badge: null,
        brackets: null,
        motif: null,
        topBar: null
      };
  }
}

// 共有カードの left/right ラベル(横並び)レイアウトを「純粋計算」で返す。
// ライブ(clock.css)の .clock-widget(inline-flex / align-items:center / gap:--clock-gap)を
// 模し、main ブロック(日付↑時刻↓)とラベルを横に並べてパネル中央へ置く。
// builder.js は measureText で測った各寸法(スケール済み px)を渡し、戻り値の座標で描画する。
// Canvas に触れないのでここで単体テストでき、ライブ面の見た目と一致しているか検証できる。
//
// 入力(すべてスケール 2.4 を掛けた px。fit は未適用):
//   mainW/mainH … main ブロック(時刻+日付行)の最大幅・合計高さ(行間 mainGap 込み)
//   labelW/labelH … ラベル文字の幅・高さ
//   widgetGap … main とラベルの間隔(= config.gap * scale)
//   mainGap … main 内の日付↔時刻の行間(= config.gap * 0.55 * scale)
//   padX/padY … パネル内側の余白
//   maxW/maxH … パネルの最大幅・高さ(stage から 80px 内側)
//   stageCx/stageCy … ステージ中心
//   isLeft … ラベルが main の左(true)か右(false=right)か
// 戻り値:
//   fit … 縦が収まらないとき全寸法へ掛ける係数(0<fit<=1)
//   panel{ x,y,w,h } … パネル矩形(fit 適用済み・幅は maxW でクランプ)
//   groupLeft … main+ラベルのグループ左端 x(stageCx 中心)
//   mainLeft … main 各行の左端 x(左揃え描画の基準)
//   labelCx … ラベルの中心 x
//   centerY … グループ(main/ラベル)の縦中央 y(= stageCy)
//   fitMainGap … fit 適用済みの main 行間
export function computeSideLabelLayout({
  mainW,
  mainH,
  labelW,
  labelH,
  widgetGap,
  mainGap,
  padX,
  padY,
  maxW,
  maxH,
  stageCx,
  stageCy,
  isLeft
}) {
  const groupW = mainW + widgetGap + labelW;
  const groupH = Math.max(mainH, labelH);

  // 縦が上限を超えるなら、全寸法・全ギャップへ同率 fit を掛けて収める(縦積みパスと同方針)。
  const fullHeight = groupH + padY * 2;
  const fit = fullHeight > maxH ? maxH / fullHeight : 1;

  const fitGroupW = groupW * fit;
  const fitWidgetGap = widgetGap * fit;
  const fitMainW = mainW * fit;
  const fitLabelW = labelW * fit;

  // 幅は字を縮めず上限でクランプ(縦積みパスと同じく横はみ出しはここで止める)。
  let panelW = fitGroupW + padX * 2;
  if (panelW > maxW) {
    panelW = maxW;
  }
  const panelH = fullHeight * fit;
  const panelX = stageCx - panelW / 2;
  const panelY = stageCy - panelH / 2;

  // グループをパネル中央へ。right は main が左・label が右、left は逆。
  const groupLeft = stageCx - fitGroupW / 2;
  const mainLeft = isLeft ? groupLeft + fitLabelW + fitWidgetGap : groupLeft;
  const labelCx = isLeft
    ? groupLeft + fitLabelW / 2
    : groupLeft + fitMainW + fitWidgetGap + fitLabelW / 2;

  return {
    fit,
    panel: { x: panelX, y: panelY, w: panelW, h: panelH },
    groupLeft,
    mainLeft,
    labelCx,
    centerY: stageCy,
    fitMainGap: mainGap * fit
  };
}

// x.com/intent/tweet 用のURLを組み立てる。画像は添付できない仕様なので
// text / url / hashtags のみを載せる。hashtags は配列でも "a,b" 文字列でも受ける。
export function buildXIntentUrl({ text = "", url = "", hashtags = [] } = {}) {
  const params = new URLSearchParams();
  const trimmedText = String(text ?? "").trim();
  if (trimmedText) {
    params.set("text", trimmedText);
  }
  const trimmedUrl = String(url ?? "").trim();
  if (trimmedUrl) {
    params.set("url", trimmedUrl);
  }
  const tags = normalizeHashtags(hashtags);
  if (tags.length > 0) {
    params.set("hashtags", tags.join(","));
  }
  return `https://x.com/intent/tweet?${params.toString()}`;
}

function normalizeHashtags(hashtags) {
  const list = Array.isArray(hashtags)
    ? hashtags
    : String(hashtags ?? "").split(",");
  const seen = new Set();
  const result = [];
  for (const raw of list) {
    // 先頭の # を落とし、X側でタグとして扱えない空白などを除く。
    const tag = String(raw ?? "").trim().replace(/^#+/, "").replace(/\s+/g, "");
    if (tag && !seen.has(tag)) {
      seen.add(tag);
      result.push(tag);
    }
  }
  return result;
}

function normalizeBuilderUrl(builderUrl) {
  const url = String(builderUrl ?? "").trim();
  return url || "https://obs-clock-overlay-builder.h8nc4y.workers.dev";
}

// Canvas 描画でフォント名をそのまま font プロパティへ入れると、引用符や
// セミコロンが指定を壊す/意図しない解釈をされうる。安全な文字へ丸めてから引用する。
export function canvasFontStack(fontFamily) {
  const clean = String(fontFamily ?? "")
    .replace(/["'\\;\n\r]/g, " ")
    .trim()
    .slice(0, 80);
  return `"${clean || "system-ui"}", system-ui, sans-serif`;
}
