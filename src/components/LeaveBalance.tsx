import './LeaveBalance.css';

export default function LeaveBalance() {
  return (
    <section className="lb-card">
      <h3 className="lb-title">Leave Balance:</h3>

      <div className="lb-header">
        <span className="red">Total</span> |
        <span className="blue"> Availed or Submitted</span> /
        <span className="blue"> Balance</span>
      </div>

      <div className="lb-grid">
        <div>
          <p>Birthday Leave (BDL): <span className="blue">1</span> [ <span className="blue">0</span> / <span className="blue">1</span> ]</p>
          <p>Associate Special Leave (ASL): <span className="red">25.0</span> [ <span className="blue">3.0</span> / <span className="blue">22.0</span> ]</p>
          <p>Work From Home (WFH): <span className="red">NA</span> [ <span className="blue">5.5</span> / <span className="red">NA</span> ]</p>
        </div>

        <div>
          <p>Casual Leave (CL): <span className="red">NA</span> [ NA / NA ]</p>
          <p>Paternity Leave (PTL): <span className="red">NA</span> [ NA / NA ]</p>
          <p>WFH Exception (WFHX): <span className="red">NA</span> [ <span className="blue">1.0</span> / NA ]</p>
        </div>

        <div>
          <p>Privilege Leave (PL): <span className="red">NA</span> [ NA / NA ]</p>
          <p>Sick Leave (SL): <span className="red">NA</span> [ NA / NA ]</p>
        </div>
      </div>
    </section>
  );
}
