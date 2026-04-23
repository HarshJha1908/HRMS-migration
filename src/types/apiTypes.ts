
//Leave Balance
export type LeaveBalanceItem = {
  type: string;
  total: number | null;
  used: number | null;
  balance: number | null;
};

export type LeaveBalanceApiData = {
  employeeName: string;
  employeeID: number;
  bdL_Total: string | null;
  bdL_Submitted: string | null;
  bdL_Balance: string | null;
  cL_Total: string | null;
  cL_Submitted: string | null;
  cL_Balance: string | null;
  pL_Total: string | null;
  pL_Submitted: string | null;
  pL_Balance: string | null;
  asL_Total: string | null;
  asL_Submitted: string | null;
  asL_Balance: string | null;
  isPTLapplicable: boolean;
  ptL_Total: string | null;
  ptL_Submitted: string | null;
  ptL_Balance: string | null;
  isMTLapplicable: boolean;
  mtL_Total: string | null;
  mtL_Submitted: string | null;
  mtL_Balance: string | null;
  sL_Total: string | null;
  sL_Submitted: string | null;
  sL_Balance: string | null;
  wfH_Total: string | null;
  wfH_Submitted: string | null;
  wfH_Balance: string | null;
  wfhX_Total: string | null;
  wfhX_Submitted: string | null;
  wfhX_Balance: string | null;
};

