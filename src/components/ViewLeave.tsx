import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./ViewLeave.css";
import { getViewLeaveDetailsByLeaveId } from "../services/apiService";
import type { LeaveDetails } from "../types/apiTypes";

export default function ViewLeaveDetails() {
  const location = useLocation();
  const leaveId = location.state?.leaveId;
  const [data, setData] = useState<LeaveDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        if (!leaveId) return;

        const result = await getViewLeaveDetailsByLeaveId(leaveId);
        setData(result.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [leaveId]);

  const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString("en-GB") : "-";

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No data found.</p>;

  const getStatusClass = (status: string) => {
    const s = status?.toLowerCase();

    if (s === "p") return "Pending";
    if (s === "a") return "Approved";
    if (s === "r") return "Rejected";
    if (s === "c") return "Cancelled";

    return "Drafted";
  };

  return (
    <section className="view-leave-page">
      <div className="details-wrapper">
        <div className="details-card">
          <h2 className="details-title">Leave Details</h2>

          <table className="leave-details-table">
            <tbody>
              <tr className="top-row">
                <td>
                  <span className="label">Employee Name:</span>
                  <span className="value">{data.requesterName || "-"}</span>
                </td>
                <td>
                  <span className="label">Maternity/Privilege Leave Applicable:</span>
                  <span className="value">{data.pat_Mat_Leave || "-"}</span>
                </td>
              </tr>

              <tr>
                <td>
                  <span className="label">Leave Type:</span>
                  <span className="value">{data.leaveTypeName || "-"}</span>
                </td>
                <td>
                  <span className="label">Status:</span>
                  <span className={`status-badge ${getStatusClass(data.statusCode)}`}>
                    {getStatusClass(data.statusCode)}
                  </span>
                </td>
              </tr>

              <tr>
                <td>
                  <span className="label">Start From:</span>
                  <span className="value">{formatDate(data.startDate)}</span>
                </td>
                <td>
                  <span className="label">End From:</span>
                  <span className="value">{formatDate(data.endDate)}</span>
                </td>
              </tr>

              <tr>
                <td colSpan={2}>
                  <span className="label">Reason:</span>
                  <span className="value">{data.reason || "-"}</span>
                </td>
              </tr>

              <tr>
                <td>
                  <span className="label">Submission Date:</span>
                  <span className="value">{formatDate(data.submitionDate)}</span>
                </td>
                <td>
                  <span className="label">Last Update Date:</span>
                  <span className="value">{formatDate(data.statusChangeDate)}</span>
                </td>
              </tr>

              <tr>
                <td>
                  <span className="label">Approver Name:</span>
                  <span className="value">{data.approverName || "-"}</span>
                </td>
                <td>
                  <span className="label">Approver Remark:</span>
                  <span className="value">{data.approverRemarks || "-"}</span>
                </td>
              </tr>

              <tr>
                <td colSpan={2}>
                  <span className="label">Attachment:</span>
                  <span className="value">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
