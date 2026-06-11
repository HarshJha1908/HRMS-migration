// Get All Employee Insurance Nomination Details (for Quick Export)

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
  ManagerLeaveDetailsExcelApi,
  ManagerLeaveDetailsExcelResponse,
  ManagerLeaveBalanceExcelApi,
  ManagerLeaveBalanceExcelResponse,
  EmployeeLeaveBalanceDetailsApi,
  EmployeeLeaveBalanceReportType,
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
  AddBulkSpecialLeaveResponse,
  DocumentTypeApi,
  DocumentTypeResponse,
  DocumentApi,
  DocumentsResponse,
  LoginUserInfo,
} from "../types/apiTypes";
import { apiClient } from "./apiClient";
import { resolveApiUrl } from "./apiClient";

//User role
export const getLoginUserInfoByUserid = async (
  userId: string
): Promise<{ data: LoginUserInfo }> => {
  const response = await apiClient(
    `/api/Me/GetLoginUserInfoByUserid?userid=${userId}`
  );

  return {
    data: response
  };
};
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
  const params = new URLSearchParams({
    startDate: data.startDate,
    endDate: data.endDate,
    Totalhalfdays: String(data.totalHalfDays),
  });

  return apiClient(`/api/Leave/GetNoOfWorkingDaysFromStartandEndDate?${params.toString()}`, {
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
  UserADId: string;
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

export const saveLeaveRequestAttachment = (data: {
  leaveId: string;
  file: File;
}) => {
  const formData = new FormData();
  formData.append("leaveId", data.leaveId);
  formData.append("file", data.file);

  return apiClient("/api/Leave/SaveLeaveRequestAttachment", {
    method: "POST",
    body: formData
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
export const getLeaveAttachment = async (leaveId: string): Promise<{ blob: Blob; filename: string } | null> => {
  try {
    const response = await fetch(
      resolveApiUrl(`/api/Leave/GetLeaveAttachment?leaveID=${encodeURIComponent(leaveId)}`)
    );

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    
    // Extract filename from Content-Disposition header
    let filename = "attachment.pdf";
    const contentDisposition = response.headers.get("content-disposition");
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    return { blob, filename };
  } catch (error) {
    console.error("Error fetching leave attachment:", error);
    return null;
  }
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

export const getLeaveDetailsForExcelByManagerId = async (
  userId: string
): Promise<ManagerLeaveDetailsExcelApi[]> => {
  const res = await apiClient(
    `/api/Leave/GetLeaveDetailsForExcelByManagerID?userid=${encodeURIComponent(userId)}`
  );

  const response = res as ManagerLeaveDetailsExcelResponse | ManagerLeaveDetailsExcelApi[];
  const data = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : [];

  if (!Array.isArray(data)) {
    throw new Error(response && !Array.isArray(response) ? response.message || "Failed to fetch leave details." : "Failed to fetch leave details.");
  }

  return data.map(mapManagerLeaveDetailsToExcelRow);
};

export const getLeaveBalanceForExcelByManagerId = async (
  userId: string
): Promise<ManagerLeaveBalanceExcelApi[]> => {
  const res = await apiClient(
    `/api/Leave/GetLeaveBalanceForExcelByManagerID?userid=${encodeURIComponent(userId)}`
  );

  const response = res as ManagerLeaveBalanceExcelResponse | ManagerLeaveBalanceExcelApi[];
  const data = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : [];

  if (!Array.isArray(data)) {
    throw new Error(response && !Array.isArray(response) ? response.message || "Failed to fetch leave balance." : "Failed to fetch leave balance.");
  }

  return data;
};

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

export const getEmpProfileByAdId = async (
  adId: string | number
): Promise<ManageProfileEmpProfileApi> => {
  const res = await apiClient(
    `/api/ManageProfile/GetEmpProfileByADId?adIdId=${encodeURIComponent(String(adId))}`
  );

  const profile = (res && typeof res === "object" && "data" in res ? res.data : res) as
    | ManageProfileEmpProfileApi
    | null;

  if (!profile || typeof profile !== "object") {
    throw new Error("Employee profile not found");
  }

  return profile;
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

export const getDocumentTypes = async (): Promise<DocumentTypeApi[]> => {
  const res = await apiClient("/api/Documents/GetDocumentType");
  const response = res as DocumentTypeResponse | DocumentTypeApi[];
  const data = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : [];

  return data
    .map((item) => ({
      ...item,
      docCode: String(item?.docCode || "").trim().toUpperCase(),
      typeName: String(item?.typeName || "").trim(),
      isActive: Boolean(item?.isActive)
    }))
    .filter((item) => item.docCode && item.typeName && item.isActive);
};

export const getDocuments = async (type: string): Promise<DocumentApi[]> => {
  const res = await apiClient(`/api/Documents/GetAllDocuments?type=${encodeURIComponent(type)}`);
  const response = res as DocumentsResponse | DocumentApi[];
  const data = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : [];

  return data.map((item) => ({
    ...item,
    fileName: String(item?.fileName || "").trim(),
    documentId: item?.id || ""
  }));
};

export const getDocumentFile = async (docId: string | number): Promise<Blob> => {
  const response = await fetch(
    resolveApiUrl(`/api/Documents/GetDocumentFile?DocID=${docId}`)
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch document: ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("pdf") && !contentType.includes("octet-stream") && !contentType.includes("spreadsheet") && !contentType.includes("image")) {
    // Likely SPA fallback HTML — proxy is misconfigured.
    throw new Error(`Unexpected document content-type: ${contentType}`);
  }

  return await response.blob();
};

export const addDocument = async (
  title: string,
  type: string,
  link: string,
  isLink: boolean,
  file?: File
): Promise<any> => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('type', type);
  formData.append('link', link || 'x');
  formData.append('isLink', String(isLink).toLowerCase());
  
  if (file) {
    formData.append('file', file);
  }

  const response = await fetch(resolveApiUrl('/api/Documents/AddDocument'), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to add document: ${response.statusText}`);
  }

  return await response.json();
};
export const updateDocument = async (
  docId: number,
  title: string,
  type: string,
  link: string,
  isLink: boolean,
  isActive: boolean,
  file?: File
): Promise<any> => {
  const formData = new FormData();
  formData.append('DocID', String(docId));
  formData.append('title', title);
  formData.append('type', type);
  formData.append('link', link || 'x');
  formData.append('isLink', String(isLink).toLowerCase());
  formData.append('isActive', String(isActive).toLowerCase());

  if (file) {
    formData.append('file', file);
  }

  const response = await fetch(resolveApiUrl('/api/Documents/UpdateDocument'), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to add document: ${response.statusText}`);
  }

  return await response.json();
};


export const searchDocuments = async (searchString: string): Promise<DocumentApi[]> => {
  const res = await apiClient(`/api/Documents/SearchDocuments?searchString=${encodeURIComponent(searchString)}`);
  const response = res as DocumentsResponse | DocumentApi[];
  const data = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : [];

  return data.map((item) => ({
    ...item,
    fileName: String(item?.fileName || "").trim(),
    documentId: item?.id || ""
  }));
};
// Insurance Relations
export interface InsuranceRelationApi {
  code: string;
  relationName: string;
  insuranceType: string;
}
 
export interface InsuranceRelationResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: InsuranceRelationApi[];
}
 
export const getInsuranceRelations = async (
  insuranceCode: string
): Promise<InsuranceRelationApi[]> => {
  const res = await apiClient(
    `/api/Insurance/GetInsuranceRelation?InsuranceCode=${encodeURIComponent(
      insuranceCode
    )}`
  );
 
  const response = res as InsuranceRelationResponse;
 
  if (!response?.isSuccess) {
    throw new Error(
      response?.message || "Failed to fetch insurance relations"
    );
  }
 
  return response.data || [];
};
 
export interface InsuranceNomineeApi {
  sequence: number;
  memberDOB: string;
  relationCode: string;
  mamberName: string;
  insuranceType: string;
  percentageShare: number;
}
 
export interface InsuranceNominationDetailsResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
 
  employeeName: string;
  employeeNumber: number;
 
  reasonforchange: string;
  lastupdateon: string;
  acceptterms: boolean;
 
  data: InsuranceNomineeApi[];
}
 
export const getInsuranceNominationDetails = async (
  insuranceCode: string,
  userId: string
): Promise<InsuranceNominationDetailsResponse> => {
  const res = await apiClient(
    `/api/Insurance/GetInsuranceNominationDetails?InsuranceCode=${encodeURIComponent(
      insuranceCode
    )}&Userid=${encodeURIComponent(userId)}`
  );
 
  const response = res as InsuranceNominationDetailsResponse;
 
  if (!response?.isSuccess) {
    throw new Error(
      response?.message ||
        "Failed to fetch insurance nomination details"
    );
  }
 
  return response;
};
 
export interface ManageInsuranceNomineeRequest {
  sequence: number;
  memberDOB: string;
  relationCode: string;
  mamberName: string;
  insuranceType: string;
  percentageShare: number;
  updatedBy: string;
  updatedOn: string;
}
 
export const manageInsuranceNominationDetails = async (
  reason: string,
  empnumber: string,
  adidforother: string,
  payload: ManageInsuranceNomineeRequest[]
) => {
  return apiClient(
    `/api/Insurance/ManageInsuranceNominationDetails?reason=${encodeURIComponent(
      reason
    )}&empnumber=${encodeURIComponent(
      empnumber
    )}&Adidforother=${encodeURIComponent(
      adidforother
    )}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
};
 
// ==============================
// HR / HEAD REPORT APIS
// ==============================
const toTextValue = (
  value: string | number | boolean | null | undefined
): string | null =>
  value === null || value === undefined
    ? null
    : String(value);

const pickTextValue = (
  ...values: Array<string | number | boolean | null | undefined>
): string | null => {
  for (const value of values) {
    const text = toTextValue(value)?.trim();
    if (text) return text;
  }

  return null;
};

const mapManagerLeaveDetailsToExcelRow = (
  item: ManagerLeaveDetailsExcelApi & {
    leaveTypeName?: string | null;
    statusCode?: string | null;
    dayCount?: number | string | null;
  }
): ManagerLeaveDetailsExcelApi => ({
  ...item,
  requesterName: pickTextValue(item.requesterName),
  employeeId: pickTextValue(item.employeeId),
  startDate: pickTextValue(item.startDate),
  endDate: pickTextValue(item.endDate),
  submitionDate: pickTextValue(item.submitionDate, item.dateOfSubmission),
  dateOfSubmission: pickTextValue(item.dateOfSubmission, item.submitionDate),
  dateofapproved: pickTextValue(item.dateofapproved, item.dateOfApproval),
  dateOfApproval: pickTextValue(item.dateOfApproval, item.dateofapproved),
  leaveType: pickTextValue(item.leaveType, item.leaveTypeName),
  status: pickTextValue(item.status, item.statusCode),
  approverName: pickTextValue(item.approverName),
  teamName: pickTextValue(item.teamName),
  noOfDays: item.noOfDays ?? item.dayCount ?? null
});

const mapEmployeeLeaveBalanceToExcelRow = (
  item: EmployeeLeaveBalanceDetailsApi
): ManagerLeaveBalanceExcelApi => ({
  employeeID: item.employeeId,

  employeeName: item.employeeName,

  bdL_Total: toTextValue(item.bdlAvailable),

  bdL_Submitted: toTextValue(
    item.bdlSubmitted ?? item.bdlSubmited
  ),

  bdL_Balance: toTextValue(item.bdlBalance),

  cL_Total: toTextValue(item.clAvailable),

  cL_Submitted: toTextValue(
    item.clSubmitted ?? item.clSubmited
  ),

  cL_Balance: toTextValue(item.clBalance),

  pL_Total: toTextValue(item.plAvailable),

  pL_Submitted: toTextValue(
    item.plSubmitted ?? item.plSubmited
  ),

  pL_Balance: toTextValue(item.plBalance),

  asL_Total: toTextValue(item.openingPLBalance),

  asL_Submitted: "0",

  asL_Balance: toTextValue(item.openingPLBalance),

  isPTLApplicable:
    item.ptlApplicable ?? null,

  ptL_Total: toTextValue(item.ptlAvailable),

  ptL_Submitted: toTextValue(
    item.ptlSubmitted ?? item.ptlSubmited
  ),

  ptL_Balance: toTextValue(item.ptlBalance),

  isMTLApplicable: null,

  mtL_Total: "0",

  mtL_Submitted: "0",

  mtL_Balance: "0",

  sL_Total: toTextValue(item.slAvailable),

  sL_Submitted: toTextValue(
    item.slSubmitted ?? item.slSubmited
  ),

  sL_Balance: toTextValue(item.slBalance),

  wfH_Total: toTextValue(item.wfhAvailable),

  wfH_Submitted: toTextValue(
    item.wfhSubmitted ?? item.wfhSubmited
  ),

  wfH_Balance: toTextValue(item.wfhBalance),

  wfhX_Total: toTextValue(item.coAvailable),

  wfhX_Submitted: toTextValue(
    item.coSubmitted ?? item.coSubmited
  ),

  wfhX_Balance: toTextValue(item.coBalance)
});

export const getAllEmployeeLeaveDetailsReport = async (
  startDate: string,
  endDate: string
): Promise<ManagerLeaveDetailsExcelApi[]> => {
  const res = await apiClient(
    `/api/Report/GetAllEmployeeLeaveDetails?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
  );

  console.log("LEAVE DETAILS RAW RESPONSE:", res); // ✅ ADD THIS

  if (Array.isArray(res)) return res.map(mapManagerLeaveDetailsToExcelRow);

  if (res?.data && Array.isArray(res.data)) {
    return res.data.map(mapManagerLeaveDetailsToExcelRow);
  }

  return [];
};
export const getAllEmployeeLeaveBalanceDetails = async (
  type: EmployeeLeaveBalanceReportType = "TY"
): Promise<EmployeeLeaveBalanceDetailsApi[]> => {
  const res = await apiClient(
    `/api/Report/GetAllEmployeeLeaveDetails?type=${encodeURIComponent(
      type
    )}`
  );

  return Array.isArray(res)
    ? (res as EmployeeLeaveBalanceDetailsApi[])
    : [];
};
export const getAllEmployeeLeaveBalanceReport = async (
  type: EmployeeLeaveBalanceReportType = "TY"
): Promise<ManagerLeaveBalanceExcelApi[]> => {
  const res = await apiClient(
    `/api/Report/GetAllEmployeeLeaveBalanceDetails?type=${encodeURIComponent(
      type
    )}`
  );

  console.log("RAW RESPONSE", res);

  const data = Array.isArray(res)
    ? res
    : [];

  return data.map(mapEmployeeLeaveBalanceToExcelRow);
};

export const getAllEmployeeEmergencyContactDetails =
  async () => {
    try {
      const response =
        await apiClient(
          "/api/Report/GetAllEmployeeEmergencyContactDetails"
        );

      if (Array.isArray(response)) {
        return response;
      }

      if (Array.isArray(response?.data)) {
        return response.data;
      }

      if (
        Array.isArray(
          response?.employeeEmergencyContactDetails
        )
      ) {
        return response.employeeEmergencyContactDetails;
      }

      return [];
    } catch (error) {
      console.error(
        "Emergency Contact API Error:",
        error
      );

      return [];
    }
  };

  export const getAllEmployeeInsuranceNominationDetails = async () => {
  try {
    const response = await apiClient("/api/Report/ GetAllEmployeeInsuranceNominationDetails");
    if (Array.isArray(response)) {
      return response;
    }
    if (Array.isArray(response?.data)) {
      return response.data;
    }
     if (
        Array.isArray(
          response?.employeeInsuranceNominationDetails
        )
      ) {
        return response.employeeInsuranceNominationDetails;
      }

      return [];
    } 
   catch (error) {
    console.error("Insurance Nomination API Error:", error);
    return [];
  }
};

//Summary Report
export interface SummaryReportTeamHeadApi {
  teamId: number;
  teamName: string;
}

export const getSummaryReportTeamHeadName =
  async (
    userId: string
  ): Promise<
    SummaryReportTeamHeadApi[]
  > => {
    const res = await apiClient(
      `/api/Report/GetSummaryReportTeamHeadName?userid=${encodeURIComponent(
        userId
      )}`
    );

    if (Array.isArray(res)) {
      return res;
    }

    if (Array.isArray(res?.data)) {
      return res.data;
    }

    return [];
  };

  export interface SummaryReportTeamNameApi {
  teamId: number;
  teamName: string;
}

export const getSummaryReportTeamName = async (
  userId: string,
  teamId: number | string
): Promise<SummaryReportTeamNameApi[]> => {
  const res = await apiClient(
    `/api/Report/GetSummaryReportTeamName?userid=${encodeURIComponent(
      userId
    )}&teamid=${encodeURIComponent(String(teamId))}`
  );

  if (Array.isArray(res)) {
    return res;
  }

  if (Array.isArray(res?.data)) {
    return res.data;
  }

  return [];
};
export interface SummaryReportTeamMemberApi {
  user_Id: string;
  user_Employee_No: number;
  name: string;

}

export const getSummaryReportTeamMemberName = async (
  teamId: number | string
): Promise<SummaryReportTeamMemberApi[]> => {
  const res = await apiClient(
    `/api/Report/GetSummaryReportTeamMemberName?teamid=${encodeURIComponent(
      String(teamId)
    )}`
  );

  if (Array.isArray(res)) {
    return res;
  }

  if (Array.isArray(res?.data)) {
    return res.data;
  }

  return [];
};


export interface LeaveDetailsSummaryReportApi {
  requesterName: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  submitionDate: string;
  dateofapproved: string;
  leaveTypeName: string;
  leaveType?: string | null;
  statusCode: string;
  approverName: string;
  teamName: string;
  noOfDays: number;
  reason: string;
}

export interface LeaveBalanceSummaryReportResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: ManagerLeaveBalanceExcelApi[] | null;
}

export const getLeaveBalanceSummaryReport = async (
  teamHeadId: number | string,
  teamNameId: number | string,
  teamMemberId: string | number
): Promise<ManagerLeaveBalanceExcelApi[]> => {
  const params = new URLSearchParams({
    THNameId: String(teamHeadId),
    TeamNameId: String(teamNameId),
    TeamMemberNameId: String(teamMemberId || -1)
  });

  const res = await apiClient(
    `/api/Report/GetLeaveBalanceSummaryReport?${params.toString()}`
  );

  if (Array.isArray(res)) {
    return res;
  }

  const response = res as LeaveBalanceSummaryReportResponse;

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

export const getLeaveDetailsSummaryReport = async (
  teamHeadId: number | string,
  teamNameId: number | string,
  teamMemberId: string | number,
  startDate: string,
  endDate: string
): Promise<LeaveDetailsSummaryReportApi[]> => {
  const params = new URLSearchParams({
    THNameId: String(teamHeadId),
    TeamNameId: String(teamNameId),
    TeamMemberNameId: String(teamMemberId || -1),
    startDate,
    Enddate: endDate
  });

  const res = await apiClient(
    `/api/Report/GetLeaveDetailsSummaryReport?${params.toString()}`
  );

  if (Array.isArray(res)) {
    return res;
  }

  if (Array.isArray(res?.data)) {
    return res.data;
  }

  return [];
};
