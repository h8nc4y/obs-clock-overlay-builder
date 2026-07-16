const baseUrl = process.env.SMOKE_BASE_URL;

if (!baseUrl) {
  console.error("SMOKE_BASE_URL is required, for example https://example.workers.dev");
  process.exit(1);
}

const securityHeaderRules = [
  {
    name: "content-security-policy",
    includes: [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self'",
      "img-src 'self' data:",
      "connect-src 'self'",
      "base-uri 'none'",
      "object-src 'none'",
      "form-action 'self'"
    ],
    excludes: ["unsafe-inline", "frame-ancestors"]
  },
  { name: "x-content-type-options", equals: "nosniff" },
  { name: "referrer-policy", equals: "no-referrer" }
];

const checks = [
  { path: "/", contentType: "text/html", bodyIncludes: "OBS時計URLビルダー", securityHeaders: true },
  { path: "/clock/", contentType: "text/html", bodyIncludes: "clockRoot", securityHeaders: true },
  { path: "/clock", contentType: "text/html", bodyIncludes: "clockRoot", securityHeaders: true },
  {
    path: "/api/defaults",
    contentType: "application/json",
    cacheControl: "no-store",
    json: { timezone: null, country: null, source: "static" }
  },
  { path: "/favicon.ico", bodyIncludes: "<svg" },
  { path: "/assets/og-image.png", contentType: "image/png" }
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
    if (check.securityHeaders && !validateSecurityHeaders(response)) {
      failed = true;
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

function validateSecurityHeaders(response) {
  // 本番HTML面の防御ヘッダを検査する。/clock/ はOBS埋め込みを維持するため
  // frame-ancestors を要求せず、混入も回帰として扱う。
  let valid = true;
  for (const rule of securityHeaderRules) {
    const value = response.headers.get(rule.name) ?? "";
    if (!value) {
      console.error(`  expected ${rule.name} header`);
      valid = false;
      continue;
    }
    if (rule.equals && value.toLowerCase() !== rule.equals) {
      console.error(`  expected ${rule.name} to equal ${rule.equals}`);
      valid = false;
    }
    for (const token of rule.includes ?? []) {
      if (!value.includes(token)) {
        console.error(`  expected ${rule.name} to include ${token}`);
        valid = false;
      }
    }
    for (const token of rule.excludes ?? []) {
      if (value.includes(token)) {
        console.error(`  expected ${rule.name} not to include ${token}`);
        valid = false;
      }
    }
  }
  return valid;
}
