import React, { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from "date-fns";
import "../styles/calendar.css";
import Navbar from "./Navbar";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/calendar/releases`);
        if (!response.ok) {
          throw new Error("Failed to fetch release dates");
        }
        const data = await response.json();
        setReleases(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchReleases();
  }, []);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setSelectedDate(null);
  };

  const handleDateClick = (day) => {
    setSelectedDate(day);
  };

  const getReleasesForDate = (date) => {
    return releases.filter((release) => isSameDay(new Date(release.releaseDate), date));
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate padding for the first week
    const firstDayIndex = getDay(monthStart);
    const paddingDays = Array.from({ length: firstDayIndex }, (_, i) => i);

    return (
      <div className="cal-grid">
        <div className="cal-header">Sun</div>
        <div className="cal-header">Mon</div>
        <div className="cal-header">Tue</div>
        <div className="cal-header">Wed</div>
        <div className="cal-header">Thu</div>
        <div className="cal-header">Fri</div>
        <div className="cal-header">Sat</div>

        {paddingDays.map((_, index) => (
          <div key={`padding-${index}`} className="cal-day cal-day-empty"></div>
        ))}

        {days.map((day) => {
          const dayReleases = getReleasesForDate(day);
          return (
            <div
              key={day.toString()}
              className={`cal-day ${dayReleases.length > 0 ? "cal-day-release" : ""} ${
                selectedDate && isSameDay(day, selectedDate) ? "cal-day-selected" : ""
              }`}
              onClick={() => handleDateClick(day)}
            >
              <span className="cal-day-number">{format(day, "d")}</span>
              {dayReleases.length > 0 && (
                <div className="cal-day-releases">
                  {dayReleases.slice(0, 2).map((release, index) => (
                    <span key={index} className="cal-day-release-title">
                      {release.title}
                    </span>
                  ))}
                  {dayReleases.length > 2 && <span className="cal-day-more">+{dayReleases.length - 2} more</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div className="cal-loader">Loading calendar...</div>;
  }

  if (error) {
    return <div className="cal-error">Error: {error}</div>;
  }

  return (
    <div className="cal-container">
      <Navbar />
      <div className="cal-main">
        <div className="cal-section">
          <div className="cal-panel">
            <h1>Book Release Calendar</h1>
            <div className="cal-controls">
              <button className="cal-nav-btn" onClick={handlePrevMonth}>
                Previous
              </button>
              <h2 className="cal-month">{format(currentMonth, "MMMM yyyy")}</h2>
              <button className="cal-nav-btn" onClick={handleNextMonth}>
                Next
              </button>
            </div>
            {renderCalendar()}
            {selectedDate && (
              <div className="cal-details">
                <h3>Releases on {format(selectedDate, "MMMM d, yyyy")}</h3>
                {getReleasesForDate(selectedDate).length > 0 ? (
                  <ul className="cal-release-list">
                    {getReleasesForDate(selectedDate).map((release, index) => (
                      <li key={index} className="cal-release-item">
                        <strong>{release.title}</strong> by {release.author}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No releases scheduled for this date.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;