import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useUser } from "../context/UserContext";
import { getLeaveBalance } from "../services/apiService";
import type { LeaveBalanceApiData } from "../types/apiTypes";
import "./LeaveBalance.css";
import { DashboardSkeleton, LeaveBalanceSkeleton } from "./Skeletons";

type LeaveBalanceProps = {
  userId?: string;
  showDashboardCards?: boolean;
  showLeaveBalanceDetails?: boolean;
  refreshKey?: number;
};

const asDisplay = (value: string | null | undefined) => {
  const text = String(value ?? "").trim();
  return text || "NA";
};

const isNaValue = (value: string | null | undefined) =>
  asDisplay(value).toUpperCase() === "NA";

const renderValue = (
  value: string | null | undefined,
  colorClass: "red" | "blue",
) => (
  <span className={isNaValue(value) ? "red" : colorClass}>
    {asDisplay(value)}
  </span>
);

const renderLine = (
  label: string,
  total: string | null | undefined,
  submitted: string | null | undefined,
  balance: string | null | undefined,
) => (
  <p>
    {label} :{" "}
    <span className="tooltip-item">
      {renderValue(total, "blue")}

      <span className="custom-tooltip">
        Total {label.split("(")[1]?.replace(")", "")}
      </span>
    </span>
    {" ["}
    <span className="tooltip-item lb-bracket-value">
      {renderValue(submitted, "blue")}

      <span className="custom-tooltip">
        Availed/Submitted {label.split("(")[1]?.replace(")", "")}
      </span>
    </span>
    {" / "}
    <span className="tooltip-item">
      {renderValue(balance, "red")}

      <span className="custom-tooltip">
        Balance {label.split("(")[1]?.replace(")", "")}
      </span>
    </span>
    {" ]"}
  </p>
);

