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
