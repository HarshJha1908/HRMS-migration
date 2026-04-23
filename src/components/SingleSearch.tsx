import { useState } from "react";
import "./SingleSearch.css";
import { getEmployeeByKeyword } from "../services/apiService"; // adjust path
import { useNavigate } from "react-router-dom";

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
    <div className="container">
      <div className="header">* Enter Search Text</div>

      {/* SEARCH SECTION */}
      <div className="search-section">
        <div className="left-box">
          <input
            type="text"
            value={keyword}
            placeholder="Enter Search Text"
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />

          <button onClick={handleSearch} disabled={loading}>Find</button>

          {error && <p className="error-text">{error}</p>}
        </div>

        <div className="right-box">
          <p className="tips-title">*Tips:</p>
          <ul>
            <li>
              Type First Name/Last Name/Employee last 3 Nbr - for specific search.
            </li>
            <li>Type Left - for only ex-employee list.</li>
            <li>Type All - for all employee list.</li>
          </ul>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table>
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
              <tr>
                <td colSpan={5} className="no-data">
                  Loading...
                </td>
              </tr>
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
                    <br></br>
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
                    <br></br>
                    <button
                      type="button"
                      onClick={() => navigate("/apply-leave",{
                        state: {
                          employee: emp,
                          empId: String(emp.user_Employee_No || "").trim(),
                          userId: String(emp.user_Id || emp.userId || "").trim()
                        }
                      })}
                    >
                      Apply Leave
                    </button>
                    <br></br>
                    <button
                      type="button"
                      onClick={() => navigate("/profile", { state: { employee: emp, mode: "update" } })}
                    >
                      Update Info
                    </button>
                    <br></br>
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SingleSearch;
