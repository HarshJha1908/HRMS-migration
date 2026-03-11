import { useEffect, useState } from 'react';
import LeaveFilterHeader from '../components/FilterHeader';
import LeaveBalance from '../components/LeaveBalance';
import MyLeaveDetail from '../components/MyLeaveDetail';
import { getLeaveTypes } from '../services/apiService';
import type { LeaveTypeApi } from '../types/apiTypes';


export default function LeaveDetails() {


  const [year, setYear] = useState(new Date().getFullYear());
  const [leaveType, setLeaveType] = useState("");
  const [status, setStatus] = useState("");
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeApi[]>([]);
 


  useEffect(() => {
    const loadLeaveTypes = async () => {
      const response = await getLeaveTypes("a2ef46");
      const raw = response?.data ?? [];
      const cleaned = raw.map((item: LeaveTypeApi) => ({
        leaveTypeCode: item.leaveTypeCode.trim(),
        leaveTypeName: item.leaveTypeName.trim()
      }));
      setLeaveTypes(cleaned);
    };

    loadLeaveTypes();
  }, []);

  return (
    <>
      <LeaveFilterHeader
        year={year}
        leaveType={leaveType}
        status={status}
        leaveTypes={leaveTypes}
        onYearChange={setYear}
        onLeaveTypeChange={setLeaveType}
        onStatusChange={setStatus}
      />
      <MyLeaveDetail
        year={year}
        leaveType={leaveType}
        status={status}
      />
      
      <LeaveBalance />

      
    </>
  );
}
