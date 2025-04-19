import React, { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, setMonth, setYear, setDate } from "date-fns";
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

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    setCurrentMonth(setMonth(currentMonth, newMonth));
    setSelectedDate(null);
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setCurrentMonth(setYear(currentMonth, newYear));
    setSelectedDate(null);
  };

  const handleDateChange = (e) => {
    const newDate = parseInt(e.target.value);
    const newSelectedDate = setDate(currentMonth, newDate);
    setCurrentMonth(newSelectedDate);
    setSelectedDate(newSelectedDate);
  };

  const getReleasesForDate = (date) => {
    return releases.filter((release) => isSameDay(new Date(release.releaseDate), date));
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 21 }, (_, i) => 2015 + i); // 2015 to 2035
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  }).map((day) => format(day, "d"));

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

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
    <div className="cal-container1">
      <Navbar />
      <div className="cal-main">
        <div className="cal-section">
          <div className="cal-panel">
            <h1 className="cal-title">Book Release Calendar</h1>
            <div className="cal-controls">
              <button className="cal-nav-btn cal-nav-btn-prev" onClick={handlePrevMonth}>
                <svg className="cal-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="cal-date-selector">
                <select
                  className="cal-select"
                  value={format(currentMonth, "M") - 1}
                  onChange={handleMonthChange}
                >
                  {months.map((month, index) => (
                    <option key={month} value={index}>{month}</option>
                  ))}
                </select>
                <select
                  className="cal-select"
                  value={format(currentMonth, "d")}
                  onChange={handleDateChange}
                >
                  {daysInMonth.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <select
                  className="cal-select"
                  value={format(currentMonth, "yyyy")}
                  onChange={handleYearChange}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <button className="cal-nav-btn cal-nav-btn-next" onClick={handleNextMonth}>
                <svg className="cal-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
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
                  <p className="text-gray-300">No releases scheduled for this date.</p>
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