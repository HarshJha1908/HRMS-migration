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
  <div className="holidayHeader">
    <h2 className="holidayTitle">Holiday List</h2>
  </div>
        {loading && <p className="status">Loading...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
  <div className="holidayTableWrapper">
    <table className="holidayTable">
            <thead>
              <tr>
                <th>Holiday Name</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday, index) => {
  const isPastHoliday =
    new Date(holiday.date).getTime() <
    new Date().setHours(0, 0, 0, 0);

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
  </div>
)}
      </div>
    </div>

  );


};

export default HolidayList;
