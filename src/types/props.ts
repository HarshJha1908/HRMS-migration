import type { LeaveStatusApi, LeaveTypeApi } from "../types/apiTypes";


//Leave form
export type LeaveFormProps = {
  onSubmit: (data: {
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
    otherReason: string;
    totalDays: number;
  }) => void;
};

//Leave Detail props
export type LeaveDetailProps = {
  showLatestOnly?: boolean;
  year?: number;
  leaveType?: string;
  status?: string;
};

// FilterProps
export type FilterProps = {
  year: number;
  leaveType: string;
  status: string;

  leaveTypes: LeaveTypeApi[];
  leaveStatuses: LeaveStatusApi[];

  onYearChange: (value: number) => void;
  onLeaveTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onApplyFilters: () => void;
};

//Pagination Props
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

