import { useCallback, useEffect, useState } from "react";
import { getLeaveStatusCodes } from "../services/apiService";
import type { LeaveStatusApi } from "../types/apiTypes";

type UseLeaveStatusCodesResult = {
  leaveStatuses: LeaveStatusApi[];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
};

export const useLeaveStatusCodes = (): UseLeaveStatusCodesResult => {
  const [leaveStatuses, setLeaveStatuses] = useState<LeaveStatusApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLeaveStatuses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getLeaveStatusCodes();
      const raw = response?.data ?? [];
      const cleaned = raw.map((item: LeaveStatusApi) => ({
        statusCode: String(item.statusCode || "").trim(),
        statusName: String(item.statusName || "").trim()
      }));

      setLeaveStatuses(cleaned);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load leave status codes";
      setError(message);
      setLeaveStatuses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeaveStatuses();
  }, [loadLeaveStatuses]);

  return {
    leaveStatuses,
    loading,
    error,
    reload: loadLeaveStatuses
  };
};
