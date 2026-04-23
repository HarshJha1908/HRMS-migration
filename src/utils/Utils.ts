import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { EmployeeContactApi } from "../types/apiTypes";

export const PdfExportUtil = {
  generateEmergencyContactPdf: (data: EmployeeContactApi[]) => {
    const doc = new jsPDF({
      orientation: "landscape",
    });

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

    doc.setFontSize(16);
    doc.setTextColor(0, 102, 153);
    doc.text("Emergency Contact Report", 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,

      theme: "grid",

      styles: {
        fontSize: 10,
        cellPadding: 5,
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
        fontSize: 11,
        halign: "center",
        overflow: "visible",
      },

      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },

      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [69, 69, 69],
      },

      // columnStyles: {
      //   0: { cellWidth: 30, halign: "center" },
      //   1: { cellWidth: 45 },
      //   2: { cellWidth: 40 },
      //   3: { cellWidth: 35, halign: "center" },
      //   4: { cellWidth: 40 },
      //   5: { cellWidth: 35, halign: "center" },
      //   6: { cellWidth: 60 },
      //   7: { cellWidth: 55 },
      //   8: { cellWidth: 55 },
      // },

      margin: { top: 25 },
    });

    return doc.output("blob");
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
    

    const escapeCsvCell = (value: string | number | null | undefined) => {
      const safeValue = value ?? "";
      const valueAsString = String(safeValue);
      const escaped = valueAsString.replace(/"/g, "\"\"");
      return `"${escaped}"`;
    };

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
};
