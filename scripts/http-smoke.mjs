const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:4173";
const targets = [
  "/",
  "/clock/",
  "/clock",
  "/overlay/keyword-reaction/",
  "/overlay/keyword-reaction",
  "/api/defaults",
  "/favicon.ico"
];
let failed = false;

for (const target of targets) {
  const url = new URL(target, baseUrl);
  try {
    const response = await fetch(url);
    console.log(`${response.status} ${url.href}`);
    if (!response.ok) {
      failed = true;
    }
  } catch (error) {
    failed = true;
    console.error(`ERROR ${url.href} ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failed) {
  process.exit(1);
}
