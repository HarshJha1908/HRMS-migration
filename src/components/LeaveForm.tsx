/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './LeaveForm.css';
import { getLeaveReasons, getLeaveTypes, saveLeaveRequest, getNoOfDays, getApprover } from '../services/apiService';
// import { getHolidays, type Holiday } from '../services/holidayService';
import { useNavigate } from 'react-router-dom';
import type { LeaveTypeApi, NoOfDaysApi, ReasonApi, ApproverApi } from '../types/apiTypes';
import type { LeaveFormProps } from '../types/props';
import { useHolidays } from '../hooks/useHolidays';
// import { useUser } from "../context/UserContext";



// const username = sessionStorage.getItem("username");
// console.log("Username from sessionStorage:", username);

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};



export default function LeaveForm({ onSubmit }: LeaveFormProps) {
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeApi[]>([]);

  const [leaveType, setLeaveType] = useState('');

  const [approver, setApprover] = useState<ApproverApi | null>(null);
  //const [loadingApprover, setLoadingApprover] = useState(false);
  // const [managerName, setManagerName] = useState('');

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [noOfDays, setNoOfDays] = useState<NoOfDaysApi | null>(null);
  const [,setLoadDays] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [reasons, setReasons] = useState<ReasonApi[]>([]);
  const [loadingReasons] = useState(false);
  const { holidays } = useHolidays();
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [isHalfDayStart, setIsHalfDayStart] = useState(false);
  const [isHalfDayEnd, setIsHalfDayEnd] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  // const [username, setUsername] = useState<string | null>(null);

  // useEffect(() => {
  //   const user = sessionStorage.getItem("username");
  //   console.log("Username from sessionStorage:", user);
  //   // console.log(sessionStorage.getItem("username"));
  //   setUsername(user);
  // }, []);

  // const { username } = useUser();

  useEffect(() => {
    const loadLeaveTypes = async () => {
      try {
        setLoading(true);

        const result = await getLeaveTypes("a2ef46");
        console.log("Leave Types API response:", result);
        if (result.isSuccess && result.data) {
          const cleaned = result.data.map((item: any) => ({
            leaveTypeCode: item.leaveTypeCode.trim(),
            leaveTypeName: item.leaveTypeName.trim()
          }));

          setLeaveTypes(cleaned);

          if (cleaned.length > 0) {
            setLeaveType(cleaned[0].leaveTypeCode);
          }
        }
      } catch (err) {
        console.error("Leave type fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    loadLeaveTypes();
  }, []);



  useEffect(() => {
    if (leaveType !== 'SL' && fileRef.current) {
      fileRef.current.value = '';
    }
  }, [leaveType]);


  useEffect(() => {
    const loadApprover = async () => {
      try {
        setLoading(true);

        const result = await getApprover("a2ef46");
        console.log("Leave Approver API response:", result);
        if (result.isSuccess && result.data) {

          setApprover(result.data);
          // console.log("Approver Name:", result.data.managerName);
        }
      } catch (err) {
        console.error("Leave approver fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    loadApprover();

  }, []);


  useEffect(() => {
    const loadReasons = async () => {
      try {
        setLoading(true);

        const result = await getLeaveReasons();
        console.log("Leave Reasons API response:", result);
        if (result.isSuccess && result.data) {
          const cleaned = result.data
            .filter((r: any) => r.isActive)
            .map((r: any) => ({
              reason: r.reason.trim()
            }));

          setReasons(cleaned);
        }
      } catch (err) {
        console.error("Reason fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    loadReasons();
  }, []);

  useEffect(() => {
    if (!startDate || !endDate) return;
    const loadDays = async () => {
      try {
        setLoadDays(true);
        const result = await getNoOfDays({
          startDate: formatLocalDate(startDate),
          endDate: formatLocalDate(endDate),
          totalHalfDays:
            (isHalfDayStart ? 0.5 : 0) +
            (isHalfDayEnd ? 0.5 : 0),
        });
        console.log("Leave Days API response:", result);
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
  }, [startDate, endDate, isHalfDayStart, isHalfDayEnd]);

  const holidayDates = useMemo(() => {
    return holidays.map((h) => formatLocalDate(new Date(h.date)));
  }, [holidays]);

  const holidayNameByDate = useMemo(() => {
    return new Map(
      holidays.map((h) => [formatLocalDate(new Date(h.date)), h.description])
    );
  }, [holidays]);

  const isHoliday = useCallback(
    (date: Date) => holidayDates.includes(formatLocalDate(date)),
    [holidayDates]
  );

  const isWeekend = (date: Date) =>
    date.getDay() === 0 || date.getDay() === 6;

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

    if (end && (isWeekend(end) || isHoliday(end)))
      setIsHalfDayEnd(false);

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
    const fullHolidayName = holidayNameByDate.get(iso) || '';
    return (
      <div
        className="day-cell"
        title={fullHolidayName && !isWeekendDay ? fullHolidayName : undefined}
      >
        <span>{day}</span>

        {fullHolidayName && !isWeekendDay && (
          <>
            <span className="holiday-underline" />
            <span className="holiday-label">
              {fullHolidayName.slice(0, 4)}
            </span>
          </>
        )}
      </div>
    );

  }
  const navigate = useNavigate();
  const handleSubmit = async () => {

    setError('');

    if (!leaveType || !startDate || !endDate || !reason.trim()) {
      setError('Please fill the required details.');
      return;
    }

    if (reason === 'Others' && !otherReason.trim()) {
      setError('Please specify the reason.');
      return;
    }
    try {
      setIsSubmitting(true);

      const payload = {

        userADId: "a2ef46",
        startDate: formatLocalDate(startDate),
        endDate: formatLocalDate(endDate),
        // noOfDays: noOfDays?.noOfDays || 0,
        reason: reason === 'Others' ? otherReason : reason,
        leaveTypeCode: leaveType.trim(),
        workHandedOver: '',
        contactNo: '',
        isHalfStartDay: isHalfDayStart,
        isHalfEndDay: isHalfDayEnd,
        approverRemarks: 'XXXXXXXXXXXXX',
        isSchedule: false,
        scheduleDate: new Date().toISOString().split("T")[0],
        statusChangeDate: new Date().toISOString().split("T")[0],
        leaveStatus: 'P',
        applyforother: false,
        applyforotheradid: '',

      };

      console.log("FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

      const response = await saveLeaveRequest(payload);

      if (response?.isSuccess === false) {
        throw new Error(response?.message || "Failed to submit leave.");
      }

      console.log("Leave submitted successfully:", response);

      onSubmit({
        leaveType,
        startDate: formatLocalDate(startDate),
        endDate: formatLocalDate(endDate),
        reason: reason === 'Others' ? otherReason : reason,
        otherReason: otherReason,
        totalDays: noOfDays?.noOfDays || 0

      });


      navigate("/leave-details", {
        state: { message: "Leave has been applied successfully!" }
      });

    } catch (error) {
      console.error("Submit failed:", error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to submit leave.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setLeaveType(leaveTypes[0]?.leaveTypeCode || '');
    setStartDate(null);
    setEndDate(null);
    setCalendarOpen(false);
    setReason('');
    setOtherReason('');
    setIsHalfDayStart(false);
    setIsHalfDayEnd(false);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  };




  return (
    <section className="leave-form-page">
      <div className="form-card">
        <h3>Apply For Leave : Tania Bhattacharjee</h3>

        {error && <div className="form-error-text">{error}</div>}

        <div className="form-grid">

          <div className="form-row">
            <label>Leave Type *</label>
            {loading && <p>Loading leave types...</p>}
            <select
              value={leaveType}
              disabled={loading}
              onChange={e => setLeaveType(e.target.value)}
            >
              {leaveTypes.map((type) => (
                <option
                  key={type.leaveTypeCode}
                  value={type.leaveTypeCode}
                >
                  {type.leaveTypeName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Approver Name</label>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <strong>{approver?.managerName || 'N/A'}</strong>
            )}

          </div>

          <div className="form-row">
            <label>Start Date *</label>
            <div className="date-with-half">
              <input
                readOnly
                value={startDate ? startDate.toLocaleDateString() : ''}
                placeholder="Select start date"
                onClick={() => setCalendarOpen(true)}
              />
              <label className="half-checkbox">
                <input
                  type="checkbox"
                  checked={isHalfDayStart}
                  disabled={!isHalfDayStartEligible}
                  onChange={e => setIsHalfDayStart(e.target.checked)}
                />
                Half Day
              </label>
            </div>
          </div>

          <div className="form-row">
            <label>End Date *</label>
            <div className="date-with-half">
              <input
                readOnly
                value={endDate ? endDate.toLocaleDateString() : ''}
                placeholder="Select end date"
                onClick={() => setCalendarOpen(true)}
              />
              <label className="half-checkbox">
                <input
                  type="checkbox"
                  checked={isHalfDayEnd}
                  disabled={!isHalfDayEndEligible}
                  onChange={e => setIsHalfDayEnd(e.target.checked)}
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

          <div className="form-row">
            <label>Reason *</label>
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

            {reason === 'Others' && (
              <textarea
                rows={3}
                placeholder="Please specify reason"
                value={otherReason}
                onChange={e => setOtherReason(e.target.value)}
              />
            )}
          </div>

          <div className="form-row">
            <label>Attachment</label>
            <div className="attachment-wrap">
              <input
                type="file"
                ref={fileRef}
                disabled={leaveType !== 'SL'}
              />
              <span className="attachment-note">
                <strong>To be used for Sick Leaves only:</strong> While applying for Sick
                Leaves, please upload the Leave of Absence Certificate, signed by a medical
                practitioner. Only documents in <strong>PDF</strong> format can be
                uploaded. Please <strong>DO NOT</strong> upload any medical prescriptions
                or medical Test Records in the tool that contains personal medical data.
              </span>
            </div>
          </div>
        </div>

        <DatePicker
          selected={startDate}
          onChange={handleDateChange}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          open={calendarOpen}
          shouldCloseOnSelect={false}
          onClickOutside={() => setCalendarOpen(false)}
          dayClassName={getDayClass}
          renderDayContents={renderDay}
          customInput={<div style={{ display: 'none' }} />}
          popperPlacement="bottom-start"
        />

        <div className="form-footer">
          <button className="btn primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
          <button
            className="btn secondary"
            type="button"
            onClick={resetForm}
          >
            Cancel
          </button>
        </div>
      </div>
    </section>
  );
}
