import React from "react";
import './HolidayList.css';
import { useHolidays } from "../hooks/useHolidays";

const HolidayList: React.FC = () => {
  const { holidays, loading, error } = useHolidays();

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
                <th>Holiday Name</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday, index) => {
                const isPastHoliday = holiday.date < new Date().toISOString();

                return (
                  <tr key={index}>
                    <td className={isPastHoliday ? "past-holiday" : ""}>
                      {holiday.description}
                    </td>
                    <td className={isPastHoliday ? "past-holiday" : ""}>
                      {formatDate(holiday.date)}
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
