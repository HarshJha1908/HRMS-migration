import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LeaveBalance from "../components/LeaveBalance";
import Pagination from "../components/Pagination";
import {
  getEmpProfileByEmpId,
  getApprover,
  getEmployeeContact,
  getLeaveDetails,
  getLeaveTypes,
  savePendingLeaveRequestByOneLeaveId
} from "../services/apiService";
import type { LeaveDetailsApi, LeaveTypeApi } from "../types/apiTypes";
import "./SingleSearchDetails.css";

type EmployeeSearchItem = {
  user_Employee_No?: string | number;
  user_Id?: string;
  name?: string;
  empName?: string;
  user_Doj?: string;
  user_Email_Id?: string;
  teamName?: string;
  teamManagerName?: string;
  teamHeadName?: string;
  status?: string;
  user_Sex?: string;
  lwd?: string | null;
  isActive?: boolean;
  user_Mat_Pat_Applicable?: boolean;
  emergencyContactNo1?: string;
  emergencyContactNo2?: string;
  contactName1?: string;
  contactName2?: string;
  [key: string]: unknown;
};

type ContactDetails = {
  contactNo1?: string;
  contactNo2?: string;
  contactNoName1?: string;
  contactNoName2?: string;
  managerName?: string;
  headName?: string;
};

type ActionStatus = "A" | "R" | "C";

const normalizeName = (value: unknown) => String(value || "").trim();

const extractManagerName = (payload: unknown) => {
  const candidate = payload as
    | { managerName?: unknown; managername?: unknown; ManagerName?: unknown; data?: unknown }
    | undefined;

  const directName =
    normalizeName(candidate?.managerName) ||
    normalizeName(candidate?.managername) ||
    normalizeName(candidate?.ManagerName);
  if (directName) return directName;

  const nestedData = candidate?.data as
    | { managerName?: unknown; managername?: unknown; ManagerName?: unknown }
    | undefined;
  const nestedName =
    normalizeName(nestedData?.managerName) ||
    normalizeName(nestedData?.managername) ||
    normalizeName(nestedData?.ManagerName);
  if (nestedName) return nestedName;

  if (Array.isArray(candidate?.data) && candidate?.data.length > 0) {
    const first = candidate.data[0] as
      | { managerName?: unknown; managername?: unknown; ManagerName?: unknown }
      | undefined;
    const listName =
      normalizeName(first?.managerName) ||
      normalizeName(first?.managername) ||
      normalizeName(first?.ManagerName);
    if (listName) return listName;
  }

  return "";
};

const formatDate = (value?: string | null) => {
  if (!value) return "NA";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "NA" : date.toLocaleDateString("en-GB");
};

const toStatusLabel = (status?: string) => {
  const normalized = status?.toLowerCase();
  if (normalized === "a") return "Approved";
  if (normalized === "r") return "Rejected";
  if (normalized === "c") return "Cancelled";
  if (normalized === "p") return "Pending";
  return "Drafted";
};

const toSuccessMessage = (status: ActionStatus) => {
  if (status === "A") return "Leave approved successfully.";
  if (status === "R") return "Leave rejected successfully.";
  return "Leave cancelled successfully.";
};

const toStatusClass = (status?: string) => {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "a" || normalized === "approved") return "approved";
  if (normalized === "p" || normalized === "pending") return "pending";
  if (normalized === "r" || normalized === "rejected") return "rejected";
  if (normalized === "c" || normalized === "cancelled") return "cancelled";
  return "drafted";
};

const isVisibleHrStatus = (status?: string) => {
  const normalized = String(status || "").trim().toLowerCase();
  return (
    normalized === "p" ||
    normalized === "a" ||
    normalized === "r" ||
    normalized === "c" ||
    normalized === "pending" ||
    normalized === "approved" ||
    normalized === "rejected" ||
    normalized === "cancelled"
  );
};

const isActionAllowedForHr = (status?: string) => {
  const normalized = String(status || "").trim().toLowerCase();
  return normalized === "p" || normalized === "a" || normalized === "pending" || normalized === "approved";
};

const toStatusKey = (status?: string) => {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "a" || normalized === "approved") return "a";
  if (normalized === "p" || normalized === "pending") return "p";
  if (normalized === "r" || normalized === "rejected") return "r";
  if (normalized === "c" || normalized === "cancelled") return "c";
  return "d";
};

