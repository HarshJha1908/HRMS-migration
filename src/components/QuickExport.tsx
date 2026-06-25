/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useEffect } from "react";
import "./QuickExport.css";
 
import Pagination from "./Pagination";
 
import {
  getAllEmployeeLeaveBalanceReport,
  getAllEmployeeLeaveDetailsReport,
  getAllEmployeeEmergencyContactDetails,
  getAllEmployeeInsuranceNominationDetails
} from "../services/apiService";
 
import type {
  ManagerLeaveBalanceExcelApi,
  ManagerLeaveDetailsExcelApi,
  EmployeeLeaveBalanceReportType
} from "../types/apiTypes";
 
import { CsvExportUtil } from "../utils/CsvExportUtil";
 
type QuickReportType = "" | "leave-details" | "leave-balance" | "Emergency Contacts(All)" | "Insurance Report(All)";
 
type BalanceYearOption = "this-year" | "next-year";
 
const REPORT_OPTIONS: Array<{
  value: Exclude<QuickReportType, "">;
  label: string;
}> = [
    { value: "leave-details", label: "All Leave Details" },
    { value: "leave-balance", label: "All Leave Balance" },
    { value: "Emergency Contacts(All)", label: "All Emergency Contacts" },
    { value: "Insurance Report(All)", label: "All Insurance Nomination Details" }
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
 
const formatDisplayDate = (value: string) => {
  if (!value) return "";
 
  const parts = value.split("-");
 
  if (parts.length !== 3) return value;
 
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};
 
const QuickExport = () => {
  const currentYear = useMemo(
    () => new Date().getFullYear(),
    []
  );
 
  const [reportType, setReportType] =
    useState<QuickReportType>("");
 
  const [startDate, setStartDate] = useState(
    toDateInputValue(
      new Date(currentYear, 0, 1)
    )
  );
 
  const [endDate, setEndDate] = useState(
    toDateInputValue(new Date())
  );
 
  const [balanceYearOption, setBalanceYearOption] =
    useState<BalanceYearOption>("this-year");
 
  const [loading, setLoading] =
    useState(false);
 
  const [message, setMessage] =
    useState("");
 
  const [tableData, setTableData] =
    useState<any[]>([]);
 
  // Pagination
  const [currentPage, setCurrentPage] =
    useState(1);
 
  const rowsPerPage = 75;
 
  const totalPages = Math.ceil(
    tableData.length / rowsPerPage
  );
 
  const lastIndex =
    currentPage * rowsPerPage;
 
  const firstIndex =
    lastIndex - rowsPerPage;
 
  const paginatedData = tableData.slice(
    firstIndex,
    lastIndex
  );
 
  useEffect(() => {
    setCurrentPage(1);
  }, [
    reportType,
    startDate,
    endDate,
    balanceYearOption
  ]);
 
  const exportLeaveDetails = async () => {
    const apiStartDate =
      formatDateForApi(startDate);
 
    const apiEndDate =
      formatDateForApi(endDate);
 
    const data: ManagerLeaveDetailsExcelApi[] =
      await getAllEmployeeLeaveDetailsReport(
        apiStartDate,
        apiEndDate
      );
 
    setTableData(data);
 
    if (data.length === 0) {
      setMessage(
        "No leave details records found."
      );
      return;
    }
 
    const csv =
      CsvExportUtil.generateManagerLeaveDetailsCsv(
        data
      );
 
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
      balanceYearOption === "this-year"
        ? "TY"
        : "NY";
 
    const data: ManagerLeaveBalanceExcelApi[] =
      await getAllEmployeeLeaveBalanceReport(
        reportTypeValue
      );
 
    setTableData(data);
 
    if (data.length === 0) {
      setMessage(
        "No leave balance records found."
      );
      return;
    }
 
    const csv =
      CsvExportUtil.generateManagerLeaveBalanceCsv(
        data
      );
 
    downloadCsv(
      csv,
      `all-leave-balance-${reportTypeValue}.csv`
    );
 
    setMessage(
      `Exported ${data.length} leave balance record(s).`
    );
  };
  const exportEmergencyContacts =
  async () => {
    const response =
      await getAllEmployeeEmergencyContactDetails();
 
    const data = Array.isArray(response)
      ? response
      : [];
 
    setTableData(data);
 
    if (data.length === 0) {
      setMessage(
        "No emergency contact records found."
      );
      return;
    }
 
    const headers = Object.keys(data[0]);
 
    const csvRows = [
      headers.join(","),
      ...data.map((row: any) =>
        headers
          .map((header) => {
            const value =
              row[header] ?? "";
 
            return `"${String(value).replace(
              /"/g,
              '""'
            )}"`;
          })
          .join(",")
      )
    ];
 
    const csv =
      csvRows.join("\n");
 
    downloadCsv(
      csv,
      `all-emergency-contacts.csv`
    );
 
    setMessage(
      `Exported ${data.length} emergency contact record(s).`
    );
  };
  const exportInsuranceNomination = async () => {
    const data = await getAllEmployeeInsuranceNominationDetails();
    setTableData(data);
    if (!data || data.length === 0) {
      setMessage("No insurance nomination records found.");
      return;
    }
    // CSV export: use all keys as headers
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      
      ...data.map((row: any) =>
        headers
          .map((header) => {
            const value = row[header] ?? "";
            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(",")
      )
    ];
    const csv = csvRows.join("\n");
    downloadCsv(csv, `all-insurance-nomination-details.csv`);
    setMessage(`Exported ${data.length} insurance nomination record(s).`);
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
      } else if (reportType === "leave-balance") {
        await exportLeaveBalance();
      } else if (reportType === "Emergency Contacts(All)") {
        await exportEmergencyContacts();
      } else if (reportType === "Insurance Report(All)") {
        await exportInsuranceNomination();
      }
    } catch {
      setMessage("Unable to export report. Please try again.");
    } finally {
      setLoading(false);
    }
  };
 
  const downloadCsv = (
    csv: string,
    fileName: string
  ) => {
    const blob = new Blob(
      [`\uFEFF${csv}`],
      {
        type: "text/csv;charset=utf-8;"
      }
    );
 
    const url =
      URL.createObjectURL(blob);
 
    const link =
      document.createElement("a");
 
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
 
    if (
      reportType === "leave-details"
    ) {
      const apiStartDate =
        formatDateForApi(startDate);
 
      const apiEndDate =
        formatDateForApi(endDate);
 
      const data =
        await getAllEmployeeLeaveDetailsReport(
          apiStartDate,
          apiEndDate
        );
 
      setTableData(data);
    }
 
    if (
      reportType === "leave-balance"
    ) {
      const reportTypeValue =
        balanceYearOption ===
        "this-year"
          ? "TY"
          : "NY";
 
      const data =
        await getAllEmployeeLeaveBalanceReport(
          reportTypeValue
        );
 
      setTableData(data);
    }
 
    if (
      reportType ===
      "Emergency Contacts(All)"
    ) {
      const response =
        await getAllEmployeeEmergencyContactDetails();
 
      const data = Array.isArray(response)
        ? response
        : [];
 
      setTableData(data);
 
      if (data.length === 0) {
        setMessage(
          "No emergency contact records found."
        );
      }
    }
 
    if (
      reportType ===
      "Insurance Report(All)"
    ) {
      const response =
        await getAllEmployeeInsuranceNominationDetails();
 
      const data = Array.isArray(response)
        ? response
        : [];
 
      setTableData(data);
 
      if (data.length === 0) {
        setMessage(
          "No insurance nomination records found."
        );
      }
    }
  } catch {
    setMessage(
      "Failed to load data."
    );
  } finally {
    setLoading(false);
  }
};
 
  useEffect(() => {
    fetchReportData();
  }, [
    reportType,
    startDate,
    endDate,
    balanceYearOption
  ]);
 
  return (
    <section className="quick-export-page">
      <h1 className="quick-export-title">
        Quick Export :
      </h1>
 
      <div className="quick-export-panel">
        <div
          className={`quick-export-grid ${reportType
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
                  event.target
                    .value as QuickReportType
                );
 
                setMessage("");
              }}
            >
              <option value="">
                Select Report Type
              </option>
 
              {REPORT_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </label>
 
          {reportType ===
            "leave-details" && (
              <div className="quick-export-controls">
                <label className="quick-export-field">
                  <span>
                    Start Date
                    <strong>*</strong>
                  </span>
 
                  <input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={formatDisplayDate(startDate)}
                    onChange={(event) => {
                      const value = event.target.value;
 
                      if (value.includes("/")) {
                        const [dd, mm, yyyy] =
                          value.split("/");
 
                        setStartDate(
                          `${yyyy}-${mm}-${dd}`
                        );
                      }
                    }}
                  />
                </label>
 
                <label className="quick-export-field">
                  <span>
                    End Date
                    <strong>*</strong>
                  </span>
 
                  <input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={formatDisplayDate(endDate)}
                    onChange={(event) => {
                      const value = event.target.value;
 
                      if (value.includes("/")) {
                        const [dd, mm, yyyy] =
                          value.split("/");
 
                        setEndDate(
                          `${yyyy}-${mm}-${dd}`
                        );
                      }
                    }}
                  />
                </label>
              </div>
            )}
 
          {reportType ===
            "leave-balance" && (
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
              disabled={
                !reportType || loading
              }
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
        <>
          <div className="quick-export-table">
              <table>
                <thead>
                  <tr>
                    {Object.keys(
                      tableData[0]
                    ).map((key) => (
                      <th key={key}>
                        {key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (char) =>
                            char.toUpperCase()
                          )}
                      </th>
                    ))}
                  </tr>
                </thead>
 
                <tbody>
                  {paginatedData.map(
                    (row, index) => (
                      <tr key={index}>
                        {Object.values(
                          row
                        ).map(
                          (value, i) => (
                            <td key={i}>
                              {value !==
                                null &&
                                value !==
                                undefined
                                ? String(
                                  value
                                )
                                : "-"}
                            </td>
                          )
                        )}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
          </div>
 
          {totalPages > 1 && (
            <Pagination
              currentPage={
                currentPage
              }
              totalPages={
                totalPages
              }
              onPageChange={(
                page
              ) =>
                setCurrentPage(
                  page
                )
              }
            />
          )}
        </>
      )}
    </section>
  );
};
 
export default QuickExport;
