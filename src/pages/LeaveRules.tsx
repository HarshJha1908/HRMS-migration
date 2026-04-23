import { useEffect, useState } from "react";
import { getLeaveRules } from "../services/apiService";
import type { LeaveRuleApi } from "../types/apiTypes";
import "./LeaveRules.css";

const leaveTypeCodeMap: Record<string, string> = {
  "Birthday Leave": "BDL",
  "Casual Leave": "CL",
  "Compensatory Off": "CO",
  "Election Leave": "ELL",
  "Maternity Leave": "MTL",
  "Paternity Leave": "PTL",
  "Privilege Leave": "PL",
  "Sick Leave": "SL",
  "Special Sick Leave": "SSL",
  "WFH Exception": "WFHX",
  "Work From Home": "WFH"
};

const formatLeaveType = (leaveType: string) => {
  const code = leaveTypeCodeMap[leaveType];
  return code ? `${leaveType}(${code})` : leaveType;
};

const normalizeText = (value: string) => {
  if (!value) return "-";
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(",");
};

export default function LeaveRules() {
  const [rules, setRules] = useState<LeaveRuleApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRules = async () => {
      try {
        setLoading(true);
        const response = await getLeaveRules();
        if (response?.isSuccess && Array.isArray(response.data)) {
          setRules(response.data);
        } else {
          setError(response?.message || "Unable to load leave rules.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load leave rules.");
      } finally {
        setLoading(false);
      }
    };

    loadRules();
  }, []);

  return (
    <section className="leave-rules-page">
      <div className="leave-rules-card">
        <h2 className="leave-rules-title">Clubbing Rule</h2>

        {loading && <p className="leave-rules-state">Loading...</p>}
        {error && !loading && <p className="leave-rules-error">{error}</p>}

        {!loading && !error && (
          <div className="leave-rules-table-wrapper">
            <table className="leave-rules-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Eligibility</th>
                  <th>Total Days</th>
                  <th>Max/Min Days</th>
                  <th>Half Day</th>
                  <th>Schedule</th>
                  <th>Clubbing Not Allowed</th>
                </tr>
              </thead>
              <tbody>
                {rules.length === 0 ? (
                  <tr>
                    <td colSpan={7}>No leave rules found.</td>
                  </tr>
                ) : (
                  rules.map((rule, index) => (
                    <tr key={`${rule.leavetype}-${index}`}>
                      <td>{formatLeaveType(rule.leavetype)}</td>
                      <td>{normalizeText(rule.eligibility)}</td>
                      <td>{rule.totalDays.toFixed(1)}</td>
                      <td>{normalizeText(rule.maxMinDays)}</td>
                      <td>{normalizeText(rule.halfDay)}</td>
                      <td>{normalizeText(rule.schedule)}</td>
                      <td>{normalizeText(rule.clubbingNotAllowed)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
