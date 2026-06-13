// /clock/ 専用のサーバー時刻補正。バックエンドは増やさず、同一オリジンの
// Cache-Control: no-store なエンドポイント(/api/defaults)へのリクエストの
// HTTP `Date` レスポンスヘッダから現在時刻を取得し、PCのシステム時計との差分
// (offset)を補正する。取得に失敗したとき(オフライン等)はローカル時刻のまま使う。
//
// offset は `?c=...` には保存しない。表示の見た目は変わらず、時刻だけ実行時に
// 補正されるため、生成URLのOBS再現性は保たれる。

let offsetMs = 0;

// サーバー時刻(Dateヘッダ。秒精度)とリクエスト往復の前後ローカル時刻から、
// ローカル時計に対する補正量(ミリ秒)を求める純粋関数。
// 往復の中点でサーバーが Date を刻んだと仮定し、その時点のローカル時刻との差を取る。
// serverDateMs が数値でない(ヘッダ欠落/解析失敗)なら null を返し、補正しない。
export function computeOffsetMs(serverDateMs, requestStartMs, responseEndMs) {
  if (!Number.isFinite(serverDateMs)) {
    return null;
  }
  const localMidpoint = (requestStartMs + responseEndMs) / 2;
  return Math.round(serverDateMs - localMidpoint);
}

// 補正後の現在時刻。未同期/同期失敗時は offset が 0 のままなので、実質ローカル時刻。
export function correctedNow() {
  return new Date(Date.now() + offsetMs);
}

// 1回だけ同期する。成功したら補正量(ミリ秒)を返して offset を更新し、
// 取得失敗/ヘッダ欠落のときは null を返して offset を据え置く(ローカル時刻のまま)。
export async function syncOnce(url) {
  if (typeof fetch !== "function") {
    return null;
  }
  const start = Date.now();
  let response;
  try {
    response = await fetch(url, { method: "GET", cache: "no-store" });
  } catch {
    return null; // オフライン等 → ローカル時刻のまま
  }
  const end = Date.now();
  const header = response.headers.get("date");
  const next = computeOffsetMs(header ? Date.parse(header) : NaN, start, end);
  if (next === null) {
    return null;
  }
  offsetMs = next;
  return next;
}

// 初回同期 + 定期再同期(ドリフト対策) + タブ復帰時の再同期を開始する。
// onUpdate は補正値が更新できたときに呼ばれ、即座に再描画させるのに使う。
export function startTimeSync({ url = "/api/defaults", intervalMs = 300000, onUpdate } = {}) {
  const run = async () => {
    const synced = await syncOnce(url);
    if (synced !== null && typeof onUpdate === "function") {
      onUpdate();
    }
  };

  run();

  if (typeof setInterval === "function") {
    setInterval(run, intervalMs);
  }

  if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        run();
      }
    });
  }
}
