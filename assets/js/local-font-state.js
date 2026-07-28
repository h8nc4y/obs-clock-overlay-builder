export function resetLocalFontResults(selectWrap, select) {
  // 再取得に失敗しても古い候補を選べる状態にしないため、問い合わせ前に前回結果を破棄する。
  selectWrap.classList.add("is-hidden");
  select.textContent = "";
}

export function createLatestLocalFontLoader({ isSupported, query, toOptions }) {
  let latestRequestId = 0;

  return async function loadLatestLocalFonts() {
    // 権限ダイアログ中の連打などで応答順が逆転しても、最後に開始した問い合わせだけを画面へ反映する。
    const requestId = ++latestRequestId;
    let result;
    try {
      if (!isSupported()) {
        result = { state: "unsupported", options: [] };
      } else {
        const options = toOptions(await query());
        result = { state: options.length === 0 ? "empty" : "ready", options };
      }
    } catch (error) {
      result = { state: "error", options: [], error };
    }

    // 非対応や同期throwも一度yieldし、同一turnに始まった新しい問い合わせで必ず無効化できるようにする。
    await Promise.resolve();
    if (requestId !== latestRequestId) {
      return null;
    }
    return result;
  };
}
