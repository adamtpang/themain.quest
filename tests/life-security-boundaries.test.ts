import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { getLifeAgentJobStatus, startProcessJob } from "../lib/local-life-agent";
import { trustedLocalMutation } from "../lib/local-request-security";
import { safeAppCallback } from "../lib/safe-callback";
import { trustedSameOriginJsonMutation } from "../lib/request-security";
import {
  clerkConfigured,
  developmentAuthBypassEnabled,
  isAllowedEmail,
  privateRouteKind,
  unconfiguredRouteDecision,
} from "../lib/auth-policy";

function localRequest(headers: Record<string, string>, url = "http://127.0.0.1:3100/api/life-agent") {
  return new NextRequest(url, { method: "POST", headers: { host: new URL(url).host, ...headers } });
}

test("local agent mutations require exact same-origin JSON requests", () => {
  const request = localRequest({
    origin: "http://127.0.0.1:3100",
    "content-type": "application/json; charset=utf-8",
    "sec-fetch-site": "same-origin",
    "x-life-agent-capability": "test-capability",
  });

  assert.equal(trustedLocalMutation(request, "test-capability"), true);
});

test("local agent mutations reject cross-origin browser requests", () => {
  const request = localRequest({
    origin: "https://hostile.example",
    "content-type": "application/json",
    "sec-fetch-site": "cross-site",
    "x-life-agent-capability": "test-capability",
  });

  assert.equal(trustedLocalMutation(request, "test-capability"), false);
});

test("local agent mutations reject simple text requests and non-loopback hosts", () => {
  const textRequest = localRequest({
    origin: "http://127.0.0.1:3100",
    "content-type": "text/plain",
    "sec-fetch-site": "same-origin",
    "x-life-agent-capability": "test-capability",
  });
  const remoteRequest = localRequest({
    origin: "http://192.0.2.10:3100",
    "content-type": "application/json",
    "sec-fetch-site": "same-origin",
    "x-life-agent-capability": "test-capability",
  }, "http://192.0.2.10:3100/api/life-agent");

  assert.equal(trustedLocalMutation(textRequest, "test-capability"), false);
  assert.equal(trustedLocalMutation(remoteRequest, "test-capability"), false);
});

test("local agent mutations reject a missing or incorrect capability", () => {
  const request = localRequest({
    origin: "http://127.0.0.1:3100",
    "content-type": "application/json",
    "sec-fetch-site": "same-origin",
    "x-life-agent-capability": "wrong-capability",
  });

  assert.equal(trustedLocalMutation(request, "test-capability"), false);
});

test("state mutations reject cross-origin and non-JSON requests", () => {
  const sameOrigin = localRequest({
    origin: "http://127.0.0.1:3100",
    "content-type": "application/json",
    "sec-fetch-site": "same-origin",
  }, "http://127.0.0.1:3100/api/life-state");
  const crossOrigin = localRequest({
    origin: "https://hostile.example",
    "content-type": "application/json",
    "sec-fetch-site": "cross-site",
  }, "http://127.0.0.1:3100/api/life-state");
  const simpleText = localRequest({
    origin: "http://127.0.0.1:3100",
    "content-type": "text/plain",
    "sec-fetch-site": "same-origin",
  }, "http://127.0.0.1:3100/api/life-state");

  assert.equal(trustedSameOriginJsonMutation(sameOrigin), true);
  assert.equal(trustedSameOriginJsonMutation(crossOrigin), false);
  assert.equal(trustedSameOriginJsonMutation(simpleText), false);
});

test("auth callbacks allow app paths and reject external or protocol-relative targets", () => {
  assert.equal(safeAppCallback("/life?from=signin"), "/life?from=signin");
  assert.equal(safeAppCallback("//hostile.example"), "/life");
  assert.equal(safeAppCallback("https://hostile.example"), "/life");
  assert.equal(safeAppCallback("/\\hostile.example"), "/life");
});

test("the email allowlist denies missing and wrong identities and accepts case-insensitively", () => {
  const previousAllowed = process.env.AUTH_ALLOWED_EMAIL;
  try {
    process.env.AUTH_ALLOWED_EMAIL = "owner@example.com";
    assert.equal(isAllowedEmail(undefined), false);
    assert.equal(isAllowedEmail("other@example.com"), false);
    assert.equal(isAllowedEmail("OWNER@EXAMPLE.COM"), true);
  } finally {
    if (previousAllowed === undefined) delete process.env.AUTH_ALLOWED_EMAIL;
    else process.env.AUTH_ALLOWED_EMAIL = previousAllowed;
  }
});

test("the development bypass is always ignored in production", () => {
  assert.equal(developmentAuthBypassEnabled({ NODE_ENV: "development", AUTH_DEV_BYPASS: "true" }), true);
  assert.equal(developmentAuthBypassEnabled({ NODE_ENV: "production", AUTH_DEV_BYPASS: "true" }), false);
  assert.equal(developmentAuthBypassEnabled({ NODE_ENV: "development", AUTH_DEV_BYPASS: "false" }), false);
});

test("private route classification covers every protected resource", () => {
  assert.equal(privateRouteKind("/life"), "page");
  assert.equal(privateRouteKind("/life/today"), "page");
  assert.equal(privateRouteKind("/money-os"), "page");
  assert.equal(privateRouteKind("/api/life-state"), "api");
  assert.equal(privateRouteKind("/api/life-agent"), "api");
  assert.equal(privateRouteKind("/api/money-os-state"), "api");
  assert.equal(privateRouteKind("/board"), null);
  assert.equal(privateRouteKind("/api/finn"), null);
});

test("Clerk is ready only when both public and secret keys exist", () => {
  assert.equal(clerkConfigured({
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_example",
    CLERK_SECRET_KEY: "sk_test_example",
  }), true);
  assert.equal(clerkConfigured({ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_example" }), false);
  assert.equal(clerkConfigured({ CLERK_SECRET_KEY: "sk_test_example" }), false);
});

test("production routing fails closed when Clerk owner authentication is not configured", () => {
  assert.deepEqual(unconfiguredRouteDecision("/life"), { action: "redirect", status: 307 });
  assert.deepEqual(unconfiguredRouteDecision("/api/life-state"), { action: "reject", status: 503 });
  assert.deepEqual(unconfiguredRouteDecision("/"), { action: "continue", status: 200 });
});

test("missing local paths return a durable unavailable job instead of a phantom running job", () => {
  const previousProfile = process.env.USERPROFILE;
  const previousVault = process.env.OBSIDIAN_VAULT_PATH;
  const previousSkill = process.env.PROCESS_SKILL_PATH;

  try {
    delete process.env.USERPROFILE;
    delete process.env.OBSIDIAN_VAULT_PATH;
    delete process.env.PROCESS_SKILL_PATH;
    const started = startProcessJob();

    assert.equal(started.state, "unavailable");
    assert.equal(getLifeAgentJobStatus().state, "unavailable");
  } finally {
    if (previousProfile === undefined) delete process.env.USERPROFILE;
    else process.env.USERPROFILE = previousProfile;
    if (previousVault === undefined) delete process.env.OBSIDIAN_VAULT_PATH;
    else process.env.OBSIDIAN_VAULT_PATH = previousVault;
    if (previousSkill === undefined) delete process.env.PROCESS_SKILL_PATH;
    else process.env.PROCESS_SKILL_PATH = previousSkill;
  }
});
