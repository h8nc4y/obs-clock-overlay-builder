const baseUrl = process.env.SMOKE_BASE_URL;

if (!baseUrl) {
  console.error("SMOKE_BASE_URL is required, for example https://example.workers.dev");
  process.exit(1);
}

const checks = [
  { path: "/", contentType: "text/html", bodyIncludes: "時計オーバーレイURLビルダー" },
  { path: "/clock/", contentType: "text/html", bodyIncludes: "clockRoot" },
  { path: "/clock", contentType: "text/html", bodyIncludes: "clockRoot" },
  {
    path: "/api/defaults",
    contentType: "application/json",
    cacheControl: "no-store",
    json: { timezone: null, country: null, source: "static" }
  }
];

let failed = false;

for (const check of checks) {
  const url = new URL(check.path, baseUrl);
  try {
    const response = await fetch(url, { redirect: "follow" });
    const text = await response.text();
    const contentType = response.headers.get("content-type") ?? "";
    const cacheControl = response.headers.get("cache-control") ?? "";
    console.log(`${response.status} ${url.href}`);
    console.log(`  content-type: ${contentType || "(none)"}`);
    if (cacheControl) {
      console.log(`  cache-control: ${cacheControl}`);
    }

    if (!response.ok) {
      failed = true;
    }
    if (check.contentType && !contentType.includes(check.contentType)) {
      failed = true;
      console.error(`  expected content-type to include ${check.contentType}`);
    }
    if (check.cacheControl && !cacheControl.includes(check.cacheControl)) {
      failed = true;
      console.error(`  expected cache-control to include ${check.cacheControl}`);
    }
    if (check.bodyIncludes && !text.includes(check.bodyIncludes)) {
      failed = true;
      console.error(`  expected body to include ${check.bodyIncludes}`);
    }
    if (check.json) {
      const parsed = JSON.parse(text);
      if (JSON.stringify(parsed) !== JSON.stringify(check.json)) {
        failed = true;
        console.error(`  expected JSON ${JSON.stringify(check.json)}, got ${JSON.stringify(parsed)}`);
      }
    }
  } catch (error) {
    failed = true;
    console.error(`ERROR ${url.href} ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log("Remote release smoke passed.");
