import type { LeaveRequest } from '../types/leave';
import './LeaveTable.css';

const data: LeaveRequest[] = [
  {
    leaveType: 'TE',
    startDate: '19/01/2026',
    endDate: '19/01/2026',
    days: 0.5,
    status: 'Approved',
    submittedOn: '20/01/2026',
    approver: 'Snehashish Bhunia',
  },
  {
    leaveType: 'WFH',
    startDate: '19/01/2026',
    endDate: '19/01/2026',
    days: 0.5,
    status: 'Approved',
    submittedOn: '19/01/2026',
    approver: 'Snehashish Bhunia',
  },
];

export default function MyLeaveDetail() {
  return (
    <section className="card">
      <h3 className="section-title">Latest Applied Leave :</h3>

      <table className="leave-table">
        <thead>
          <tr>
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Days</th>
            <th>Status</th>
            <th>Submission Date</th>
            <th>Approver Name</th>
          </tr>
        </thead>

        <tbody>
          {data.map((l, i) => (
            <tr key={`${l.leaveType}-${i}`}>
              <td>{l.leaveType}</td>
              <td>{l.startDate}</td>
              <td>{l.endDate}</td>
              <td>{l.days}</td>
              <td>
                <span
                  className={`status ${l.status.toLowerCase()}`}
                  aria-label={`Status ${l.status}`}
                >
                  {l.status}
                </span>
              </td>
              <td>{l.submittedOn}</td>
              <td>{l.approver}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="view-more">
        <a href="/leave-details" aria-label="View more applied leave">
          View More..
        </a>
      </div>
    </section>
  );
}

