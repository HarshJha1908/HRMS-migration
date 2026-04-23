import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./ViewLeave.css";
import {
  getViewLeaveDetailsByLeaveId,
  savePendingLeaveRequestByOneLeaveId
} from "../services/apiService";
import type { LeaveDetails } from "../types/apiTypes";
import { useHolidays } from "../hooks/useHolidays";

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

type ViewLeaveDetailsProps = {
  onDataLoaded?: (details: LeaveDetails | null) => void;
};

export default function ViewLeaveDetails({ onDataLoaded }: ViewLeaveDetailsProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const leaveId = location.state?.leaveId;
  const isManager = Boolean(location.state?.isManager);
  const [data, setData] = useState<LeaveDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { holidays } = useHolidays();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        if (!leaveId) return;

        const result = await getViewLeaveDetailsByLeaveId(leaveId);
        setData(result.data);
        setRemarks(result?.data?.approverRemarks || "");
        onDataLoaded?.((result?.data as LeaveDetails) || null);
      } catch (error) {
        console.error(error);
        onDataLoaded?.(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [leaveId, onDataLoaded]);

  const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString("en-GB") : "-";
  const holidayDates = useMemo(
    () => holidays.map((h) => formatLocalDate(new Date(h.date))),
    [holidays]
  );

  const holidayNameByDate = useMemo(
    () =>
      new Map(
        holidays.map((h) => [formatLocalDate(new Date(h.date)), h.description])
      ),
    [holidays]
  );

  const isHoliday = useCallback(
    (date: Date) => holidayDates.includes(formatLocalDate(date)),
    [holidayDates]
  );

  const isPending = data?.statusCode?.toLowerCase() === "p";
  const showManagerActions = isManager && isPending;

  const handleManagerAction = async (nextStatus: "A" | "R") => {
    if (!leaveId) {
      alert("Leave ID is missing.");
      return;
    }

    const trimmedRemarks = remarks.trim();

    if (nextStatus === "R" && !trimmedRemarks) {
      alert("Please enter approver remark before rejection.");
      return;
    }

    try {
      setActionLoading(true);
      const response = await savePendingLeaveRequestByOneLeaveId({
        leaveId,
        status: nextStatus,
        remarks: trimmedRemarks
      });

      if (!response?.isSuccess) {
        throw new Error(response?.message || "Failed to update leave request.");
      }

      setData((prev) =>
        prev
          ? {
              ...prev,
              statusCode: nextStatus,
              approverRemarks: trimmedRemarks || prev.approverRemarks
            }
          : prev
      );

      alert(nextStatus === "A" ? "Leave approved successfully." : "Leave rejected successfully.");
      navigate("/pending-approval");
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to save action. Please try again.";
      alert(message);
    } finally {
      setActionLoading(false);
    }
  };

  const getDayClass = (date: Date) => {
    const isWeekendDay = date.getDay() === 0 || date.getDay() === 6;
    if (isHoliday(date) && !isWeekendDay) return "holiday-dot";
    return "";
  };

  const renderDay = (day: number, date?: Date) => {
    if (!date) return day;

    const iso = formatLocalDate(date);
    const isWeekendDay = date.getDay() === 0 || date.getDay() === 6;
    const fullHolidayName = holidayNameByDate.get(iso) || "";

    return (
      <div
        className="day-cell"
        title={fullHolidayName && !isWeekendDay ? fullHolidayName : undefined}
      >
        <span>{day}</span>
        {fullHolidayName && !isWeekendDay && (
          <>
            <span className="holiday-underline" />
            <span className="holiday-label">{fullHolidayName.slice(0, 4)}</span>
          </>
        )}
      </div>
    );
  };

  const getStatusClass = (status: string) => {
    const s = status?.toLowerCase();

    if (s === "p") return "Pending";
    if (s === "a") return "Approved";
    if (s === "r") return "Rejected";
    if (s === "c") return "Cancelled";

    return "Drafted";
  };

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No data found.</p>;

  return (
    <section className="view-leave-page">
      <div className="details-wrapper">
        <div className="details-card">
          <div className="details-title-row">
            <div className="details-title-left">
              <h2 className="details-title">Leave Details</h2>
              {showManagerActions && (
                <div className="calendar-anchor">
                  <button
                    type="button"
                    className="calendar-toggle-btn"
                    aria-label="Open holiday calendar"
                    onClick={() => setCalendarOpen((prev) => !prev)}
                    title="Holiday Calendar"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm12 8H5v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9ZM6 7a1 1 0 0 0-1 1h14a1 1 0 0 0-1-1H6Z" />
                    </svg>
                  </button>

                  {calendarOpen && (
                    <div className="details-calendar-popover">
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date | null) => setSelectedDate(date)}
                        inline
                        dayClassName={getDayClass}
                        renderDayContents={renderDay}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {showManagerActions && (
              <div className="action-buttons leave-actions">
                <button
                  type="button"
                  className="btn approve"
                  disabled={actionLoading}
                  onClick={() => handleManagerAction("A")}
                >
                  {actionLoading ? "Saving..." : "Approve"}
                </button>
                <button
                  type="button"
                  className="btn reject"
                  disabled={actionLoading}
                  onClick={() => handleManagerAction("R")}
                >
                  {actionLoading ? "Saving..." : "Reject"}
                </button>
              </div>
            )}
          </div>

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
                  {showManagerActions ? (
                    <textarea
                      className="approver-remark-input"
                      value={remarks}
                      maxLength={250}
                      placeholder="Enter remark"
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  ) : (
                    <span className="value">{data.approverRemarks || "-"}</span>
                  )}
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
