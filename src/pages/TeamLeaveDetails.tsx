import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllLeaveRequestByManagerId,
  getAllTeamMembersByManagerId,
  getLeaveTypes
} from "../services/apiService";
import Pagination from "../components/Pagination";
import type { LeaveDetailsApi, LeaveTypeApi, TeamMemberApi } from "../types/apiTypes";
import "./TeamLeaveDetails.css";
import { useLeaveStatusCodes } from "../hooks/useLeaveStatusCodes";

const MANAGER_USER_ID = "in091a";

const normalize = (value: string | null | undefined) => (value || "").trim();
const normalizeCode = (value: string | null | undefined) => normalize(value).toUpperCase();
const normalizeAdId = (value: unknown) => String(value ?? "").trim();

const pickRowUserId = (row: LeaveDetailsApi) => {
  const candidate = row as LeaveDetailsApi & {
    userId?: unknown;
    adId?: unknown;
    requesterAdId?: unknown;
    requesterUserId?: unknown;
    user_Id?: unknown;
  };

  return (
    normalizeAdId(candidate.requesterAdId) ||
    normalizeAdId(candidate.requesterUserId) ||
    normalizeAdId(candidate.userId) ||
    normalizeAdId(candidate.adId) ||
    normalizeAdId(candidate.user_Id)
  );
};

const formatDate = (value: string | null) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-GB");
};

const statusClass = (statusCode: string) => {
  const code = normalizeCode(statusCode);
  if (code === "A") return "approved";
  if (code === "P") return "pending";
  if (code === "R") return "rejected";
  if (code === "C") return "cancelled";
  if (code === "S") return "schedule";
  return "draft";
};

