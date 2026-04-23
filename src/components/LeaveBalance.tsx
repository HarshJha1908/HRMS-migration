import { useEffect, useMemo, useState } from "react";
import { getLeaveBalance } from "../services/apiService";
import type { LeaveBalanceApiData } from "../types/apiTypes";
import "./LeaveBalance.css";

type LeaveBalanceProps = {
  userId?: string;
};

const DEFAULT_USER_ID = "in091a";

const asDisplay = (value: string | null | undefined) => {
  const text = String(value ?? "").trim();
  return text || "NA";
};

const isNaValue = (value: string | null | undefined) => asDisplay(value).toUpperCase() === "NA";

const renderValue = (value: string | null | undefined, colorClass: "red" | "blue") => (
  <span className={isNaValue(value) ? "red" : colorClass}>{asDisplay(value)}</span>
);

const renderLine = (
  label: string,
  total: string | null | undefined,
  submitted: string | null | undefined,
  balance: string | null | undefined
) => (
  <p>
    {label}: {renderValue(total, "blue")} [ {renderValue(submitted, "blue")} / {renderValue(balance, "red")} ]
  </p>
);

export default function LeaveBalance({ userId = DEFAULT_USER_ID }: LeaveBalanceProps) {
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalanceApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadLeaveBalance = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getLeaveBalance(userId);
        if (!active) return;

        if (!response?.isSuccess || !response?.data) {
          throw new Error(response?.message || "Unable to load leave balance.");
        }

        setLeaveBalance(response.data);
      } catch (apiError) {
        if (!active) return;
        const message =
          apiError instanceof Error && apiError.message
            ? apiError.message
            : "Unable to load leave balance.";
        setError(message);
        setLeaveBalance(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadLeaveBalance();

    return () => {
      active = false;
    };
  }, [userId]);

  const firstColumn = useMemo(() => {
    if (!leaveBalance) return null;

    return (
      <div>
        {renderLine("Birthday Leave(BDL)", leaveBalance.bdL_Total, leaveBalance.bdL_Submitted, leaveBalance.bdL_Balance)}
        {renderLine(
          "Associate Special Leave (ASL)",
          leaveBalance.asL_Total,
          leaveBalance.asL_Submitted,
          leaveBalance.asL_Balance
        )}
        {renderLine("Work From Home (WFH)", leaveBalance.wfH_Total, leaveBalance.wfH_Submitted, leaveBalance.wfH_Balance)}
      </div>
    );
  }, [leaveBalance]);

  const secondColumn = useMemo(() => {
    if (!leaveBalance) return null;

    return (
      <div>
        {renderLine("Casual Leave(CL)", leaveBalance.cL_Total, leaveBalance.cL_Submitted, leaveBalance.cL_Balance)}
        {leaveBalance.isPTLapplicable &&
          renderLine("Paternity Leave (PTL)", leaveBalance.ptL_Total, leaveBalance.ptL_Submitted, leaveBalance.ptL_Balance)}
        {leaveBalance.isMTLapplicable &&
          renderLine("Maternity Leave (MTL)", leaveBalance.mtL_Total, leaveBalance.mtL_Submitted, leaveBalance.mtL_Balance)}
        {renderLine("WFH Exception (WFHX)", leaveBalance.wfhX_Total, leaveBalance.wfhX_Submitted, leaveBalance.wfhX_Balance)}
      </div>
    );
  }, [leaveBalance]);

  const thirdColumn = useMemo(() => {
    if (!leaveBalance) return null;

    return (
      <div>
        {renderLine("Privilege Leave(PL)", leaveBalance.pL_Total, leaveBalance.pL_Submitted, leaveBalance.pL_Balance)}
        {renderLine("Sick Leave (SL)", leaveBalance.sL_Total, leaveBalance.sL_Submitted, leaveBalance.sL_Balance)}
      </div>
    );
  }, [leaveBalance]);

  return (
    <section className="lb-card">
      <h3 className="lb-title">Leave Balance:</h3>

      <div className="lb-header">
        <span className="red">Total</span> |
        <span className="blue"> Availed or Submitted</span> /
        <span className="red"> Balance</span>
      </div>

      {loading && <p>Loading leave balance...</p>}
      {!loading && error && <p className="red">{error}</p>}
      {!loading && !error && leaveBalance && (
        <div className="lb-grid">
          {firstColumn}
          {secondColumn}
          {thirdColumn}
        </div>
      )}
    </section>
  );
}
