import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.PORT || 4173);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/svg+xml",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

// 本番(_headers)と同じセキュリティヘッダをdevでも返し、CSPをローカルで検証できるようにする。
// frame-ancestors は付けない(/clock/ をOBSや他面に埋め込めるようにするため)。
const securityHeaders = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "content-security-policy":
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; object-src 'none'"
};

const server = createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
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
    "content-type": contentTypeFor(url.pathname, filePath),
    "cache-control": "no-store",
    ...securityHeaders
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

function contentTypeFor(pathname, filePath) {
  if (pathname === "/api/defaults") {
    return "application/json; charset=utf-8";
  }
  return contentTypes[extname(filePath)] || "application/octet-stream";
}
