// 共有カードの Canvas 装飾描画。templateDecoration(share.js) の純粋データを受け、
// builder.js の時計本体描画から呼び出される。

export function clearShadow(ctx) {
  ctx.shadowColor = "rgba(0, 0, 0, 0)";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

// 各デジタルテンプレの装飾を、clock.css の `.template-<id>` に忠実な見た目で描く。
// 装飾の「種類と色」は templateDecoration(純粋データ)が決め、ここでは Canvas の
// プリミティブ(fillRect/arc/ellipse/lineTo 等)だけで描画する。clock.css の px 値は
// unit = scale * fit を掛けて共有カードのスケールへ揃え、位置はパネル矩形 panel を基準にする。
export function drawDigitalTemplateDecorations(
  ctx,
  { config, decoration, fontStack, fit, labelLine, panel, scale, timeLine }
) {
  if (
    !decoration.timeUnderline &&
    !decoration.badge &&
    !decoration.brackets &&
    !decoration.motif &&
    !decoration.topBar
  ) {
    return;
  }
  const unit = scale * fit;

  ctx.save();
  clearShadow(ctx);

  // aqua-deck: パネル上辺のグラデ帯。CSS の overflow:hidden に合わせ、パネルの角丸で
  // クリップしてから帯を塗る(上の角だけ丸く欠ける)。
  if (decoration.topBar && panel) {
    drawTemplateTopBar(ctx, decoration.topBar, panel, unit);
  }

  // neon-hud: パネル左上+右下の角ブラケット。
  if (decoration.brackets && panel) {
    drawTemplateBrackets(ctx, decoration.brackets, panel, unit);
  }

  // soda / pastel-pop / sakura: パネル右上のワンポイント。
  if (decoration.motif && panel) {
    drawTemplateMotif(ctx, decoration.motif, panel, unit);
  }

  // studio-live / night-studio: 時刻の下線。
  // 縦積みパスは時刻が中央なので __stage.cx 基準。横並びパスは時刻が左寄せのため
  // timeLine.cx(時刻の中心x)を渡してくる。あればそれを優先し、下線を時刻の真下へ揃える。
  if (timeLine && decoration.timeUnderline) {
    const underlineWidth = Math.max(1, decoration.timeUnderline.px * unit);
    const underlineY = timeLine.y + timeLine.px / 2 + 3 * unit + underlineWidth / 2;
    const timeCx = timeLine.cx ?? ctx.__stage.cx;
    ctx.beginPath();
    ctx.lineCap = "butt";
    ctx.lineWidth = underlineWidth;
    ctx.strokeStyle = decoration.timeUnderline.color;
    ctx.moveTo(timeCx - timeLine.width / 2, underlineY);
    ctx.lineTo(timeCx + timeLine.width / 2, underlineY);
    ctx.stroke();
  }

  // ラベルバッジ(塗り/枠)。ラベルが表示されているときだけ描く(実物と同じ)。
  if (labelLine && decoration.badge) {
    drawTemplateBadge(ctx, decoration.badge, { config, fontStack, labelLine, unit });
  }
  ctx.restore();
}

// aqua-deck: パネル上辺の左→右グラデ帯。CSS overflow:hidden を再現するため、パネルの
// 角丸 path でクリップしてから幅いっぱいに塗る。
export function drawTemplateTopBar(ctx, topBar, panel, unit) {
  const barH = topBar.px * unit;
  ctx.save();
  drawRoundedRectPath(ctx, panel.x, panel.y, panel.w, panel.h, panel.radius);
  ctx.clip();
  const gradient = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.w, panel.y);
  gradient.addColorStop(0, topBar.from);
  gradient.addColorStop(1, topBar.to);
  ctx.fillStyle = gradient;
  ctx.fillRect(panel.x, panel.y, panel.w, barH);
  ctx.restore();
}

// neon-hud: 左上は (x+4u, y+4u) を角に水平・垂直の腕 14u、右下は (x+w-4u, y+h-4u) を角に。
export function drawTemplateBrackets(ctx, brackets, panel, unit) {
  const inset = 4 * unit;
  const arm = 14 * unit;
  const lineW = Math.max(1, brackets.px * unit);
  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = lineW;
  ctx.lineCap = "butt";
  ctx.strokeStyle = brackets.color;
  // border は path の中心ではなく内側に乗るので、腕の基準線を線幅の半分だけ内側へ寄せる
  // (CSS の border-top/left が要素の内側へ描かれる見え方に合わせる)。
  const half = lineW / 2;
  // 左上(border-top + border-left)
  const tlX = panel.x + inset + half;
  const tlY = panel.y + inset + half;
  ctx.moveTo(tlX, tlY);
  ctx.lineTo(tlX + arm, tlY);
  ctx.moveTo(tlX, tlY);
  ctx.lineTo(tlX, tlY + arm);
  // 右下(border-right + border-bottom)
  const brX = panel.x + panel.w - inset - half;
  const brY = panel.y + panel.h - inset - half;
  ctx.moveTo(brX, brY);
  ctx.lineTo(brX - arm, brY);
  ctx.moveTo(brX, brY);
  ctx.lineTo(brX, brY - arm);
  ctx.stroke();
  ctx.restore();
}

