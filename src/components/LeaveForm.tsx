/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  getApprover,
  getLeaveTypes,
  getNoOfDays,
  saveLeaveRequest,
  saveLeaveRequestAttachment,
} from "../services/apiService";
import "./LeaveForm.css";
// import { getHolidays, type Holiday } from '../services/holidayService';
import { useNavigate } from "react-router-dom";
import { useHolidays } from "../hooks/useHolidays";
import type { ApproverApi, LeaveTypeApi, NoOfDaysApi } from "../types/apiTypes";
import type { LeaveFormProps } from "../types/props";
// import { useUser } from "../context/UserContext";
import { useAuth } from "../auth/useAuth";
import { formatLocalDate } from "../utils/Utils";
import PageLoader from "./PageLoader";

const formatApiDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${month}-${day}-${year}`;
};

const getSavedLeaveId = (response: any) => {
  const leaveId = response?.message;
  return leaveId !== undefined && leaveId !== null
    ? String(leaveId).trim()
    : "";
};

export default function LeaveForm({
  onSubmit,
  userId,
  employeeName,
  isApplyForOthers = false,
}: LeaveFormProps) {
  const { user } = useAuth();
  const targetUserId = String(userId || user?.loginUserAdID || "").trim();
  const displayName = String(employeeName || user?.name || "").trim();

  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeApi[]>([]);

  const [leaveType, setLeaveType] = useState("");

  const [approver, setApprover] = useState<ApproverApi | null>(null);
  //const [loadingApprover, setLoadingApprover] = useState(false);
  // const [managerName, setManagerName] = useState('');

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [noOfDays, setNoOfDays] = useState<NoOfDaysApi | null>(null);
  const [, setLoadDays] = useState(false);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(false);
  const [loadingApprover, setLoadingApprover] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  // const [reasons, setReasons] = useState<ReasonApi[]>([]);
  // const [loadingReasons] = useState(false);
  const { holidays } = useHolidays();
  const [reason, setReason] = useState("");
  // const [otherReason, setOtherReason] = useState('');
  const [isHalfDayStart, setIsHalfDayStart] = useState(false);
  const [isHalfDayEnd, setIsHalfDayEnd] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageloader, setPageLoader] = useState(false);

  const errorRef = useRef<HTMLDivElement | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);
  // Tracks the previous Leave Type so we can reset the form only when the user
  // switches to a different type, while avoiding a reset on the initial API load.
  const previousLeaveTypeRef = useRef("");
  const hasInitializedLeaveTypeRef = useRef(false);
  // const [username, setUsername] = useState<string | null>(null);

  // useEffect(() => {
  //   const user = sessionStorage.getItem("username");
  //   setUsername(user);
  // }, []);

  // const { username } = useUser();

  useEffect(() => {
    const loadLeaveTypes = async () => {
      if (!targetUserId) return;

      try {
        setLoadingLeaveTypes(true);
        const result = await getLeaveTypes(targetUserId);
        if (result.isSuccess && result.data) {
          const cleaned = result.data.map((item: any) => ({
            leaveTypeCode: item.leaveTypeCode.trim(),
            leaveTypeName: item.leaveTypeName.trim(),
          }));

          setLeaveTypes(cleaned);

          if (cleaned.length > 0) {
            const defaultLeaveType = cleaned[0].leaveTypeCode;

            setLeaveType(defaultLeaveType);
            previousLeaveTypeRef.current = defaultLeaveType;
            hasInitializedLeaveTypeRef.current = true;
          }
        }
      } catch (err) {
        console.error("Leave type fetch failed", err);
      } finally {
        setLoadingLeaveTypes(false);
      }
    };

    loadLeaveTypes();
  }, [targetUserId]);

  useEffect(() => {
    if (leaveType !== "SL" && fileRef.current) {
      fileRef.current.value = "";
    }
  }, [leaveType]);

  useEffect(() => {
    const loadApprover = async () => {
      if (!targetUserId) return;

      try {
        setLoadingApprover(true);

        const result = await getApprover(targetUserId);
        if (result.isSuccess && result.data) {
          setApprover(result.data);
        }
      } catch (err) {
        console.error("Leave approver fetch failed", err);
      } finally {
        setLoadingApprover(false);
      }
    };

    loadApprover();
  }, [targetUserId]);

  // useEffect(() => {
  //   const loadReasons = async () => {
  //     try {
  //       setLoading(true);

  //       const result = await getLeaveReasons();
  //       if (result.isSuccess && result.data) {
  //         const cleaned = result.data
  //           .filter((r: any) => r.isActive)
  //           .map((r: any) => ({
  //             reason: r.reason.trim()
  //           }));

  //         setReasons(cleaned);
  //       }
  //     } catch (err) {
  //       console.error("Reason fetch failed", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   loadReasons();
  // }, []);

  useEffect(() => {
    if (!startDate || !endDate || !leaveType) {
      setNoOfDays(null);
      return;
    }
    const loadDays = async () => {
      try {
        setLoadDays(true);
        const result = await getNoOfDays({
          startDate: formatApiDate(startDate),
          endDate: formatApiDate(endDate),
          LeaveType: String(leaveType),
          totalHalfDays: (isHalfDayStart ? 0.5 : 0) + (isHalfDayEnd ? 0.5 : 0),
        });
        if (result?.isSuccess && result?.data) {
          setNoOfDays(result.data);
        }
      } catch (err) {
        console.error("Leave days fetch failed", err);
      } finally {
        setLoadDays(false);
      }
    };
    loadDays();
  }, [startDate, endDate, leaveType, isHalfDayStart, isHalfDayEnd]);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [error]);

  const holidayDates = useMemo(() => {
    return holidays.map((h) => formatLocalDate(new Date(h.date)));
  }, [holidays]);

  const holidayNameByDate = useMemo(() => {
    return new Map(
      holidays.map((h) => [formatLocalDate(new Date(h.date)), h.description]),
    );
  }, [holidays]);

  const isHoliday = useCallback(
    (date: Date) => holidayDates.includes(formatLocalDate(date)),
    [holidayDates],
  );

  const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

  const isHalfDayStartEligible =
    !!startDate && !isWeekend(startDate) && !isHoliday(startDate);

  const isHalfDayEndEligible =
    !!endDate && !isWeekend(endDate) && !isHoliday(endDate);

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    if (!start) setIsHalfDayStart(false);
    if (!end) setIsHalfDayEnd(false);

    if (start && (isWeekend(start) || isHoliday(start)))
      setIsHalfDayStart(false);

    if (end && (isWeekend(end) || isHoliday(end))) setIsHalfDayEnd(false);

    if (start && end) setCalendarOpen(false);
  };

  const getDayClass = (date: Date) => {
    const isWeekendDay = date.getDay() === 0 || date.getDay() === 6;

    if (isHoliday(date) && !isWeekendDay) {
      return "holiday-dot";
    }

    return "";
  };
  const renderDay = (day: number, date?: Date) => {
    if (!date) return day;

    const iso = formatLocalDate(date);
    const isWeekendDay = date.getDay() === 0 || date.getDay() === 6;
    const fullHolidayName = holidayNameByDate.get(iso) || "";
    return (
      <div
        className="day-cell"
        title={fullHolidayName && !isWeekendDay ? fullHolidayName : undefined}
      >
        <span>{day}</span>

        {fullHolidayName && !isWeekendDay && (
          <>
            <span className="holiday-underline" />
            <span className="holiday-label">{fullHolidayName.slice(0, 4)}</span>
          </>
        )}
      </div>
    );
  };
  const navigate = useNavigate();

  const clearLeaveTypeDependentFormState = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    setNoOfDays(null);
    setLoadDays(false);
    setCalendarOpen(false);
    setReason("");
    // setOtherReason('');
    setIsHalfDayStart(false);
    setIsHalfDayEnd(false);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const handleLeaveTypeChange = (nextLeaveType: string) => {
    const previousLeaveType = previousLeaveTypeRef.current;

    if (!hasInitializedLeaveTypeRef.current) {
      setLeaveType(nextLeaveType);
      previousLeaveTypeRef.current = nextLeaveType;
      hasInitializedLeaveTypeRef.current = true;
      return;
    }

    if (nextLeaveType === previousLeaveType) {
      return;
    }

    // A real Leave Type switch invalidates dates, half-day choices, calculated
    // days, comments, validation, and attachment state. Keep the new type.
    clearLeaveTypeDependentFormState();
    setLeaveType(nextLeaveType);
    previousLeaveTypeRef.current = nextLeaveType;
  };

  const handleSubmit = async () => {
    setError("");

    if (!leaveType || !startDate || !endDate || !targetUserId) {
      setError("Please fill the required details.");
      return;
    }

    if (leaveType !== "WFH" && !reason.trim()) {
      setError("Please fill the required details.");
      return;
    }

    if (!user?.loginUserAdID) {
      setError("Logged-in user details are unavailable.");
      return;
    }
    // if (reason === 'Others' && !otherReason.trim()) {
    //   setError('Please specify the reason.');
    //   return;
    // }
    try {
      setIsSubmitting(true);

      const payload = {
        UserADId: isApplyForOthers ? targetUserId : user?.loginUserAdID || "",
        startDate: formatApiDate(startDate), //startDate
        endDate: formatApiDate(endDate), //endDate
        // noOfDays: noOfDays?.noOfDays || 0,
        // reason: reason === 'Others' ? otherReason : reason,
        reason:
          leaveType === "WFH"
            ? reason.trim() || "As per Home Office Policy"
            : reason.trim(),
        leaveTypeCode: leaveType.trim(),
        workHandedOver: "",
        contactNo: "",
        isHalfStartDay: isHalfDayStart,
        isHalfEndDay: isHalfDayEnd,
        approverRemarks: "",
        isSchedule: false,
        scheduleDate: new Date().toISOString().split("T")[0],
        statusChangeDate: new Date().toISOString().split("T")[0],
        leaveStatus: "P",
        applyforother: isApplyForOthers,
        applyforotheradid: isApplyForOthers ? user?.loginUserAdID || "" : "",
      };

      const attachment = fileRef.current?.files?.[0] || null;

      if (leaveType === "SL") {
        if (!attachment) {
          throw new Error("Please upload a PDF attachment for Sick Leave.");
        }

        const isPdf =
          attachment.type === "application/pdf" ||
          attachment.name.toLowerCase().endsWith(".pdf");

        if (!isPdf) {
          throw new Error("Only PDF files are allowed for Sick Leave.");
        }

        const maxSizeInBytes = 3 * 1024 * 1024;

        if (attachment.size > maxSizeInBytes) {
          throw new Error("PDF file size must be less than 3 MB.");
        }
      }
      console.log("Submitting payload:", payload);

      setPageLoader(true);
      const response = await saveLeaveRequest(payload);

      if (response?.isSuccess === false) {
        setPageLoader(false);
        throw new Error(response?.message || "Failed to submit leave.");
      }

      if (response?.isSuccess === true && attachment) {
        const leaveId = getSavedLeaveId(response);

        if (!leaveId) {
          throw new Error(
            "Leave submitted, but leave ID was not returned for attachment upload.",
          );
        }

        const attachmentResponse = await saveLeaveRequestAttachment({
          leaveId,
          file: attachment,
        });

        if (attachmentResponse?.isSuccess === false) {
          throw new Error(
            attachmentResponse?.message ||
              "Leave submitted, but attachment upload failed.",
          );
        }
      }

      onSubmit({
        leaveType,
        startDate: formatLocalDate(startDate),
        endDate: formatLocalDate(endDate),
        // reason: reason === 'Others' ? otherReason : reason,
        // otherReason: otherReason,
        reason: reason,
        otherReason: "",
        totalDays: noOfDays?.noOfDays || 0,
      });

      // Only navigate to leave-details if applying for self, not for others
      if (!isApplyForOthers) {
        navigate("/leave-details", {
          state: { message: "Leave has been applied successfully!" },
        });
      } else {
        // For apply for others, just reset the form
        resetForm();
      }
    } catch (error) {
      console.error("Submit failed:", error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to submit leave.";
      setError(message);
    } finally {
      setPageLoader(false);
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    const defaultLeaveType = leaveTypes[0]?.leaveTypeCode || "";

    setLeaveType(defaultLeaveType);
    previousLeaveTypeRef.current = defaultLeaveType;
    hasInitializedLeaveTypeRef.current = Boolean(defaultLeaveType);
    clearLeaveTypeDependentFormState();
  };

  return (
    <section className="leave-form-page">
      <PageLoader show={pageloader} />
      <div className="form-card">
        <div className="form-header">
          <h3>Apply For Leave : {displayName || user?.name}</h3>
        </div>

        {error && (
          <div ref={errorRef} className="form-error-text">
            {error}
          </div>
        )}

        <div className="form-grid">
          <div className="form-row">
            <label>
              Leave Type <span className="required">*</span>
            </label>
            <div className="form-control-wrap">
              <select
                value={leaveType}
                disabled={loadingLeaveTypes}
                onChange={(e) => handleLeaveTypeChange(e.target.value)}
              >
                {loadingLeaveTypes && (
                  <option value="">Loading leave types...</option>
                )}
                {leaveTypes.map((type) => (
                  <option key={type.leaveTypeCode} value={type.leaveTypeCode}>
                    {type.leaveTypeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <label>
              Approver Name <span className="required">*</span>
            </label>
            <strong className="field-value" aria-live="polite">
              {loadingApprover
                ? "Loading..."
                : approver?.managerName || "N/A"}
            </strong>
          </div>

          <div className="form-row">
            <label>
              Start Date <span className="required">*</span>
            </label>
            <div className="date-with-half">
              <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                open={calendarOpen}
                shouldCloseOnSelect={false}
                onInputClick={() => setCalendarOpen(true)}
                onClickOutside={() => setCalendarOpen(false)}
                dayClassName={getDayClass}
                renderDayContents={renderDay}
                value={startDate ? formatLocalDate(startDate) : ""}
                placeholderText="Select start date"
                customInput={<input readOnly placeholder="Select start date" />}
                wrapperClassName="leave-form-datepicker-input"
                popperPlacement="bottom-start"
                popperClassName="leave-form-datepicker-popper"
              />
              <label className="half-checkbox">
                <input
                  type="checkbox"
                  checked={isHalfDayStart}
                  disabled={!isHalfDayStartEligible}
                  onChange={(e) => setIsHalfDayStart(e.target.checked)}
                />
                Half Day
              </label>
            </div>
          </div>

          <div className="form-row">
            <label>
              End Date <span className="required">*</span>
            </label>
            <div className="date-with-half">
              <input
                readOnly
                value={endDate ? formatLocalDate(endDate) : ""}
                placeholder="Select end date"
                onClick={() => setCalendarOpen(true)}
              />
              <label className="half-checkbox">
                <input
                  type="checkbox"
                  checked={isHalfDayEnd}
                  disabled={!isHalfDayEndEligible}
                  onChange={(e) => setIsHalfDayEnd(e.target.checked)}
                />
                Half Day
              </label>
            </div>
          </div>

          {endDate && (
            <div className="form-row leave-days-row">
              <label>Total Leave Days</label>
              <strong>{noOfDays?.noOfDays || 0}</strong>
            </div>
          )}

          {/* <div className="form-row">
            <label>
              Reason
              {leaveType !== "WFH" && (
                <span className="required">*</span>
              )}
            </label>

            <select
              value={reason}
              disabled={loadingReasons}
              onChange={e => {
                setReason(e.target.value);

                if (e.target.value !== 'Others') {
                  setOtherReason('');
                }
              }}
            >
              <option value="">-- Select Reason --</option>

              {loadingReasons ? (
                <option>Loading...</option>
              ) : (
                reasons.map(r => (
                  <option
                    key={r.reason}
                    value={r.reason}
                  >
                    {r.reason}
                  </option>
                ))
              )}
            </select>
          </div> */}
          {/* 
          {reason === 'Others' && (
            <div className="form-row">
              <label>
                Please Specify Reason <span className="required">*</span>
              </label>

              <div className="reason-wrapper">
                <textarea
                  rows={4}
                  maxLength={250}
                  placeholder="Enter reason..."
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                />

                <div className="char-count">
                  {otherReason.length} / 250 characters
                </div>
              </div>
            </div>
          )} */}
          <div className="form-row">
            <label>
              Reason <span className="required">*</span>
            </label>

            <div className="reason-wrapper">
              <textarea
                rows={4}
                maxLength={250}
                placeholder="Enter reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <div className="char-count">{reason.length} / 250 characters</div>
            </div>
          </div>
          <div className="form-row">
            <label>
              Attachment <span className="required">*</span>
            </label>
            <div className="attachment-wrap">
              <input
                type="file"
                ref={fileRef}
                disabled={leaveType !== "SL"}
                accept=".pdf,application/pdf"
              />
              <span className="attachment-note">
                To be used for Sick Leaves only: While applying for Sick Leaves,
                please upload the Leave of Absence Certificate, signed by a
                medical practitioner. Only documents in PDF format can be
                uploaded. Please DO NOT upload any medical prescriptions or
                medical Test Records in the tool that contains personal medical
                data.
              </span>
            </div>
          </div>
        </div>

        <div className="form-footer">
          <button
            className="btn primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
          <button className="btn secondary" type="button" onClick={resetForm}>
            Cancel
          </button>
        </div>
      </div>
    </section>
  );
}
