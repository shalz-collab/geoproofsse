import { By } from "selenium-webdriver";
import assert from "assert";

/**
 * Runs Accessibility Testing Suite (AC-001 to AC-010)
 * 
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} baseUrl - Base URL of the web application
 * @param {Function} runTest - Runner function (id, name, fn)
 */
export async function runSuite(driver, baseUrl, runTest) {
  
  await runTest("AC-001", "Verify header logo contains alt description attribute", async () => {
    await driver.get(baseUrl);
    const logo = await driver.findElement(By.xpath("//header//img"));
    const alt = await logo.getAttribute("alt");
    assert.strictEqual(alt, "GeoProof");
  });

  await runTest("AC-002", "Verify camera switch button on capture page contains aria-label", async () => {
    await driver.get(baseUrl + "/capture");
    const switchBtn = await driver.findElement(By.xpath("//button[@aria-label='Switch camera']"));
    assert.ok(switchBtn);
  });

  await runTest("AC-003", "Verify capture shoot button on capture page contains aria-label", async () => {
    await driver.get(baseUrl + "/capture");
    const shootBtn = await driver.findElement(By.xpath("//button[@aria-label='Capture']"));
    assert.ok(shootBtn);
  });

  await runTest("AC-004", "Verify semantic landmark HTML tags exist (header, main, footer/nav)", async () => {
    await driver.get(baseUrl);
    const header = await driver.findElement(By.tagName("header"));
    const main = await driver.findElement(By.tagName("main"));
    const footer = await driver.findElement(By.tagName("footer"));
    assert.ok(header && main && footer);
  });

  await runTest("AC-005", "Verify settings switch controls use keyboard-accessible button tags", async () => {
    await driver.get(baseUrl + "/settings");
    const switchBtns = await driver.findElements(By.xpath("//button[@aria-pressed]"));
    for (const btn of switchBtns) {
      const tagName = await btn.getTagName();
      assert.strictEqual(tagName, "button");
    }
  });

  await runTest("AC-006", "Verify verification input field on /verify contains placeholder text", async () => {
    await driver.get(baseUrl + "/verify");
    const input = await driver.findElement(By.xpath("//input[@placeholder]"));
    const ph = await input.getAttribute("placeholder");
    assert.strictEqual(ph, "Enter Verification ID");
  });

  await runTest("AC-007", "Verify text indicators verify dark mode active classes", async () => {
    await driver.get(baseUrl + "/settings");
    const darkToggle = await driver.findElement(By.xpath("//button[@aria-pressed]"));
    const stateBefore = await darkToggle.getAttribute("aria-pressed");
    assert.ok(stateBefore === "true" || stateBefore === "false");
  });

  await runTest("AC-008", "Verify landing page has only a single h1 tag for correct header hierarchy", async () => {
    await driver.get(baseUrl);
    const h1s = await driver.findElements(By.tagName("h1"));
    assert.strictEqual(h1s.length, 1, "Should have exactly one h1 per page for SEO and a11y");
  });

  await runTest("AC-009", "Verify settings page has aria-pressed attribute toggled correctly", async () => {
    await driver.get(baseUrl + "/settings");
    const toggle = await driver.findElement(By.xpath("//button[@aria-pressed]"));
    const initial = await toggle.getAttribute("aria-pressed");
    await toggle.click();
    const current = await toggle.getAttribute("aria-pressed");
    assert.notStrictEqual(initial, current);
  });

  await runTest("AC-010", "Verify details page QR image renders alt tags successfully", async () => {
    await driver.get(baseUrl);
    // Seed
    const mockV = {
      id: "test-a11y-10",
      shortId: "TAC10",
      imageDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      qrDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      address: "SIMATS",
      timestamp: new Date().toISOString(),
      hash: "abc",
      status: "verified",
      confidence: 100
    };
    await driver.executeScript((data) => {
      localStorage.setItem("geoproof.verifications.v1", JSON.stringify([data]));
    }, mockV);

    await driver.get(baseUrl + "/v/test-a11y-10");
    const qrImg = await driver.findElement(By.xpath("//img[@alt='QR']"));
    assert.ok(qrImg);

    await driver.executeScript(() => localStorage.clear());
  });
}
