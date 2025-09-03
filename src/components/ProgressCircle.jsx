import React from "react";
import { motion } from "framer-motion";

export function ProgressCircle({ progress, size = 41 }) {
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dash = (progress * circumference) / 100;

  // Calculate color based on progress
  const getColor = (progress) => {
    if (progress < 30) return "rgb(239, 68, 68)"; // red-500
    if (progress < 70) return "rgb(234, 179, 8)"; // yellow-500
    return "rgb(34, 197, 94)"; // green-500
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="transform -rotate-90 relative"
      style={{
        filter: `drop-shadow(0 0 ${progress / 20}px ${getColor(progress)})`,
      }}
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        className="stroke-white/10"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
        className="transition-all duration-300"
        initial={{
          strokeDasharray: `${0} ${circumference}`,
          stroke: getColor(0),
        }}
        animate={{
          strokeDasharray: `${dash} ${circumference}`,
          stroke: getColor(progress),
        }}
        transition={{
          strokeDasharray: { duration: 1.5, ease: "easeInOut" },
          stroke: { duration: 0.5 },
        }}
      />
    </motion.svg>
  );
}
