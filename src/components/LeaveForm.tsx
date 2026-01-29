import { useState } from 'react';
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


export default function LeaveForm({ onSubmit }: LeaveFormProps) {
  const [leaveType, setLeaveType] = useState('WFH');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');

    // Required field validation (as per UI)
    if (!leaveType || !startDate || !endDate || !reason.trim()) {
      setError('Please fill the required details....');
      return;
    }

    // Date validation
    if (new Date(endDate) < new Date(startDate)) {
      setError('End date must be greater than start date.');
      return;
    }

    onSubmit({
  leaveType,
  startDate,
  endDate,
  reason,
});

  };

  return (
    <section className="form-card">
      <h3 className="section-title">Apply For Leave : Harsh Kumar Jha</h3>

      <div className="form-grid">
        {/* Leave Type */}
        <label htmlFor="leaveType">Leave Type *</label>
        <select
          id="leaveType"
          value={leaveType}
          onChange={e => setLeaveType(e.target.value)}
        >
          {LEAVE_TYPES.map(t => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {/* Approver Name */}
        <label>Approver Name</label>
        <span className="readonly">Rajeev Kalleparambil</span>

        {/* Start Date */}
        <label htmlFor="startDate">Start From (dd/mm/yyyy) *</label>
        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />

        {/* Half Day (Start) */}
        <label htmlFor="halfDayStart">Half Day</label>
        <input id="halfDayStart" type="checkbox" />

        {/* End Date */}
        <label htmlFor="endDate">Ends on (dd/mm/yyyy) *</label>
        <input
          id="endDate"
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />

        {/* Half Day (End) */}
        <label htmlFor="halfDayEnd">Half Day</label>
        <input id="halfDayEnd" type="checkbox" />

        {/* Reason */}
        <label htmlFor="reason">Reason *</label>
        <input
          id="reason"
          type="text"
          value={reason}
          onChange={e => setReason(e.target.value)}
        />

        {/* Contact */}
        <label htmlFor="contact">
          My Contact during Leave (Phone# only)
        </label>
        <input id="contact" type="text" />

        {/* Schedule for Submit */}
        <label htmlFor="scheduleSubmit">Schedule for Submit</label>
        <input id="scheduleSubmit" type="checkbox" />

        {/* Schedule Date */}
        <label htmlFor="scheduleDate">Schedule Date (dd/mm/yyyy)</label>
        <input id="scheduleDate" type="date" />

        {/* Work Handed Over */}
        <label htmlFor="workHandedOver">Work Handed Over</label>
        <input id="workHandedOver" type="text" />
      </div>

      {/* Sick Leave Note */}
      <div className="sick-note">
        To be used for Sick Leaves only: While applying for Sick Leaves, please
        upload the Leave of Absence Certificate, signed by a medical practitioner.
        Only documents in PDF format can be uploaded. Please DO NOT upload any
        medical prescriptions or medical Test Records in the tool that contains
        personal medical data.
      </div>

      {/* File Upload (accessible) */}
      <div className="upload-row">
        <label htmlFor="medicalUpload" className="visually-hidden">
          Upload medical certificate
        </label>
        <input id="medicalUpload" type="file" />
      </div>

      {/* Error Message */}
      {error && <p className="error">{error}</p>}

      {/* Footer Buttons */}
      <div className="form-footer">
        <button type="button" className="btn primary" onClick={handleSubmit}>
          Submit
        </button>
        <button type="button" className="btn secondary">
          Save Draft
        </button>
      </div>
    </section>
  );
}
