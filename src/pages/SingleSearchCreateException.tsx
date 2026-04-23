import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  addLeaveException,
  getAllLeaveExceptionsByEmployee,
  getEmpProfileByEmpId,
  getLeaveTypes
} from "../services/apiService";
import type { LeaveExceptionItem, LeaveTypeApi } from "../types/apiTypes";
import "./SingleSearchCreateException.css";

const formatTodayForInput = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

type EmployeeSearchItem = {
  user_Employee_No?: string | number;
  [key: string]: unknown;
};

const normalizeDateLabel = (value: unknown) => {
  if (!value) return "-";
  const dateString = String(value).trim();
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return dateString;

  return parsed.toLocaleDateString("en-GB");
};

const resolveLeaveTypeLabel = (item: LeaveExceptionItem) =>
  String(item.leaveTypeName || item.leaveTypeCode || item.leaveType || "-");

const resolveRaisedDateLabel = (item: LeaveExceptionItem) =>
  normalizeDateLabel(item.exceptionRaisedDate || item.raisedDate);

const resolveReasonLabel = (item: LeaveExceptionItem) =>
  String(item.reason || item.exceptionReason || item.remarks || "-");

const resolveCreatedAtLabel = (item: LeaveExceptionItem) =>
  normalizeDateLabel(item.createdDate || item.createdAt);

const resolveExceptionValidTillLabel = (item: LeaveExceptionItem) =>
  normalizeDateLabel(item.exceptionValidTill || item.validTillDate);

