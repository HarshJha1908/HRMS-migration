import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type {
  EmployeeContactApi,
  ManagerLeaveBalanceExcelApi,
  ManagerLeaveDetailsExcelApi
} from "../types/apiTypes";

const asText = (value: string | number | boolean | null | undefined) => String(value ?? "").trim();

const asDisplay = (value: string | number | boolean | null | undefined, fallback = "NA") => {
  const text = asText(value);
  return text || fallback;
};

const escapeCsvCell = (value: string | number | boolean | null | undefined) => {
  const escaped = String(value ?? "").replace(/"/g, "\"\"");
  return `"${escaped}"`;
};

const buildPdf = (
  title: string,
  columns: string[],
  rows: Array<Array<string | number | boolean | null | undefined>>,
  options?: {
    format?: "a4" | "a3";
    fontSize?: number;
    headFontSize?: number;
    cellPadding?: number;
    margin?: { top: number; left?: number; right?: number; bottom?: number };
    headOverflow?: "linebreak" | "ellipsize" | "visible" | "hidden";
    columnStyles?: Record<number, { cellWidth?: number | "auto" | "wrap"; halign?: "left" | "center" | "right" }>;
  }
) => {
  const doc = new jsPDF({
    orientation: "landscape",
    format: options?.format || "a4",
  });

  doc.setFontSize(16);
  doc.setTextColor(0, 102, 153);
  doc.text(title, 14, 15);

  doc.setFontSize(10);
  doc.setTextColor(100);

  autoTable(doc, {
    head: [columns],
    body: rows.map((row) => row.map((cell) => asDisplay(cell, "-"))),
    startY: 20,
    theme: "grid",
    styles: {
      fontSize: options?.fontSize ?? 10,
      cellPadding: options?.cellPadding ?? 5,
      valign: "middle",
      halign: "center",
      lineColor: [207, 214, 223],
      lineWidth: 0.2,
      textColor: [69, 69, 69],
    },
    headStyles: {
      fillColor: [233, 239, 245],
      textColor: [31, 41, 55],
      fontStyle: "bold",
      fontSize: options?.headFontSize ?? 11,
      halign: "center",
      overflow: options?.headOverflow ?? "linebreak",
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
      textColor: [69, 69, 69],
    },
    margin: options?.margin ?? { top: 25 },
    columnStyles: options?.columnStyles,
  });

  return doc.output("blob");
};