export default function TeamLeaveDetails() {
  const navigate = useNavigate();
  const { leaveStatuses } = useLeaveStatusCodes();

  const [teamMembers, setTeamMembers] = useState<TeamMemberApi[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeApi[]>([]);

  const [allRows, setAllRows] = useState<LeaveDetailsApi[]>([]);
  const [rows, setRows] = useState<LeaveDetailsApi[]>([]);

  const [memberFilter, setMemberFilter] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError("");

        const [memberRes, leaveTypeRes, managerRows] = await Promise.all([
          getAllTeamMembersByManagerId(MANAGER_USER_ID),
          getLeaveTypes(MANAGER_USER_ID),
          getAllLeaveRequestByManagerId(MANAGER_USER_ID)
        ]);

        const memberData = (memberRes?.data ?? []).map((m: TeamMemberApi) => ({
          ...m,
          name: normalize(m.name),
          user_Id: normalize(m.user_Id)
        }));

        const leaveTypeData = (leaveTypeRes?.data ?? []).map((lt: LeaveTypeApi) => ({
          leaveTypeCode: normalize(lt.leaveTypeCode),
          leaveTypeName: normalize(lt.leaveTypeName)
        }));

        const normalizedRows = (managerRows ?? []).map((row) => ({
          ...row,
          requesterName: normalize(row.requesterName),
          leaveTypeName: normalize(row.leaveTypeName),
          statusCode: normalize(row.statusCode)
        }));

        setTeamMembers(memberData);
        setLeaveTypes(leaveTypeData);
        setAllRows(normalizedRows);
        setRows(normalizedRows);
      } catch (err) {
        console.error(err);
        setError("Failed to load team leave details.");
        setAllRows([]);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  const statusMap = useMemo(() => {
    const map = new Map<string, string>();
    leaveStatuses.forEach((s) => {
      map.set(normalizeCode(s.statusCode), s.statusName);
    });
    return map;
  }, [leaveStatuses]);

  const leaveTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    leaveTypes.forEach((lt) => {
      map.set(normalizeCode(lt.leaveTypeCode), normalize(lt.leaveTypeName));
    });
    return map;
  }, [leaveTypes]);

  const memberNameToAdId = useMemo(() => {
    const map = new Map<string, string>();
    teamMembers.forEach((member) => {
      const key = normalize(member.name).toLowerCase();
      const adid = normalize(member.user_Id);
      if (key && adid && !map.has(key)) {
        map.set(key, adid);
      }
    });
    return map;
  }, [teamMembers]);

  const handleGo = () => {
    const hasFilter = Boolean(memberFilter || leaveTypeFilter || statusFilter);

    if (!hasFilter) {
      setRows(allRows);
      setCurrentPage(1);
      return;
    }

    const filtered = allRows.filter((row) => {
      const memberOk =
        !memberFilter || normalize(row.requesterName).toLowerCase() === normalize(memberFilter).toLowerCase();

      const leaveTypeOk =
        !leaveTypeFilter ||
        normalizeCode(row.leaveTypeName) === normalizeCode(leaveTypeFilter) ||
        normalize(row.leaveTypeName).toLowerCase() ===
          (leaveTypeMap.get(normalizeCode(leaveTypeFilter)) || "").toLowerCase();

      const statusOk = !statusFilter || normalizeCode(row.statusCode) === normalizeCode(statusFilter);

      return memberOk && leaveTypeOk && statusOk;
    });

    setRows(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const lastIndex = currentPage * rowsPerPage;
  const firstIndex = lastIndex - rowsPerPage;
  const paginatedRows = rows.slice(firstIndex, lastIndex);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <section className="team-leave-page">
      <div className="team-leave-card">
        <div className="team-leave-header">
          <h2 className="team-leave-title">Leave Details - At A Glance</h2>
        </div>

        <div className="team-filter-grid">
          <div className="team-filter-field">
            <label>Team Member Name</label>
            <select value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)}>
              <option value="">All Member</option>
              {teamMembers.map((member) => (
                <option key={member.user_Id} value={member.name}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="team-filter-field">
            <label>Leave Type</label>
            <select value={leaveTypeFilter} onChange={(e) => setLeaveTypeFilter(e.target.value)}>
              <option value="">All Leave Type</option>
              {leaveTypes.map((lt) => (
                <option key={lt.leaveTypeCode} value={lt.leaveTypeCode}>
                  {lt.leaveTypeName}
                </option>
              ))}
            </select>
          </div>

          <div className="team-filter-field">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              {leaveStatuses.map((ls) => (
                <option key={ls.statusCode} value={ls.statusCode}>
                  {ls.statusName}
                </option>
              ))}
            </select>
          </div>

          <div className="team-filter-action">
            <button className="team-go-btn" type="button" onClick={handleGo}>
              Go
            </button>
          </div>
        </div>

        <div className="team-table-wrap">
          <table className="team-table">
            <thead>
              <tr>
                <th>Requester Name</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Submission Date</th>
                <th>Status</th>
                <th>Status Change Date</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9}>Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9}>{error}</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9}>No leave records found.</td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr key={row.leaveId}>
                    <td>{row.requesterName}</td>
                    <td>{row.leaveTypeName}</td>
                    <td>{formatDate(row.startDate)}</td>
                    <td>{formatDate(row.endDate)}</td>
                    <td>{row.noOfDays}</td>
                    <td>{formatDate(row.submitionDate)}</td>
                    <td>
                      <span className={`team-status ${statusClass(row.statusCode)}`}>
                        {statusMap.get(normalizeCode(row.statusCode)) || row.statusCode}
                      </span>
                    </td>
                    <td>{formatDate(row.statusChangeDate)}</td>
                    <td>
                      <button
                        type="button"
                        className="team-view-btn"
                        onClick={() =>
                          navigate("/leave-view", {
                            state: {
                              leaveId: row.leaveId,
                              isManager: true,
                              userId:
                                pickRowUserId(row) ||
                                memberNameToAdId.get(normalize(row.requesterName).toLowerCase()) ||
                                undefined
                            }
                          })
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && !error && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </section>
  );
}
