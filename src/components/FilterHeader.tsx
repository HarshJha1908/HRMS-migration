import "./FilterHeader.css";
import type { FilterProps } from "../types/props";


export default function LeaveFilterHeader({
  year,
  leaveType,
  status,
  leaveTypes,
  onYearChange,
  onLeaveTypeChange,
  onStatusChange
}: FilterProps) {

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
  <div className="filter-card">

    <h2 className="filter-title">My Leaves Details</h2>

    <div className="filter-container">

      <div className="filter-field">
        <label>Year</label>
        <select
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
        >
          {/* years */}
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
        </select>
      </div>

      <div className="filter-field">
        <label>Leave Type</label>
        <select
          value={leaveType}
          onChange={(e) => onLeaveTypeChange(e.target.value)}
        >
          <option value="">All Leave Type</option>
          {leaveTypes.map((lt) => (
            <option
              key={lt.leaveTypeCode}
              value={lt.leaveTypeCode}
            >
              {lt.leaveTypeName}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label>Status</label>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="A">Approved</option>
          <option value="P">Pending</option>
          <option value="R">Rejected</option>
          <option value="D">Drafted</option>
          <option value="C">Cancelled</option>
        </select>
      </div>

    </div>
  </div>
);
}