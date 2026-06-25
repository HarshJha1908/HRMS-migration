import type {
  EmployeeContactApi,
  ManagerLeaveBalanceExcelApi,
  ManagerLeaveDetailsExcelApi
} from "../types/apiTypes";

const escapeCsvCell = (value: string | number | boolean | null | undefined) => {
  const escaped = String(value ?? "").replace(/"/g, "\"\"");
  return `"${escaped}"`;
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
      escapeCsvCell(item.dateOfSubmission ?? item.submitionDate),
      escapeCsvCell(item.dateOfApproval ?? item.dateofapproved),
      escapeCsvCell(item.leaveType),
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
