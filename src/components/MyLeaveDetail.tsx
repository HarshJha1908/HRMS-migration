import { useEffect, useState } from "react";
import { getLeaveDetails } from "../services/apiService";
import "./MyLeaveDetail.css";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Pagination from "./Pagination";
import type { LeaveDetailsApi } from "../types/apiTypes";
import type { LeaveDetailProps } from "../types/props";


export default function MyLeaveDetail({
  showLatestOnly = false,
  year,
  leaveType,
  status
}: LeaveDetailProps) {


  const location = useLocation();
  const navigate = useNavigate();
  const [showMessage, setShowMessage] = useState(true);
  const [data, setData] = useState<LeaveDetailsApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
          adid: "a2ef46",
          leaveTypeCode: selectedLeaveType,
          status: selectedStatus
        };

        console.log("Request Payload:", payload);

        const response = await getLeaveDetails(payload);
        // console.log("API FULL RESPONSE:", response);
        console.log("API DATA:", response?.data);

        if (response && response.data) {
          setData(response.data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load leave details.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedYear, selectedLeaveType, selectedStatus]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  useEffect(() => {
    if (location.state?.message) {
      const timer = setTimeout(() => {
        setShowMessage(false);

        navigate(location.pathname, { replace: true });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);
  const getStatusClass = (status: string) => {
    const s = status?.toLowerCase();

    if (s === "p") return "Pending";
    if (s === "a") return "Approved";
    if (s === "c") return "Cancelled";
    if (s === "r") return "Rejected";

    return "Drafted";
  };

  //Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const dataPerPage = 15;
  const totalPages = Math.ceil(data.length / dataPerPage);
  console.log("Total Pages:", totalPages);

  const lastIndex = currentPage * dataPerPage;
  const firstIndex = lastIndex - dataPerPage;
  const displayData = data.slice(firstIndex, lastIndex);
  console.log("Display Data for Page", currentPage, displayData);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, selectedLeaveType, selectedStatus]);

  //UI related
  return (
    <section className="leave-detail-page">
      <div className="leave-detail-card">
        <h3 className="section-title">Latest Applied Leave :</h3>
        {/* <p>{currentPage}</p> */}
        {location.state?.message && showMessage && (
          <div className="top-success-toast">
            {location.state.message}
          </div>
        )}
        {loading && <p>Loading...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && (
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

                {displayData.length === 0 ? (
                  <tr>
                    <td colSpan={7}>No leave records found.</td>
                  </tr>
                ) :
                  showLatestOnly ? (
                    displayData.slice(0, 2).map((l, i) => (
                      <tr key={l.leaveId || i}>
                        <td>{l.leaveTypeName}</td>
                        <td>{formatDate(l.startDate)}</td>
                        <td>{formatDate(l.endDate)}</td>
                        <td>{l.noOfDays}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(l.statusCode)}`}>
                            {getStatusClass(l.statusCode)}
                          </span>
                        </td>
                        <td>{formatDate(l.submitionDate)}</td>
                        <td>{l.approverName}</td>
                        <td>
                          <button
                            className="view-btn"
                            onClick={() => navigate("/leave-view", {
                              state: { leaveId: l.leaveId }
                            })}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))) : (
                    displayData.map((l, i) => (
                      <tr key={l.leaveId || i}>
                        <td>{l.leaveTypeName}</td>
                        <td>{formatDate(l.startDate)}</td>
                        <td>{formatDate(l.endDate)}</td>
                        <td>{l.noOfDays}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(l.statusCode)}`}>
                            {getStatusClass(l.statusCode)}
                          </span>
                        </td>
                        <td>{formatDate(l.submitionDate)}</td>
                        <td>{l.approverName}</td>
                        <td>
                          <button
                            className="view-btn"
                            onClick={() => navigate("/leave-view", {
                              state: { leaveId: l.leaveId }
                            })}
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
        )}

        {showLatestOnly && (
          <div
            className="view-more"
            onClick={() => navigate("/leave-details")}
            style={{ cursor: "pointer" }}
          >
            View More..
          </div>
        )}


        {!showLatestOnly && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />

        )}
        {/* <PaginatedData data={displayData} /> */}
      </div>

    </section>

  );
}