export const PdfExportUtil = {
  generateEmergencyContactPdf: (data: EmployeeContactApi[]) => {
    const columns = [
      "Emp ID", "Emp Name", "Contact Name 1", "Contact No1",
      "Contact Name 2", "Contact No2", "Team Name", "Team Manager", "Team Head"
    ];

    const rows = data.map((item) => [
      item.empId,
      item.empName,
      item.contactNoName1,
      item.contactNo1,
      item.contactNoName2,
      item.contactNo2,
      item.teamName,
      item.managerName,
      item.headName
    ]);

    return buildPdf("Emergency Contact Report", columns, rows);
  },
  generateManagerLeaveDetailsPdf: (data: ManagerLeaveDetailsExcelApi[]) => {
    const columns = [
      "Requester Name",
      "Employee ID",
      "Start Date",
      "End Date",
      "Submission Date",
      "Approved Date",
      "Leave Type",
      "Status",
      "Approver Name",
      "Team Name",
      "No. of Days"
    ];

    const rows = data.map((item) => [
      item.requesterName,
      item.employeeId,
      item.startDate,
      item.endDate,
      item.submissionDate ?? item.submitionDate,
      item.dateOfApproved ?? item.dateofapproved,
      item.leaveTypeName,
      item.status,
      item.approverName,
      item.teamName,
      item.noOfDays
    ]);

    return buildPdf("Leave Details Report", columns, rows, {
      format: "a3",
      fontSize: 10,
      headFontSize: 10,
      cellPadding: 4,
      headOverflow: "visible",
      margin: { top: 25, left: 12, right: 12, bottom: 12 },
      columnStyles: {
        0: { cellWidth: 44, halign: "left" },
        1: { cellWidth: 32 },
        2: { cellWidth: 28 },
        3: { cellWidth: 28 },
        4: { cellWidth: 40 },
        5: { cellWidth: 38 },
        6: { cellWidth: 32 },
        7: { cellWidth: 26 },
        8: { cellWidth: 42, halign: "left" },
        9: { cellWidth: 36, halign: "left" },
        10: { cellWidth: 24 }
      }
    });
  },
  generateManagerLeaveBalancePdf: (data: ManagerLeaveBalanceExcelApi[]) => {
    const columns = [
      "Employee\nName",
      "Employee\nID",
      "BDL\nTotal",
      "BDL\nUsed",
      "BDL\nBalance",
      "CL\nTotal",
      "CL\nUsed",
      "CL\nBalance",
      "PL\nTotal",
      "PL\nUsed",
      "PL\nBalance",
      "ASL\nTotal",
      "ASL\nUsed",
      "ASL\nBalance",
      "PTL\nAppl.",
      "PTL\nTotal",
      "PTL\nUsed",
      "PTL\nBalance",
      "MTL\nAppl.",
      "MTL\nTotal",
      "MTL\nUsed",
      "MTL\nBalance",
      "SL\nTotal",
      "SL\nUsed",
      "SL\nBalance",
      "WFH\nTotal",
      "WFH\nUsed",
      "WFH\nBalance",
      "WFHX\nTotal",
      "WFHX\nUsed",
      "WFHX\nBalance"
    ];

    const rows = data.map((item) => [
      item.employeeName,
      item.employeeID,
      item.bdL_Total,
      item.bdL_Submitted,
      item.bdL_Balance,
      item.cL_Total,
      item.cL_Submitted,
      item.cL_Balance,
      item.pL_Total,
      item.pL_Submitted,
      item.pL_Balance,
      item.asL_Total,
      item.asL_Submitted,
      item.asL_Balance,
      item.isPTLApplicable ?? item.isPTLapplicable,
      item.ptL_Total,
      item.ptL_Submitted,
      item.ptL_Balance,
      item.isMTLApplicable ?? item.isMTLapplicable,
      item.mtL_Total,
      item.mtL_Submitted,
      item.mtL_Balance,
      item.sL_Total,
      item.sL_Submitted,
      item.sL_Balance,
      item.wfH_Total,
      item.wfH_Submitted,
      item.wfH_Balance,
      item.wfhX_Total,
      item.wfhX_Submitted,
      item.wfhX_Balance
    ]);

    return buildPdf("Leave Balance Report", columns, rows, {
      format: "a3",
      fontSize: 7,
      headFontSize: 8,
      cellPadding: 2.5,
      margin: { top: 25, left: 10, right: 10, bottom: 12 },
      columnStyles: {
        0: { cellWidth: 26, halign: "left" },
        1: { cellWidth: 18 },
        2: { cellWidth: 12 },
        3: { cellWidth: 12 },
        4: { cellWidth: 13 },
        5: { cellWidth: 12 },
        6: { cellWidth: 12 },
        7: { cellWidth: 13 },
        8: { cellWidth: 12 },
        9: { cellWidth: 12 },
        10: { cellWidth: 13 },
        11: { cellWidth: 12 },
        12: { cellWidth: 12 },
        13: { cellWidth: 13 },
        14: { cellWidth: 12 },
        15: { cellWidth: 12 },
        16: { cellWidth: 12 },
        17: { cellWidth: 13 },
        18: { cellWidth: 12 },
        19: { cellWidth: 12 },
        20: { cellWidth: 12 },
        21: { cellWidth: 13 },
        22: { cellWidth: 12 },
        23: { cellWidth: 12 },
        24: { cellWidth: 13 },
        25: { cellWidth: 12 },
        26: { cellWidth: 12 },
        27: { cellWidth: 13 },
        28: { cellWidth: 12 },
        29: { cellWidth: 12 },
        30: { cellWidth: 13 }
      }
    });
  }
};