export default function LeaveBalance({
  userId,
  showDashboardCards = false,
  showLeaveBalanceDetails = true,
  refreshKey = 0,
}: LeaveBalanceProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userInfo } = useUser();
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalanceApiData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const openLeaveHistory = (leaveTypeCode: string) => {
    navigate("/leave-details", {
      state: { leaveTypeCode },
    });
  };

  // Helper function to check if employee is an associate (ACT code)
  const isAssociate = useMemo(() => {
    const eligibleType = String(userInfo?.eligibleTypeCode || "")
      .trim()
      .toUpperCase();
    return eligibleType === "ACT";
  }, [userInfo?.eligibleTypeCode]);

  useEffect(() => {
    let active = true;

    const loadLeaveBalance = async () => {
      const resolvedUserId = String(userId || user?.loginUserAdID || "").trim();

      if (!resolvedUserId) {
        setLeaveBalance(null);
        setError("User ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getLeaveBalance(resolvedUserId);
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
  }, [user?.loginUserAdID, userId, refreshKey]);

  const firstColumn = useMemo(() => {
    if (!leaveBalance) return null;

    return (
      <div>
        {renderLine(
          "Birthday Leave(BDL)",
          leaveBalance.bdL_Total,
          leaveBalance.bdL_Submitted,
          leaveBalance.bdL_Balance,
        )}
        {renderLine(
          "Associate Special Leave (ASL)",
          leaveBalance.asL_Total,
          leaveBalance.asL_Submitted,
          leaveBalance.asL_Balance,
        )}
        {renderLine(
          "Work From Home (WFH)",
          leaveBalance.wfH_Total,
          leaveBalance.wfH_Submitted,
          leaveBalance.wfH_Balance,
        )}
      </div>
    );
  }, [leaveBalance]);

  const secondColumn = useMemo(() => {
    if (!leaveBalance) return null;

    return (
      <div>
        {renderLine(
          "Casual Leave(CL)",
          leaveBalance.cL_Total,
          leaveBalance.cL_Submitted,
          leaveBalance.cL_Balance,
        )}
        {renderLine(
          "Paternity Leave (PTL)",
          leaveBalance.ptL_Total,
          leaveBalance.ptL_Submitted,
          leaveBalance.ptL_Balance,
        )}
        {renderLine(
          "WFH Exception (WFHX)",
          leaveBalance.wfhX_Total,
          leaveBalance.wfhX_Submitted,
          leaveBalance.wfhX_Balance,
        )}
      </div>
    );
  }, [leaveBalance]);

  const thirdColumn = useMemo(() => {
    if (!leaveBalance) return null;

    return (
      <div>
        {renderLine(
          "Privilege Leave(PL)",
          leaveBalance.pL_Total,
          leaveBalance.pL_Submitted,
          leaveBalance.pL_Balance,
        )}
        {renderLine(
          "Sick Leave (SL)",
          leaveBalance.sL_Total,
          leaveBalance.sL_Submitted,
          leaveBalance.sL_Balance,
        )}
      </div>
    );
  }, [leaveBalance]);

  return (
    <section className="lb-page">
      {/* Dashboard First */}
      {!loading && !error && leaveBalance && showDashboardCards && (
        <div className="lb-card dashboard-main-card">
          <div className="lb-title-wrap">
            <h3 className="lb-title">Leave Dashboard</h3>
          </div>

          <div className="leave-dashboard-wrapper">
            <div className="dashboard-cards">
              <button
                type="button"
                className="dashboard-card wfh"
                onClick={() => openLeaveHistory("WFH")}
              >
                <div className="dashboard-icon">🏠</div>
                <div className="dashboard-label">WFH</div>
                <div className="dashboard-value">
                  {asDisplay(leaveBalance.wfH_Submitted)}
                </div>
              </button>

              <button
                type="button"
                className="dashboard-card wfhx"
                onClick={() => openLeaveHistory("WFHX")}
              >
                <div className="dashboard-icon">🏡</div>
                <div className="dashboard-label">WFH(X)</div>
                <div className="dashboard-value">
                  {asDisplay(leaveBalance.wfhX_Submitted)}
                </div>
              </button>

              <button
                type="button"
                className="dashboard-card cl"
                onClick={() => openLeaveHistory("CL")}
              >
                <div className="dashboard-icon">🧳</div>
                <div className="dashboard-label">CL</div>
                <div className="dashboard-value">
                  {asDisplay(leaveBalance.cL_Submitted)}
                </div>
              </button>

              {isAssociate ? (
                <button
                  type="button"
                  className="dashboard-card asl"
                  onClick={() => openLeaveHistory("ASL")}
                >
                  <div className="dashboard-icon">⭐</div>
                  <div className="dashboard-label">ASL</div>
                  <div className="dashboard-value">
                    {asDisplay(leaveBalance.asL_Submitted)}
                  </div>
                  {/* <div className="dashboard-subtext">
                    {asDisplay(leaveBalance.asL_Total)}
                    (Opening Balance)
                  </div> */}
                </button>
              ) : (
                <button
                  type="button"
                  className="dashboard-card pl"
                  onClick={() => openLeaveHistory("PL")}
                >
                  <div className="dashboard-icon">🏖️</div>
                  <div className="dashboard-label">PL</div>
                  <div className="dashboard-value">
                    {asDisplay(leaveBalance.pL_Submitted)}
                  </div>
                  <div className="dashboard-subtext">
                    {asDisplay(leaveBalance.pL_Total)}
                    (Opening Balance)
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showDashboardCards && !showLeaveBalanceDetails && loading && (
        <DashboardSkeleton />
      )}

      {showDashboardCards && !showLeaveBalanceDetails && !loading && error && (
        <div className="lb-card">
          <p className="lb-error">{error}</p>
        </div>
      )}

      {/* Leave Balance Below */}
      {showLeaveBalanceDetails && (
        <div className="lb-card">
          <div className="lb-title-wrap">
            <h3 className="lb-title">Leave Balance</h3>
          </div>

          <div className="lb-header">
            <span className="red">Total</span> |
            <span className="blue"> Availed or Submitted</span> /
            <span className="red"> Balance</span>
          </div>

          {loading && <LeaveBalanceSkeleton />}
          {!loading && error && <p className="red">{error}</p>}

          {!loading && !error && leaveBalance && (
            <div className="lb-grid">
              {firstColumn}
              {secondColumn}
              {thirdColumn}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
