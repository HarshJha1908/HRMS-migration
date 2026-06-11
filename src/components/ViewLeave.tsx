import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./ViewLeave.css";
import {
  getViewLeaveDetailsByLeaveId,
  savePendingLeaveRequestByOneLeaveId,
  getLeaveAttachment
} from "../services/apiService";
import type { LeaveDetails } from "../types/apiTypes";
import { useHolidays } from "../hooks/useHolidays";
import { useUser } from "../context/UserContext";
import { useAuth } from "../auth/useAuth";
import { formatLocalDate } from "../utils/Utils";
import PageLoader from "./PageLoader";
// import ToastMessage from "./ToastMessage";

type ViewLeaveDetailsProps = {
  onDataLoaded?: (details: LeaveDetails | null) => void;
  onLeaveStatusChanged?: () => void;
};

export default function ViewLeaveDetails({
  onDataLoaded,
  onLeaveStatusChanged
}: ViewLeaveDetailsProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const leaveId = location.state?.leaveId;
  const { isManager } = useUser();
  const { user } = useAuth();
  const currentUserAdId = user?.loginUserAdID || "";
  const viewedUserId =
    location.state?.userId || "";
  const isOwnLeave =
    currentUserAdId.trim().toLowerCase() ===
    viewedUserId.trim().toLowerCase();
  const [data, setData] = useState<LeaveDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { holidays } = useHolidays();
  const [attachmentFile, setAttachmentFile] = useState<Blob | null>(null);
  const [attachmentFileName, setAttachmentFileName] = useState<string>("");
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  // const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [, setSuccessMessage] = useState("");
  const [rejectValidationActive, setRejectValidationActive] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {

        setLoading(true);

        if (!leaveId) return;

        const result = await getViewLeaveDetailsByLeaveId(leaveId);
        console.log("Leave details fetched:", result);
        setData(result.data);
        setRemarks(result?.data?.approverRemarks || "");
        onDataLoaded?.((result?.data as LeaveDetails) || null);

        // Fetch attachment
        try {

          const attachmentData = await getLeaveAttachment(leaveId);

          if (attachmentData && attachmentData.blob && attachmentData.blob.size > 0) {


            const pdfBlob = new Blob(
              [attachmentData.blob],
              { type: "application/pdf" }
            );
            setAttachmentFile(pdfBlob);
            setAttachmentFileName(attachmentData.filename);
          }
        } catch (attachmentError) {
          console.error("Attachment fetch failed:", attachmentError);
          setAttachmentFile(null);
          setAttachmentFileName("");
        }
      } catch (error) {
        console.error(error);
        onDataLoaded?.(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [leaveId, onDataLoaded]);

  useEffect(() => {
    if (!attachmentFile) {
      setAttachmentUrl("");
      return;
    }

    const url = URL.createObjectURL(attachmentFile);
    setAttachmentUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [attachmentFile]);


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

  const showManagerActions =
    isManager &&
    !isOwnLeave &&
    isPending;

  const handleManagerAction = async (nextStatus: "A" | "R") => {
    setErrorMessage("");
    setSuccessMessage("");
    if (!leaveId) {
      setErrorMessage("Leave ID is missing.");
      return;
    }

    const trimmedRemarks = remarks.trim();

    if (nextStatus === "R" && !trimmedRemarks) {
      setErrorMessage("Please enter approver remark before rejection.");
      setRejectValidationActive(true);
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

      onLeaveStatusChanged?.();

      setTimeout(() => {
        navigate("/pending-approval", {
          state: {
            message:
              nextStatus === "A"
                ? "Leave approved successfully."
                : "Leave rejected successfully."
          }
        });
      }, 700);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to save action. Please try again.";
      setErrorMessage(message);
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

  const handleViewAttachment = () => {
    if (attachmentFile) {
      setShowAttachmentModal(true);
    }
  };

  const closeAttachmentModal = () => {
    setShowAttachmentModal(false);
  };

  // const getAttachmentUrl = () => {
  //   if (attachmentFile) {
  //     return URL.createObjectURL(attachmentFile);
  //   }
  //   return "";
  // };

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No data found.</p>;

  return (
    <section className="view-leave-page">
      <PageLoader show={actionLoading} />
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
                  disabled={
                    actionLoading ||
                    rejectValidationActive
                  }
                  onClick={() => handleManagerAction("A")}
                >
                  {actionLoading ? (
                    <span className="btn-spinner"></span>
                  ) : (
                    "Approve"
                  )}
                </button>
                <button
                  type="button"
                  className="btn reject"
                  disabled={actionLoading}
                  onClick={() => handleManagerAction("R")}
                >
                  {actionLoading ? (
                    <span className="btn-spinner"></span>
                  ) : (
                    "Reject"
                  )}
                </button>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="view-error-text">
              {errorMessage}
            </div>
          )}

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
                  <span className="value">{formatDate(data.dateofapproved)}</span>
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
                      onChange={(e) => {
                        const value = e.target.value;

                        setRemarks(value);

                        if (value.trim()) {
                          setRejectValidationActive(false);
                          setErrorMessage("");
                        }
                      }}
                    />
                  ) : (
                    <span className="value">{data.approverRemarks || "-"}</span>
                  )}
                </td>
              </tr>

              <tr>
                <td colSpan={2}>
                  <span className="label">Attachment:</span>
                  {attachmentFile ? (
                    <button
                      type="button"
                      onClick={handleViewAttachment}
                      className="attachment-link"
                      title="Click to view attachment"
                    >
                      {attachmentFileName}
                    </button>
                  ) : (
                    <span className="value">-</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Attachment Modal */}
      {showAttachmentModal && attachmentFile && (
        <div className="attachment-modal-overlay" onClick={closeAttachmentModal}>
          <div className="attachment-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="attachment-modal-header">
              <h3>{attachmentFileName}</h3>
              <button
                type="button"
                className="attachment-modal-close"
                onClick={closeAttachmentModal}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="attachment-modal-body">
              <iframe
                src={attachmentUrl}
                className="attachment-viewer"
                title="Attachment Viewer"
              />
            </div>
            <div className="attachment-modal-footer">
              <a
                href={attachmentUrl}
                download={attachmentFileName}
                className="btn-download"
              >
                Download
              </a>
              <button
                type="button"
                className="btn-close-modal"
                onClick={closeAttachmentModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
