const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const verifySource = fs.readFileSync(
  "C:\\Users\\adamp\\.agents\\skills\\beautify\\scripts\\verify_ui.js",
  "utf8"
);
const outputDir = process.env.UI_OUTPUT_DIR || path.join(process.cwd(), ".ui-checks");
fs.mkdirSync(outputDir, { recursive: true });

async function inspect(page, name, url, viewport, dark = false) {
  await page.setViewportSize(viewport);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(1800);
  if (dark) {
    await page.getByRole("button", { name: "Toggle color theme" }).click();
    await page.waitForTimeout(250);
  }
  const report = await page.evaluate(verifySource);
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: true });
  return report;
}

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.BROWSER_EXECUTABLE || chromium.executablePath(),
    headless: true,
  });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  const reports = {
    publicDesktop: await inspect(page, "public-desktop", "http://localhost:3100", { width: 1440, height: 1000 }),
    lifeDesktop: await inspect(page, "life-desktop", "http://localhost:3100/life", { width: 1440, height: 1000 }),
    lifeDark: await inspect(page, "life-dark", "http://localhost:3100/life", { width: 1440, height: 1000 }, true),
    lifeMobile: await inspect(page, "life-mobile", "http://localhost:3100/life", { width: 390, height: 844 }),
    consoleErrors,
  };

  console.log(JSON.stringify(reports, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
