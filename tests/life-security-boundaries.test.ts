import assert from "node:assert/strict";
import test from "node:test";
import { encode } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { trustedLocalMutation } from "../app/api/life-agent/route";
import { getLifeAgentJobStatus, startProcessJob } from "../lib/local-life-agent";
import { safeAppCallback } from "../lib/safe-callback";
import { trustedSameOriginJsonMutation } from "../lib/request-security";
import { developmentAuthBypassEnabled, isAllowedEmail } from "../lib/auth-options";
import { proxy } from "../proxy";

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

test("production route enforcement redirects pages, rejects APIs, and accepts only the allowlisted token", async () => {
  const previous = {
    NODE_ENV: process.env.NODE_ENV,
    AUTH_DEV_BYPASS: process.env.AUTH_DEV_BYPASS,
    AUTH_ALLOWED_EMAIL: process.env.AUTH_ALLOWED_EMAIL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  };
  const restore = (key: keyof typeof previous) => {
    const value = previous[key];
    if (value === undefined) Reflect.deleteProperty(process.env, key);
    else Reflect.set(process.env, key, value);
  };

  try {
    Reflect.set(process.env, "NODE_ENV", "production");
    process.env.AUTH_DEV_BYPASS = "true";
    process.env.AUTH_ALLOWED_EMAIL = "owner@example.com";
    process.env.NEXTAUTH_SECRET = "test-only-secret";
    process.env.NEXTAUTH_URL = "https://themain.quest";

    const deniedPage = await proxy(new NextRequest("https://themain.quest/life"));
    assert.equal(deniedPage.status, 307);
    assert.match(deniedPage.headers.get("location") ?? "", /\/signin\?callbackUrl=%2Flife/);

    const deniedApi = await proxy(new NextRequest("https://themain.quest/api/life-state"));
    assert.equal(deniedApi.status, 401);

    const wrongToken = await encode({ token: { email: "other@example.com" }, secret: "test-only-secret" });
    const wrongRequest = new NextRequest("https://themain.quest/api/life-state", {
      headers: { cookie: `__Secure-next-auth.session-token=${wrongToken}` },
    });
    assert.equal((await proxy(wrongRequest)).status, 401);

    const allowedToken = await encode({ token: { email: "owner@example.com" }, secret: "test-only-secret" });
    const allowedRequest = new NextRequest("https://themain.quest/life", {
      headers: { cookie: `__Secure-next-auth.session-token=${allowedToken}` },
    });
    const allowedResponse = await proxy(allowedRequest);
    assert.equal(allowedResponse.status, 200);
    assert.equal(allowedResponse.headers.get("x-middleware-next"), "1");
  } finally {
    restore("NODE_ENV");
    restore("AUTH_DEV_BYPASS");
    restore("AUTH_ALLOWED_EMAIL");
    restore("NEXTAUTH_SECRET");
    restore("NEXTAUTH_URL");
  }
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
