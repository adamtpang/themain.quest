const { chromium } = require("playwright");

const baseUrl = process.env.UI_BASE_URL || "http://localhost:3100";

let browser;

(async () => {
  browser = await chromium.launch({
    executablePath: process.env.BROWSER_EXECUTABLE || chromium.executablePath(),
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  const stateResponse = await page.request.get(`${baseUrl}/api/life-state`);
  if (!stateResponse.ok()) throw new Error(`life-state returned ${stateResponse.status()}`);
  const data = await stateResponse.json();
  let processRequested = false;
  let processPolled = false;
  let stateRefreshed = false;

  await page.route("**/api/life-agent", async (route) => {
    const request = route.request();
    if (request.method() === "POST" && request.postDataJSON()?.action === "shrink") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          move: {
            action: "Touch one object involved in the quest.",
            permission: "That single movement is enough for this round.",
          },
          data,
        }),
      });
    }
    if (request.method() === "POST" && request.postDataJSON()?.action === "process") {
      processRequested = true;
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ state: "running", message: "Processing the current outbox." }),
      });
    }
    if (request.method() === "GET" && processRequested) {
      processPolled = true;
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ state: "complete", message: "The current outbox is processed." }),
      });
    }
    return route.continue();
  });

  await page.route("**/api/life-state", async (route) => {
    const request = route.request();
    if (request.method() === "GET" && processPolled) {
      stateRefreshed = true;
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(data),
      });
    }
    return route.continue();
  });

  await page.goto(`${baseUrl}/life`, { waitUntil: "networkidle", timeout: 120000 });
  await page.getByText("Next quest", { exact: true }).waitFor();

  for (const hiddenSection of ["Next quest queue", "Seven-day momentum", "Century to today"]) {
    if (await page.getByText(hiddenSection, { exact: true }).count()) {
      throw new Error(`${hiddenSection} should not be visible in the one-quest interface`);
    }
  }

  const startButton = page.getByRole("button", { name: /^Start \d+m$/ });
  await startButton.click();
  await page.waitForFunction(
    () => !document.body.innerText.includes("00:00"),
    undefined,
    { timeout: 5000 },
  );
  await page.getByRole("button", { name: "Pause" }).click();

  await page.getByRole("button", { name: "Skip and explain why" }).click();
  await page.getByRole("heading", { name: "Why is this not the right next quest?" }).waitFor();
  await page.getByRole("button", { name: "Blocked" }).click();
  await page.getByRole("button", { name: "Keep this quest" }).click();

  await page.getByRole("button", { name: "Too hard? Make it smaller" }).click();
  await page.getByText("Touch one object involved in the quest.", { exact: true }).waitFor();
  await page.getByText("AI tuned", { exact: true }).waitFor();

  const processButton = page.getByRole("button", { name: "Process vault", exact: true });
  if (!(await processButton.isEnabled())) throw new Error("Process button is not ready");
  await processButton.click();
  await page.getByText("Vault processed and synced. Your next quest is ready.", { exact: true }).waitFor({ timeout: 10000 });
  if (!processRequested || !processPolled || !stateRefreshed) {
    throw new Error("Process did not complete the background sync and refresh loop");
  }
  if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);

  console.log(JSON.stringify({
    oneQuestOnly: true,
    stopwatch: "passed",
    skipReasonSheet: "passed without mutation",
    aiShrink: "passed with mocked response",
    processButton: "passed with mocked process completion",
    backgroundSyncRefresh: "passed without live mutation",
    browserErrors: errors.length,
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await browser?.close();
});
