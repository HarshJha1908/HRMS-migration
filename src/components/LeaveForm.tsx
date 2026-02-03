import { useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './LeaveForm.css';

import { LEAVE_TYPES } from '../types/leave';

type LeaveFormProps = {
  onSubmit: (data: {
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
    otherReason: string;
    totalDays: number;
  }) => void;
};

const YEAR = new Date().getFullYear();

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const HOLIDAY_LIST = [
  'January 26, Monday - Republic Day',
  'March 3, Tuesday - Holi',
  'April 15, Wednesday - Bengali New Year',
  'May 1, Friday - May Day',
  'May 27, Wednesday - Ramzan',
  'October 2, Friday - Gandhi Jayanti',
  'October 19, Monday - Maha Astami',
  'October 20, Tuesday - Maha Navami',
  'October 21, Wednesday - Vijaya Dashami',
  'November 9, Monday - Kali Puja',
  'December 25, Friday - Christmas Day'
];

/* ---------- LEAVE DAY CALCULATION ---------- */
const calculateLeaveDays = (
  start: Date,
  end: Date,
  holidayDates: string[]
): number => {
  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const day = current.getDay();
        const iso = formatLocalDate(current);

    const isWeekend = day === 0 || day === 6;
    const isHoliday = holidayDates.includes(iso);

    if (!isWeekend && !isHoliday) count++;
    current.setDate(current.getDate() + 1);
  }

  return count;
};

export default function LeaveForm({ onSubmit }: LeaveFormProps) {
  const [leaveType, setLeaveType] = useState('WFH');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [error, setError] = useState('');

  /* ---------- HOLIDAYS ---------- */
  const holidayDates = useMemo(() => {
    return HOLIDAY_LIST.map(item => {
      const [monthDay] = item.split(',');
      return formatLocalDate(new Date(`${monthDay} ${YEAR}`));
    });
  }, []);

  const isHoliday = (date: Date) =>
     holidayDates.includes(formatLocalDate(date));

  /* ---------- TOTAL DAYS ---------- */
  const totalLeaveDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return calculateLeaveDays(startDate, endDate, holidayDates);
  }, [startDate, endDate, holidayDates]);

  /* ---------- DAY CLASS ---------- */
  const getDayClass = (date: Date) => {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    if (isHoliday(date) && !isWeekend) return 'holiday-dot';
    return undefined;
  };

  /* ---------- CUSTOM DAY ---------- */
  const renderDay = (day: number, date?: Date) => {
    if (!date) return day;

    const iso = formatLocalDate(date);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const index = holidayDates.indexOf(iso);

    const fullHolidayName =
      index !== -1
        ? HOLIDAY_LIST[index].split('-')[1]?.trim()
        : '';

    return (
      <div
        className="day-cell"
        title={index !== -1 && !isWeekend ? fullHolidayName : undefined}
      >
        <span>{day}</span>

        {index !== -1 && !isWeekend && (
          <>
            <span className="holiday-underline" />
            <span className="holiday-label">
              {fullHolidayName.slice(0, 4)}
            </span>
          </>
        )}
      </div>
    );
  };


  /* ---------- DATE CHANGE ---------- */
  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    if (start && end) {
      setCalendarOpen(false); // close after end date
    }
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = () => {
    setError('');

    if (!leaveType || !startDate || !endDate || !reason.trim()) {
      setError('Please fill the required details.');
      return;
    }

    if (reason === 'Others' && !otherReason.trim()) {
      setError('Please specify the reason.');
      return;
    }

    onSubmit({
      leaveType,
       startDate: formatLocalDate(startDate),
      endDate: formatLocalDate(endDate),
      reason,
      otherReason: reason === 'Others' ? otherReason : '',
      totalDays: totalLeaveDays
    });
  };

  return (
    <section className="form-card">
      <h3>Apply For Leave : Tania Bhattacharjee</h3>

      <div className="form-error-placeholder">
        {error && <span className="form-error-text">{error}</span>}
      </div>

      <div className="form-grid">

        <div className="form-row">
          <label>Leave Type *</label>
          <select value={leaveType} onChange={e => setLeaveType(e.target.value)}>
            {LEAVE_TYPES.map(t => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Approver Name</label>
          <strong>Snehashish Bhunia</strong>
        </div>

        <div className="form-row date-anchor">
          <label>Start Date *</label>
          <input
            readOnly
            value={startDate ? startDate.toLocaleDateString() : ''}
            placeholder="Select start date"
            onClick={() => setCalendarOpen(true)}
          />
        </div>

        <div className="form-row">
          <label>End Date *</label>
          <input
            readOnly
            value={endDate ? endDate.toLocaleDateString() : ''}
            placeholder="Select end date"
            onClick={() => setCalendarOpen(true)}
          />
        </div>

        {endDate && (
          <div className="form-row leave-days-row">
            <label>Total Leave Days</label>
            <strong>{totalLeaveDays}</strong>
          </div>
        )}

        <div className="form-row">
          <label>Reason *</label>
          <div className="reason-field">
            <select
              value={reason}
              onChange={e => {
                setReason(e.target.value);
                if (e.target.value !== 'Others') setOtherReason('');
              }}
            >
              <option value="">-- Select Reason --</option>
              <option value="WFH Policy">As Per Home Office Policy</option>
              <option value="Inclement Weather">Inclement Weather</option>
              <option value="Medical Appointment">Medical Appointment</option>
              <option value="Medical Procedure">Medical Procedure</option>
              <option value="Medical Illness/Injury">Medical Illness/Injury</option>
              <option value="Others">Others</option>
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
        </div>

        <div className="form-row">
          <label>Attachment</label>
          <input type="file" />
        </div>

      </div>

      {/* DATEPICKER */}
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

        /* 🔑 THIS REMOVES THE EXTRA INPUT */
        customInput={<div style={{ display: 'none' }} />}

        popperPlacement="bottom-start"
      />


      <div className="form-footer">
        <button className="btn primary" onClick={handleSubmit}>Submit</button>
        <button className="btn secondary">Save Draft</button>
      </div>
    </section>

  );
}
