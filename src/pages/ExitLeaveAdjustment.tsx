import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  getEmpProfileByEmpId,
  getExitLeaveAdjustmentCalculation,
  updateExitLeaveAdjustment
} from "../services/apiService";
import type { ExitLeaveAdjustmentCalculationData } from "../types/apiTypes";
import "./ExitLeaveAdjustment.css";

type EmployeeState = {
  name?: string;
  user_Employee_No?: string | number;
  user_Doj?: string;
  [key: string]: unknown;
};

const toInputDate = (date?: string) => {
  if (date) {
    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, "0");
      const d = String(parsed.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }

  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const toDojLabel = (date?: string) => {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const normalizeDisplayValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "NA";
  return String(value);
};

const pickFieldValue = (
  data: ExitLeaveAdjustmentCalculationData | null,
  keys: string[]
) => {
  if (!data) return "NA";

  for (const key of keys) {
    const value = data[key];
    if (value !== null && value !== undefined && value !== "") {
      return normalizeDisplayValue(value);
    }
  }

  return "NA";
};

const parseNumericValue = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;

  const sanitized = value.replace(/[^0-9.-]/g, "");
  if (!sanitized) return null;

  const parsed = Number(sanitized);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function ExitLeaveAdjustment() {
  const location = useLocation();
  const routeState = location.state as { employee?: EmployeeState; empId?: string } | null;
  const employee = routeState?.employee || ({} as EmployeeState);
  const empId = useMemo(
    () => String(routeState?.empId || employee.user_Employee_No || "").trim(),
    [routeState?.empId, employee.user_Employee_No]
  );

  const employeeName = useMemo(
    () => String(employee.name || "Employee").trim(),
    [employee.name]
  );
  const dojLabel = useMemo(() => toDojLabel(String(employee.user_Doj || "")), [employee.user_Doj]);
  const [userId, setUserId] = useState("");
  const [userIdError, setUserIdError] = useState("");

  useEffect(() => {
    let active = true;

    const loadUserId = async () => {
      if (!empId) {
        if (!active) return;
        setUserId("");
        setUserIdError("Employee ID missing.");
        return;
      }

      try {
        setUserIdError("");
        const profile = await getEmpProfileByEmpId(empId);
        if (!active) return;

        const resolvedUserId = String(profile.user_Id || "").trim();
        if (!resolvedUserId) {
          throw new Error("User ID not found in employee profile.");
        }

        setUserId(resolvedUserId);
      } catch (error) {
        if (!active) return;
        setUserId("");
        setUserIdError(error instanceof Error ? error.message : "Unable to load user ID.");
      }
    };

    loadUserId();

    return () => {
      active = false;
    };
  }, [empId]);

  const [exitDate, setExitDate] = useState(toInputDate());
  const [exitRemarks, setExitRemarks] = useState("");
  const [showExitRemarks, setShowExitRemarks] = useState(false);
  const [showUpdatePL, setShowUpdatePL] = useState(false);
  const [calculationData, setCalculationData] = useState<ExitLeaveAdjustmentCalculationData | null>(null);
  const [calculationLoading, setCalculationLoading] = useState(false);
  const [calculationError, setCalculationError] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  const currentClBalance = useMemo(
    () =>
      pickFieldValue(calculationData, [
        "cL_Availed",
        "cL_Balance",
        "clBalance",
        "currentCL",
        "currentCl"
      ]),
    [calculationData]
  );
  const currentSlBalance = useMemo(
    () =>
      pickFieldValue(calculationData, [
        "sL_Availed",
        "sL_Balance",
        "slBalance",
        "currentSL",
        "currentSl"
      ]),
    [calculationData]
  );
  const currentPlBalance = useMemo(
    () =>
      pickFieldValue(calculationData, [
        "pL_Balance",
        "plBalance",
        "currentPL",
        "currentPl"
      ]),
    [calculationData]
  );

  const exitClBalance = useMemo(
    () =>
      pickFieldValue(calculationData, [
        "cl",
        "cL_ExitBalance",
        "clExitBalance",
        "actualCL",
        "actualCl"
      ]),
    [calculationData]
  );
  const exitSlBalance = useMemo(
    () =>
      pickFieldValue(calculationData, [
        "sl",
        "sL_ExitBalance",
        "slExitBalance",
        "actualSL",
        "actualSl"
      ]),
    [calculationData]
  );
  const exitPlBalance = useMemo(
    () =>
      pickFieldValue(calculationData, [
        "pl",
        "pL_ExitBalance",
        "plExitBalance",
        "actualPL",
        "actualPl"
      ]),
    [calculationData]
  );
  const adjustedPlBalance = useMemo(
    () =>
      pickFieldValue(calculationData, [
        "pL_ExitDate",
        "adjustedPL",
        "adjustedPrivilegeLeave",
        "adjustedPl",
        "adjusted_PL"
      ]),
    [calculationData]
  );

  const plOnExitDateValue = useMemo(() => {
    if (!calculationData) return null;

    const rawValue =
      calculationData.pL_ExitDate ??
      calculationData.adjustedPL ??
      calculationData.adjustedPrivilegeLeave ??
      calculationData.adjustedPl ??
      calculationData.adjusted_PL ??
      calculationData.pl ??
      calculationData.pL_ExitBalance;

    return parseNumericValue(rawValue);
  }, [calculationData]);

  const handleCalculateLeave = async () => {
    setShowExitRemarks(true);
    setShowUpdatePL(true);
    setCalculationError("");
    setUpdateError("");
    setUpdateSuccess("");

    if (!userId) {
      setCalculationData(null);
      setCalculationError(userIdError || "User ID missing.");
      return;
    }

    if (!exitDate) {
      setCalculationData(null);
      setCalculationError("Please select an exit date.");
      return;
    }

    try {
      setCalculationLoading(true);
      const response = await getExitLeaveAdjustmentCalculation(userId, exitDate);
      setCalculationData(response);

      const apiRemarks =
        response && typeof response.exitRemarks === "string" ? response.exitRemarks.trim() : "";
      if (apiRemarks) {
        setExitRemarks(apiRemarks);
      }
    } catch (error) {
      setCalculationData(null);
      setCalculationError(
        error instanceof Error ? error.message : "Unable to fetch exit leave adjustment details."
      );
    } finally {
      setCalculationLoading(false);
    }
  };

  const handleUpdatePl = async () => {
    setUpdateError("");
    setUpdateSuccess("");

    if (!userId) {
      setUpdateError(userIdError || "User ID missing.");
      return;
    }

    if (plOnExitDateValue === null) {
      setUpdateError("PL on exit date is not available for update.");
      return;
    }

    try {
      setUpdateLoading(true);
      const response = await updateExitLeaveAdjustment({
        userId,
        exitRemarks: exitRemarks.trim(),
        plOnExitDate: plOnExitDateValue
      });

      if (response?.isSuccess === false) {
        throw new Error(response.message || "Failed to update exit leave adjustment.");
      }

      setUpdateSuccess(response?.message || "Exit leave adjustment updated successfully.");
    } catch (error) {
      setUpdateError(
        error instanceof Error ? error.message : "Unable to update exit leave adjustment."
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <section className="ela-page">
      <div className="ela-wrap">
        <div className="ela-header">
          <h1 className="ela-title">Exit Leave Adjustment:</h1>
          <p className="ela-subtitle">
            <strong>{employeeName}</strong> [ DOJ: <strong>{dojLabel}</strong> ]
          </p>
          
        </div>

        <div className="ela-board">
          <div className="ela-grid">
            <div className="ela-col">
              <div className="ela-top">
                <label htmlFor="ela-exit-date" className="ela-label">
                  Enter Exit Date (dd/mm/yyyy) <span className="ela-required">*</span>
                </label>
                <input
                  id="ela-exit-date"
                  type="date"
                  className="ela-input"
                  value={exitDate}
                  onChange={(e) => setExitDate(e.target.value)}
                />
              </div>

              <div className="ela-section">
                <h2 className="ela-section-title">Employee Leave as on Today</h2>

                <div className="ela-row">
                  <p className="ela-key">Casual Leave(CL)- Balance</p>
                  <p className="ela-value">{currentClBalance}</p>
                </div>

                <div className="ela-row">
                  <p className="ela-key">Sick Leave(SL)- Balance</p>
                  <p className="ela-value">{currentSlBalance}</p>
                </div>

                <div className="ela-row">
                  <p className="ela-key">Privilege Leave(PL)- Balance</p>
                  <p className="ela-value">{currentPlBalance}</p>
                </div>

                {showExitRemarks && (
                  <div className="ela-row ela-row-remarks">
                    <label htmlFor="ela-remarks" className="ela-key ela-remarks-label">
                      Exit Remarks
                    </label>
                    <textarea
                      id="ela-remarks"
                      className="ela-textarea"
                      value={exitRemarks}
                      onChange={(e) => setExitRemarks(e.target.value)}
                    />
                  </div>
                )}

                {showUpdatePL && (
                  <div className="ela-row ela-row-remarks">
                   <button
                  type="button"
                  className="ela-btn"
                  onClick={handleUpdatePl}
                  disabled={updateLoading || !calculationData}
                >
                  {updateLoading ? "Updating..." : "Update PL"}
                  </button>
                  {updateError && <p className="ela-help-text">{updateError}</p>}
                  {updateSuccess && <p className="ela-success-text">{updateSuccess}</p>}
                  </div>
                )}
              </div>
            </div>

            <div className="ela-col">
              <div className="ela-top ela-right-top">
                <button
                  type="button"
                  className="ela-btn"
                  onClick={handleCalculateLeave}
                  disabled={calculationLoading || !userId}
                >
                  {calculationLoading ? "Calculating..." : "Calculate Leave"}
                </button>
                {calculationError && <p className="ela-help-text">{calculationError}</p>}
                {!calculationError && userIdError && <p className="ela-help-text">{userIdError}</p>}
              </div>

              <div className="ela-section">
                <h2 className="ela-section-title">Actual Leave Balance as on Exit Date</h2>

                <div className="ela-row">
                  <p className="ela-key">Casual Leave(CL)</p>
                  <p className="ela-value">{exitClBalance}</p>
                </div>

                <div className="ela-row">
                  <p className="ela-key">Sick Leave(SL)</p>
                  <p className="ela-value">{exitSlBalance}</p>
                </div>

                <div className="ela-row">
                  <p className="ela-key">Privilege Leave(PL)</p>
                  <p className="ela-value">{exitPlBalance}</p>
                </div>

                <div className="ela-row">
                  <p className="ela-key">Adjusted Privilege Leave(PL)as on Exit Date</p>
                  <p className="ela-value">{adjustedPlBalance}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
