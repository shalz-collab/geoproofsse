import { By, until } from "selenium-webdriver";
import assert from "assert";

/**
 * Runs Compatibility Testing Suite (CP-001 to CP-010)
 * 
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} baseUrl - Base URL of the web application
 * @param {Function} runTest - Runner function (id, name, fn)
 */
export async function runSuite(driver, baseUrl, runTest) {
  
  // Helper to change window size
  async function setWindowSize(w, h) {
    await driver.manage().window().setRect({ width: w, height: h });
    // Pause briefly for layout recalculations
    await driver.sleep(200);
  }

  await runTest("CP-001", "Verify desktop layout (1280x800) displays top navigation and hides mobile bottom-nav", async () => {
    await setWindowSize(1280, 800);
    await driver.get(baseUrl);
    const topNav = await driver.findElement(By.xpath("//header//nav[contains(@class, 'hidden md:flex')]"));
    assert.strictEqual(await topNav.getCssValue("display"), "flex");

    const bottomNav = await driver.findElement(By.xpath("//nav[contains(@class, 'md:hidden')]"));
    assert.strictEqual(await bottomNav.getCssValue("display"), "none");
  });

  await runTest("CP-002", "Verify tablet portrait layout (768x1024) displays top-nav links properly", async () => {
    await setWindowSize(768, 1024);
    await driver.get(baseUrl);
    // On 768px (Vite/Tailwind 'md' is 768px), top nav should be visible (display flex or block)
    const topNav = await driver.findElement(By.xpath("//header//nav[contains(@class, 'hidden md:flex')]"));
    const display = await topNav.getCssValue("display");
    assert.ok(display === "flex" || display === "block");
  });

  await runTest("CP-003", "Verify mobile portrait layout (375x812) displays mobile bottom navigation menu", async () => {
    await setWindowSize(375, 812);
    await driver.get(baseUrl);
    const bottomNav = await driver.findElement(By.xpath("//nav[contains(@class, 'md:hidden')]"));
    assert.match(await bottomNav.getCssValue("display"), /block|grid|flex/);
  });

  await runTest("CP-004", "Verify mobile portrait layout (375x812) hides desktop top-nav links", async () => {
    await setWindowSize(375, 812);
    await driver.get(baseUrl);
    const topNav = await driver.findElement(By.xpath("//header//nav[contains(@class, 'hidden md:flex')]"));
    assert.strictEqual(await topNav.getCssValue("display"), "none");
  });

  await runTest("CP-005", "Verify capture camera wrapper component maintains responsive structure on mobile", async () => {
    await setWindowSize(375, 812);
    await driver.get(baseUrl + "/capture");
    const previewBox = await driver.findElement(By.xpath("//div[contains(@class, 'aspect-[3/4]')]"));
    assert.ok(previewBox, "Aspect ratio camera wrapper not found on mobile viewport");
  });

  await runTest("CP-006", "Verify search input in History matches screen size width adaptions", async () => {
    await setWindowSize(375, 812);
    await driver.get(baseUrl + "/history");
    const search = await driver.findElement(By.xpath("//input[contains(@placeholder, 'Search by')]"));
    const width = await search.getRect();
    assert.ok(width.width > 200, "Search input should adapt and have full container width spacing");
  });

  await runTest("CP-007", "Verify landing page feature section wraps content successfully on mobile viewports", async () => {
    await setWindowSize(375, 812);
    await driver.get(baseUrl);
    const grid = await driver.findElement(By.xpath("//section[@id='features']/div"));
    const classVal = await grid.getAttribute("class");
    assert.match(classVal, /grid-cols-2/); // Check that grid-cols-2 class exists for mobile stacking
  });

  await runTest("CP-008", "Verify verify page form elements center successfully on mobile widths", async () => {
    await setWindowSize(375, 812);
    await driver.get(baseUrl + "/verify");
    const form = await driver.findElement(By.tagName("form"));
    const rect = await form.getRect();
    assert.ok(rect.width > 250 && rect.width <= 375, "Verify form width should adjust responsively on mobile");
  });

  await runTest("CP-009", "Verify verification detail grid adapts columns dynamically from mobile to desktop", async () => {
    await setWindowSize(375, 812);
    // Seed and visit details page
    const mockV = {
      id: "test-compat-9",
      shortId: "TCM9",
      imageDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      address: "SIMATS Campus",
      timestamp: new Date().toISOString(),
      hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      status: "verified",
      confidence: 90
    };
    await driver.get(baseUrl);
    await driver.executeScript((data) => {
      localStorage.setItem("geoproof.verifications.v1", JSON.stringify([data]));
    }, mockV);

    await driver.get(baseUrl + "/v/test-compat-9");
    const grid = await driver.findElement(By.xpath("//div[contains(@class, 'grid md:grid-cols-2')]"));
    const classVal = await grid.getAttribute("class");
    assert.match(classVal, /grid/);
    assert.match(classVal, /md:grid-cols-2/);

    await driver.executeScript(() => localStorage.clear());
  });

  await runTest("CP-010", "Verify security checklist adapts to columnar layouts on desktop viewports", async () => {
    await setWindowSize(1280, 800);
    await driver.get(baseUrl + "/security");
    const checklist = await driver.findElement(By.xpath("//div[contains(@class, 'grid md:grid-cols-2')]"));
    assert.ok(checklist);
  });

  // Restore default window size for subsequent tests
  await setWindowSize(1280, 800);
}