export const CsvExportUtil = {
  generateEmergencyContactCsv: (data: EmployeeContactApi[]) => {
    const headers = [
      "Emp ID",
      "Emp Name",
      "Contact Name 1",
      "Contact No1",
      "Contact Name 2",
      "Contact No2",
      "Team Name",
      "Team Manager",
      "Team Head",
    ];

    const rows = data.map((item) => [
      escapeCsvCell(item.empId),
      escapeCsvCell(item.empName),
      escapeCsvCell(item.contactNoName1),
      escapeCsvCell(item.contactNo1),
      escapeCsvCell(item.contactNoName2),
      escapeCsvCell(item.contactNo2),
      escapeCsvCell(item.teamName),
      escapeCsvCell(item.managerName),
      escapeCsvCell(item.headName),
    ]);

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  },
  generateManagerLeaveDetailsCsv: (data: ManagerLeaveDetailsExcelApi[]) => {
    const headers = [
      "Employee ID",
      "Requester Name",
      "Start Date",
      "End Date",
      "Submission Date",
      "Approved Date",
      "Leave Type",
      "Status",
      "Approver Name",
      "Team Name",
      "No. of Days"
    ];

    const rows = data.map((item) => [
      escapeCsvCell(item.employeeId),
      escapeCsvCell(item.requesterName),
      escapeCsvCell(item.startDate),
      escapeCsvCell(item.endDate),
      escapeCsvCell(item.submissionDate ?? item.submitionDate),
      escapeCsvCell(item.dateOfApproved ?? item.dateofapproved),
      escapeCsvCell(item.leaveTypeName),
      escapeCsvCell(item.status),
      escapeCsvCell(item.approverName),
      escapeCsvCell(item.teamName),
      escapeCsvCell(item.noOfDays)
    ]);

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  },
  generateManagerLeaveBalanceCsv: (data: ManagerLeaveBalanceExcelApi[]) => {
    const headers = [
      "Employee ID",
      "Employee Name",
      "BDL Total",
      "BDL Submitted",
      "BDL Balance",
      "CL Total",
      "CL Submitted",
      "CL Balance",
      "PL Total",
      "PL Submitted",
      "PL Balance",
      "ASL Total",
      "ASL Submitted",
      "ASL Balance",
      "PTL Applicable",
      "PTL Total",
      "PTL Submitted",
      "PTL Balance",
      "MTL Applicable",
      "MTL Total",
      "MTL Submitted",
      "MTL Balance",
      "SL Total",
      "SL Submitted",
      "SL Balance",
      "WFH Total",
      "WFH Submitted",
      "WFH Balance",
      "WFHX Total",
      "WFHX Submitted",
      "WFHX Balance"
    ];

    const rows = data.map((item) => [
      escapeCsvCell(item.employeeID),
      escapeCsvCell(item.employeeName),
      escapeCsvCell(item.bdL_Total),
      escapeCsvCell(item.bdL_Submitted),
      escapeCsvCell(item.bdL_Balance),
      escapeCsvCell(item.cL_Total),
      escapeCsvCell(item.cL_Submitted),
      escapeCsvCell(item.cL_Balance),
      escapeCsvCell(item.pL_Total),
      escapeCsvCell(item.pL_Submitted),
      escapeCsvCell(item.pL_Balance),
      escapeCsvCell(item.asL_Total),
      escapeCsvCell(item.asL_Submitted),
      escapeCsvCell(item.asL_Balance),
      escapeCsvCell(item.isPTLApplicable ?? item.isPTLapplicable),
      escapeCsvCell(item.ptL_Total),
      escapeCsvCell(item.ptL_Submitted),
      escapeCsvCell(item.ptL_Balance),
      escapeCsvCell(item.isMTLApplicable ?? item.isMTLapplicable),
      escapeCsvCell(item.mtL_Total),
      escapeCsvCell(item.mtL_Submitted),
      escapeCsvCell(item.mtL_Balance),
      escapeCsvCell(item.sL_Total),
      escapeCsvCell(item.sL_Submitted),
      escapeCsvCell(item.sL_Balance),
      escapeCsvCell(item.wfH_Total),
      escapeCsvCell(item.wfH_Submitted),
      escapeCsvCell(item.wfH_Balance),
      escapeCsvCell(item.wfhX_Total),
      escapeCsvCell(item.wfhX_Submitted),
      escapeCsvCell(item.wfhX_Balance)
    ]);

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  }
};

export const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`;
};

