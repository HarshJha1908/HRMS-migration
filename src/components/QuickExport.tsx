import { useMemo, useState, useEffect } from "react";
import "./QuickExport.css";

import {
  getAllEmployeeLeaveBalanceReport,
  getAllEmployeeLeaveDetailsReport
} from "../services/apiService";

import type {
  ManagerLeaveBalanceExcelApi,
  ManagerLeaveDetailsExcelApi,
  EmployeeLeaveBalanceReportType
} from "../types/apiTypes";

import { CsvExportUtil } from "../utils/Utils";

type QuickReportType = "" | "leave-details" | "leave-balance";
type BalanceYearOption = "this-year" | "next-year";

const REPORT_OPTIONS: Array<{
  value: Exclude<QuickReportType, "">;
  label: string;
}> = [
  { value: "leave-details", label: "All Leave Details" },
  { value: "leave-balance", label: "All Leave Balance" }
];

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateForApi = (value: string) => {
  return value;
};

const QuickExport = () => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const [reportType, setReportType] =
    useState<QuickReportType>("");

  const [startDate, setStartDate] = useState(
    toDateInputValue(new Date(currentYear, 0, 1))
  );

  const [endDate, setEndDate] = useState(
    toDateInputValue(new Date())
  );

  const [balanceYearOption, setBalanceYearOption] =
    useState<BalanceYearOption>("this-year");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [tableData, setTableData] = useState<any[]>([]);

  const exportLeaveDetails = async () => {
    const apiStartDate = formatDateForApi(startDate);
    const apiEndDate = formatDateForApi(endDate);

    const data: ManagerLeaveDetailsExcelApi[] =
      await getAllEmployeeLeaveDetailsReport(
        apiStartDate,
        apiEndDate
      );
      setTableData(data);
    if (data.length === 0) {
      setMessage("No leave details records found.");
      return;
    }

    const csv =
      CsvExportUtil.generateManagerLeaveDetailsCsv(data);

    downloadCsv(
      csv,
      `all-leave-details-${apiStartDate}-to-${apiEndDate}.csv`
    );

    setMessage(
      `Exported ${data.length} leave detail record(s).`
    );
  };

  const exportLeaveBalance = async () => {
    const reportTypeValue: EmployeeLeaveBalanceReportType =
      balanceYearOption === "this-year" ? "TY" : "NY";

    const data: ManagerLeaveBalanceExcelApi[] =
      await getAllEmployeeLeaveBalanceReport(
        reportTypeValue
      );
      console.log("data", data);
      setTableData(data);
    if (data.length === 0) {
      setMessage("No leave balance records found.");
      return;
    }

    const csv =
      CsvExportUtil.generateManagerLeaveBalanceCsv(data);

    downloadCsv(
      csv,
      `all-leave-balance-${reportTypeValue}.csv`
    );

    setMessage(
      `Exported ${data.length} leave balance record(s).`
    );
  };

  const handleExport = async () => {
    if (!reportType) {
      setMessage("Please select report type.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      if (reportType === "leave-details") {
        await exportLeaveDetails();
      }

      if (reportType === "leave-balance") {
        await exportLeaveBalance();
      }
    } catch {
      setMessage(
        "Unable to export report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = (
    csv: string,
    fileName: string
  ) => {
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  };

  const fetchReportData = async () => {
  if (!reportType) return;

  try {
    setLoading(true);
    setMessage("");

    if (reportType === "leave-details") {
      const apiStartDate = formatDateForApi(startDate);
      const apiEndDate = formatDateForApi(endDate);

      const data = await getAllEmployeeLeaveDetailsReport(
        apiStartDate,
        apiEndDate
      );

      setTableData(data);
    }

    if (reportType === "leave-balance") {
      const reportTypeValue =
        balanceYearOption === "this-year" ? "TY" : "NY";

      const data = await getAllEmployeeLeaveBalanceReport(
        reportTypeValue
      );

      setTableData(data);
    }
  } catch {
    setMessage("Failed to load data.");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchReportData();
}, [reportType, startDate, endDate, balanceYearOption]);
  return (
    <section className="quick-export-page">
      <h1 className="quick-export-title">
        Quick Export :
      </h1>

      <div className="quick-export-panel">
        <div
          className={`quick-export-grid ${
            reportType
              ? "has-report"
              : "is-default"
          }`}
        >
          <label className="quick-export-field">
            <span>Report Type</span>

            <select
              value={reportType}
              onChange={(event) => {
                setReportType(
                  event.target.value as QuickReportType
                );

                setMessage("");
              }}
            >
              <option value="">
                Select Report Type
              </option>

              {REPORT_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {reportType === "leave-details" && (
            <div className="quick-export-controls">
              <label className="quick-export-field">
                <span>
                  Start Date
                  <strong>*</strong>
                </span>

                <input
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                />
              </label>

              <label className="quick-export-field">
                <span>
                  End Date
                  <strong>*</strong>
                </span>

                <input
                  type="date"
                  value={endDate}
                  onChange={(event) =>
                    setEndDate(event.target.value)
                  }
                />
              </label>
            </div>
          )}

          {reportType === "leave-balance" && (
            <div className="quick-export-controls">
              <fieldset className="quick-export-field quick-export-radio-field">
                <label>
                  <input
                    type="radio"
                    name="balanceYear"
                    value="this-year"
                    checked={
                      balanceYearOption ===
                      "this-year"
                    }
                    onChange={() =>
                      setBalanceYearOption(
                        "this-year"
                      )
                    }
                  />
                  This Year
                </label>
              </fieldset>

              <fieldset className="quick-export-field quick-export-radio-field">
                <label>
                  <input
                    type="radio"
                    name="balanceYear"
                    value="next-year"
                    checked={
                      balanceYearOption ===
                      "next-year"
                    }
                    onChange={() =>
                      setBalanceYearOption(
                        "next-year"
                      )
                    }
                  />
                  Next Year
                </label>
              </fieldset>
            </div>
          )}

          <div className="quick-export-action">
            <button
              type="button"
              onClick={handleExport}
              disabled={!reportType || loading}
            >
              {loading
                ? "Exporting..."
                : "Export"}
            </button>
          </div>
        </div>

        {message && (
          <p className="quick-export-message">
            {message}
          </p>
        )}
      </div>

{tableData.length > 0 && (
  <div className="leave-table-wrapper">
    <table className="leave-table">
      <thead>
        <tr>
          {Object.keys(tableData[0]).map((key) => (
            <th key={key}>{key}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {tableData.map((row, index) => (
          <tr key={index}>
            {Object.values(row).map((value, i) => (
              <td key={i}>{String(value ?? "")}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
    </section>
  );
};

export default QuickExport;