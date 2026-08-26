import { useState } from "react";
import "./SingleSearch.css";
import { getEmployeeByKeyword } from "../services/apiService"; // adjust path
import { useNavigate } from "react-router-dom";
import { TableSkeleton } from "./Skeletons";
// import { useAuth } from "../auth/useAuth";

type EmployeeSearchItem = {
  user_Employee_No?: string | number;
  user_Id?: string;
  userId?: string;
  name?: string;
  user_Doj?: string;
  teamName?: string;
  user_Sex?: string;
  lwd?: string | null;
  isActive?: boolean;
  user_Mat_Pat_Applicable?: boolean;
};

const SingleSearch = () => {
  // const {user} = useAuth();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [employees, setEmployees] = useState<EmployeeSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      setError("Please enter search text");
      return;
    }

    if (trimmedKeyword.length > 100) {
      setError("Search text is too long.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getEmployeeByKeyword(trimmedKeyword);
      setEmployees(data);
    } catch {
      setEmployees([]);
      setError("Unable to fetch employees. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="single-search-page">
  <div className="single-search-card">
      <div className="single-search-header">
  <h2 className="single-search-title">Single Search</h2>
</div>

      {/* SEARCH SECTION */}
      <div className="single-search-filter-grid">
  <div className="single-search-filter-field">
    <label>Enter Search Text</label>

    <input
      type="text"
      value={keyword}
      placeholder="Enter Search Text"
      onChange={(e) => setKeyword(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
    />

    {error && <p className="single-search-error">{error}</p>}
  </div>

  <div className="single-search-filter-field single-search-tips">
    <label>Tips</label>

    <ul>
      <li>
        Type First Name/Last Name/Employee last 3 Nbr - for specific search.
      </li>
      <li>Type Left - for only ex-employee list.</li>
      <li>Type All - for all employee list.</li>
    </ul>
  </div>

  <div className="single-search-filter-action">
    <button
      className="single-search-go-btn"
      onClick={handleSearch}
      disabled={loading}
    >
      Find
    </button>
  </div>
</div>

      {/* TABLE */}
      <div className="single-search-table-wrap">
  <table className="single-search-table">
          <thead>
            <tr>
              <th>Employee Id</th>
              <th>Employee Name</th>
              <th>DOJ</th>
              <th>Team Name</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <TableSkeleton columns={5} rows={6} />
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={5} className="no-data">
                  No Records Found
                </td>
              </tr>
            ) : (
              employees.map((emp, i) => (
                <tr key={emp.user_Employee_No || `emp-${i}`}>
                  <td>{emp.user_Employee_No || "-"}</td>
                  <td>{emp.name || "-"}</td>
                  <td>
                    {emp.user_Doj
                      ? new Date(emp.user_Doj).toLocaleDateString("en-GB")
                      : "-"}
                  </td>
                  <td className="team">{emp.teamName || "-"}</td>
                  <td className="action">
                    <button
                      type="button"
                      onClick={() => navigate("/single-search/details", { state: { employee: emp } })}
                    >
                      Details
                    </button>
                   
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/single-search/create-exception", {
                          state: {
                            employee: emp,
                            empId: String(emp.user_Employee_No || "").trim(),
                            userId: String(emp.user_Id || emp.userId || "").trim()
                          }
                        })
                      }
                    >
                      Create Exception
                    </button>
              
                    {/* <button
                      type="button"
                      onClick={() => navigate("/apply-leave", {
                        state: {
                          employee: emp,
                          empId: String(emp.user_Employee_No || "").trim(),
                          userId: String(emp.user_Id || emp.userId || "").trim()
                        }
                      })}
                    >
                      Apply Leave
                    </button> */}
                   
                    <button
                      type="button"
                      onClick={() => navigate("/profile", { state: { employee: emp, mode: "update" } })}
                    >
                      Update Employee Profile
                    </button>
                  
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/insurance", {
                          state: {
                            employee: emp,
                            empId: String(
                              emp.user_Employee_No || ""
                            ).trim(),
                            mode: "single-search",
                          },
                        })
                      }
                    >
                      Update Insurance Info
                    </button>
                    
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/single-search/exit-leave-adjustment", {
                          state: {
                            employee: emp,
                            empId: String(emp.user_Employee_No || "").trim()
                          }
                        })
                      }
                    >
                      Exit Leave Adjustment
                    </button>
                    {/* <br></br> */}
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/apply-leave-for-others", {
                          state: {
                            employee: emp,
                            empId: String(emp.user_Employee_No || "").trim(),
                            userId: String(emp.user_Id || emp.userId || "").trim(),
                            employeeName: String(emp.name || "").trim(),
                            mode: "single-search",
                          },
                        })
                      }
                    >
                      Apply Leave for Others
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    </section>
  );
};

export default SingleSearch;
