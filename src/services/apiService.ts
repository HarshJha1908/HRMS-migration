
import type {
  HolidayResponse,
  LeaveDetailsApi,
  LeaveStatusResponse,
  LeaveRuleResponse,
  LeaveBalanceResponse,
  TeamMemberResponse,
  ManageProfileEmpProfileApi,
  SaveNewEmployeeProfileRequest,
  UpdateEmergencyContactRequest,
  ApiMutationResponse,
  ExitLeaveAdjustmentCalculationData,
  ExitLeaveAdjustmentCalculationResponse,
  UpdateExitLeaveAdjustmentRequest,
  UpdateExitLeaveAdjustmentResponse,
  LeaveExceptionItem,
  LeaveExceptionListResponse,
  AddLeaveExceptionRequest,
  AddLeaveExceptionResponse,
  JobVacancyResponse,
  SpecialLeaveTypeApi,
  SpecialLeaveTypeResponse,
  SpecialLeaveRowApi,
  DeactivateBulkSpecialLeavesResponse,
  EmployeeByTeamApi,
  AddBulkSpecialLeaveRequestItem,
  AddBulkSpecialLeaveResponse
} from "../types/apiTypes";
import { apiClient } from "./apiClient";

// Get Leave Types

// leave balance
// export const getLeaveBalance = (userId: string) => {
//   return apiClient(`/api/Leave/GetLeaveBalance?userid=${userId}`);
// }
export const getLeaveTypes = (userId: string) => {
  return apiClient(`/api/Leave/GetLeaveType?userid=${userId}`);
};

export const getLeaveRules = (): Promise<LeaveRuleResponse> => {
  return apiClient("/api/Leave/GetLeaveRule");
};

export const getLeaveBalance = (userId: string): Promise<LeaveBalanceResponse> => {
  return apiClient(`/api/Leave/GetLeaveBalance?userid=${encodeURIComponent(userId)}`);
};

