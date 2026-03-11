import React from "react";
import "./EmployeeProfile.css";
import LockedScreen from "./LockedScreen";



const CreateEmployeeLeaveProfile: React.FC = () => {
  return (
    
    <section className="create-employee-form">
      <h2 className="page-title">Create Employee Leave Profile</h2>
      <LockedScreen/>
      <div className="employee-form-card">
        <div className="form-grid">
          {/* Row 1 */}
          <div className="form-group checkbox-group">
            <input type="checkbox" checked readOnly />
            <label>Employee Status</label>
          </div>

          <div className="form-group">
            <label>
              Employee Type<span>*</span>
            </label>
            <select>
              <option>Associate</option>
              <option>FTE</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <input type="checkbox" />
            <label>Is Manager / Head / Team Lead</label>
          </div>

          {/* Row 2 */}
          <div className="form-group">
            <label>
              First Name<span>*</span>
            </label>
            <input type="text" />
          </div>

          <div className="form-group">
            <label>Middle Name</label>
            <input type="text" />
          </div>

          <div className="form-group">
            <label>
              Last Name<span>*</span>
            </label>
            <input type="text" />
          </div>

          {/* Row 3 */}
          <div className="form-group">
            <label>
              Employee No<span>*</span>
            </label>
            <input type="text" />
          </div>

          <div className="form-group">
            <label>
              User Id<span>*</span>
            </label>
            <input type="text" />
          </div>

          <div className="form-group">
            <label>
              Email Id<span>*</span>
            </label>
            <input type="email" />
          </div>

          {/* Row 4 */}
          <div className="form-group">
            <label>
              Gender<span>*</span>
            </label>
            <select>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <input type="checkbox" />
            <label>Maternity / Paternity Leave Applicable</label>
          </div>

          <div className="form-group">
            <label>
              Joining Date (dd/mm/yyyy)<span>*</span>
            </label>
            <input type="text" placeholder="dd/mm/yyyy" />
          </div>

          {/* Row 5 */}
          <div className="form-group full-width">
            <label>
              Assignment Team<span>*</span>
            </label>
            <select>
              <option>--------- Team Name ---------</option>
              <option>Engineering</option>
              <option>HR</option>
              <option>Finance</option>
            </select>
          </div>
        </div>

        {/* Leave balances */}
    
<div className="leave-balance-wrapper">
  <div className="leave-section">
    <div className="leave-row">
      <label>
        Casual Leave (CL) Balance Entry<span>*</span>
      </label>
      <input type="number" defaultValue="0.0" />
    </div>

    <div className="leave-row">
      <label>
        Sick Leave (SL) Balance Entry<span>*</span>
      </label>
      <input type="number" defaultValue="0.0" />
    </div>

    <div className="leave-row">
      <label>
        Associate Leave (ASL) Balance Entry<span>*</span>
      </label>
      <input type="number" />
    </div>
  </div>
</div>


        <div className="action-bar">
          <button className="btn-primary">Create</button>
        </div>
      </div>
    </section>
  );
};

export default CreateEmployeeLeaveProfile;
