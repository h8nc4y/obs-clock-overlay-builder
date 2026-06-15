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