// soda / pastel-pop / sakura のワンポイント(パネル右上)。色は kind ごとに固定。
export function drawTemplateMotif(ctx, motif, panel, unit) {
  const right = panel.x + panel.w;
  const top = panel.y;
  ctx.save();
  if (motif.kind === "bubbles") {
    // CSS: ::after top:9px right:12px w/h:7px(=r3.5) +box-shadow 2つ。
    const mainCx = right - (12 + 3.5) * unit;
    const mainCy = top + (9 + 3.5) * unit;
    fillCircle(ctx, mainCx, mainCy, 3.5 * unit, "rgba(255, 255, 255, 0.9)");
    fillCircle(ctx, mainCx - 10 * unit, mainCy + 6 * unit, 2.5 * unit, "rgba(255, 255, 255, 0.8)");
    fillCircle(ctx, mainCx - 4 * unit, mainCy + 13 * unit, 1.5 * unit, "rgba(255, 255, 255, 0.7)");
  } else if (motif.kind === "dots") {
    // CSS: ::after top:10px right:13px w/h:6px(=r3) +box-shadow で左に2つ。
    const pinkCx = right - (13 + 3) * unit;
    const cy = top + (10 + 3) * unit;
    fillCircle(ctx, pinkCx, cy, 3 * unit, "#ff9ed2");
    fillCircle(ctx, pinkCx - 11 * unit, cy, 3 * unit, "#ffd24d");
    fillCircle(ctx, pinkCx - 22 * unit, cy, 3 * unit, "#7fd6ee");
  } else if (motif.kind === "sakura") {
    // CSS: ::after 22x22, top:-9px right:12px。SVG viewBox24 を全体スケール 22u/24 で描く。
    const flowerCx = right - (12 + 11) * unit;
    const flowerCy = top + (-9 + 11) * unit;
    drawSakura(ctx, flowerCx, flowerCy, (22 * unit) / 24);
  }
  ctx.restore();
}

// 桜マーク: 中心から放射状にピンクの花びら5枚 + 黄色い芯。SVG(viewBox24, 中心(12,12))を
// 基準に、上(cx12,cy4=中心から上へ8)を起点に 72°刻みで楕円(rx3.2 ry4.2)を5枚配置する。
export function drawSakura(ctx, cx, cy, s) {
  ctx.save();
  ctx.fillStyle = "#ff9ec0";
  const petalDist = 8 * s; // 中心(12,12)から上の花びら中心(12,4)までの距離
  for (let i = 0; i < 5; i += 1) {
    const angle = (i * 72 * Math.PI) / 180; // 0=真上
    const px = cx + Math.sin(angle) * petalDist;
    const py = cy - Math.cos(angle) * petalDist;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, 3.2 * s, 4.2 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  fillCircle(ctx, cx, cy, 2.4 * s, "#ffd24d");
  ctx.restore();
}

export function fillCircle(ctx, cx, cy, r, color) {
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(0.5, r), 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// ラベルバッジ。mode='fill' は塗りバッジ(fill 背景 / ink 文字、dot 有のとき左に白丸)。
// mode='outline' は枠バッジ(枠線=文字色=config.textColor、塗りなし、ドットなし)。
export function drawTemplateBadge(ctx, badge, { config, fontStack, labelLine, unit }) {
  // 縦積みパスはラベルが中央なので __stage.cx 基準。横並びパスはラベルが左右どちらかに
  // 寄るため labelLine.cx(ラベルの中心x)を渡してくる。あればそれを優先する。
  const cx = labelLine.cx ?? ctx.__stage.cx;
  const dot = badge.dot === true;
  // ドット有(studio-live)は左に余白を多く取り、ドットを置く。ドット無は左右対称の padding。
  const paddingLeft = (dot ? 22 : 11) * unit;
  const paddingRight = 11 * unit;
  const paddingY = 2 * unit;
  const badgeX = cx - labelLine.width / 2 - paddingLeft;
  const badgeY = labelLine.y - labelLine.px / 2 - paddingY;
  const badgeW = labelLine.width + paddingLeft + paddingRight;
  const badgeH = labelLine.px + paddingY * 2;
  const radius = Math.min(6 * unit, badgeH / 2);

  if (badge.mode === "outline") {
    // 枠バッジ: 枠線も文字も config.textColor。塗りはしない。
    const ink = config.textColor;
    const lineW = Math.max(1, 2 * unit);
    drawRoundedRectPath(ctx, badgeX, badgeY, badgeW, badgeH, radius);
    ctx.lineWidth = lineW;
    ctx.strokeStyle = ink;
    ctx.stroke();
    drawBadgeText(ctx, labelLine, fontStack, config.fontWeight, ink, cx);
    return;
  }

  // 塗りバッジ。
  drawRoundedRectPath(ctx, badgeX, badgeY, badgeW, badgeH, radius);
  ctx.fillStyle = badge.fill;
  ctx.fill();
  if (dot) {
    fillCircle(ctx, badgeX + 12.5 * unit, labelLine.y, Math.max(2, 3.5 * unit), "#ffffff");
  }
  drawBadgeText(ctx, labelLine, fontStack, config.fontWeight, badge.ink, cx);
}

export function drawBadgeText(ctx, labelLine, fontStack, fontWeight, ink, cx) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${fontWeight} ${labelLine.px}px ${fontStack}`;
  ctx.fillStyle = ink;
  ctx.fillText(labelLine.text, cx, labelLine.y);
}

export function drawRoundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, width, height, r);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}
