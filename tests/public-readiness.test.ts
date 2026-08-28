import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import nextConfig from "../next.config.mjs";
import sitemap from "../app/sitemap";

test("public routes publish strict security headers", async () => {
  assert.equal(typeof nextConfig.headers, "function");
  const rules = await nextConfig.headers!();
  const headers = new Map(
    rules.flatMap((rule) => rule.headers).map((header) => [header.key, header.value]),
  );

  const csp = headers.get("Content-Security-Policy") ?? "";
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.doesNotMatch(csp, /https?:\/\/\*/);
  assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
});

test("sitemap includes every public trust page", () => {
  const urls = sitemap().map((entry) => entry.url);
  assert.deepEqual(
    ["/", "/about", "/board", "/contact", "/privacy"].map(
      (path) => `https://themain.quest${path === "/" ? "" : path}`,
    ),
    [...urls].sort(),
  );
});

test("agent guidance states the public and private boundary", async () => {
  const guidance = await readFile(new URL("../public/llms.txt", import.meta.url), "utf8");
  assert.match(guidance, /public Board is free to try/i);
  assert.match(guidance, /must not include raw vault notes/i);
  assert.doesNotMatch(guidance, /buy\.stripe\.com|founding lifetime license/i);
});
