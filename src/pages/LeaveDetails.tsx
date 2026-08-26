import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LeaveFilterHeader from '../components/FilterHeader';
import LeaveBalance from '../components/LeaveBalance';
import MyLeaveDetail from '../components/MyLeaveDetail';
import { getLeaveTypes } from '../services/apiService';
import type { LeaveTypeApi } from '../types/apiTypes';
import { useLeaveStatusCodes } from '../hooks/useLeaveStatusCodes';
import { useAuth } from '../auth/useAuth';


export default function LeaveDetails() {

  const location = useLocation();
  const { user } = useAuth();
  const currentUserAdId = String(user?.loginUserAdID || "").trim();
  const routeState = location.state as { leaveTypeCode?: unknown } | null;
  const initialLeaveType = String(routeState?.leaveTypeCode || "").trim();

  const [year, setYear] = useState(new Date().getFullYear());
  const [leaveType, setLeaveType] = useState(initialLeaveType);
  const [status, setStatus] = useState("");
  const [appliedYear, setAppliedYear] = useState(new Date().getFullYear());
  const [appliedLeaveType, setAppliedLeaveType] = useState(initialLeaveType);
  const [appliedStatus, setAppliedStatus] = useState("");
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeApi[]>([]);
  const [leaveBalanceRefreshKey, setLeaveBalanceRefreshKey] = useState(0);
  const { leaveStatuses } = useLeaveStatusCodes();
 


  useEffect(() => {
    const loadFilterData = async () => {
      if (!currentUserAdId) {
        setLeaveTypes([]);
        return;
      }

      try {
        const leaveTypeResponse = await getLeaveTypes(currentUserAdId);

        const leaveTypeRaw = leaveTypeResponse?.data ?? [];
        const leaveTypeCleaned = leaveTypeRaw.map((item: LeaveTypeApi) => ({
          leaveTypeCode: String(item.leaveTypeCode || "").trim(),
          leaveTypeName: String(item.leaveTypeName || "").trim()
        }));
        setLeaveTypes(leaveTypeCleaned);
      } catch (error) {
        setLeaveTypes([]);
      }
    };

    loadFilterData();
  }, [currentUserAdId]);

  const handleApplyFilters = () => {
    setAppliedYear(year);
    setAppliedLeaveType(leaveType);
    setAppliedStatus(status);
  };

  const refreshLeaveBalance = () => {
    setLeaveBalanceRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <LeaveFilterHeader
        year={year}
        leaveType={leaveType}
        status={status}
        leaveTypes={leaveTypes}
        leaveStatuses={leaveStatuses}
        onYearChange={setYear}
        onLeaveTypeChange={setLeaveType}
        onStatusChange={setStatus}
        onApplyFilters={handleApplyFilters}
      />
      <MyLeaveDetail
        year={appliedYear}
        leaveType={appliedLeaveType}
        status={appliedStatus}
        onLeaveStatusChanged={refreshLeaveBalance}
      />
      
      <LeaveBalance refreshKey={leaveBalanceRefreshKey} />

      
    </>
  );
}
