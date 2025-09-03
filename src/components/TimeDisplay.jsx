import React, { useState, useEffect, memo } from "react";

const TimeDisplay = memo(() => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-right truncate">
      <div className="text-[10px] font-medium tracking-tight">
        {currentTime.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })}
      </div>
      <div className="text-[11px] opacity-70">
        {currentTime.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </div>
    </div>
  );
});

TimeDisplay.displayName = "TimeDisplay";

export default TimeDisplay;
