import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

/**
 * Initializes a new Selenium WebDriver instance for Chrome.
 * Supports headless execution, screen resizing, and geolocation mocking.
 * 
 * @param {Object} config - Driver configurations.
 * @param {boolean} [config.headless=true] - Whether to run Chrome in headless mode.
 * @param {number} [config.width=1280] - Initial window width.
 * @param {number} [config.height=800] - Initial window height.
 * @returns {Promise<ThenableWebDriver>}
 */
export async function initDriver(config = {}) {
  const headless = config.headless !== false;
  const width = config.width || 1280;
  const height = config.height || 800;

  const options = new chrome.Options();
  
  // Set chrome preferences to automatically allow geolocation permission
  options.setUserPreferences({
    "profile.default_content_setting_values.geolocation": 1
  });

  // Basic chrome flags
  options.addArguments(
    `--window-size=${width},${height}`,
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-web-security" // Allow testing local mocks easily
  );

  if (headless) {
    options.addArguments("--headless=new");
  }

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  return driver;
}

/**
 * Sets mock geolocation coordinates via Chrome DevTools Protocol (CDP).
 * 
 * @param {WebDriver} driver - The selenium webdriver instance.
 * @param {number} latitude - Latitude to mock.
 * @param {number} longitude - Longitude to mock.
 * @param {number} [accuracy=10] - Accuracy in meters.
 */
export async function mockGeolocation(driver, latitude, longitude, accuracy = 10) {
  // We use executeCDP to set the geolocation override
  await driver.executeCDP("Emulation.setGeolocationOverride", {
    latitude: latitude,
    longitude: longitude,
    accuracy: accuracy
  });
}
