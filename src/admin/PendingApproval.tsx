import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PendingApproval.css";
import { getAllTeamMembersByManagerId, getPendingApprovals, bulkApproveReject } from "../services/apiService";
import type { TeamMemberApi } from "../types/apiTypes";

type PendingApprovalApiItem = {
  leaveId: string;
  requesterName: string;
  leaveTypeName?: string | null;
  startDate: string;
  endDate: string;
  noOfDays: number;
  submitionDate: string;
  reason?: string | null;
  userId?: string | null;
  user_Id?: string | null;
  requesterAdId?: string | null;
  requesterUserId?: string | null;
  adId?: string | null;
};

type PendingRow = {
  id: string;
  leaveId: string;
  name: string;
  type: string;
  dateRange: string;
  days: number;
  balance: string;
  submitted: string;
  reason: string;
  remark: string;
  selected: boolean;
  userId: string;
};

export default function PendingApproval() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<PendingRow[]>([]);
  const [nameToAdId, setNameToAdId] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userId = "in091a";
  const normalize = (value: string | null | undefined) => (value || "").trim();
  const normalizeNameKey = (value: string | null | undefined) => normalize(value).toLowerCase();
  const pickUserId = (item: PendingApprovalApiItem) =>
    normalize(item.userId) ||
    normalize(item.user_Id) ||
    normalize(item.requesterAdId) ||
    normalize(item.requesterUserId) ||
    normalize(item.adId);

  const formatDate = (date: string) => {
    if (!date) return "-";
    const parsedDate = new Date(date);
    return Number.isNaN(parsedDate.getTime())
      ? "-"
      : parsedDate.toLocaleDateString("en-GB");
  };

  const fetchPending = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError("");

        const [data, teamRes] = await Promise.all([
          getPendingApprovals(userId) as Promise<PendingApprovalApiItem[]>,
          getAllTeamMembersByManagerId(userId)
        ]);

        const teamMap = new Map<string, string>();
        (teamRes?.data ?? []).forEach((member: TeamMemberApi) => {
          const nameKey = normalizeNameKey(member.name);
          const adid = normalize(member.user_Id);
          if (nameKey && adid && !teamMap.has(nameKey)) {
            teamMap.set(nameKey, adid);
          }
        });
        setNameToAdId(teamMap);

        const mapped = data.map((item, index) => ({
          id: `${item.leaveId}-${index}`,
          leaveId: item.leaveId,
          name: item.requesterName,
        type: item.leaveTypeName?.trim() || "-",
        dateRange: `${formatDate(item.startDate)} to ${formatDate(item.endDate)}`,
        days: item.noOfDays,
        balance: "NA",
          submitted: formatDate(item.submitionDate),
          reason: item.reason || "-",
          remark: "",
          selected: false,
          userId: pickUserId(item) || teamMap.get(normalizeNameKey(item.requesterName)) || ""
        }));

      setRows(mapped);
    } catch {
      setError("Failed to load pending approvals. Please try again.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const hasSelection = rows.some((r) => r.selected);
  const allSelected = rows.length > 0 && rows.every((r) => r.selected);

  const toggleAll = (checked: boolean) => {
    setRows((prev) => prev.map((r) => ({ ...r, selected: checked })));
  };

  const toggleRow = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, selected: !r.selected } : r
      )
    );
  };

  const updateRemark = (id: string, value: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, remark: value.slice(0, 250) } : r
      )
    );
  };

  const handleAction = async (action: "Approve" | "Reject") => {
  const selectedRows = rows.filter((r) => r.selected);

  if (selectedRows.length === 0) {
    alert("No rows selected");
    return;
  }

  if (action === "Reject") {
    const missingRemark = selectedRows.some((r) => !r.remark.trim());
    if (missingRemark) {
      alert("Please enter remark for rejection");
      return;
    }
  }

  // Prepare payload (as per your API)
  const payload = selectedRows.map((r) => ({
    leaveId: r.leaveId,
    status: action === "Approve" ? "A" : "R",
    remarks: r.remark || ""
  }));

  // Backup current state (for rollback)
  const previousRows = rows;

  // 🔥 Optimistic update (instant UI change)
  setRows((prev) => prev.filter((r) => !r.selected));

  try {
    setLoading(true);

    await bulkApproveReject(payload);

    alert(`${action} successful`);

  } catch (err) {
    console.error(err);
    alert("Something went wrong");

    // ❗ Rollback if API fails
    setRows(previousRows);
  } finally {
    setLoading(false);
  }
};

  return (
    <section className="pending-page">
      <div className="container">
        <div className="card">
          <div className="card-header">Pending Approval Details</div>

          <div className="card-body">
            <div className="controls">
              <label className="select-all">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
                <span>Select All</span>
              </label>

              <div className="action-buttons">
                <button
                  className="btn approve"
                  disabled={!hasSelection}
                  onClick={() => handleAction("Approve")}
                >
                  Approve
                </button>

                <button
                  className="btn reject"
                  disabled={!hasSelection}
                  onClick={() => handleAction("Reject")}
                >
                  Reject
                </button>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Requester Name</th>
                    <th>Leave Type</th>
                    <th>Start-End Date</th>
                    <th>Days</th>
                    <th>Balance</th>
                    <th>Submission Date</th>
                    <th>Reason</th>
                    <th>Approver Remark</th>
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
                      <td colSpan={9}>No Records Found</td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={() => toggleRow(row.id)}
                          />
                        </td>
                        <td>{row.name}</td>
                        <td>{row.type}</td>
                        <td>{row.dateRange}</td>
                        <td>{row.days}</td>
                        <td>{row.balance}</td>
                        <td>{row.submitted}</td>
                        <td>{row.reason}</td>
                        <td>
                          <input
                            type="text"
                            className="remark-input"
                            value={row.remark}
                            onChange={(e) =>
                              updateRemark(row.id, e.target.value)
                            }
                          />
                          <div>
                            <button
                              type="button"
                              className="view-link"
                              onClick={() =>
                                navigate("/leave-view", {
                                  state: {
                                    leaveId: row.leaveId,
                                    isManager: true,
                                    userId: row.userId || nameToAdId.get(normalizeNameKey(row.name)) || undefined
                                  }
                                })
                              }
                            >
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
