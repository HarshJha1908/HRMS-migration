import { useCallback, useEffect, useState } from "react";
import { getHolidays } from "../services/apiService";
import type { Holiday } from "../types/apiTypes";

type UseHolidaysResult = {
  holidays: Holiday[];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
};

export const useHolidays = (): UseHolidaysResult => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHolidays = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getHolidays();
      if (!result?.isSuccess) {
        throw new Error(result?.message || "Holiday API request failed");
      }

      setHolidays(result.data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Holiday fetch failed";
      setError(message);
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHolidays();
  }, [loadHolidays]);

  return {
    holidays,
    loading,
    error,
    reload: loadHolidays
  };
};
