import { By, until } from "selenium-webdriver";
import assert from "assert";

/**
 * Runs Functional Testing Suite (FN-001 to FN-012)
 * 
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} baseUrl - Base URL of the web application
 * @param {Function} runTest - Runner function (id, name, fn)
 */
export async function runSuite(driver, baseUrl, runTest) {
  
  await runTest("FN-001", "Verify landing page renders successfully with proper title", async () => {
    await driver.get(baseUrl);
    const title = await driver.getTitle();
    assert.match(title, /GeoProof/);
    
    const h1 = await driver.findElement(By.tagName("h1"));
    const h1Text = await h1.getText();
    assert.match(h1Text, /Every image/);
  });

  await runTest("FN-002", "Verify navigation from landing page to Capture page via 'Get started'", async () => {
    await driver.get(baseUrl);
    const getStartedBtn = await driver.findElement(By.xpath("//a[contains(text(), 'Get started')]"));
    await getStartedBtn.click();
    
    // Wait for route change to /capture
    await driver.wait(until.urlContains("/capture"), 5000);
    const heading = await driver.findElement(By.tagName("h1"));
    assert.strictEqual(await heading.getText(), "Live Capture");
  });

  await runTest("FN-003", "Verify navigation from landing page to Dashboard via 'View dashboard' button", async () => {
    await driver.get(baseUrl);
    const dashboardBtn = await driver.findElement(By.xpath("//a[contains(text(), 'View dashboard')]"));
    await dashboardBtn.click();
    
    await driver.wait(until.urlContains("/dashboard"), 5000);
    const heading = await driver.findElement(By.tagName("h1"));
    assert.strictEqual(await heading.getText(), "GEO-PROOF DASHBOARD");
  });

  await runTest("FN-004", "Verify top navigation link to 'Capture' works on desktop view", async () => {
    await driver.get(baseUrl + "/dashboard");
    const navLink = await driver.findElement(By.xpath("//nav[contains(@class, 'hidden md:flex')]//a[text()='Capture']"));
    await navLink.click();
    await driver.wait(until.urlContains("/capture"), 5000);
  });

  await runTest("FN-005", "Verify top navigation link to 'Stats' works on desktop view", async () => {
    await driver.get(baseUrl);
    const navLink = await driver.findElement(By.xpath("//nav[contains(@class, 'hidden md:flex')]//a[text()='Stats']"));
    await navLink.click();
    await driver.wait(until.urlContains("/dashboard"), 5000);
  });

  await runTest("FN-006", "Verify top navigation link to 'Verify' works on desktop view", async () => {
    await driver.get(baseUrl);
    const navLink = await driver.findElement(By.xpath("//nav[contains(@class, 'hidden md:flex')]//a[text()='Verify']"));
    await navLink.click();
    await driver.wait(until.urlContains("/verify"), 5000);
  });

  await runTest("FN-007", "Verify top navigation link to 'Scan' works on desktop view", async () => {
    await driver.get(baseUrl);
    const navLink = await driver.findElement(By.xpath("//nav[contains(@class, 'hidden md:flex')]//a[text()='Scan']"));
    await navLink.click();
    await driver.wait(until.urlContains("/scan"), 5000);
  });

  await runTest("FN-008", "Verify top navigation link to 'History' works on desktop view", async () => {
    await driver.get(baseUrl);
    const navLink = await driver.findElement(By.xpath("//nav[contains(@class, 'hidden md:flex')]//a[text()='History']"));
    await navLink.click();
    await driver.wait(until.urlContains("/history"), 5000);
  });

  await runTest("FN-009", "Verify header logo link navigates back to landing page", async () => {
    await driver.get(baseUrl + "/settings");
    const logoLink = await driver.findElement(By.xpath("//header//a[contains(@class, 'flex items-center')]"));
    await logoLink.click();
    await driver.wait(until.urlIs(baseUrl + "/"), 5000);
  });

  await runTest("FN-010", "Verify submission of invalid verification ID displays error message", async () => {
    await driver.get(baseUrl + "/verify");
    const input = await driver.findElement(By.xpath("//input[@placeholder='Enter Verification ID']"));
    await input.sendKeys("INVALID-ID-12345");
    
    const submitBtn = await driver.findElement(By.xpath("//button[text()='Verify Now']"));
    await submitBtn.click();
    
    // Check error text
    const errText = await driver.wait(until.elementLocated(By.xpath("//p[contains(@class, 'text-destructive')]")), 3000);
    assert.strictEqual(await errText.getText(), "No verification found for this ID.");
  });

  await runTest("FN-011", "Verify Settings controls change and persist notification settings in state", async () => {
    await driver.get(baseUrl + "/settings");
    const switches = await driver.findElements(By.xpath("//button[@aria-pressed]"));
    assert.ok(switches.length >= 2, "Expected at least 2 settings switches (Dark Mode and Notifications)");
    
    const initialPressed = await switches[1].getAttribute("aria-pressed");
    await switches[1].click(); // Toggle
    const newPressed = await switches[1].getAttribute("aria-pressed");
    assert.notStrictEqual(initialPressed, newPressed);
  });

  await runTest("FN-012", "Verify back buttons navigate to the previous history context", async () => {
    await driver.get(baseUrl);
    await driver.get(baseUrl + "/verify");
    const backBtn = await driver.findElement(By.xpath("//button[contains(@class, 'p-1')]"));
    await backBtn.click();
    
    // Wait for URL to return to landing page /
    await driver.wait(until.urlIs(baseUrl + "/"), 5000);
  });
}