export default function SingleSearchCreateException() {
  const location = useLocation();
  const employee = location.state?.employee as EmployeeSearchItem | undefined;

  const empId = useMemo(
    () => String(location.state?.empId || employee?.user_Employee_No || "").trim(),
    [employee?.user_Employee_No, location.state?.empId]
  );

  const minRaisedDate = useMemo(() => formatTodayForInput(), []);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeApi[]>([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState("");
  const [raisedDate, setRaisedDate] = useState(minRaisedDate);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(false);
  const [leaveTypeError, setLeaveTypeError] = useState("");
  const [dateError, setDateError] = useState("");
  const [reason, setReason] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [exceptions, setExceptions] = useState<LeaveExceptionItem[]>([]);
  const [loadingExceptions, setLoadingExceptions] = useState(false);
  const [exceptionError, setExceptionError] = useState("");

  useEffect(() => {
    const loadLeaveTypes = async () => {
      if (!empId) {
        setLeaveTypes([]);
        setSelectedLeaveType("");
        setLeaveTypeError("Employee ID missing from Single Search selection.");
        return;
      }

      try {
        setLoadingLeaveTypes(true);
        setLeaveTypeError("");

        const profile = await getEmpProfileByEmpId(empId);
        const adId = String(profile?.user_Id || "").trim();

        if (!adId) {
          setLeaveTypes([]);
          setSelectedLeaveType("");
          setLeaveTypeError("Unable to resolve AD ID from employee profile.");
          return;
        }

        const leaveTypeResponse = await getLeaveTypes(adId);
        const options = Array.isArray(leaveTypeResponse?.data)
          ? leaveTypeResponse.data
              .map((item: LeaveTypeApi) => ({
                leaveTypeCode: String(item.leaveTypeCode || "").trim(),
                leaveTypeName: String(item.leaveTypeName || "").trim()
              }))
              .filter((item: LeaveTypeApi) => item.leaveTypeCode || item.leaveTypeName)
          : [];

        setLeaveTypes(options);
        setSelectedLeaveType(options[0]?.leaveTypeCode || "");

        if (options.length === 0) {
          setLeaveTypeError("No leave types available for this employee.");
        }
      } catch {
        setLeaveTypes([]);
        setSelectedLeaveType("");
        setLeaveTypeError("Unable to fetch leave types.");
      } finally {
        setLoadingLeaveTypes(false);
      }
    };

    loadLeaveTypes();
  }, [empId]);

  const loadExceptions = async () => {
    if (!empId) {
      setExceptions([]);
      setExceptionError("Employee ID missing from Single Search selection.");
      return;
    }

    try {
      setLoadingExceptions(true);
      setExceptionError("");
      const response = await getAllLeaveExceptionsByEmployee(empId);
      setExceptions(response);
    } catch (error) {
      setExceptions([]);
      setExceptionError(
        error instanceof Error ? error.message : "Unable to fetch exception details."
      );
    } finally {
      setLoadingExceptions(false);
    }
  };

  useEffect(() => {
    loadExceptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empId]);

  const isPastDate = Boolean(raisedDate) && raisedDate < minRaisedDate;

  const handleRaisedDateChange = (value: string) => {
    setRaisedDate(value);
    setDateError(value && value < minRaisedDate ? "Date must be today or a future date." : "");
  };

  const handleAddException = async () => {
    setAddError("");
    setAddSuccess("");

    if (!empId) {
      setAddError("Employee ID missing from Single Search selection.");
      return;
    }

    if (!selectedLeaveType.trim()) {
      setAddError("Leave Type is required.");
      return;
    }

    if (!raisedDate) {
      setAddError("Exception Raised Date is required.");
      return;
    }

    if (raisedDate < minRaisedDate) {
      setAddError("Date must be today or a future date.");
      return;
    }

    if (!reason.trim()) {
      setAddError("Reason for Exception is required.");
      return;
    }

    const employeeNo = Number(empId);
    if (!Number.isFinite(employeeNo)) {
      setAddError("Employee ID is invalid for exception creation.");
      return;
    }

    const exceptionValidTillIso = new Date(`${raisedDate}T00:00:00.000Z`).toISOString();
    const createdDateIso = new Date().toISOString();

    try {
      setAddLoading(true);
      const response = await addLeaveException({
        reason: reason.trim(),
        leaveType: selectedLeaveType.trim(),
        createdFor: employeeNo,
        exceptionValidTill: exceptionValidTillIso,
        createdBy: employeeNo,//manager/Hr empno should be passed here based on logged in user, using employeeNo for now as placeholder
        createdDate: createdDateIso,
        isActive: true
      });

      if (response?.isSuccess === false) {
        throw new Error(response.message || "Failed to add exception.");
      }

      setAddSuccess(response?.message || "Exception added successfully.");
      setReason("");
      await loadExceptions();
    } catch (error) {
      setAddError(error instanceof Error ? error.message : "Unable to add exception.");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <section className="ssce-page">
      <div className="ssce-panel">
        <h2 className="ssce-title">New Exception Rule :</h2>

        <div className="ssce-form-grid">
          <div className="ssce-left-col">
            <div className="ssce-field">
              <label htmlFor="leaveType" className="ssce-label">
                Leave Type:<span className="ssce-required">*</span>
              </label>
              <select
                id="leaveType"
                className="ssce-select"
                value={selectedLeaveType}
                onChange={(e) => setSelectedLeaveType(e.target.value)}
                disabled={loadingLeaveTypes || leaveTypes.length === 0}
              >
                {loadingLeaveTypes ? (
                  <option value="">Loading leave types...</option>
                ) : leaveTypes.length > 0 ? (
                  leaveTypes.map((item) => {
                    const code = item.leaveTypeCode || item.leaveTypeName;
                    const name = item.leaveTypeName || item.leaveTypeCode;
                    return (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    );
                  })
                ) : (
                  <option value="">No leave types available</option>
                )}
              </select>
              {leaveTypeError && <p className="ssce-help-text">{leaveTypeError}</p>}
            </div>

            <div className="ssce-field">
              <label htmlFor="raisedDate" className="ssce-label">
                Exception Raised Date:<span className="ssce-required">*</span>
              </label>
              <input
                id="raisedDate"
                type="date"
                className="ssce-input"
                min={minRaisedDate}
                value={raisedDate}
                onChange={(e) => handleRaisedDateChange(e.target.value)}
              />
              {dateError && <p className="ssce-help-text">{dateError}</p>}
            </div>
          </div>

          <div className="ssce-right-col">
            <div className="ssce-field">
              <label htmlFor="reason" className="ssce-label">
                Reason for Exception <span className="ssce-required">*</span>
              </label>
              <textarea
                id="reason"
                className="ssce-textarea"
                placeholder="Type reason for exception"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="ssce-add-btn"
              disabled={isPastDate || addLoading || loadingLeaveTypes}
              onClick={handleAddException}
            >
              {addLoading ? "Adding..." : "Add Exception"}
            </button>
            {addError && <p className="ssce-help-text">{addError}</p>}
            {addSuccess && <p className="ssce-success-text">{addSuccess}</p>}
          </div>
        </div>
      </div>

      <div className="ssce-panel ssce-details-panel">
        <h2 className="ssce-title">Exception Details :</h2>
        <div className="ssce-details-wrap">
          {loadingExceptions ? (
            <p className="ssce-details-state">Loading exception details...</p>
          ) : exceptionError ? (
            <p className="ssce-help-text ssce-details-state">{exceptionError}</p>
          ) : exceptions.length === 0 ? (
            <p className="ssce-details-state">No exception records found.</p>
          ) : (
            <table className="ssce-details-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Raised Date</th>
                  <th>Exception Valid Till</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {exceptions.map((item, index) => (
                  <tr
                    key={`${resolveLeaveTypeLabel(item)}-${resolveRaisedDateLabel(item)}-${index}`}
                  >
                    <td>{resolveLeaveTypeLabel(item)}</td>
                    <td>{resolveCreatedAtLabel(item)}</td>
                    <td>{resolveExceptionValidTillLabel(item)}</td>
                    <td>{resolveReasonLabel(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
