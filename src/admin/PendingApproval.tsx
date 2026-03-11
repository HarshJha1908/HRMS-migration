
import  { useState } from "react";
import "./PendingApproval.css";
import LockedScreen from "../components/LockedScreen";
const initialData = [
  {
    id: 1,
    name: "Harsh Jha",
    type: "WFH",
    dateRange: "02/02/2026 to 02/02/2026",
    days: 1,
    balance: "NA",
    submitted: "02/02/2026",
    reason: "Following work from home policy",
    remark: "",
    selected: false
  },
  {
    id: 2,
    name: "Tania Bhattacharjee",
    type: "WFH",
    dateRange: "30/01/2026 to 30/01/2026",
    days: 1,
    balance: "NA",
    submitted: "03/02/2026",
    reason: "WFH",
    remark: "",
    selected: false
  }
];

export default function PendingApproval() {
  const [rows, setRows] = useState(initialData);
  const allSelected = rows.every(r => r.selected);

  const toggleAll = (checked: boolean) => {
    setRows(rows.map(r => ({ ...r, selected: checked })));
  };

  const toggleRow = (id: number) => {
    setRows(rows.map(r =>
      r.id === id ? { ...r, selected: !r.selected } : r
    ));
  };

  const updateRemark = (id: number, value: string) => {
    setRows(rows.map(r =>
      r.id === id ? { ...r, remark: value } : r
    ));
  };

  const handleAction = (action: string) => {
    const selectedRows = rows.filter(r => r.selected);
    console.log(action, selectedRows);
    alert(`${action} clicked for ${selectedRows.length} request(s)`);
  };

  return (
    <>
      
      {/* Content */}
      <LockedScreen/>
      <section className="pending-page">
      <div className="container">
        <div className="card">
          <div className="card-header">Pending Approval Details</div>

          <div className="card-body">
            <div className="controls">
              <div>
                Go To:
                <select>
                  <option>Apply Leave</option>
                  <option>Leave History</option>
                </select>
              </div>

              <div>
                <button 
                  className="btn approve"
                  onClick={() => handleAction("Approve")}
                >
                  Approve
                </button>
                <button
                  className="btn reject"
                  onClick={() => handleAction("Reject")}
                >
                  Reject
                </button>
              </div>
            </div>

            <div className="select-all">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => toggleAll(e.target.checked)}
              />{" "}
              Select All
            </div>

            <table>
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Requester Name</th>
                  <th>Leave Type</th>
                  <th>Start-End Date</th>
                  <th>Days</th>
                  <th>Balance</th>
                  <th>Submission Date</th>
                  <th>Reason</th>
                  <th>Approver Remark</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={row.selected}
                        onChange={() => toggleRow(row.id)}
                      />
                    </td>
                    <td>{row.name}</td>
                    <td>{row.type}</td>
                    <td>{row.dateRange}</td>
                    <td>{row.days}</td>
                    <td>{row.balance}</td>
                    <td>{row.submitted}</td>
                    <td>{row.reason}</td>
                    <td>
                      <input
                        type="text"
                        value={row.remark}
                        onChange={(e) =>
                          updateRemark(row.id, e.target.value)
                        }
                      />
                      <div>
                        <a href="#" className="view-link">View Details</a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>
      </div>
      </section>
    </>
  );
}
