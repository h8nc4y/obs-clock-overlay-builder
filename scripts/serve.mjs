import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.PORT || 4173);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

const server = createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  if (url.pathname === "/api/defaults") {
    response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ timezone: null, country: null, source: "local" }));
    return;
  }

  const filePath = resolvePath(url.pathname);
  if (!filePath) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  if (!existsSync(filePath)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
  response.writeHead(200, {
    "content-type": contentTypes[extname(filePath)] || "application/octet-stream",
    "cache-control": "no-store"
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, () => {
  console.log(`Local server: http://localhost:${port}/`);
});

function resolvePath(pathname) {
  let cleanPath = decodeURIComponent(pathname);
  if (cleanPath === "/clock") {
    cleanPath = "/clock/";
  }
  if (cleanPath.endsWith("/")) {
    cleanPath += "index.html";
  }
  const normalized = normalize(cleanPath).replace(/^(\.\.[/\\])+/, "");
  const target = resolve(join(root, normalized));
  const rootWithSeparator = `${root}\\`;
  if (target !== root && !target.startsWith(rootWithSeparator) && !target.startsWith(`${root}/`)) {
    return null;
  }
  try {
    const stats = statSync(target);
    if (stats.isDirectory()) {
      return join(target, "index.html");
    }
  } catch {
    return target;
  }
  return target;
}
