import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import LeaveBalance from "../components/LeaveBalance";
import LeaveForm from "../components/LeaveForm";
import ToastMessage from "../components/ToastMessage";
import { getEmpProfileByEmpId } from "../services/apiService";
import type { LeaveFormProps } from "../types/props";

type EmployeeRouteState = {
  user_Employee_No?: string | number;
  user_Id?: string;
  userId?: string;
  name?: string;
  empName?: string;
};

export default function ApplyLeaveForOthers() {
  const location = useLocation();

  const routeState = (location.state ?? {}) as {
    employee?: EmployeeRouteState;
    empId?: string;
    userId?: string;
    employeeName?: string;
  };
  const [resolvedUserId, setResolvedUserId] = useState(
    String(
      routeState.userId ||
        routeState.employee?.user_Id ||
        routeState.employee?.userId ||
        "",
    ).trim(),
  );
  const [employeeName, setEmployeeName] = useState(
    String(
      routeState.employeeName ||
        routeState.employee?.name ||
        routeState.employee?.empName ||
        "",
    ).trim(),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const resolvedEmpId = useMemo(
    () =>
      String(
        routeState.empId || routeState.employee?.user_Employee_No || "",
      ).trim(),
    [routeState.empId, routeState.employee?.user_Employee_No],
  );

  useEffect(() => {
    // Only load if we have empId but missing userId or employeeName
    if (!resolvedEmpId) {
      if (!resolvedUserId || !employeeName) {
        setError(
          "Employee details are missing. Please start from Single Search.",
        );
      }
      return;
    }

    // If we already have both userId and employeeName from route state, skip loading
    if (resolvedUserId && employeeName) {
      return;
    }

    const loadEmployeeProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const profile = await getEmpProfileByEmpId(resolvedEmpId);

        // Always use profile data to ensure we have the correct target employee
        setResolvedUserId(String(profile.user_Id || "").trim());
        setEmployeeName(String(profile.empName || "").trim());
      } catch (err) {
        setError("Unable to load employee details. Please try again.");
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEmployeeProfile();
  }, [resolvedEmpId]); // Only depend on resolvedEmpId to avoid infinite loops

  const handleLeaveSubmitSuccess: LeaveFormProps["onSubmit"] = (_submitData) => {
    const message = `Leave has been applied successfully for ${employeeName}!`;

    setSuccessMessage(message);
    setShowSuccess(true);

    // Just show the toast, stay on the same page
    setTimeout(() => {
      setShowSuccess(false);
    }, 4000);
  };

  return (
    <>
      <ToastMessage
        message={successMessage}
        show={showSuccess}
        type="success"
      />
      {loading && <p>Loading employee details...</p>}
      {!loading && error && (
        <p style={{ color: "red", padding: "10px" }}>{error}</p>
      )}
      {!loading && !error && resolvedUserId && (
        <>
          <LeaveBalance userId={resolvedUserId} />
          <LeaveForm
            userId={resolvedUserId}
            employeeName={employeeName}
            isApplyForOthers={true}
            onSubmit={handleLeaveSubmitSuccess}
          />
        </>
      )}
    </>
  );
}