export type LeaveBalanceResponse = {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: LeaveBalanceApiData | null;
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

export type LeaveStatusApi = {
  statusCode: string;
  statusName: string;
};

export type TeamMemberApi = {
  user_Employee_No: number;
  user_Id: string;
  name: string;
  user_Doj: string;
  user_Email_Id: string;
  isActive: boolean;
  lwd: string | null;
  user_Sex: string;
  user_Mat_Pat_Applicable: boolean;
  emergencyContactNo1: string;
  emergencyContactNo2: string;
  contactName2: string;
  contactName1: string;
  teamName: string | null;
};

export type ManageProfileEmpProfileApi = {
  user_Employee_No: number;
  user_Id: string;
  empName: string;
  user_Doj: string;
  user_Email_Id: string;
  teamManagerName: string;
  teamName: string;
  teamHeadName: string;
  status: string;
  eligibleTypeCode: string;
  lwd: string | null;
  user_Sex: string;
  user_Mat_Pat_Applicable: boolean;
  emergencyContactNo1: string;
  emergencyContactNo2: string;
  contactName2: string;
  contactName1: string;
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

//Manager Name
export type ApproverApi={
   managerName: string;
}

//Employee Contact Details

export type EmployeeContactApi={
  empId:number;
  empName:string;
  contactName:string;
  contactNo1:string;
  contactNo2:string;
  contactNoName1:string;
  contactNoName2:string;
  teamName:string;
  managerName:string;
  headName:string;
}

export type EmployeeContactResponse={
  statusCode: number;
  isSuccess: boolean;
  employeeEmergencyContactDetails: EmployeeContactApi[];
}

//Create Employee 
  //Employee Type
export type EmployeeTypeApi={
    eligibleTypeId: number;
    eligibleEmpName: string;
    eligibleTypeCode: string;
    isActive: boolean;
}

export type EmployeeTeamApi={
  teamName: string;
  teamId: string | number;

}

export type SaveNewEmployeeProfileRequest = {
  employee: {
    user_Employee_No: number;
    user_Seq_No: number;
    user_Id: string;
    user_Fname: string;
    user_Mname: string;
    user_Lname: string;
    user_Doj: string;
    user_Email_Id: string;
    user_Line_Mng: number;
    user_Line_Mng_1: number;
    isActive: boolean;
    eligibleTypeCode: string;
    lwd: string;
    user_Sex: string;
    user_Mat_Pat_Applicable: boolean;
    emergencyContactNo1: string;
    emergencyContactNo2: string;
    contactName2: string;
    contactName1: string;
    lastUpdate: string;
  };
  isManager: boolean;
  assignmentTeamId: string;
  cl: number;
  pl: number;
  asl: number;
};

export type UpdateEmergencyContactRequest = SaveNewEmployeeProfileRequest["employee"];

export type ApiMutationResponse = {
  statusCode?: number;
  isSuccess?: boolean;
  message?: string;
  data?: unknown;
};


export type LeaveRuleApi = {
  leavetype: string;
  eligibility: string;
  totalDays: number;
  maxMinDays: string;
  halfDay: string;
  schedule: string;
  clubbingNotAllowed: string;
};

export type LeaveRuleResponse = {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: LeaveRuleApi[];
};

export type LeaveStatusResponse = {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: LeaveStatusApi[];
};

export type TeamMemberResponse = {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: TeamMemberApi[];
};

export type ExitLeaveAdjustmentCalculationData = {
  cL_Balance?: string | number | null;
  sL_Balance?: string | number | null;
  pL_Balance?: string | number | null;
  cL_ExitBalance?: string | number | null;
  sL_ExitBalance?: string | number | null;
  pL_ExitBalance?: string | number | null;
  adjustedPL?: string | number | null;
  adjustedPrivilegeLeave?: string | number | null;
  exitRemarks?: string | null;
  [key: string]: unknown;
};

export type ExitLeaveAdjustmentCalculationResponse = {
  statusCode?: number;
  isSuccess?: boolean;
  message?: string;
  data?: ExitLeaveAdjustmentCalculationData | null;
};

export type UpdateExitLeaveAdjustmentRequest = {
  userId: string;
  exitRemarks: string;
  plOnExitDate: number;
};

export type UpdateExitLeaveAdjustmentResponse = {
  statusCode?: number;
  isSuccess?: boolean;
  message?: string;
  data?: unknown;
};

export type LeaveExceptionItem = {
  leaveTypeName?: string;
  leaveTypeCode?: string;
  exceptionRaisedDate?: string;
  raisedDate?: string;
  reason?: string;
  isActive?: boolean;
  [key: string]: unknown;
};

export type LeaveExceptionListResponse = {
  statusCode?: number;
  isSuccess?: boolean;
  message?: string;
  data?: LeaveExceptionItem[] | null;
  leaveExceptions?: LeaveExceptionItem[] | null;
};

export type AddLeaveExceptionRequest = {
  reason: string;
  leaveType: string;
  createdFor: number;
  exceptionValidTill: string;
  createdBy: number;
  createdDate: string;
  isActive: boolean;
};

export type AddLeaveExceptionResponse = {
  statusCode?: number;
  isSuccess?: boolean;
  message?: string;
  data?: unknown;
};

// Job Vacancy
export type JobVacancyApi = {
  id: number;
  title: string;
  type: string;
  department: string;
  fileName: string;
  isActive: boolean;
  updatedDate: string;
  userId: string;
  isrrnum: number;
};

export type JobVacancyResponse = {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: JobVacancyApi[] | null;
};

export type SpecialLeaveTypeApi = {
  leaveTypeCode: string;
  leaveTypeName: string;
  leaveTypeId?: number | string;
  leaveTypeID?: number | string;
  totalDays?: number;
  hasLimit?: boolean;
  minNoOfDays?: number;
  maxNoOfDays?: number;
  negativeBalance?: boolean;
  halfDay?: boolean;
  isAutoApproved?: boolean;
  isActive?: boolean;
  isScheduled?: boolean;
  applyAssociate?: number | null;
  applyConfirmed?: number | null;
  applyExternal?: number | null;
  applyProbation?: number | null;
  isSpecial?: boolean;
};

export type SpecialLeaveTypeResponse = {
  statusCode?: number;
  isSuccess?: boolean;
  message?: string;
  leaveTypes?: SpecialLeaveTypeApi[] | null;
  data?: SpecialLeaveTypeApi[] | null;
};

export type SpecialLeaveRowApi = {
  specialLeaveID: number;
  empId: number;
  empAdId: string;
  empName: string;
  leaveType: string;
  leaveTypeCode?: string;
  leaveTypeName?: string;
  fromDate: string;
  toDate: string;
  updatedOn?: string;
  updatedBy?: string;
  isActive?: boolean;
  isHalfStartDay?: boolean;
  isHalfEndDay?: boolean;
  teamName?: string | null;
};

export type DeactivateBulkSpecialLeavesResponse = {
  statusCode?: number;
  isSuccess?: boolean;
  message?: string;
  data?: unknown;
};

export type EmployeeByTeamApi = {
  employeeId: number;
  employeeADId: string;
  employeeName: string;
  doj: string;
  teamName: string;
};

export type AddBulkSpecialLeaveRequestItem = {
  specialLeaveID: number;
  empId: number;
  empAdId: string;
  empName: string;
  leaveType: string;
  leaveTypeCode?: string;
  leaveTypeName?: string;
  leaveTypeId?: number | string;
  leaveTypeID?: number | string;
  fromDate: string;
  toDate: string;
  updatedOn: string;
  updatedBy: string;
  isActive: boolean;
  isHalfStartDay: boolean;
  isHalfEndDay: boolean;
};

export type AddBulkSpecialLeaveResponse = {
  statusCode?: number;
  isSuccess?: boolean;
  message?: string;
  data?: unknown;
};

