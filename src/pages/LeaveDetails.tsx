import { useEffect, useState } from 'react';
import LeaveFilterHeader from '../components/FilterHeader';
import LeaveBalance from '../components/LeaveBalance';
import MyLeaveDetail from '../components/MyLeaveDetail';
import { getLeaveTypes } from '../services/apiService';
import type { LeaveTypeApi } from '../types/apiTypes';
import { useLeaveStatusCodes } from '../hooks/useLeaveStatusCodes';


export default function LeaveDetails() {


  const [year, setYear] = useState(new Date().getFullYear());
  const [leaveType, setLeaveType] = useState("");
  const [status, setStatus] = useState("");
  const [appliedYear, setAppliedYear] = useState(new Date().getFullYear());
  const [appliedLeaveType, setAppliedLeaveType] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeApi[]>([]);
  const { leaveStatuses } = useLeaveStatusCodes();
 


  useEffect(() => {
    const loadFilterData = async () => {
      const leaveTypeResponse = await getLeaveTypes("a2ef46");

      const leaveTypeRaw = leaveTypeResponse?.data ?? [];
      const leaveTypeCleaned = leaveTypeRaw.map((item: LeaveTypeApi) => ({
        leaveTypeCode: item.leaveTypeCode.trim(),
        leaveTypeName: item.leaveTypeName.trim()
      }));
      setLeaveTypes(leaveTypeCleaned);
    };

    loadFilterData();
  }, []);

  const handleApplyFilters = () => {
    setAppliedYear(year);
    setAppliedLeaveType(leaveType);
    setAppliedStatus(status);
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
      />
      
      <LeaveBalance />

      
    </>
  );
}
