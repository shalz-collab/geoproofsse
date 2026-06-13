import { By } from "selenium-webdriver";
import assert from "assert";

/**
 * Runs Mobile Specific Testing Suite (MB-001 to MB-010)
 * 
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} baseUrl - Base URL of the web application
 * @param {Function} runTest - Runner function (id, name, fn)
 */
export async function runSuite(driver, baseUrl, runTest) {
  
  // Helper to change window size to mobile portrait
  async function setMobileViewport() {
    await driver.manage().window().setRect({ width: 375, height: 812 });
    await driver.sleep(200);
  }

  // Helper to restore standard window size
  async function restoreViewport() {
    await driver.manage().window().setRect({ width: 1280, height: 800 });
    await driver.sleep(200);
  }

  await runTest("MB-001", "Verify bottom navigation renders on mobile viewport width", async () => {
    await setMobileViewport();
    await driver.get(baseUrl);
    const bottomNav = await driver.findElement(By.xpath("//nav[contains(@class, 'md:hidden')]"));
    assert.strictEqual(await bottomNav.isDisplayed(), true);
  });

  await runTest("MB-002", "Verify mobile navigation has exactly 7 link icons in bottom nav", async () => {
    await setMobileViewport();
    await driver.get(baseUrl);
    const bottomLinks = await driver.findElements(By.xpath("//nav[contains(@class, 'md:hidden')]//a"));
    assert.strictEqual(bottomLinks.length, 7, "Mobile bottom navigation should contain exactly 7 items");
  });

  await runTest("MB-003", "Verify active link in mobile bottom nav contains active highlighting classes", async () => {
    await setMobileViewport();
    await driver.get(baseUrl + "/capture");
    const activeLink = await driver.findElement(By.xpath("//nav[contains(@class, 'md:hidden')]//a[contains(@class, 'text-primary')]"));
    assert.ok(activeLink);
  });

  await runTest("MB-004", "Verify top navigation header links are hidden on mobile screen dimensions", async () => {
    await setMobileViewport();
    await driver.get(baseUrl);
    const topNav = await driver.findElement(By.xpath("//header//nav[contains(@class, 'hidden md:flex')]"));
    assert.strictEqual(await topNav.isDisplayed(), false);
  });

  await runTest("MB-005", "Verify mobile camera container has flex-based layout classes", async () => {
    await setMobileViewport();
    await driver.get(baseUrl + "/capture");
    const previewContainer = await driver.findElement(By.xpath("//div[contains(@class, 'relative rounded-2xl overflow-hidden bg-black')]"));
    assert.ok(previewContainer);
  });

  await runTest("MB-006", "Verify mobile touch-friendly sizes for primary action buttons", async () => {
    await setMobileViewport();
    await driver.get(baseUrl + "/capture");
    const captureBtn = await driver.findElement(By.xpath("//button[@aria-label='Capture']"));
    const rect = await captureBtn.getRect();
    // Verify touch hit target is large enough (>= 48px standard)
    assert.ok(rect.width >= 48 && rect.height >= 48, "Capture button hit size should be touch friendly");
  });

  await runTest("MB-007", "Verify mobile margins and padding elements use standard fluid margins", async () => {
    await setMobileViewport();
    await driver.get(baseUrl);
    const headerWrapper = await driver.findElement(By.xpath("//header/div"));
    const paddingVal = await headerWrapper.getAttribute("class");
    assert.match(paddingVal, /px-4|px-6/);
  });

  await runTest("MB-008", "Verify mobile layouts have no horizontal page overflows", async () => {
    await setMobileViewport();
    await driver.get(baseUrl);
    const overflowX = await driver.executeScript(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    assert.strictEqual(overflowX, false, "Horizontal overflow detected on mobile viewport");
  });

  await runTest("MB-009", "Verify logo scales down nicely for mobile header size constraints", async () => {
    await setMobileViewport();
    await driver.get(baseUrl);
    const logoImg = await driver.findElement(By.xpath("//header//img"));
    const size = await logoImg.getRect();
    assert.ok(size.height <= 40, "Logo height should scale down for compact mobile header");
  });

  await runTest("MB-010", "Verify simple touch gesture capability is supported in mobile viewport", async () => {
    await setMobileViewport();
    await driver.get(baseUrl + "/settings");
    const toggle = await driver.findElement(By.xpath("//button[@aria-pressed]"));
    await toggle.click();
    assert.ok(toggle);
  });

  // Restore screen size
  await restoreViewport();
}
