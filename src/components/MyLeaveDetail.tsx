import { useEffect, useState } from "react";
import {
  getLeaveDetails,
  savePendingLeaveRequestByOneLeaveId
} from "../services/apiService";
import "./MyLeaveDetail.css";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Pagination from "./Pagination";
import type { LeaveDetailsApi } from "../types/apiTypes";
import type { LeaveDetailProps } from "../types/props";
import { useAuth } from "../auth/useAuth";
import ToastMessage from "./ToastMessage";
import PageLoader from "./PageLoader";
import { TableSkeleton } from "./Skeletons";

const toStatusKey = (value?: string | null) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "a" || normalized === "approved") return "a";
  if (normalized === "p" || normalized === "pending") return "p";
  if (normalized === "r" || normalized === "rejected") return "r";
  if (normalized === "c" || normalized === "cancelled") return "c";
  if (
    normalized === "d" ||
    normalized === "draft" ||
    normalized === "drafted"
  )
    return "d";
  if (
    normalized === "s" ||
    normalized === "schedule" ||
    normalized === "scheduled"
  )
    return "s";

  return normalized;
};

export default function MyLeaveDetail({
  showLatestOnly = false,
  year,
  leaveType,
  status,
  onLeaveStatusChanged
}: LeaveDetailProps) {
  const { user } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const [showMessage, setShowMessage] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [data, setData] = useState<LeaveDetailsApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPageLoader, setShowPageLoader] = useState(false);
  const [error, setError] = useState("");
  const [showCancelModal, setShowCancelModal] =
    useState(false);

  const [selectedLeaveId, setSelectedLeaveId] =
    useState<string>("");

  const currentUserAdId = user?.loginUserAdID || "";

  const currentYear = new Date().getFullYear();

  const selectedYear = year ?? currentYear;
  const selectedLeaveType = leaveType ?? "";
  const selectedStatus = status ?? "";

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const payload = {
          year: selectedYear,
          adid: currentUserAdId || "",
          leaveTypeCode: selectedLeaveType,
          status: selectedStatus
        };

        const response = await getLeaveDetails(payload);

        const rows = Array.isArray(response?.data)
          ? response.data
          : [];

        const selectedStatusKey = toStatusKey(selectedStatus);

        const filteredRows = selectedStatus
          ? rows.filter(
            (row: LeaveDetailsApi) =>
              toStatusKey(row.statusCode) === selectedStatusKey
          )
          : rows;

        setData(filteredRows);
      } catch (err) {
        setError("Failed to load leave details.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    selectedYear,
    selectedLeaveType,
    selectedStatus,
    currentUserAdId
  ]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString("en-GB");
  };

  useEffect(() => {
    if (location.state?.message,setShowMessage) {
      const timer = setTimeout(() => {
        setShowMessage(false);
        setSuccessMessage("");
        navigate(location.pathname, { replace: true });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.state, navigate, successMessage]);

  const getStatusClass = (status: string) => {
    const s = status?.toLowerCase();

    if (s === "p") return "Pending";
    if (s === "a") return "Approved";
    if (s === "c") return "Cancelled";
    if (s === "r") return "Rejected";

    return "Drafted";
  };

  const canCancelLeave = (
    startDate: string | null,
    status: string
  ) => {
    if (!startDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const leaveStartDate = new Date(startDate);
    leaveStartDate.setHours(0, 0, 0, 0);

    const normalizedStatus = status?.toLowerCase();

    const validStatus =
      normalizedStatus === "p" ||
      normalizedStatus === "a";

    return today < leaveStartDate && validStatus;
  };

const handleCancelLeave = (
  leaveId: string
) => {
  
  setSelectedLeaveId(leaveId);
  setShowCancelModal(true);
};

const confirmCancelLeave = async () => {
  try {
    setShowPageLoader(true);
    await savePendingLeaveRequestByOneLeaveId({
      leaveId: selectedLeaveId,
      status: "C",
      remarks: ""
    });

    setData((prev) =>
      prev.map((item) =>
        item.leaveId === selectedLeaveId
          ? {
              ...item,
              statusCode: "c"
            }
          : item
      )
    );

    setShowCancelModal(false);

    onLeaveStatusChanged?.();
    setSuccessMessage("Leave cancelled successfully.");
  } catch (error) {
    setShowCancelModal(false);

    setError("Failed to cancel leave.");
  }
  finally{
    // setSuccessMessage(false);
    setShowPageLoader(false);
  }
};
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const dataPerPage = 15;

  const totalPages = Math.ceil(data.length / dataPerPage);

  const lastIndex = currentPage * dataPerPage;
  const firstIndex = lastIndex - dataPerPage;

  const displayData = data.slice(firstIndex, lastIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, selectedLeaveType, selectedStatus]);

  // UI
  return (
    <section className="leave-detail-page">
      <div className="leave-detail-card">
        <h3 className="section-title">
          Latest Applied Leave :
        </h3>

        {location.state?.message && showMessage && (
          <ToastMessage
            show={!!location.state.message}
            message={location.state.message}
            type="success"
          />
        )}

        {successMessage && (
          <ToastMessage
            show={!!successMessage}
            message={successMessage}
            type="success"
          />
        )}

        {!loading && error && (
          <p className="error-text">{error}</p>
        )}

        {!error && (
          <div className="leave-table-wrapper">
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Submission Date</th>
                  <th>Approver Name</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <TableSkeleton columns={8} rows={showLatestOnly ? 2 : 7} />
                ) : displayData.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      No leave records found.
                    </td>
                  </tr>
                ) : showLatestOnly ? (
                  displayData
                    .slice(0, 2)
                    .map((l, i) => (
                      <tr key={l.leaveId || i}>
                        <td>{l.leaveTypeName}</td>

                        <td>
                          {formatDate(l.startDate)}
                        </td>

                        <td>
                          {formatDate(l.endDate)}
                        </td>

                        <td>{l.noOfDays}</td>

                        <td>
                          <span
                            className={`status-badge ${getStatusClass(
                              l.statusCode
                            )}`}
                          >
                            {getStatusClass(
                              l.statusCode
                            )}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            l.submitionDate
                          )}
                        </td>

                        <td>{l.approverName}</td>

                        <td className="action-cell">
                          <div className="action-buttons">
                            {canCancelLeave(
                              l.startDate,
                              l.statusCode
                            ) && (
                                <>
                                  <button
                                    className="cancel-btn"
                                    onClick={() =>
                                      handleCancelLeave(
                                        l.leaveId
                                      )
                                    }
                                  >
                                    Cancel
                                  </button>

                                  <span className="action-separator">
                                    |
                                  </span>
                                </>
                              )}

                            <button
                              className="view-btn"
                              onClick={() =>
                                navigate(
                                  "/leave-view",
                                  {
                                    state: {
                                      leaveId:
                                        l.leaveId,
                                      userId:
                                        currentUserAdId
                                    }
                                  }
                                )
                              }
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                ) : (
                  displayData.map((l, i) => (
                    <tr key={l.leaveId || i}>
                      <td>{l.leaveTypeName}</td>

                      <td>
                        {formatDate(l.startDate)}
                      </td>

                      <td>
                        {formatDate(l.endDate)}
                      </td>

                      <td>{l.noOfDays}</td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            l.statusCode
                          )}`}
                        >
                          {getStatusClass(
                            l.statusCode
                          )}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          l.submitionDate
                        )}
                      </td>

                      <td>{l.approverName}</td>

                      <td className="action-cell">
                        <div className="action-buttons">
                          {canCancelLeave(
                            l.startDate,
                            l.statusCode
                          ) && (
                              <>
                                <button
                                  className="cancel-btn"
                                  onClick={() =>
                                    handleCancelLeave(
                                      l.leaveId
                                    )
                                  }
                                >
                                  Cancel
                                </button>

                                <span className="action-separator">
                                  |
                                </span>
                              </>
                            )}

                          <button
                            className="view-btn"
                            onClick={() =>
                              navigate(
                                "/leave-view",
                                {
                                  state: {
                                    leaveId:
                                      l.leaveId,
                                    userId:
                                      currentUserAdId
                                  }
                                }
                              )
                            }
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {showLatestOnly && (
          <div
            className="view-more"
            onClick={() =>
              navigate("/leave-details")
            }
            style={{ cursor: "pointer" }}
          >
            View More..
          </div>
        )}

        {!showLatestOnly && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) =>
              setCurrentPage(page)
            }
          />
        )}
      </div>
      {showCancelModal && (
  <div className="cancel-modal-overlay">
    <PageLoader show={showPageLoader} />
    <div className="cancel-modal">
      <h3>Cancel Leave</h3>

      <p>
        Are you sure you want to cancel this
        leave request?
      </p>

      <div className="cancel-modal-actions">
        <button
          className="modal-no-btn"
          onClick={() =>
            setShowCancelModal(false)
          }
        >
          No
        </button>

        <button
          className="modal-yes-btn"
          onClick={confirmCancelLeave}
        >
          Yes
        </button>
      </div>
    </div>
  </div>
)}
    </section>
  );
}
