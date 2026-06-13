import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";

/**
 * Generates a styled Excel report for the test execution results.
 * 
 * @param {Array<Object>} results - Array of test results. Each result has:
 *   - id: string (e.g. 'FT-001')
 *   - category: string (e.g. 'Functional Testing')
 *   - name: string (description of the test)
 *   - status: 'PASS' | 'FAIL'
 *   - duration: number (milliseconds)
 *   - error: string | null (error message if failed)
 * @param {string} outputDir - Directory to save the excel file.
 * @returns {Promise<string>} Path to the generated Excel file.
 */
export async function generateExcelReport(results, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/T/, "_").replace(/:/g, "-").split(".")[0];
  const filename = `GeoProof_E2E_TestReport_${timestamp}.xlsx`;
  const filePath = path.join(outputDir, filename);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "GeoProof Selenium Automation";
  workbook.created = new Date();

  // Calculate metrics
  const totalTests = results.length;
  const passedTests = results.filter(r => r.status === "PASS").length;
  const failedTests = results.filter(r => r.status === "FAIL").length;
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  const totalDurationMs = results.reduce((acc, r) => acc + r.duration, 0);
  const totalDurationSec = (totalDurationMs / 1000).toFixed(2);

  // Group by category for the dashboard breakdown
  const categoriesMap = {};
  results.forEach(r => {
    if (!categoriesMap[r.category]) {
      categoriesMap[r.category] = { total: 0, passed: 0, failed: 0, duration: 0 };
    }
    categoriesMap[r.category].total += 1;
    if (r.status === "PASS") {
      categoriesMap[r.category].passed += 1;
    } else {
      categoriesMap[r.category].failed += 1;
    }
    categoriesMap[r.category].duration += r.duration;
  });

  // ==========================================
  // SHEET 1: DASHBOARD
  // ==========================================
  const dashSheet = workbook.addWorksheet("Dashboard", {
    views: [{ showGridLines: true }]
  });

  // Column definitions for spacing
  dashSheet.columns = [
    { width: 5 },   // A
    { width: 25 },  // B
    { width: 15 },  // C
    { width: 15 },  // D
    { width: 15 },  // E
    { width: 15 },  // F
    { width: 20 },  // G
  ];

  // Header Title block
  dashSheet.mergeCells("B2:G3");
  const titleCell = dashSheet.getCell("B2");
  titleCell.value = "GEOPROOF-AI E2E AUTOMATION TEST REPORT";
  titleCell.font = { name: "Segoe UI", size: 16, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F1B2D" } // Deep Blue
  };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  // Set borders for title
  for (let r = 2; r <= 3; r++) {
    for (let c = 2; c <= 7; c++) {
      const cell = dashSheet.getCell(r, c);
      cell.border = {
        top: { style: "medium", color: { argb: "FF0F1B2D" } },
        bottom: { style: "medium", color: { argb: "FF0F1B2D" } },
        left: { style: "medium", color: { argb: "FF0F1B2D" } },
        right: { style: "medium", color: { argb: "FF0F1B2D" } }
      };
    }
  }

  // Section: Metadata Info
  dashSheet.getCell("B5").value = "Execution Summary";
  dashSheet.getCell("B5").font = { name: "Segoe UI", size: 12, bold: true, color: { argb: "FF0F1B2D" } };

  const metaRows = [
    ["Run Timestamp", new Date().toLocaleString()],
    ["Platform", process.platform],
    ["Environment", "Local Development / E2E"],
    ["Browser Engine", "Google Chrome (Headless)"]
  ];

  metaRows.forEach((row, i) => {
    const rowIdx = 6 + i;
    dashSheet.getCell(`B${rowIdx}`).value = row[0];
    dashSheet.getCell(`B${rowIdx}`).font = { name: "Segoe UI", size: 10, bold: true };
    dashSheet.getCell(`B${rowIdx}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F4F8" } };
    
    dashSheet.getCell(`C${rowIdx}`).value = row[1];
    dashSheet.getCell(`C${rowIdx}`).font = { name: "Segoe UI", size: 10 };
    dashSheet.mergeCells(`C${rowIdx}:D${rowIdx}`);
    
    // borders
    dashSheet.getCell(`B${rowIdx}`).border = { bottom: { style: "thin", color: { argb: "FFD0D7DE" } } };
    dashSheet.getCell(`C${rowIdx}`).border = { bottom: { style: "thin", color: { argb: "FFD0D7DE" } } };
    dashSheet.getCell(`D${rowIdx}`).border = { bottom: { style: "thin", color: { argb: "FFD0D7DE" } } };
  });

  // Section: Stat KPI Blocks
  const kpis = [
    { col: "F", startRow: 5, label: "TOTAL TESTS", val: totalTests, color: "FF0F1B2D" },
    { col: "F", startRow: 8, label: "PASSED TESTS", val: passedTests, color: "FF10B981" },
    { col: "G", startRow: 5, label: "FAILED TESTS", val: failedTests, color: failedTests > 0 ? "FFEF4444" : "FF64748B" },
    { col: "G", startRow: 8, label: "PASS RATE", val: `${passRate.toFixed(1)}%`, color: passRate > 90 ? "FF10B981" : "FFF59E0B" }
  ];

  kpis.forEach(kpi => {
    // Label cell
    dashSheet.mergeCells(`${kpi.col}${kpi.startRow}:${kpi.col}${kpi.startRow + 1}`);
    const valCell = dashSheet.getCell(`${kpi.col}${kpi.startRow}`);
    valCell.value = kpi.val;
    valCell.font = { name: "Segoe UI", size: 18, bold: true, color: { argb: kpi.color } };
    valCell.alignment = { vertical: "middle", horizontal: "center" };
    valCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F4F8" } };

    const lblCell = dashSheet.getCell(`${kpi.col}${kpi.startRow + 2}`);
    lblCell.value = kpi.label;
    lblCell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: "FF64748B" } };
    lblCell.alignment = { vertical: "middle", horizontal: "center" };
    lblCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };

    // Set borders for KPI cards
    for (let r = kpi.startRow; r <= kpi.startRow + 2; r++) {
      const cell = dashSheet.getCell(`${kpi.col}${r}`);
      cell.border = {
        top: { style: "thin", color: { argb: "FFCBD5E1" } },
        bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
        left: { style: "thin", color: { argb: "FFCBD5E1" } },
        right: { style: "thin", color: { argb: "FFCBD5E1" } }
      };
    }
  });

  // Table Section: Results by Category
  dashSheet.getCell("B12").value = "Testing Category Breakdown";
  dashSheet.getCell("B12").font = { name: "Segoe UI", size: 12, bold: true, color: { argb: "FF0F1B2D" } };

  const tableHeaders = ["Category Suite", "Total Cases", "Passed", "Failed", "Duration (s)", "Pass Rate"];
  tableHeaders.forEach((th, idx) => {
    const cell = dashSheet.getCell(13, 2 + idx);
    cell.value = th;
    cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F1B2D" } };
    cell.alignment = { horizontal: idx === 0 ? "left" : "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin", color: { argb: "FF0F1B2D" } },
      bottom: { style: "medium", color: { argb: "FF0F1B2D" } },
      left: { style: "thin", color: { argb: "FF0F1B2D" } },
      right: { style: "thin", color: { argb: "FF0F1B2D" } }
    };
  });

  let rowIdx = 14;
  Object.keys(categoriesMap).forEach(cat => {
    const data = categoriesMap[cat];
    const catPassRate = (data.passed / data.total) * 100;
    const catDurSec = (data.duration / 1000).toFixed(2);

    const values = [cat, data.total, data.passed, data.failed, Number(catDurSec), `${catPassRate.toFixed(1)}%`];
    values.forEach((val, idx) => {
      const cell = dashSheet.getCell(rowIdx, 2 + idx);
      cell.value = val;
      cell.font = { name: "Segoe UI", size: 10 };
      cell.alignment = { horizontal: idx === 0 ? "left" : "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: "FFCBD5E1" } },
        bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
        left: { style: "thin", color: { argb: "FFCBD5E1" } },
        right: { style: "thin", color: { argb: "FFCBD5E1" } }
      };

      // Custom styling for rate or fail counts
      if (idx === 3 && data.failed > 0) {
        cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFEF4444" } };
      } else if (idx === 5) {
        cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: catPassRate === 100 ? "FF10B981" : "FFF59E0B" } };
      }
    });
    rowIdx++;
  });

  // Add overall summary row at bottom of table
  const totals = ["TOTAL SUMMARY", totalTests, passedTests, failedTests, Number(totalDurationSec), `${passRate.toFixed(1)}%`];
  totals.forEach((val, idx) => {
    const cell = dashSheet.getCell(rowIdx, 2 + idx);
    cell.value = val;
    cell.font = { name: "Segoe UI", size: 10, bold: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
    cell.alignment = { horizontal: idx === 0 ? "left" : "center", vertical: "middle" };
    cell.border = {
      top: { style: "medium", color: { argb: "FF0F1B2D" } },
      bottom: { style: "medium", color: { argb: "FF0F1B2D" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } }
    };

    if (idx === 3 && failedTests > 0) {
      cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFEF4444" } };
    }
  });


  // ==========================================
  // SHEET 2: DETAILED LOGS
  // ==========================================
  const logSheet = workbook.addWorksheet("Test Execution Details", {
    views: [{ showGridLines: true }]
  });

  logSheet.columns = [
    { header: "Test ID", key: "id", width: 12 },
    { header: "Category Suite", key: "category", width: 25 },
    { header: "Test Scenario Description", key: "name", width: 50 },
    { header: "Execution Status", key: "status", width: 18 },
    { header: "Duration (ms)", key: "duration", width: 15 },
    { header: "Failure details / Assert exception notes", key: "error", width: 60 }
  ];

  // Format header row in logs
  const logHeaderRow = logSheet.getRow(1);
  logHeaderRow.height = 28;
  logHeaderRow.eachCell((cell, idx) => {
    cell.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F1B2D" } };
    cell.alignment = { vertical: "middle", horizontal: idx === 3 || idx === 4 || idx === 1 ? "center" : "left" };
    cell.border = {
      top: { style: "thin", color: { argb: "FF0F1B2D" } },
      bottom: { style: "medium", color: { argb: "FF0F1B2D" } },
      left: { style: "thin", color: { argb: "FF0F1B2D" } },
      right: { style: "thin", color: { argb: "FF0F1B2D" } }
    };
  });

  // Populate data
  results.forEach((res, i) => {
    const row = logSheet.addRow({
      id: res.id,
      category: res.category,
      name: res.name,
      status: res.status,
      duration: res.duration,
      error: res.error || ""
    });
    row.height = 20;

    // Alternating background color
    const isEven = i % 2 === 0;
    const bgColor = isEven ? "FFFFFFFF" : "FFF9FAFB";

    row.eachCell((cell, colIdx) => {
      cell.font = { name: "Segoe UI", size: 10 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        left: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFE5E7EB" } }
      };

      // Status styling
      if (colIdx === 4) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        if (res.status === "PASS") {
          cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF10B981" } };
        } else {
          cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFEF4444" } };
        }
      } else if (colIdx === 5) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else if (colIdx === 1) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.font = { name: "Courier New", size: 10, bold: true };
      } else {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      }

      if (colIdx === 6 && res.error) {
        cell.font = { name: "Segoe UI", size: 9, color: { argb: "FFEF4444" } };
        cell.alignment = { wrapText: true, vertical: "middle" };
      }
    });
  });

  await workbook.xlsx.writeFile(filePath);
  return filePath;
}
