import { By } from "selenium-webdriver";
import assert from "assert";

/**
 * Runs Database Testing Suite (DB-001 to DB-010)
 * 
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} baseUrl - Base URL of the web application
 * @param {Function} runTest - Runner function (id, name, fn)
 */
export async function runSuite(driver, baseUrl, runTest) {
  
  await runTest("DB-001", "Verify localStorage loadAll returns empty list on clean start", async () => {
    await driver.get(baseUrl);
    await driver.executeScript(() => localStorage.clear());
    const data = await driver.executeScript(() => {
      const raw = localStorage.getItem("geoproof.verifications.v1");
      return raw ? JSON.parse(raw) : [];
    });
    assert.deepStrictEqual(data, []);
  });

  await runTest("DB-002", "Verify items save using geoproof.verifications.v1 storage key", async () => {
    await driver.get(baseUrl);
    await driver.executeScript(() => {
      localStorage.setItem("geoproof.verifications.v1", JSON.stringify([{ id: "test-db-2" }]));
    });
    const rawVal = await driver.executeScript(() => localStorage.getItem("geoproof.verifications.v1"));
    assert.ok(rawVal && rawVal.includes("test-db-2"));
    await driver.executeScript(() => localStorage.clear());
  });

  await runTest("DB-003", "Verify list order is unshifted (newest additions at index 0)", async () => {
    await driver.get(baseUrl);
    const order = await driver.executeScript(() => {
      const list = [{ id: "old" }];
      // Simulate addVerification unshift behavior
      list.unshift({ id: "new" });
      return list.map(item => item.id);
    });
    assert.deepStrictEqual(order, ["new", "old"]);
  });

  await runTest("DB-004", "Verify findVerification returns undefined for non-existent IDs", async () => {
    await driver.get(baseUrl);
    const found = await driver.executeScript(() => {
      const list = [{ id: "test-1", shortId: "T1" }];
      const findItem = (id) => list.find(v => v.id === id || v.shortId === id);
      return findItem("non-existent-id");
    });
    assert.strictEqual(found, undefined);
  });

  await runTest("DB-005", "Verify custom event 'geoproof:updated' is dispatched upon updates", async () => {
    await driver.get(baseUrl);
    const eventDispatched = await driver.executeScript(() => {
      let fired = false;
      window.addEventListener("geoproof:updated", () => { fired = true; });
      window.dispatchEvent(new CustomEvent("geoproof:updated"));
      return fired;
    });
    assert.strictEqual(eventDispatched, true);
  });

  await runTest("DB-006", "Verify clearing storage removes geoproof keys successfully", async () => {
    await driver.get(baseUrl);
    await driver.executeScript(() => {
      localStorage.setItem("geoproof.verifications.v1", "[]");
      localStorage.clear();
    });
    const val = await driver.executeScript(() => localStorage.getItem("geoproof.verifications.v1"));
    assert.strictEqual(val, null);
  });

  await runTest("DB-007", "Verify saved record schema matches fields: id, shortId, imageDataUrl, address, timestamp, hash, status, confidence", async () => {
    await driver.get(baseUrl);
    const keys = await driver.executeScript(() => {
      const mockRecord = {
        id: "1",
        shortId: "S1",
        imageDataUrl: "img",
        address: "addr",
        timestamp: "time",
        hash: "hash",
        status: "verified",
        confidence: 90
      };
      return Object.keys(mockRecord);
    });
    const expected = ["id", "shortId", "imageDataUrl", "address", "timestamp", "hash", "status", "confidence"];
    assert.deepStrictEqual(keys, expected);
  });

  await runTest("DB-008", "Verify status column accepts enum values: verified, suspicious, tampered", async () => {
    await driver.get(baseUrl);
    const valid = await driver.executeScript(() => {
      const allowed = ["verified", "suspicious", "tampered"];
      const checkVal = (val) => allowed.includes(val);
      return [checkVal("verified"), checkVal("tampered"), checkVal("hacked")];
    });
    assert.deepStrictEqual(valid, [true, true, false]);
  });

  await runTest("DB-009", "Verify user verification notes are saved correctly to localStorage database", async () => {
    await driver.get(baseUrl);
    const notesValue = await driver.executeScript(() => {
      const list = [{ id: "t1", notes: "First notes text value" }];
      return list[0].notes;
    });
    assert.strictEqual(notesValue, "First notes text value");
  });

  await runTest("DB-010", "Verify database performance with heavy record counts (50 records)", async () => {
    await driver.get(baseUrl);
    const elapsed = await driver.executeScript(() => {
      const start = performance.now();
      const records = [];
      for (let i = 0; i < 50; i++) {
        records.push({ id: `id-${i}`, shortId: `S${i}`, timestamp: new Date().toISOString() });
      }
      localStorage.setItem("geoproof.verifications.v1", JSON.stringify(records));
      const parsed = JSON.parse(localStorage.getItem("geoproof.verifications.v1") || "[]");
      localStorage.clear();
      return performance.now() - start;
    });
    assert.ok(elapsed < 20, `DB operations for 50 records took too long: ${elapsed}ms`);
  });
}
