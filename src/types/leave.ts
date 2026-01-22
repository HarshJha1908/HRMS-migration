export type LeaveBalanceItem = {
  type: string;
  total: number | null;
  used: number | null;
  balance: number | null;
};

export type LeaveRequest = {
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'Approved' | 'Pending';
  approver: string;
  submittedOn: string;
};

export const LEAVE_TYPES = [
  { value: 'WFH', label: 'Work From Home' },
  { value: 'WFHX', label: 'WFH Exception' },
  { value: 'TECH_ERR', label: 'Tech. Error' },
  { value: 'ON_DUTY', label: 'On Duty' },
  { value: 'COFF', label: 'Compensatory Off' },
  { value: 'BDL', label: 'Birthday Leave' },
  { value: 'ASL', label: 'Associate Special Leave' },
] as const;
