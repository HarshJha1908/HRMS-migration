// import Footer from '../components/Footer';
import { useState } from "react";
import LeaveBalance from "../components/LeaveBalance";
import LeaveForm from "../components/LeaveForm";
import MyLeaveDetail from "../components/MyLeaveDetail";
import type { LeaveFormProps } from "../types/props";
// import type { LeaveDetailsApi } from '../types/apiTypes';

export default function ApplyLeave() {
  const [leaveBalanceRefreshKey, setLeaveBalanceRefreshKey] = useState(0);

  const handleLeaveSubmitSuccess: LeaveFormProps["onSubmit"] = () => {
    // LeaveForm component already handles navigation to /leave-details after successful submission
    // No need to manually refresh - the page redirect will show updated data
  };

  const refreshLeaveBalance = () => {
    setLeaveBalanceRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <LeaveBalance refreshKey={leaveBalanceRefreshKey} />
      <LeaveForm onSubmit={handleLeaveSubmitSuccess} />
      <MyLeaveDetail
        showLatestOnly={true}
        onLeaveStatusChanged={refreshLeaveBalance}
      />
    </>
  );
}
