import { useEffect, useMemo, useState } from "react";
import {
  addBulkSpecialLeaveRequest,
  deactivateBulkSpecialLeavesRequest,
  getAllSpecialLeaveTypes,
  getEmployeeListByTeamId,
  getEmployeeTeam,
  getEmpProfileByEmpId,
  getSpecialLeavesByLeaveTypeCodeYear
} from "../services/apiService";
import type {
  AddBulkSpecialLeaveRequestItem,
  EmployeeByTeamApi,
  SpecialLeaveRowApi,
  SpecialLeaveTypeApi
} from "../types/apiTypes";
import "./SpecialLeaveEntry.css";

const DEFAULT_LEAVE_TYPES: SpecialLeaveTypeApi[] = [
  { leaveTypeCode: "LWP", leaveTypeName: "Leave Without Pay" },
  { leaveTypeCode: "ELL", leaveTypeName: "Election Leave" },
  { leaveTypeCode: "SSL", leaveTypeName: "Special Sick Leave" }
];

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value.trim())) return value.trim();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB");
};

const normalize = (value: string | null | undefined) => String(value || "").trim();

const escapeCsvCell = (value: string | number | boolean | null | undefined) => {
  const safeValue = value ?? "";
  return `"${String(safeValue).replace(/"/g, "\"\"")}"`;
};

const sanitizeFileNamePart = (value: string) =>
  normalize(value)
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

type TeamOption = {
  teamId: string;
  teamName: string;
};

