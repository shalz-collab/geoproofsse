import { By, until } from "selenium-webdriver";
import assert from "assert";

/**
 * Runs UI/UX Testing Suite (UI-001 to UI-012)
 * 
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} baseUrl - Base URL of the web application
 * @param {Function} runTest - Runner function (id, name, fn)
 */
export async function runSuite(driver, baseUrl, runTest) {
  
  await runTest("UI-001", "Verify header navigation contains Stats, Verify, Scan, History, Security, Settings links", async () => {
    await driver.get(baseUrl);
    const navItems = ["Stats", "Verify", "Scan", "History", "Security", "Settings"];
    for (const item of navItems) {
      const el = await driver.findElement(By.xpath(`//header//nav//a[text()='${item}']`));
      assert.ok(el, `Header navigation is missing link for ${item}`);
    }
  });

  await runTest("UI-002", "Verify header contains GeoProof logo image element", async () => {
    await driver.get(baseUrl);
    const logoImg = await driver.findElement(By.xpath("//header//img[@alt='GeoProof']"));
    assert.ok(logoImg, "Logo image not found in header");
    const src = await logoImg.getAttribute("src");
    assert.match(src, /^data:image\/jpeg;base64,/); // Base64 JSON asset url
  });

  await runTest("UI-003", "Verify Verify page displays ShieldCheck status icon", async () => {
    await driver.get(baseUrl + "/verify");
    const icon = await driver.findElement(By.css(".lucide-shield-check"));
    assert.ok(icon, "ShieldCheck icon not found on Verify page");
  });

  await runTest("UI-004", "Verify Security page displays Security Score and Risk Level indicators", async () => {
    await driver.get(baseUrl + "/security");
    const scoreText = await driver.findElement(By.xpath("//*[text()='Security Score']/following-sibling::p"));
    assert.strictEqual(await scoreText.getText(), "98/100");
    const riskText = await driver.findElement(By.xpath("//*[text()='Risk Level']/following-sibling::p"));
    assert.strictEqual(await riskText.getText(), "Low");
  });

  await runTest("UI-005", "Verify Settings page rows render with labels and description info", async () => {
    await driver.get(baseUrl + "/settings");
    const darkModeLabel = await driver.findElement(By.xpath("//p[text()='Dark Mode']"));
    const darkModeDesc = await driver.findElement(By.xpath("//p[text()='Toggle theme']"));
    assert.ok(darkModeLabel && darkModeDesc);
  });

  await runTest("UI-006", "Verify button styles use standard theme-based classes", async () => {
    await driver.get(baseUrl);
    const heroBtn = await driver.findElement(By.xpath("//a[contains(text(), 'Capture evidence')]"));
    const classList = await heroBtn.getAttribute("class");
    assert.match(classList, /bg-emerald-500|bg-emerald-400|transition/);
  });

  await runTest("UI-007", "Verify landing page features section lists exactly 4 feature grid cards", async () => {
    await driver.get(baseUrl);
    const featureCards = await driver.findElements(By.xpath("//section[@id='features']//div[contains(@class, 'rounded-2xl')]"));
    assert.strictEqual(featureCards.length, 4, "Expected exactly 4 features listed");
  });

  await runTest("UI-008", "Verify header logo contains rounded border and ring class alignment", async () => {
    await driver.get(baseUrl);
    const logoImg = await driver.findElement(By.xpath("//header//img[@alt='GeoProof']"));
    const classes = await logoImg.getAttribute("class");
    assert.match(classes, /rounded-full/);
    assert.match(classes, /ring-2/);
  });

  await runTest("UI-009", "Verify ID inputs on Verify page uses focus styling triggers", async () => {
    await driver.get(baseUrl + "/verify");
    const input = await driver.findElement(By.xpath("//input[@placeholder='Enter Verification ID']"));
    const classes = await input.getAttribute("class");
    assert.match(classes, /focus:ring-primary|focus:outline-none/);
  });

  await runTest("UI-010", "Verify landing page has background container and overlay gradient", async () => {
    await driver.get(baseUrl);
    const bgContainer = await driver.findElement(By.xpath("//div[contains(@class, 'absolute inset-0 -z-10')]"));
    assert.ok(bgContainer, "Background image wrapper container not found");
  });

  await runTest("UI-011", "Verify mobile navigation bar is hidden on standard desktop screen size", async () => {
    await driver.get(baseUrl);
    const mobileNav = await driver.findElement(By.xpath("//nav[contains(@class, 'md:hidden')]"));
    const display = await mobileNav.getCssValue("display");
    // On md:hidden, at width 1280, it should be hidden (display: none)
    assert.strictEqual(display, "none", "Mobile nav should be hidden on desktop views");
  });

  await runTest("UI-012", "Verify details page spacing and styling labels render properly with mock data", async () => {
    // Seed local storage mock
    await driver.get(baseUrl);
    const mockV = {
      id: "test-ui-12",
      shortId: "TUI1",
      imageDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      qrDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      lat: 13.0827,
      lng: 80.2707,
      accuracy: 5,
      address: "SIMATS Engineering campus, Chennai",
      timestamp: new Date().toISOString(),
      hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      status: "verified",
      confidence: 98,
      device: "Chrome WebDriver UI-UX Test"
    };
    await driver.executeScript((data) => {
      localStorage.setItem("geoproof.verifications.v1", JSON.stringify([data]));
    }, mockV);

    // Go to verification details page
    await driver.get(baseUrl + "/v/test-ui-12");
    await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Verification #TUI1')]")), 5000);

    const locationLabel = await driver.findElement(By.xpath("//*[text()='Location']"));
    assert.ok(locationLabel);
    
    // Clear storage for subsequent tests
    await driver.executeScript(() => localStorage.clear());
  });
}
