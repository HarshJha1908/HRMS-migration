
import type { HolidayResponse } from "../types/apiTypes";
import { apiClient } from "./apiClient";

// Get Leave Types
export const getLeaveTypes = (userId: string) => {
  return apiClient(`/api/Leave/GetLeaveType?userid=${userId}`);
};

// Get No.of Days
export const getNoOfDays = (data: {
  startDate: string;
  endDate: string;
  totalHalfDays: number;
}) => {
  return apiClient(`api/Leave/GetNoOfWorkingDaysFromStartandEndDate?startDate=${data.startDate}&Enddate=${data.endDate}&Totalhalfdays=${data.totalHalfDays}`, {
    method: "GET",
  });
}

//Get Holiday List
export const getHolidays = () :  Promise<HolidayResponse> => {
  return apiClient("/api/HolidayList/GetAllHolidayList") ;
};

// Get Leave Reasons
export const getLeaveReasons = () => {
  return apiClient("/api/Leave/GetReasons");
};

// Submit Leave
export const saveLeaveRequest = (data: {
  userADId: string;
  startDate: string;
  endDate: string;
//   noOfDays: number;
  reason: string;
  leaveTypeCode: string;
  workHandedOver: string;
  contactNo: string;
  isHalfStartDay: boolean;
  isHalfEndDay: boolean;
  approverRemarks: string;
  isSchedule: boolean;
  scheduleDate: string;
  statusChangeDate: string;
  leaveStatus: string;
  applyforother: boolean;
  applyforotheradid: string;
}) => {
  return apiClient("/api/Leave/SaveLeaveRequest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
};

//Get My Leave Details
export const getLeaveDetails = (data: {
  year: number;
  adid: string;
//   noOfDays: number;
  leaveTypeCode: string;
  status: string;
}) => {
  return apiClient("api/Leave/GetAllLeaveRequestDetailsByEmpAdId", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
};

//get view leave details by leaveId
export const getViewLeaveDetailsByLeaveId = (leaveId: string) => {
  return apiClient(`/api/Leave/GetLeaveRequestDetailsByLeaveId?LeaveId=${leaveId}`);
}

export const getApprover=(UserID:string)=>{
  return apiClient(`/api/Employee/GetManagerNamebyUserAdID?UserAdID=${UserID}`);
}

export const getLoginUser = () => {
  return apiClient("/api/me");
};