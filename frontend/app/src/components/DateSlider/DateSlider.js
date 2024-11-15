import React, { useState } from 'react';
import Slider from 'react-slider';
import './DateSlider.css'; 

const DateSlider = ({ minDate, maxDate, onDateChange }) => {
  const [selectedDate, setSelectedDate] = useState(minDate);

  const handleSliderChange = (value) => {
    const newDate = new Date(minDate);
    newDate.setDate(minDate.getDate() + value);
    setSelectedDate(newDate);
    onDateChange(newDate);
  };

  const getDateArray = () => {
    const dateArray = [];
    let currentDate = new Date(minDate);

    while (currentDate <= maxDate) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
  };

  const dateArray = getDateArray();

  return (
    <div className="date-slider-container">
      <Slider
        min={0}
        max={dateArray.length - 1}
        value={dateArray.findIndex((date) => date.toDateString() === selectedDate.toDateString())}
        onChange={handleSliderChange}
        renderTrack={(props, state) => <div {...props} className="slider-track" />}
        renderThumb={(props, state) => <div {...props} className="slider-thumb" />}
        marks
        step={1}
      />
      <div className="date-labels">
        {dateArray.map((date, index) => (
          <div key={index} className="date-label">
            {date.getDate()}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DateSlider;