export const getLeaveStatusCodes = (): Promise<LeaveStatusResponse> => {
  return apiClient("/api/Leave/GetLeaveStatusCode");
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
  return apiClient("/api/Leave/GetAllLeaveRequestDetailsByEmpAdId", {
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

// export const getLoginUser = () => {
//   return apiClient("/api/me");
// };

//Employee contact details
export const getEmployeeContact=(userId:string)=>{
  return apiClient(`/api/EmployeeEmergencyContact/GetEmployeeEmergencyContactDetails?adId=${encodeURIComponent(userId)}`)
}

// Single Employee Search
export const getEmployeeByKeyword = async (keyword: string) => {
  const res = await apiClient(
    `/api/Employee/GetEmployeeDetailsBySingleSearch?keyword=${encodeURIComponent(keyword)}`
  );

  // standard backend handling
  if (!res?.isSuccess) {
    throw new Error(res?.message || "No data found");
  }

  return res.data || [];
};

//employee profile for single search details
export const getEmployeeProfile = (empId: string) => {
  return apiClient(`/api/ManageProfile/GetEmpProfileByEmpId?empId=${encodeURIComponent(empId)}`);
}
// Pending Approvals (Manager)
export const getPendingApprovals = async (userId: string) => {
  const res = await apiClient(
    `/api/Leave/GetAllPendingLeaveRequestByManagerId?userid=${encodeURIComponent(userId)}`
  );

  if (!res?.isSuccess) {
    throw new Error(res?.message || "Failed to fetch pending approvals");
  }

  return res.data || [];
};

export const savePendingLeaveRequestByOneLeaveId = (data: {
  leaveId: string;
  status: string;
  remarks: string;
}) => {
  return apiClient("/api/Leave/SavePendingLeaveRequestByOneLeaveId", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
};

export const getAllTeamMembersByManagerId = (userId: string): Promise<TeamMemberResponse> => {
  return apiClient(`/api/Employee/GetAllTeamMembersByManagerId?UserAdID=${encodeURIComponent(userId)}`);
};

export const getAllLeaveRequestByManagerId = async (userId: string): Promise<LeaveDetailsApi[]> => {
  const res = await apiClient(
    `/api/Leave/GetAllLeaveRequestByManagerId?userid=${encodeURIComponent(userId)}`
  );

  if (!res?.isSuccess) {
    throw new Error(res?.message || "Failed to fetch team leave details");
  }

  return res.data || [];
};

//Create Employee 
  //Employee Type
export const getEmployeeType=()=>{
  return apiClient("/api/Employee/GetAllEligibleEmployees");
}
  //employee team name
export const getEmployeeTeam = (isManager: boolean, forceRefresh = false) => {
  const refreshParam = forceRefresh ? `&_=${Date.now()}` : "";
  return apiClient(
    `/api/Employee/GetTeamAssignementList?isManager=${isManager ? "true" : "false"}${refreshParam}`
  );
}

export const saveNewEmpProfile = (data: SaveNewEmployeeProfileRequest) => {
  return apiClient("/api/ManageProfile/SaveNewEmpProfile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
};
//Update employee profile
export const updateEmpProfile = (data: SaveNewEmployeeProfileRequest) => {
  return apiClient("/api/ManageProfile/UpdateEmployeeProfile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
};

export const getEmpProfileByEmpId = async (
  empId: string | number
): Promise<ManageProfileEmpProfileApi> => {
  const res = await apiClient(
    `/api/ManageProfile/GetEmpProfileByEmpId?empId=${encodeURIComponent(String(empId))}`
  );

  const profile = (res && typeof res === "object" && "data" in res ? res.data : res) as
    | ManageProfileEmpProfileApi
    | null;

  if (!profile || typeof profile !== "object") {
    throw new Error("Employee profile not found");
  }

  return profile;
};

export const updateEmergencyContactDetails = (
  data: UpdateEmergencyContactRequest
): Promise<ApiMutationResponse> => {
  return apiClient("/api/ManageProfile/UpdateEmergencyContactDetails", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
};

//approve/reject in bulk
export const bulkApproveReject = async (payload: {
  leaveId: string;
  status: string;
  remarks: string;
}[]) => {
  return apiClient("/api/Leave/SavePendingLeaveRequestByLeaveId", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export const getExitLeaveAdjustmentCalculation = async (
  userId: string,
  exitDate: string
): Promise<ExitLeaveAdjustmentCalculationData> => {
  const toApiDate = (value: string) => {
    const parts = value.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      if (year && month && day) {
        return `${day}/${month}/${year}`;
      }
    }
    return value;
  };

  const res = await apiClient(
    `/api/Employee/GetExitLeaveAdjustmentCalculation?userid=${encodeURIComponent(
      userId
    )}&ExitDate=${encodeURIComponent(toApiDate(exitDate))}`
  );

  const response = res as ExitLeaveAdjustmentCalculationResponse;
  const data =
    response && typeof response === "object" && "data" in response ? response.data : response;

  if (!data || typeof data !== "object") {
    throw new Error("Exit leave adjustment details not found");
  }

  return data as ExitLeaveAdjustmentCalculationData;
};

export const updateExitLeaveAdjustment = async (
  payload: UpdateExitLeaveAdjustmentRequest
): Promise<UpdateExitLeaveAdjustmentResponse> => {
  const res = await apiClient("/api/Employee/UpdateExitLeaveAdjustment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return res as UpdateExitLeaveAdjustmentResponse;
};

export const getAllLeaveExceptionsByEmployee = async (
  employeeId: string | number
): Promise<LeaveExceptionItem[]> => {
  const res = await apiClient(
    `/api/LeaveException/GetAllLeaveExceptionsByEmployee?employeeId=${encodeURIComponent(
      String(employeeId)
    )}`
  );

  const response = res as LeaveExceptionListResponse | LeaveExceptionItem[];
  const data =
    response &&
    typeof response === "object" &&
    !Array.isArray(response)
      ? response.data ?? response.leaveExceptions
      : response;

  return Array.isArray(data) ? data : [];
};

export const addLeaveException = async (
  payload: AddLeaveExceptionRequest
): Promise<AddLeaveExceptionResponse> => {
  const res = await apiClient("/api/LeaveException/AddLeaveException", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return res as AddLeaveExceptionResponse;
};

// Job Vacancy
export const getJobVacancies = (): Promise<JobVacancyResponse> => {
  return apiClient("/api/Career/GetAllCareers");
};
// ✅ ADD CAREER
export const addCareer = async (formData: FormData): Promise<any> => {
  return apiClient("/api/Career/AddNewCareer", {
    method: "POST",
    body: formData,
  });
};
export const updateCareer = async (formData: FormData): Promise<any> => {
  return apiClient("/api/Career/UpdateCareer", {
    method: "POST",
    body: formData,
  });
};

export const getAllSpecialLeaveTypes = async (): Promise<SpecialLeaveTypeApi[]> => {
  const res = await apiClient("/api/LeaveType/GetAllSpecialLeaveType");
  const response = res as SpecialLeaveTypeResponse | SpecialLeaveTypeApi[];
  const list =
    Array.isArray(response)
      ? response
      : Array.isArray(response?.leaveTypes)
        ? response.leaveTypes
        : Array.isArray(response?.data)
          ? response.data
          : [];

  return list
    .map((item) => ({
      ...item,
      leaveTypeCode: String(item.leaveTypeCode || "").trim().toUpperCase(),
      leaveTypeName: String(item.leaveTypeName || "").trim()
    }))
    .filter((item) => item.leaveTypeCode && item.leaveTypeName);
};

export const getSpecialLeavesByLeaveTypeCode = async (
  leaveTypeCode: string
): Promise<SpecialLeaveRowApi[]> => {
  const code = String(leaveTypeCode || "").trim().toUpperCase();
  if (!code) return [];

  const res = await apiClient(
    `/api/SpecialLeaves/GetSpecialLeavesByLeaveTypeCode?leaveTypeCode=${encodeURIComponent(code)}`
  );

  if (Array.isArray(res)) {
    return res as SpecialLeaveRowApi[];
  }

  if (res && typeof res === "object" && "data" in res) {
    const data = (res as { data?: unknown }).data;
    return Array.isArray(data) ? (data as SpecialLeaveRowApi[]) : [];
  }

  return [];
};

export const getSpecialLeavesByLeaveTypeCodeYear = async (
  leaveTypeCode: string,
  year: number | string
): Promise<SpecialLeaveRowApi[]> => {
  const code = String(leaveTypeCode || "").trim().toUpperCase();
  const yearValue = String(year || "").trim();
  if (!code || !yearValue) return [];

  const urls = [
    `/api/SpecialLeaves/GetSpecialLeavesByLeaveTypeCodeYear?leaveTypeCode=${encodeURIComponent(code)}&year=${encodeURIComponent(yearValue)}`,
    `/api/SpecialLeaves/GetSpecialLeavesByLeaveTypeCodeYear?leaveTypeCode=${encodeURIComponent(code)}&Year=${encodeURIComponent(yearValue)}`,
    `/api/SpecialLeaves/GetSpecialLeavesByLeaveTypeCodeYear?LeaveTypeCode=${encodeURIComponent(code)}&year=${encodeURIComponent(yearValue)}`
  ];

  let lastError: unknown = null;

  for (const url of urls) {
    try {
      const res = await apiClient(url);

      if (Array.isArray(res)) {
        return res as SpecialLeaveRowApi[];
      }

      if (res && typeof res === "object" && "data" in res) {
        const data = (res as { data?: unknown }).data;
        return Array.isArray(data) ? (data as SpecialLeaveRowApi[]) : [];
      }

      return [];
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error("Unable to fetch special leaves.");
};

export const deactivateBulkSpecialLeavesRequest = async (
  payload: SpecialLeaveRowApi[]
): Promise<DeactivateBulkSpecialLeavesResponse> => {
  const res = await apiClient("/api/SpecialLeaves/DeactivateBulkSpecialLeavesRequest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return res as DeactivateBulkSpecialLeavesResponse;
};

export const getEmployeeListByTeamId = async (
  teamId: string | number
): Promise<EmployeeByTeamApi[]> => {
  const rawId = String(teamId || "").trim();
  if (!rawId) return [];

  const digitsOnlyId = rawId.replace(/[^\d]/g, "");
  const candidateIds = Array.from(new Set([rawId, digitsOnlyId].filter(Boolean)));
  const queryKeys = ["teamId", "teamid"];

  let lastError: unknown = null;

  for (const id of candidateIds) {
    for (const queryKey of queryKeys) {
      try {
        const res = await apiClient(
          `/api/Employee/GetEmployeeListByTeamId?${queryKey}=${encodeURIComponent(id)}`
        );

        if (Array.isArray(res)) {
          return res as EmployeeByTeamApi[];
        }

        if (res && typeof res === "object" && "data" in res) {
          const data = (res as { data?: unknown }).data;
          return Array.isArray(data) ? (data as EmployeeByTeamApi[]) : [];
        }

        return [];
      } catch (error) {
        lastError = error;
      }
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error("Unable to load team members by team id.");
};

export const addBulkSpecialLeaveRequest = async (
  payload: AddBulkSpecialLeaveRequestItem[]
): Promise<AddBulkSpecialLeaveResponse> => {
  const normalizedPayload = (Array.isArray(payload) ? payload : []).map((item) => {
    const leaveTypeCode = String(
      item?.leaveTypeCode || item?.leaveType || item?.leaveTypeName || ""
    )
      .trim()
      .toUpperCase();

    return {
      specialLeaveID: Number(item?.specialLeaveID || 0),
      empId: Number(item?.empId || 0),
      empAdId: String(item?.empAdId || "").trim(),
      empName: String(item?.empName || "").trim(),
      leaveType: leaveTypeCode,
      fromDate: String(item?.fromDate || "").trim(),
      toDate: String(item?.toDate || "").trim(),
      updatedOn: String(item?.updatedOn || "").trim(),
      updatedBy: String(item?.updatedBy || "").trim(),
      isActive: Boolean(item?.isActive),
      isHalfStartDay: Boolean(item?.isHalfStartDay),
      isHalfEndDay: Boolean(item?.isHalfEndDay)
    };
  });

  const res = await apiClient("/api/SpecialLeaves/AddBulkSpecialLeaveRequest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(normalizedPayload)
  });

  return res as AddBulkSpecialLeaveResponse;
};
