import { useMemo, useState } from "react";
import "./QuickExport.css";
import { useAuth } from "../auth/useAuth";
import {
  getLeaveBalanceForExcelByManagerId,
  getLeaveDetailsForExcelByManagerId
} from "../services/apiService";
import type {
  ManagerLeaveBalanceExcelApi
} from "../types/apiTypes";
import { CsvExportUtil } from "../utils/Utils";

type QuickReportType = "" | "leave-details" | "leave-balance";
type BalanceYearOption = "this-year" | "next-year";

const REPORT_OPTIONS: Array<{ value: Exclude<QuickReportType, "">; label: string }> = [
  { value: "leave-details", label: "All Leave Details" },
  { value: "leave-balance", label: "All Leave Balance" }
];

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseReportDate = (value: string | null | undefined) => {
  const text = String(value || "").trim();
  if (!text) return null;

  const dateOnly = text.split("T")[0].trim();
  const separator = dateOnly.includes("/") ? "/" : dateOnly.includes("-") ? "-" : "";
  if (!separator) {
    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parts = dateOnly.split(separator).map((part) => part.trim());
  if (parts.length !== 3) {
    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const [first, second, third] = parts;
  const yearFirst = first.length === 4;
  const year = Number(yearFirst ? first : third);
  const month = Number(second);
  const day = Number(yearFirst ? third : first);
  const parsed = new Date(year, month - 1, day);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeDateStart = (value: string) => {
  const parsed = parseReportDate(value);
  if (!parsed) return null;

  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

const normalizeDateEnd = (value: string) => {
  const parsed = parseReportDate(value);
  if (!parsed) return null;

  parsed.setHours(23, 59, 59, 999);
  return parsed;
};

const downloadCsv = (csv: string, fileName: string) => {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const QuickExport = () => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [reportType, setReportType] = useState<QuickReportType>("");
  const [startDate, setStartDate] = useState(toDateInputValue(new Date(currentYear, 0, 1)));
  const [endDate, setEndDate] = useState(toDateInputValue(new Date()));
  const [balanceYearOption, setBalanceYearOption] = useState<BalanceYearOption>("this-year");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  const selectedBalanceYear = balanceYearOption === "this-year" ? currentYear : currentYear + 1;

  const exportLeaveDetails = async (userId: string) => {
    const rangeStart = normalizeDateStart(startDate);
    const rangeEnd = normalizeDateEnd(endDate);

    if (!rangeStart || !rangeEnd) {
      setMessage("Please select valid start and end dates.");
      return;
    }

    if (rangeStart > rangeEnd) {
      setMessage("Start date cannot be after end date.");
      return;
    }

    const data = await getLeaveDetailsForExcelByManagerId(userId);
    const filteredData = data.filter((item) => {
      const itemStart = normalizeDateStart(item.startDate || "");
      const itemEnd = normalizeDateEnd(item.endDate || item.startDate || "");

      if (!itemStart && !itemEnd) return false;

      const effectiveStart = itemStart || itemEnd;
      const effectiveEnd = itemEnd || itemStart;

      return Boolean(effectiveStart && effectiveEnd && effectiveStart <= rangeEnd && effectiveEnd >= rangeStart);
    });

    if (filteredData.length === 0) {
      setMessage("No leave details found for selected date range.");
      return;
    }

    downloadCsv(
      CsvExportUtil.generateManagerLeaveDetailsCsv(filteredData),
      `all-leave-details-${startDate}-to-${endDate}.csv`
    );
    setMessage(`Exported ${filteredData.length} leave detail record(s).`);
  };

  const exportLeaveBalance = async (userId: string) => {
    const data: ManagerLeaveBalanceExcelApi[] = await getLeaveBalanceForExcelByManagerId(userId);

    if (data.length === 0) {
      setMessage("No leave balance records found.");
      return;
    }

    downloadCsv(
      CsvExportUtil.generateManagerLeaveBalanceCsv(data),
      `all-leave-balance-${selectedBalanceYear}.csv`
    );
    setMessage(`Exported ${data.length} leave balance record(s) for ${selectedBalanceYear}.`);
  };

  const handleExport = async () => {
    const userId = String(user?.loginUserAdID || "").trim();
    if (!reportType) {
      setMessage("Please select report type.");
      return;
    }

    if (!userId) {
      setMessage("Unable to identify logged in user.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      if (reportType === "leave-details") {
        await exportLeaveDetails(userId);
      } else {
        await exportLeaveBalance(userId);
      }
    } catch {
      setMessage("Unable to export report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="quick-export-page">
      <h1 className="quick-export-title">Quick Export :</h1>

      <div className="quick-export-panel">
        <div className={`quick-export-grid ${reportType ? "has-report" : "is-default"}`}>
          <label className="quick-export-field">
            <span>Report Type</span>
            <select
              value={reportType}
              onChange={(event) => {
                setReportType(event.target.value as QuickReportType);
                setMessage("");
              }}
            >
              <option value="">Select Report Type</option>
              {REPORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {reportType === "leave-details" && (
            <div className="quick-export-controls">
              <label className="quick-export-field">
                <span>Start Date (dd/mm/yyyy)<strong>*</strong></span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </label>

              <label className="quick-export-field">
                <span>End Date (dd/mm/yyyy)<strong>*</strong></span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
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
                    checked={balanceYearOption === "this-year"}
                    onChange={() => setBalanceYearOption("this-year")}
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
                    checked={balanceYearOption === "next-year"}
                    onChange={() => setBalanceYearOption("next-year")}
                  />
                  Next Year
                </label>
              </fieldset>
            </div>
          )}
          <div className="quick-export-action">
            <button type="button" onClick={handleExport} disabled={!reportType || loading}>
              {loading ? "Exporting..." : "Export"}
            </button>
          </div>
        </div>

        {message && <p className="quick-export-message">{message}</p>}
      </div>
    </section>
  );
};

export default QuickExport;
