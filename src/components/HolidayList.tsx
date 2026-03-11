import React, { useEffect, useState } from "react";
import './HolidayList.css';
import { getHolidays } from "../services/apiService";
import type { Holiday } from "../types/apiTypes";

const HolidayList: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const result = await getHolidays();
        if (!result?.isSuccess) {
          throw new Error(result?.message || "API request failed");
        }
        setHolidays(result.data ?? []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  const formatDate = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };


  return (

    <div className="holidayRoot">
      <div className="holidayCard">
        <h2 className="holidayTitle">Holiday List</h2>

        {loading && <p className="status">Loading...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <table className="holidayTable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Holiday Name</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday, index) => {
                const isPastHoliday = holiday.date < new Date().toISOString();

                return (
                  <tr key={index}>
                    <td className={isPastHoliday ? "past-holiday" : ""}>
                      {formatDate(holiday.date)}
                    </td>
                    <td className={isPastHoliday ? "past-holiday" : ""}>
                      {holiday.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>

  );


};

export default HolidayList;
