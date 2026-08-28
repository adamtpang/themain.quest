const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const verifyScript = process.env.BEAUTIFY_VERIFY_SCRIPT || path.join(
  process.env.USERPROFILE || process.env.HOME || "",
  ".agents",
  "skills",
  "beautify",
  "scripts",
  "verify_ui.js"
);
const verifySource = fs.readFileSync(verifyScript, "utf8");
const outputDir = process.env.UI_OUTPUT_DIR || path.join(process.cwd(), ".ui-checks", "landing");
const baseUrl = process.env.UI_BASE_URL || "http://127.0.0.1:3100";
fs.mkdirSync(outputDir, { recursive: true });

async function inspect(page, name, viewport, dark = false) {
  await page.setViewportSize(viewport);
  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 120000 });
  if (dark) {
    await page.evaluate(() => document.documentElement.classList.add("dark"));
  }
  await page.waitForTimeout(300);
  const report = await page.evaluate(verifySource);
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: true });
  return report;
}

let browser;

(async () => {
  browser = await chromium.launch({
    executablePath: process.env.BROWSER_EXECUTABLE || chromium.executablePath(),
    headless: true,
  });
  const page = await browser.newPage();
  const consoleErrors = [];
  const failedResponses = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) failedResponses.push({ status: response.status(), url: response.url() });
  });

  const desktop = await inspect(page, "landing-desktop", { width: 1440, height: 1000 });
  const dark = await inspect(page, "landing-dark", { width: 1440, height: 1000 }, true);
  const mobile = await inspect(page, "landing-mobile", { width: 390, height: 844 });

  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.waitForTimeout(700);
  const menuLinks = await page.locator('[role="dialog"] a').evaluateAll((links) =>
    links.map((link) => ({ label: link.textContent.trim(), href: link.getAttribute("href") }))
  );
  await page.screenshot({ path: path.join(outputDir, "landing-mobile-menu.png"), fullPage: false });

  const desktopNavLinks = await page
    .locator('nav[aria-label="Main navigation"] a')
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));

  for (const [name, report] of Object.entries({ desktop, dark, mobile })) {
    if (report.horizontalOverflow) throw new Error(`${name} has page-level horizontal overflow`);
    if (report.skeletonsLeft > 0) throw new Error(`${name} left ${report.skeletonsLeft} loading skeletons`);
  }
  if (failedResponses.length) throw new Error(`Failed responses: ${JSON.stringify(failedResponses)}`);
  if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join(" | ")}`);

  console.log(JSON.stringify({ desktop, dark, mobile, desktopNavLinks, menuLinks, failedResponses, consoleErrors }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await browser?.close();
});
