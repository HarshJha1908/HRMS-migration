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

const YEAR = 2026;

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
    const iso = current.toISOString().split('T')[0];

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
      return new Date(`${monthDay} ${YEAR}`)
        .toISOString()
        .split('T')[0];
    });
  }, []);

  const isHoliday = (date: Date) =>
    holidayDates.includes(date.toISOString().split('T')[0]);

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

  const iso = date.toISOString().split('T')[0];
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
      startDate: startDate!.toISOString().split('T')[0],
      endDate: endDate!.toISOString().split('T')[0],
      reason,
      otherReason: reason === 'Others' ? otherReason : '',
      totalDays: totalLeaveDays
    });
  };

  return (
    <section className="page-layout">
      <section className="form-card">
        <h3>Apply For Leave : Tania Bhattacharjee</h3>

        <div className="form-error-placeholder">
          {error && <span className="form-error-text">{error}</span>}
        </div>

        <table className="form-table">
          <tbody>
            <tr>
              <td>Leave Type *</td>
              <td>
                <select value={leaveType} onChange={e => setLeaveType(e.target.value)}>
                  {LEAVE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </td>
            </tr>

            <tr>
              <td>Approver Name</td>
              <td><strong>Snehashish Bhunia</strong></td>
            </tr>

            <tr>
              <td>Start Date *</td>
              <td>
                <input
                  readOnly
                  value={startDate ? startDate.toLocaleDateString() : ''}
                  placeholder="Select start date"
                  onClick={() => setCalendarOpen(true)}
                />
              </td>
            </tr>

            <tr>
              <td>End Date *</td>
              <td>
                <input
                  readOnly
                  value={endDate ? endDate.toLocaleDateString() : ''}
                  placeholder="Select end date"
                  onClick={() => setCalendarOpen(true)}
                />
              </td>
            </tr>

            {/* ✅ SHOW ONLY WHEN END DATE EXISTS */}
            {endDate && (
              <tr className="leave-days-row">
                <td>Total Leave Days</td>
                <td><strong>{totalLeaveDays}</strong></td>
              </tr>
            )}

            <tr>
              <td>Reason *</td>
              <td>
                <select
                  value={reason}
                  onChange={e => {
                    setReason(e.target.value);
                    if (e.target.value !== 'Others') setOtherReason('');
                  }}
                >
                  <option value="">-- Select Reason --</option>
                  <option value="Medical Appointment">Medical Appointment</option>
                  <option value="Family Emergency">Family Emergency</option>
                  <option value="Vacation">Vacation</option>
                  <option value="Others">Others</option>
                </select>

                {reason === 'Others' && (
                  <input
                    type="text"
                    placeholder="Please specify reason"
                    value={otherReason}
                    onChange={e => setOtherReason(e.target.value)}
                  />
                )}
              </td>
            </tr>

            <tr>
              <td>Attachment</td>
              <td><input type="file" /></td>
            </tr>
          </tbody>
        </table>

        {/* 🔒 REAL HIDDEN DATEPICKER (NO INPUT RENDERED) */}
       <DatePicker
  selected={startDate}
  onChange={handleDateChange}
  startDate={startDate}
  endDate={endDate}
  selectsRange
  open={calendarOpen}
  monthsShown={1}
  shouldCloseOnSelect={false}
  dayClassName={getDayClass}
  renderDayContents={renderDay}
  customInput={<div />}
  onClickOutside={() => setCalendarOpen(false)}

  /* ✅ OPEN ON RIGHT SIDE OF START DATE */
  popperPlacement="right-start"
  popperProps={{
    strategy: 'fixed',
  }}
  popperModifiers={[
    {
      name: 'flip',
      enabled: true,
      options: {
        fallbackPlacements: ['left-start', 'bottom-start', 'top-start'],
      },
    },
    {
      name: 'preventOverflow',
      enabled: true,
      options: {
        boundary: 'viewport',
        padding: 8,
      },
    },
  ]}
/>




        <div className="form-footer">
          <button className="btn primary" onClick={handleSubmit}>Submit</button>
          <button className="btn secondary">Save Draft</button>
        </div>
      </section>

      <section className="holiday-card">
        <h3>Upcoming Holidays</h3>
        <ul>
          {HOLIDAY_LIST.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </section>
    </section>
  );
}