export default function SpecialLeaveEntry() {
  const [leaveTypes, setLeaveTypes] = useState<SpecialLeaveTypeApi[]>([]);
  const [selectedLeaveTypeCode, setSelectedLeaveTypeCode] = useState("LWP");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [rows, setRows] = useState<SpecialLeaveRowApi[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isAssignMode, setIsAssignMode] = useState(false);

  const [assignStartDate, setAssignStartDate] = useState("");
  const [assignEndDate, setAssignEndDate] = useState("");
  const [assignLeaveTypeCode, setAssignLeaveTypeCode] = useState("ELL");
  const [teamOptions, setTeamOptions] = useState<TeamOption[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [teamMembers, setTeamMembers] = useState<EmployeeByTeamApi[]>([]);
  const [selectedAssignEmployees, setSelectedAssignEmployees] = useState<number[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [isAssignSaving, setIsAssignSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState("");

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, index) => currentYear - index);
  }, []);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const list = await getAllSpecialLeaveTypes();
        const resolved = list.length > 0 ? list : DEFAULT_LEAVE_TYPES;
        setLeaveTypes(resolved);

        const hasCurrentCode = resolved.some(
          (item) => item.leaveTypeCode === selectedLeaveTypeCode
        );
        if (!hasCurrentCode) {
          setSelectedLeaveTypeCode(resolved[0]?.leaveTypeCode || "LWP");
        }
      } catch {
        setLeaveTypes(DEFAULT_LEAVE_TYPES);
      }
    };

    loadTypes();
  }, [selectedLeaveTypeCode]);

  useEffect(() => {
    const loadSpecialLeaves = async () => {
      if (!selectedLeaveTypeCode || !selectedYear) return;

      try {
        setLoading(true);
        setError("");
        const list = await getSpecialLeavesByLeaveTypeCodeYear(
          selectedLeaveTypeCode,
          selectedYear
        );
        const safeList = Array.isArray(list) ? list : [];

        const profileTeamCache = new Map<string, Promise<string>>();
        const fetchTeamNameFromProfile = async (lookupKey: string) => {
          const key = String(lookupKey || "").trim();
          if (!key) return "";

          try {
            const profile = await getEmpProfileByEmpId(key);
            return String(profile?.teamName || "").trim();
          } catch {
            return "";
          }
        };

        const enrichedRows = await Promise.all(
          safeList.map(async (row) => {
            const teamNameFromApi = String(row.teamName || "").trim();
            if (teamNameFromApi) return row;

            const candidateKeys = [String(row.empId || "").trim(), String(row.empAdId || "").trim()]
              .filter(Boolean);

            for (const key of candidateKeys) {
              if (!profileTeamCache.has(key)) {
                profileTeamCache.set(key, fetchTeamNameFromProfile(key));
              }
              const teamName = await profileTeamCache.get(key);
              if (teamName) {
                return { ...row, teamName };
              }
            }

            return row;
          })
        );

        setRows(enrichedRows);
        setSelectedRows([]);
      } catch (fetchError) {
        const message =
          fetchError instanceof Error && fetchError.message
            ? fetchError.message
            : "Unable to fetch special leaves.";
        setError(message);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    loadSpecialLeaves();
  }, [selectedLeaveTypeCode, selectedYear]);

  useEffect(() => {
    const loadAssignData = async () => {
      if (!isAssignMode) return;

      try {
        setAssignLoading(true);
        setError("");
        const teamResponse = await getEmployeeTeam(false, true);

        const rawTeams = Array.isArray(teamResponse) ? teamResponse : teamResponse?.data || [];
        const normalizedTeams = rawTeams
          .map((item: Record<string, unknown>) => {
            const rawTeamId = item?.teamId ?? item?.teamID ?? item?.assignmentTeamId ?? item?.id;
            const rawTeamName = item?.teamName ?? item?.assignmentTeamName ?? item?.name ?? "";
            return {
              teamId: String(rawTeamId ?? "").trim(),
              teamName: String(rawTeamName ?? "").trim()
            };
          })
          .filter((item: TeamOption) => item.teamId && item.teamName);

        const uniqueTeamMap = new Map<string, TeamOption>();
        normalizedTeams.forEach((team: TeamOption) => {
          const key = normalize(team.teamName).toLowerCase();
          if (!uniqueTeamMap.has(key)) {
            uniqueTeamMap.set(key, team);
          }
        });

        const teamList = Array.from(uniqueTeamMap.values());
        setTeamOptions(teamList);
        setSelectedTeamId((prev) => (prev && teamList.some((t) => t.teamId === prev) ? prev : teamList[0]?.teamId || ""));
      } catch {
        setError("Unable to load assign details.");
        setTeamOptions([]);
        setTeamMembers([]);
      } finally {
        setAssignLoading(false);
      }
    };

    void loadAssignData();
  }, [isAssignMode]);

  useEffect(() => {
    const loadTeamMembers = async () => {
      if (!isAssignMode || !selectedTeamId) {
        setTeamMembers([]);
        return;
      }

      try {
        setTeamMembersLoading(true);
        setError("");
        const members = await getEmployeeListByTeamId(selectedTeamId);
        setTeamMembers(Array.isArray(members) ? members : []);
        setSelectedAssignEmployees([]);
      } catch (loadError) {
        const message =
          loadError instanceof Error && loadError.message
            ? loadError.message
            : "Unable to load team members for selected team.";
        setError(message);
        setTeamMembers([]);
      } finally {
        setTeamMembersLoading(false);
      }
    };

    void loadTeamMembers();
  }, [isAssignMode, selectedTeamId]);

  const normalizedRows = useMemo(
    () =>
      rows.map((row, index) => ({
        ...row,
        serialNo: index + 1
      })),
    [rows]
  );

  const selectedTeamName = useMemo(
    () => teamOptions.find((team) => team.teamId === selectedTeamId)?.teamName || "",
    [selectedTeamId, teamOptions]
  );

  const assignMemberRows = useMemo(() => teamMembers, [teamMembers]);

  const toggleRow = (specialLeaveId: number) => {
    setSelectedRows((prev) =>
      prev.includes(specialLeaveId)
        ? prev.filter((id) => id !== specialLeaveId)
        : [...prev, specialLeaveId]
    );
  };

  const toggleAssignEmployee = (employeeNo: number) => {
    setSelectedAssignEmployees((prev) =>
      prev.includes(employeeNo)
        ? prev.filter((id) => id !== employeeNo)
        : [...prev, employeeNo]
    );
  };

  const handleRemoveSelected = async () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one row to remove.");
      return;
    }

    const confirmRemove = window.confirm(
      "Do you really want to remove the selected special leave request(s)?"
    );

    if (!confirmRemove) return;

    try {
      setIsRemoving(true);
      setError("");

      const today = new Date().toISOString().split("T")[0];
      const currentUser =
        String(sessionStorage.getItem("username") || "").trim() ||
        String(sessionStorage.getItem("userId") || "").trim() ||
        "HR";

      const selectedSet = new Set(selectedRows);
      const selectedPayload = rows
        .filter((row) => selectedSet.has(row.specialLeaveID))
        .map((row) => ({
          specialLeaveID: row.specialLeaveID,
          empId: row.empId,
          empAdId: row.empAdId,
          empName: row.empName,
          leaveType: normalize(row.leaveTypeCode || row.leaveType || row.leaveTypeName),
          fromDate: row.fromDate,
          toDate: row.toDate,
          updatedOn: today,
          updatedBy: currentUser,
          isActive: false,
          isHalfStartDay: Boolean(row.isHalfStartDay),
          isHalfEndDay: Boolean(row.isHalfEndDay)
        }));

      const response = await deactivateBulkSpecialLeavesRequest(selectedPayload);
      if (response?.isSuccess === false) {
        throw new Error(response?.message || "Unable to remove selected rows.");
      }

      setRows((prev) =>
        prev.map((row) =>
          selectedSet.has(row.specialLeaveID)
            ? { ...row, isActive: false, updatedOn: today, updatedBy: currentUser }
            : row
        )
      );
      setSelectedRows([]);
    } catch (removeError) {
      const message =
        removeError instanceof Error && removeError.message
          ? removeError.message
          : "Unable to remove selected rows.";
      setError(message);
      alert(message);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleAssignSave = async () => {
    if (!assignStartDate || !assignEndDate) {
      alert("Please select both Start Date and End Date.");
      return;
    }

    if (assignEndDate < assignStartDate) {
      alert("End Date cannot be before Start Date.");
      return;
    }

    if (!assignLeaveTypeCode) {
      alert("Please select Leave Type.");
      return;
    }

    if (selectedAssignEmployees.length === 0) {
      alert("Please select at least one employee.");
      return;
    }

    const selectedSet = new Set(selectedAssignEmployees);
    const selectedMembers = assignMemberRows.filter((member) => selectedSet.has(member.employeeId));

    if (selectedMembers.length === 0) {
      alert("Selected employees are not available in current team list.");
      return;
    }

    const updatedOn = new Date().toISOString().split("T")[0];
    const updatedBy =
      normalize(sessionStorage.getItem("username")) ||
      normalize(sessionStorage.getItem("userId")) ||
      "HR";
    const selectedLeaveType = leaveTypes.find(
      (item) => normalize(item.leaveTypeCode).toUpperCase() === normalize(assignLeaveTypeCode).toUpperCase()
    );
    const resolvedLeaveTypeCode =
      normalize(selectedLeaveType?.leaveTypeCode || assignLeaveTypeCode).toUpperCase();
    const resolvedLeaveTypeName = normalize(selectedLeaveType?.leaveTypeName || assignLeaveTypeCode);
    const resolvedLeaveTypeIdRaw =
      selectedLeaveType?.leaveTypeId ?? selectedLeaveType?.leaveTypeID ?? "";
    const resolvedLeaveTypeId = normalize(String(resolvedLeaveTypeIdRaw || ""));

    const payload: AddBulkSpecialLeaveRequestItem[] = selectedMembers.map((member) => ({
      specialLeaveID: 0,
      empId: member.employeeId,
      empAdId: normalize(member.employeeADId),
      empName: normalize(member.employeeName),
      leaveType: resolvedLeaveTypeCode,
      leaveTypeCode: resolvedLeaveTypeCode,
      leaveTypeName: resolvedLeaveTypeName,
      ...(resolvedLeaveTypeId ? { leaveTypeId: resolvedLeaveTypeId, leaveTypeID: resolvedLeaveTypeId } : {}),
      fromDate: assignStartDate,
      toDate: assignEndDate,
      updatedOn,
      updatedBy,
      isActive: true,
      isHalfStartDay: false,
      isHalfEndDay: false
    }));
    console.info("Special leave assign payload type snapshot", {
      assignLeaveTypeCode,
      resolvedLeaveTypeCode,
      resolvedLeaveTypeName,
      resolvedLeaveTypeId
    });

    try {
      setIsAssignSaving(true);
      const response = await addBulkSpecialLeaveRequest(payload);
      if (response?.isSuccess === false) {
        throw new Error(response?.message || "Unable to save special leave request.");
      }

      setSelectedAssignEmployees([]);
      setSelectedLeaveTypeCode(resolvedLeaveTypeCode);
      setIsAssignMode(false);
      alert(response?.message || "Special leave request saved successfully.");
    } catch (saveError) {
      const message =
        saveError instanceof Error && saveError.message
          ? saveError.message
          : "Unable to save special leave request.";
      alert(message);
    } finally {
      setIsAssignSaving(false);
    }
  };

  const handleExport = () => {
    if (normalizedRows.length === 0) {
      alert("No records available to export.");
      return;
    }

    const headers = [
      "Serial No",
      "Employee No",
      "Employee AD ID",
      "Employee Name",
      "Team Name",
      "Leave Type",
      "Start Date",
      "End Date",
      "Active Status",
      "Updated On",
      "Updated By"
    ];

    const csvRows = normalizedRows.map((row) =>
      [
        row.serialNo,
        row.empId,
        row.empAdId,
        row.empName || "-",
        row.teamName || "-",
        row.leaveTypeCode || row.leaveTypeName || row.leaveType || "-",
        formatDate(row.fromDate),
        formatDate(row.toDate),
        row.isActive === false ? "Inactive" : "Active",
        formatDate(row.updatedOn),
        row.updatedBy || "-"
      ]
        .map(escapeCsvCell)
        .join(",")
    );

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;"
    });
    const downloadUrl = URL.createObjectURL(blob);
    const selectedLeaveTypeName =
      leaveTypes.find((type) => type.leaveTypeCode === selectedLeaveTypeCode)?.leaveTypeName ||
      selectedLeaveTypeCode;
    const safeLeaveType = sanitizeFileNamePart(selectedLeaveTypeName) || "special-leave";
    const fileName = `${safeLeaveType}-${selectedYear}.csv`;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  if (isAssignMode) {
    return (
      <section className="special-leave-page">
        <div className="special-leave-card assign-card">
          <div className="special-leave-header">
            <h2>Assign Special Leaves</h2>
          </div>

          <div className="assign-form-grid">
            <div className="assign-field">
              <label>
                Start Date<span>*</span>
              </label>
              <input
                type="date"
                value={assignStartDate}
                onChange={(event) => setAssignStartDate(event.target.value)}
              />
            </div>
            <div className="assign-field">
              <label>
                End Date<span>*</span>
              </label>
              <input
                type="date"
                value={assignEndDate}
                onChange={(event) => setAssignEndDate(event.target.value)}
              />
            </div>
            <div className="assign-field">
              <label>
                Leave Type<span>*</span>
              </label>
              <select
                value={assignLeaveTypeCode}
                onChange={(event) => setAssignLeaveTypeCode(event.target.value)}
              >
                {leaveTypes.map((type) => (
                  <option key={type.leaveTypeCode} value={type.leaveTypeCode}>
                    {type.leaveTypeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="assign-team-section">
            <label>
              Search &amp; Select Employee(s)<span>*</span>
            </label>
            <select
              value={selectedTeamId}
              onChange={(event) => setSelectedTeamId(event.target.value)}
              disabled={assignLoading}
            >
              <option value="">Select Team</option>
              {teamOptions.map((team) => (
                <option key={team.teamId} value={team.teamId}>
                  {team.teamName}
                </option>
              ))}
            </select>
          </div>

          {assignLoading && <div className="special-leave-error">Loading assign data...</div>}
          {error && <div className="special-leave-error">{error}</div>}

          <div className="special-leave-table-wrap">
            <table className="special-leave-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Employee Id</th>
                  <th>Employee Name</th>
                  <th>DOJ</th>
                  <th>Team Name</th>
                </tr>
              </thead>
              <tbody>
                {assignLoading || teamMembersLoading ? (
                  <tr>
                    <td colSpan={5}>Loading...</td>
                  </tr>
                ) : assignMemberRows.length === 0 ? (
                  <tr>
                    <td colSpan={5}>No employees found for selected team.</td>
                  </tr>
                ) : (
                  assignMemberRows.map((member) => (
                    <tr key={`${member.employeeId}-${member.employeeADId}`}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedAssignEmployees.includes(member.employeeId)}
                          onChange={() => toggleAssignEmployee(member.employeeId)}
                          aria-label={`Select employee ${member.employeeId}`}
                        />
                      </td>
                      <td>{member.employeeId}</td>
                      <td>{member.employeeName || "-"}</td>
                      <td>{formatDate(member.doj)}</td>
                      <td>{member.teamName || selectedTeamName || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="special-leave-actions">
            <button
              type="button"
              onClick={handleAssignSave}
              disabled={isAssignSaving || assignLoading || teamMembersLoading}
            >
              {isAssignSaving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsAssignMode(false)}
              disabled={isAssignSaving}
            >
              Back
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="special-leave-page">
      <div className="special-leave-card">
        <div className="special-leave-header">
          <h2>View Special Leaves</h2>
        </div>

        <div className="special-leave-filter">
          <label htmlFor="specialLeaveType">Special Leave Type:</label>
          <select
            id="specialLeaveType"
            value={selectedLeaveTypeCode}
            onChange={(event) => setSelectedLeaveTypeCode(event.target.value)}
          >
            {leaveTypes.map((type) => (
              <option key={type.leaveTypeCode} value={type.leaveTypeCode}>
                {type.leaveTypeName}
              </option>
            ))}
          </select>
          <label htmlFor="specialLeaveYear">Year:</label>
          <select
            id="specialLeaveYear"
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="special-leave-error">{error}</div>}

        <div className="special-leave-table-wrap">
          <table className="special-leave-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Serial No</th>
                <th>Employee No</th>
                <th>Employee Name</th>
                <th>Team Name</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8}>Loading...</td>
                </tr>
              ) : normalizedRows.length === 0 ? (
                <tr>
                  <td colSpan={8}>No records found.</td>
                </tr>
              ) : (
                normalizedRows.map((row) => (
                  <tr
                    key={row.specialLeaveID}
                    className={row.isActive === false ? "special-leave-row-inactive" : ""}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.specialLeaveID)}
                        onChange={() => toggleRow(row.specialLeaveID)}
                        disabled={row.isActive === false || isRemoving}
                        aria-label={`Select row ${row.specialLeaveID}`}
                      />
                    </td>
                    <td>{row.serialNo}</td>
                    <td>{row.empId}</td>
                    <td>{row.empName || "-"}</td>
                    <td>{row.teamName || "-"}</td>
                    <td>{row.leaveTypeCode || row.leaveTypeName || row.leaveType || "-"}</td>
                    <td>{formatDate(row.fromDate)}</td>
                    <td>{formatDate(row.toDate)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="special-leave-actions">
          <button type="button" onClick={() => setIsAssignMode(true)}>
            Assign
          </button>
          <button type="button" onClick={handleRemoveSelected} disabled={isRemoving}>
            {isRemoving ? "Removing..." : "Remove Selected"}
          </button>
          <button type="button" onClick={handleExport} disabled={loading || normalizedRows.length === 0}>
            Export
          </button>
        </div>
      </div>
    </section>
  );
}
