
//Leave Balance
export type LeaveBalanceItem = {
  type: string;
  total: number | null;
  used: number | null;
  balance: number | null;
};

export type LeaveRequest = {
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'Approved' | 'Pending';
  approver: string;
  submittedOn: string;
};

//LeaveType field
export type LeaveTypeApi = {
  leaveTypeCode: string;
  leaveTypeName: string;
};

//Total LeaveDays
export type NoOfDaysApi={
  noOfDays: number;
  isActive: boolean;
}

//Holiday list Api Data
export type Holiday = {
  date: string;
  description: string;
};

export type HolidayResponse = {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: Holiday[];
};

//Reason field
export type ReasonApi = {
  reason: string;
  isActive: boolean;
};

//Leave Details 
export type LeaveDetailsApi = {
  requesterName: string;
  leaveId: string;
  startDate: string;
  endDate: string;
  startEndDate: string | null;
  balance: number | null;
  submitionDate: string;
  approvednDate: string | null;
  statusChangeDate: string | null;
  leaveTypeName: string;
  statusCode: string;
  reason: string | null;
  teamName: string | null;
  approverName: string;
  approverRemarks: string;
  noOfDays: number;
};

//View Single Leave Details By ID
export type LeaveDetails = {
  requesterName: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  submitionDate: string;
  statusCode: string;
  statusChangeDate: string | null;
  approverName: string;
  approverRemarks: string | null;
  noOfDays: number;
  pat_Mat_Leave: string;
};

export type ApproverApi={
   managerName: string;
}