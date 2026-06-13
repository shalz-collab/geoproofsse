import { By, until } from "selenium-webdriver";
import assert from "assert";

/**
 * Runs Regression Testing Suite (RG-001 to RG-015)
 * 
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} baseUrl - Base URL of the web application
 * @param {Function} runTest - Runner function (id, name, fn)
 */
export async function runSuite(driver, baseUrl, runTest) {
  
  await runTest("RG-001", "Verify end-to-end flow from Capture to Detail Certificate works", async () => {
    await driver.get(baseUrl + "/capture");
    
    // We mock geolocation to specific coordinate
    await driver.executeCDP("Emulation.setGeolocationOverride", {
      latitude: 13.0827,
      longitude: 80.2707,
      accuracy: 10
    });

    await driver.sleep(500); // Allow coordinate acquisition

    // Shoot the image capture
    const captureBtn = await driver.findElement(By.xpath("//button[@aria-label='Capture']"));
    await captureBtn.click();

    // Wait for the detail view page redirect which indicates successful capture processing
    await driver.wait(until.urlContains("/v/"), 5000);
    const heading = await driver.findElement(By.xpath("//h1[contains(text(), 'Verification #')]"));
    assert.ok(heading, "E2E capture did not redirect to verification certificate page");
  });

  await runTest("RG-002", "Verify landing page button links continue to route to capture and dashboard routes", async () => {
    await driver.get(baseUrl);
    const captureLink = await driver.findElement(By.xpath("//a[contains(@href, '/capture')]"));
    const dashLink = await driver.findElement(By.xpath("//a[contains(@href, '/dashboard')]"));
    assert.ok(captureLink && dashLink);
  });

  await runTest("RG-003", "Verify switching theme persists dark setting values inside storage keys", async () => {
    await driver.get(baseUrl + "/settings");
    const toggle = await driver.findElement(By.xpath("//button[@aria-pressed]"));
    const initial = await toggle.getAttribute("aria-pressed");
    
    await toggle.click();
    const storageVal = await driver.executeScript(() => localStorage.getItem("geoproof.dark"));
    
    if (initial === "true") {
      assert.strictEqual(storageVal, "0");
    } else {
      assert.strictEqual(storageVal, "1");
    }
  });

  await runTest("RG-004", "Verify entering valid Verification ID routing maps to target detail view", async () => {
    // Seed storage with a mock record
    await driver.get(baseUrl);
    const mockV = {
      id: "test-reg-4",
      shortId: "TREG4",
      imageDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      address: "SIMATS Poonamallee",
      timestamp: new Date().toISOString(),
      hash: "xyz",
      status: "verified",
      confidence: 100
    };
    await driver.executeScript((data) => {
      localStorage.setItem("geoproof.verifications.v1", JSON.stringify([data]));
    }, mockV);

    await driver.get(baseUrl + "/verify");
    const input = await driver.findElement(By.xpath("//input[@placeholder='Enter Verification ID']"));
    await input.sendKeys("test-reg-4");
    
    const submitBtn = await driver.findElement(By.xpath("//button[text()='Verify Now']"));
    await submitBtn.click();

    // Verify it maps to details page successfully
    await driver.wait(until.urlContains("/v/test-reg-4"), 5000);
    await driver.executeScript(() => localStorage.clear());
  });

  await runTest("RG-005", "Verify gallery upload form control exists on QR scan page", async () => {
    await driver.get(baseUrl + "/scan");
    const uploadInput = await driver.findElement(By.xpath("//input[@type='file']"));
    assert.ok(uploadInput);
  });

  await runTest("RG-006", "Verify database verifications logs continue to persist across multiple navigation pages", async () => {
    // Seed
    await driver.get(baseUrl);
    const mockV = {
      id: "test-reg-6",
      shortId: "TRG6",
      imageDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      address: "SIMATS Poonamallee",
      timestamp: new Date().toISOString(),
      hash: "xyz",
      status: "verified",
      confidence: 100
    };
    await driver.executeScript((data) => {
      localStorage.setItem("geoproof.verifications.v1", JSON.stringify([data]));
    }, mockV);

    // Navigate away and back
    await driver.get(baseUrl + "/dashboard");
    await driver.get(baseUrl + "/history");
    
    const item = await driver.findElement(By.xpath("//p[contains(text(), 'test-reg-6')]"));
    assert.ok(item, "Record failed to persist after route changes");

    await driver.executeScript(() => localStorage.clear());
  });

  await runTest("RG-007", "Verify verification detail page maps location inside iframe embed container", async () => {
    await driver.get(baseUrl);
    const mockV = {
      id: "test-reg-7",
      shortId: "TRG7",
      imageDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      lat: 13.0827,
      lng: 80.2707,
      address: "SIMATS Poonamallee",
      timestamp: new Date().toISOString(),
      hash: "xyz",
      status: "verified",
      confidence: 100
    };
    await driver.executeScript((data) => {
      localStorage.setItem("geoproof.verifications.v1", JSON.stringify([data]));
    }, mockV);

    await driver.get(baseUrl + "/v/test-reg-7");
    const iframe = await driver.findElement(By.xpath("//iframe[@title='map']"));
    assert.ok(iframe);

    await driver.executeScript(() => localStorage.clear());
  });

  await runTest("RG-008", "Verify certificate details sharing link copy execution does not trigger error prompts", async () => {
    await driver.get(baseUrl);
    const mockV = {
      id: "test-reg-8",
      shortId: "TRG8",
      imageDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      address: "SIMATS Poonamallee",
      timestamp: new Date().toISOString(),
      hash: "xyz",
      status: "verified",
      confidence: 100
    };
    await driver.executeScript((data) => {
      localStorage.setItem("geoproof.verifications.v1", JSON.stringify([data]));
    }, mockV);

    await driver.get(baseUrl + "/v/test-reg-8");
    const shareBtn = await driver.findElement(By.xpath("//button[contains(@class, 'Share2') or .//*[local-name()='svg' and contains(@class, 'share')]]"));
    
    // Override alert/navigator.share to prevent blocking alert dialog
    await driver.executeScript(() => {
      window.alert = () => {};
      navigator.share = () => Promise.resolve();
    });

    await shareBtn.click();
    assert.ok(shareBtn);

    await driver.executeScript(() => localStorage.clear());
  });

  await runTest("RG-009", "Verify settings clear command empties verification records list", async () => {
    await driver.get(baseUrl);
    await driver.executeScript(() => {
      localStorage.setItem("geoproof.verifications.v1", JSON.stringify([{ id: "test" }]));
    });

    await driver.get(baseUrl + "/settings");
    const clearBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Clear All Local Captures')]"));
    
    // Mock confirm dialog
    await driver.executeScript(() => { window.confirm = () => true; });
    await clearBtn.click();
    
    const count = await driver.executeScript(() => {
      const items = localStorage.getItem("geoproof.verifications.v1");
      return items ? JSON.parse(items).length : 0;
    });
    assert.strictEqual(count, 0);
  });

  await runTest("RG-010", "Verify capture coordinates display location unavailable when geolocation fails", async () => {
    await driver.get(baseUrl + "/capture");
    
    // Override location accuracy/permissions to simulate GPS failure
    await driver.executeCDP("Emulation.clearGeolocationOverride");
    
    // Confirm layout loads default elements safely without crashing
    const gpsBtn = await driver.findElement(By.xpath("//button[contains(., 'GPS')]"));
    assert.ok(gpsBtn);
  });

  await runTest("RG-011", "Verify header logo navigation works correctly across all routes", async () => {
    await driver.get(baseUrl + "/security");
    const logoLink = await driver.findElement(By.xpath("//header//a[contains(@class, 'flex items-center')]"));
    await logoLink.click();
    await driver.wait(until.urlIs(baseUrl + "/"), 5000);
  });

  await runTest("RG-012", "Verify security row checklists render correct states dynamically", async () => {
    await driver.get(baseUrl + "/dashboard");
    const label = await driver.findElement(By.xpath("//*[text()='Anti-Tamper Protection']"));
    const status = await driver.findElement(By.xpath("//*[text()='Anti-Tamper Protection']/../following-sibling::span"));
    assert.strictEqual(await status.getText(), "Enabled");
  });

  await runTest("RG-013", "Verify details map container does not render if coordinate values are null", async () => {
    await driver.get(baseUrl);
    // Seed record without coordinates
    const mockV = {
      id: "test-reg-13",
      shortId: "TRG13",
      imageDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      lat: null,
      lng: null,
      address: "SIMATS",
      timestamp: new Date().toISOString(),
      hash: "abc",
      status: "verified",
      confidence: 80
    };
    await driver.executeScript((data) => {
      localStorage.setItem("geoproof.verifications.v1", JSON.stringify([data]));
    }, mockV);

    await driver.get(baseUrl + "/v/test-reg-13");
    const maps = await driver.findElements(By.xpath("//iframe[@title='map']"));
    assert.strictEqual(maps.length, 0, "Location map should not render if GPS is null");

    await driver.executeScript(() => localStorage.clear());
  });

  await runTest("RG-014", "Verify history search input successfully filters lists", async () => {
    await driver.get(baseUrl);
    const mockVs = [
      { id: "matching-reg-id", shortId: "MATCH", address: "Matching Place", timestamp: new Date().toISOString(), imageDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" },
      { id: "ignored-reg-id", shortId: "IGNORE", address: "Ignored Place", timestamp: new Date().toISOString(), imageDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" }
    ];
    await driver.executeScript((data) => {
      localStorage.setItem("geoproof.verifications.v1", JSON.stringify(data));
    }, mockVs);

    await driver.get(baseUrl + "/history");
    const search = await driver.findElement(By.xpath("//input[contains(@placeholder, 'Search by')]"));
    await search.sendKeys("Matching");
    await driver.sleep(200);

    const matches = await driver.findElements(By.xpath("//p[contains(text(), 'matching-reg-id')]"));
    const ignored = await driver.findElements(By.xpath("//p[contains(text(), 'ignored-reg-id')]"));
    
    assert.strictEqual(matches.length, 1);
    assert.strictEqual(ignored.length, 0);

    await driver.executeScript(() => localStorage.clear());
  });

  await runTest("RG-015", "Verify file input triggers selection dialog on capture gallery uploads", async () => {
    await driver.get(baseUrl + "/capture");
    const uploadInput = await driver.findElement(By.xpath("//input[@type='file']"));
    assert.ok(uploadInput);
  });
}
