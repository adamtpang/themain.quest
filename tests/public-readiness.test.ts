import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import nextConfig from "../next.config.mjs";
import sitemap from "../app/sitemap";
import {
  BASELINE_CONTENT_SECURITY_POLICY,
  CLERK_CONTENT_SECURITY_POLICY,
} from "../lib/security-headers";

test("public routes publish strict security headers", async () => {
  assert.equal(typeof nextConfig.headers, "function");
  const rules = await nextConfig.headers!();
  const headers = new Map(
    rules.flatMap((rule) => rule.headers).map((header) => [header.key, header.value]),
  );

  assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
  assert.match(BASELINE_CONTENT_SECURITY_POLICY, /default-src 'self'/);
  assert.match(BASELINE_CONTENT_SECURITY_POLICY, /object-src 'none'/);
  assert.match(BASELINE_CONTENT_SECURITY_POLICY, /frame-ancestors 'none'/);
  assert.equal(CLERK_CONTENT_SECURITY_POLICY.strict, true);
  assert.deepEqual(CLERK_CONTENT_SECURITY_POLICY.directives["object-src"], ["'none'"]);
  assert.deepEqual(CLERK_CONTENT_SECURITY_POLICY.directives["frame-ancestors"], ["'none'"]);
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
