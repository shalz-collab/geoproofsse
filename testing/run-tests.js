import { initDriver } from "./utils/driver-helper.js";
import { generateExcelReport } from "./utils/excel-reporter.js";
import { spawn } from "child_process";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

// ES Module resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const reportsDir = path.join(__dirname, "reports");

// Test Suites imports
import { runSuite as runFunctional } from "./suites/functional.suite.js";
import { runSuite as runUiUx } from "./suites/ui-ux.suite.js";
import { runSuite as runCompatibility } from "./suites/compatibility.suite.js";
import { runSuite as runPerformance } from "./suites/performance.suite.js";
import { runSuite as runSecurity } from "./suites/security.suite.js";
import { runSuite as runApi } from "./suites/api.suite.js";
import { runSuite as runDatabase } from "./suites/database.suite.js";
import { runSuite as runAccessibility } from "./suites/accessibility.suite.js";
import { runSuite as runMobile } from "./suites/mobile.suite.js";
import { runSuite as runRegression } from "./suites/regression.suite.js";

const results = [];
let currentCategory = "";

/**
 * Runner helper function to execute and log individual test cases.
 */
async function runTest(id, name, fn) {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    results.push({ id, category: currentCategory, name, status: "PASS", duration, error: null });
    console.log(`  [PASS] [${id}] - ${name} (${duration}ms)`);
  } catch (err) {
    const duration = Date.now() - start;
    const errMsg = err.stack || err.message;
    results.push({ id, category: currentCategory, name, status: "FAIL", duration, error: errMsg });
    console.log(`  [FAIL] [${id}] - ${name} (${duration}ms)`);
    console.error(`       Error: ${err.message}`);
  }
}

/**
 * Helper to wait for a local URL to be active.
 */
function waitForServer(url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        reject(new Error(`Server at ${url} failed to start in ${timeoutMs}ms`));
        return;
      }

      http.get(url, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          clearInterval(interval);
          resolve();
        }
      }).on("error", () => {
        // Retry silently
      });
    }, 500);
  });
}

async function main() {
  console.log("=================================================");
  console.log(" GEOPROOF-AI E2E SELENIUM AUTOMATION RUNNER");
  console.log("=================================================");

  let devServer;
  const port = "5173";
  const baseUrl = `http://localhost:${port}`;

  // 1. Start Web Server
  console.log(`\nStep 1: Starting local web server on port ${port}...`);
  devServer = spawn("npm", ["run", "dev"], {
    cwd: rootDir,
    shell: true,
    stdio: "ignore" // Ignore noise, we will poll port 5173
  });

  try {
    await waitForServer(baseUrl);
    console.log(`Server is up and running at ${baseUrl}`);
  } catch (err) {
    console.error("Error: Could not start the local web application server. Ensure that no other process is holding the port.");
    devServer.kill("SIGINT");
    process.exit(1);
  }

  // 2. Initialize WebDriver
  console.log("\nStep 2: Initializing Chrome Selenium WebDriver...");
  let driver;
  try {
    driver = await initDriver({ headless: true });
    console.log("Chrome WebDriver initialized successfully.");
  } catch (err) {
    console.error("Error: Failed to initialize Chrome WebDriver. Ensure Google Chrome is installed.");
    console.error(err);
    devServer.kill("SIGINT");
    process.exit(1);
  }

  // 3. Execute Suites
  try {
    console.log("\nStep 3: Running Test Cases (10 Categories)...");

    currentCategory = "1. Functional Testing";
    console.log(`\n--- Running ${currentCategory} ---`);
    await runFunctional(driver, baseUrl, runTest);

    currentCategory = "2. UI UX Testing";
    console.log(`\n--- Running ${currentCategory} ---`);
    await runUiUx(driver, baseUrl, runTest);

    currentCategory = "3. Compatibility Testing";
    console.log(`\n--- Running ${currentCategory} ---`);
    await runCompatibility(driver, baseUrl, runTest);

    currentCategory = "4. Performance Testing";
    console.log(`\n--- Running ${currentCategory} ---`);
    await runPerformance(driver, baseUrl, runTest);

    currentCategory = "5. Security Testing";
    console.log(`\n--- Running ${currentCategory} ---`);
    await runSecurity(driver, baseUrl, runTest);

    currentCategory = "6. API Testing";
    console.log(`\n--- Running ${currentCategory} ---`);
    await runApi(driver, baseUrl, runTest);

    currentCategory = "7. Database Testing";
    console.log(`\n--- Running ${currentCategory} ---`);
    await runDatabase(driver, baseUrl, runTest);

    currentCategory = "8. Accessibility Testing";
    console.log(`\n--- Running ${currentCategory} ---`);
    await runAccessibility(driver, baseUrl, runTest);

    currentCategory = "9. Mobile Specific Testing";
    console.log(`\n--- Running ${currentCategory} ---`);
    await runMobile(driver, baseUrl, runTest);

    currentCategory = "10. Regression Testing";
    console.log(`\n--- Running ${currentCategory} ---`);
    await runRegression(driver, baseUrl, runTest);

  } catch (err) {
    console.error("Fatal error during test suite execution:", err);
  } finally {
    // 4. Cleanup Driver
    console.log("\nStep 4: Shutting down WebDriver...");
    if (driver) {
      await driver.quit().catch(() => {});
    }

    // 5. Cleanup Server
    console.log("Step 5: Stopping local web server...");
    if (devServer) {
      // In Windows, spawn creates a cmd.exe shell wrapper. We need to kill the process tree.
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", devServer.pid, "/f", "/t"], { shell: true });
      } else {
        devServer.kill("SIGINT");
      }
    }
  }

  // 6. Generate Report
  console.log("\nStep 6: Generating Excel Analysis Report...");
  try {
    const reportPath = await generateExcelReport(results, reportsDir);
    console.log(`Excel report successfully generated: ${reportPath}`);
  } catch (err) {
    console.error("Failed to generate Excel report:", err);
  }

  // Summary output
  const total = results.length;
  const passed = results.filter(r => r.status === "PASS").length;
  const failed = results.filter(r => r.status === "FAIL").length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

  console.log("\n=================================================");
  console.log(" EXECUTION SUMMARY");
  console.log("=================================================");
  console.log(`  Total Tests Run: ${total}`);
  console.log(`  Passed:         ${passed}`);
  console.log(`  Failed:         ${failed}`);
  console.log(`  Pass Rate:      ${passRate}%`);
  console.log("=================================================");
}

main().catch(err => {
  console.error("Unexpected error in main runner:", err);
});
