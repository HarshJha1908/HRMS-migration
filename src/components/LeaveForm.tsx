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
  }) => void;
};

const YEAR = 2026;

const HOLIDAY_LIST = [
  'January 26, Monday - Republic Day',
  'March 3, Tuesday - Doljatra',
  'April 15, Wednesday - Bengali New Year',
  'May 1, Friday - May Day',
  'May 27, Wednesday - Bakr-Id',
  'October 2, Friday - Gandhi Jayanti',
  'October 19, Monday - Maha Astami',
  'October 20, Tuesday - Maha Navami',
  'October 21, Wednesday - Vijaya Dashami',
  'November 9, Monday - Kali Puja',
  'December 25, Friday - Christmas Day'
];

export default function LeaveForm({ onSubmit }: LeaveFormProps) {
  const [leaveType, setLeaveType] = useState('WFH');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  // 🔹 Convert holiday strings → yyyy-mm-dd
  const holidayDates = useMemo(() => {
    return HOLIDAY_LIST.map(item => {
      const [monthDay] = item.split(',');
      return new Date(`${monthDay} ${YEAR}`)
        .toISOString()
        .split('T')[0];
    });
  }, []);

  const isHoliday = (date: Date) => {
    const d = date.toISOString().split('T')[0];
    return holidayDates.includes(d);
  };

  const handleSubmit = () => {
    setError('');

    if (!leaveType || !startDate || !endDate || !reason.trim()) {
      setError('Please fill the required details.');
      return;
    }

    if (endDate < startDate) {
      setError('End date must be greater than start date.');
      return;
    }

    if (isHoliday(startDate) || isHoliday(endDate)) {
      setError('Selected date falls on a holiday.');
      return;
    }

    onSubmit({
      leaveType,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      reason,
    });
  };


  return (
    <section className="page-layout">
      {/* LEFT : LEAVE FORM */}
      <section className="form-card">
        <h3>Apply For Leave : Tania Bhattacharjee</h3>

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
              <td>Start From *</td>
              <td>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  dayClassName={date =>
                    isHoliday(date) ? 'holiday-day' : ''
                  }
                  filterDate={date => !isHoliday(date)}
                  dateFormat="MM-dd-yyyy"      
                />
                <label className="inline">
                  <input type="checkbox" /> Half Day
                </label>
              </td>
            </tr>

            <tr>
              <td>Ends On *</td>
              <td>
                <DatePicker
                  selected={endDate}
                   onChange={(date: Date | null) => setEndDate(date)}
                  dayClassName={date =>
                    isHoliday(date) ? 'holiday-day' : ''
                  }
                  filterDate={date => !isHoliday(date)}
                  dateFormat="MM-dd-yyyy"
                  minDate={startDate || undefined}
                />
                <label className="inline">
                  <input type="checkbox" /> Half Day
                </label>
              </td>
            </tr>

            <tr>
              <td>Reason *</td>
              <td>
                <input type="text" value={reason} onChange={e => setReason(e.target.value)} />
              </td>
            </tr>

            <tr>
              <td>Contact during Leave</td>
              <td><input type="text" /></td>
            </tr>

            <tr>
              <td>Schedule for Submit</td>
              <td>
                <input type="checkbox" />
                <input type="date" />
              </td>
            </tr>

            <tr>
              <td>Work Handed Over</td>
              <td><input type="text" /></td>
            </tr>

            <tr>
              <td>Attachment</td>
              
              <td><input type="file" /></td>
              
            </tr>
           
          </tbody>
        </table>
        {/* ERROR MESSAGE */}
        {error && (
          <div className="form-error">
            {error}
          </div>
        )}
        <div className="form-footer">
          <button className="btn primary" onClick={handleSubmit}>Submit</button>
          <button className="btn secondary">Save Draft</button>
        </div>
      </section>
      {/* RIGHT : HOLIDAY LIST */}
      <section className="holiday-card">
        <h3>Upcoming Holidays</h3>

        <ul className="holiday-list">
          {HOLIDAY_LIST.map((holiday, index) => (
            <li key={index}>{holiday}</li>
          ))}
        </ul>
      </section>
    </section>

  );
}