const pickAdId = (employee?: EmployeeSearchItem | null) =>
  String(employee?.user_Id || "").trim();

const pickEmpNo = (employee?: EmployeeSearchItem | null) =>
  String(employee?.user_Employee_No || "").trim();

const toEmpNoParam = (value: string) => {
  if (!value) return "";
  const digits = value.replace(/[^\d]/g, "");
  return digits || value;
};

export default function SingleSearchDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const employeeFromState = location.state?.employee as EmployeeSearchItem | undefined;
  const [profile, setProfile] = useState<EmployeeSearchItem | null>(employeeFromState || null);
  const [contact, setContact] = useState<ContactDetails | null>(null);
  const [leaveRows, setLeaveRows] = useState<LeaveDetailsApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningLeaveId, setActioningLeaveId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeApi[]>([]);
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [appliedLeaveTypeFilter, setAppliedLeaveTypeFilter] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("");
  const rowsPerPage = 5;

  useEffect(() => {
    const loadDetails = async () => {
      if (!employeeFromState) {
        setError("Employee details were not passed from Single Search.");
        setLoading(false);
        return;
      }

      const empNoFromState = pickEmpNo(employeeFromState);
      const empNoParam = toEmpNoParam(empNoFromState);

      try {
        setLoading(true);
        setError("");
        setCurrentPage(1);
        setLeaveTypeFilter("");
        setStatusFilter("");
        setAppliedLeaveTypeFilter("");
        setAppliedStatusFilter("");
        setLeaveTypes([]);

        if (!empNoParam) {
          throw new Error("Employee number is missing. Unable to load profile details.");
        }

        const profileByEmpId = await getEmpProfileByEmpId(empNoParam);
        const mergedProfile: EmployeeSearchItem = {
          ...employeeFromState,
          ...profileByEmpId,
          name: String(profileByEmpId.empName || employeeFromState.name || "").trim() || undefined
        };
        setProfile(mergedProfile);

        const adId = pickAdId(mergedProfile);
        if (!adId) {
          setLeaveRows([]);
          return;
        }

        let managerName = "";
        try {
          const approverResponse = await getApprover(adId);
          managerName = extractManagerName(approverResponse);
        } catch {
          managerName = "";
        }

        try {
          const leaveTypeResponse = await getLeaveTypes(adId);
          const leaveTypeData = Array.isArray(leaveTypeResponse?.data)
            ? leaveTypeResponse.data
            : [];
          setLeaveTypes(
            leaveTypeData
              .map((item: LeaveTypeApi) => ({
                leaveTypeCode: String(item.leaveTypeCode || "").trim(),
                leaveTypeName: String(item.leaveTypeName || "").trim()
              }))
              .filter((item: LeaveTypeApi) => item.leaveTypeCode || item.leaveTypeName)
          );
        } catch {
          setLeaveTypes([]);
        }

        try {
          const contactResponse = await getEmployeeContact(adId);
          const list = contactResponse?.employeeEmergencyContactDetails;

          if (Array.isArray(list) && list.length > 0) {
            const contactInfo = list[0] as ContactDetails;
            setContact({
              ...contactInfo,
              managerName:
                normalizeName(contactInfo?.managerName) ||
                managerName ||
                normalizeName(mergedProfile.teamManagerName),
              headName:
                normalizeName(contactInfo?.headName) ||
                normalizeName(mergedProfile.teamHeadName)
            });
          } else {
            setContact(
              managerName || mergedProfile.teamManagerName || mergedProfile.teamHeadName
                ? {
                    managerName: managerName || normalizeName(mergedProfile.teamManagerName),
                    headName: normalizeName(mergedProfile.teamHeadName)
                  }
                : null
            );
          }
        } catch {
          setContact(
            managerName || mergedProfile.teamManagerName || mergedProfile.teamHeadName
              ? {
                  managerName: managerName || normalizeName(mergedProfile.teamManagerName),
                  headName: normalizeName(mergedProfile.teamHeadName)
                }
              : null
          );
        }

        try {
          const leaveResponse = await getLeaveDetails({
            year: new Date().getFullYear(),
            adid: adId,
            leaveTypeCode: "",
            status: ""
          });

          const rows = Array.isArray(leaveResponse?.data) ? leaveResponse.data : [];
          setLeaveRows(rows);
        } catch {
          setLeaveRows([]);
        }
      } catch {
        setError("Unable to fetch employee details. Please try again.");
        setLeaveRows([]);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [employeeFromState]);

  const visibleLeaveRows = useMemo(
    () => leaveRows.filter((row) => isVisibleHrStatus(row.statusCode)),
    [leaveRows]
  );

  const leaveTypeOptions = useMemo(() => {
    const byCode = new Map<string, string>();

    leaveTypes.forEach((item) => {
      const code = String(item.leaveTypeCode || "").trim();
      const name = String(item.leaveTypeName || "").trim();

      if (!code && !name) return;

      const optionCode = code || name;
      const optionName = name || code;

      if (!byCode.has(optionCode)) {
        byCode.set(optionCode, optionName);
      }
    });

    return Array.from(byCode.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [leaveTypes]);

  const statusOptions = useMemo(() => ["p", "a", "r", "c"], []);

  const filteredLeaveRows = useMemo(
    () =>
      visibleLeaveRows.filter((row) => {
        const rowLeaveType = String(row.leaveTypeName || "").trim().toLowerCase();
        const rowStatusKey = toStatusKey(row.statusCode);
        const selectedLeaveType = appliedLeaveTypeFilter.toLowerCase();
        const selectedLeaveTypeName =
          leaveTypeOptions.find((item) => item.code.toLowerCase() === selectedLeaveType)?.name.toLowerCase() ||
          "";

        const leaveTypeMatch = !appliedLeaveTypeFilter
          ? true
          : rowLeaveType === selectedLeaveType || rowLeaveType === selectedLeaveTypeName;
        const statusMatch = !appliedStatusFilter || rowStatusKey === appliedStatusFilter;

        return leaveTypeMatch && statusMatch;
      }),
    [appliedLeaveTypeFilter, appliedStatusFilter, leaveTypeOptions, visibleLeaveRows]
  );

  const totalPages = Math.ceil(filteredLeaveRows.length / rowsPerPage);
  const lastIndex = currentPage * rowsPerPage;
  const firstIndex = lastIndex - rowsPerPage;
  const paginatedLeaveRows = filteredLeaveRows.slice(firstIndex, lastIndex);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
    if (filteredLeaveRows.length === 0) {
      setCurrentPage(1);
    }
  }, [currentPage, filteredLeaveRows.length, totalPages]);

  const fullName = useMemo(
    () => String(profile?.empName || profile?.name || profile?.user_Fname || "NA"),
    [profile]
  );

  const statusText = useMemo(() => {
    const profileStatus = String(profile?.status || "").trim();
    if (profileStatus) return profileStatus;
    return profile?.isActive === false ? "Inactive" : "Active";
  }, [profile]);

  const handleGoFilter = () => {
    setAppliedLeaveTypeFilter(leaveTypeFilter);
    setAppliedStatusFilter(statusFilter);
    setCurrentPage(1);
  };

  const handleLeaveAction = async (leaveId: string, status: ActionStatus) => {
    try {
      setActioningLeaveId(leaveId);
      const response = await savePendingLeaveRequestByOneLeaveId({
        leaveId,
        status,
        remarks: ""
      });

      if (!response?.isSuccess) {
        throw new Error(response?.message || "Action failed.");
      }

      setLeaveRows((prev) =>
        prev.map((row) => (row.leaveId === leaveId ? { ...row, statusCode: status } : row))
      );
      alert(toSuccessMessage(status));
    } catch (actionError) {
      const message =
        actionError instanceof Error && actionError.message
          ? actionError.message
          : "Unable to submit action.";
      alert(message);
    } finally {
      setActioningLeaveId(null);
    }
  };

  if (loading) return <p>Loading details...</p>;

  return (
    <section className="single-search-details-page">
      <div className="ssd-panel">
        <h2 className="ssd-title">My Profile :</h2>
        {error && <p className="ssd-error">{error}</p>}
        {!error && (
          <div className="ssd-grid">
            <div>Emp ID:</div>
            <div>{pickEmpNo(profile) || "NA"}</div>
            <div>AD ID:</div>
            <div>{pickAdId(profile) || "NA"}</div>

            <div>Name:</div>
            <div>{fullName}</div>
            <div>Sex:</div>
            <div>{String(profile?.user_Sex || "NA")}</div>

            <div>DOJ (dd/mm/yyyy):</div>
            <div>{formatDate(String(profile?.user_Doj || ""))}</div>
            <div>LWD (dd/mm/yyyy):</div>
            <div>{formatDate(String(profile?.lwd || ""))}</div>

            <div>Is Maternity/Paternity Applicable:</div>
            <div>{profile?.user_Mat_Pat_Applicable ? "Yes" : "No"}</div>
            <div>Status:</div>
            <div>{statusText}</div>

            <div>Emergency Contact Name 1:</div>
            <div>{String(contact?.contactNoName1 || profile?.contactName1 || "NA")}</div>
            <div>Emergency Contact Number 1:</div>
            <div>{String(contact?.contactNo1 || profile?.emergencyContactNo1 || "NA")}</div>

            <div>Emergency Contact Name 2:</div>
            <div>{String(contact?.contactNoName2 || profile?.contactName2 || "NA")}</div>
            <div>Emergency Contact Number 2:</div>
            <div>{String(contact?.contactNo2 || profile?.emergencyContactNo2 || "NA")}</div>

            <div>Team Name:</div>
            <div>{String(profile?.teamName || "NA")}</div>
            <div>Team Head Name:</div>
            <div>{String(contact?.headName || profile?.teamHeadName || "NA")}</div>

            <div>Team Manager Name:</div>
            <div>{String(contact?.managerName || profile?.teamManagerName || "NA")}</div>
            <div />
            <div />
          </div>
        )}
      </div>

      <div className="ssd-panel">
        <h2 className="ssd-title">Leave Details :</h2>
        <div className="ssd-filter-grid">
          <div className="ssd-filter-field">
            <label>Leave Type</label>
            <select value={leaveTypeFilter} onChange={(e) => setLeaveTypeFilter(e.target.value)}>
              <option value="">All Leave Type</option>
              {leaveTypeOptions.map((type) => (
                <option key={type.code} value={type.code}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div className="ssd-filter-field">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              {statusOptions.map((statusKey) => (
                <option key={statusKey} value={statusKey}>
                  {toStatusLabel(statusKey)}
                </option>
              ))}
            </select>
          </div>
          <div className="ssd-filter-action">
            <button type="button" onClick={handleGoFilter}>
              Go
            </button>
          </div>
        </div>
        <div className="ssd-table-wrap">
          <table className="ssd-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Start-End Date</th>
                <th>Days</th>
                <th>Submission Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaveRows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    No pending, approved, rejected or cancelled leave information available.
                  </td>
                </tr>
              ) : (
                paginatedLeaveRows.map((row) => {
                  const actionAllowed = isActionAllowedForHr(row.statusCode);
                  const rowBusy = actioningLeaveId === row.leaveId;

                  return (
                    <tr key={row.leaveId}>
                      <td>{row.leaveTypeName || "NA"}</td>
                      <td>{`${formatDate(row.startDate)} to ${formatDate(row.endDate)}`}</td>
                      <td>{row.noOfDays}</td>
                      <td>{formatDate(row.submitionDate)}</td>
                      <td>{row.reason || "NA"}</td>
                      <td>
                        <span className={`ssd-status-badge ${toStatusClass(row.statusCode)}`}>
                          {toStatusLabel(row.statusCode)}
                        </span>
                      </td>
                      <td>
                        <div className="ssd-actions">
                          <button
                            type="button"
                            disabled={!actionAllowed || rowBusy}
                            onClick={() => handleLeaveAction(row.leaveId, "A")}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={!actionAllowed || rowBusy}
                            onClick={() => handleLeaveAction(row.leaveId, "R")}
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            disabled={!actionAllowed || rowBusy}
                            onClick={() => handleLeaveAction(row.leaveId, "C")}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      <LeaveBalance userId={pickAdId(profile) || undefined} />

      <div className="ssd-back-row">
        <button type="button" onClick={() => navigate("/single-search")}>
          Back To Single Search
        </button>
      </div>
    </section>
  );
}
