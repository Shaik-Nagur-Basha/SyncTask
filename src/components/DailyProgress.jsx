import React, { memo } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell } from "recharts";
import { Glass } from "./Glass";

const CATEGORIES_DISPLAY = ["Health", "Routine", "Rest", "SS1", "SS2", "SS3"];
const PIE_COLORS = [
  "#4ade80",
  "#60a5fa",
  "#f472b6",
  "#a78bfa",
  "#2dd4bf",
  "#facc15",
];

const DailyProgress = memo(({ todayData, currentTime, onClose }) => {
  const pieData = CATEGORIES_DISPLAY.map((category) => ({
    name: category,
    value: todayData?.Categories[category] || 0,
    maxValue: category === "Routine" ? 25 : category === "Study" ? 45 : 15,
  }));

  const totalStudy = todayData
    ? todayData.Categories.SS1 +
      todayData.Categories.SS2 +
      todayData.Categories.SS3
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <Glass
        className="w-[90%] max-w-lg m-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Today's Progress</h3>
          <div className="text-sm opacity-70">
            {currentTime.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
            })}
          </div>
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="w-64 h-64 relative">
            <PieChart width={256} height={256}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <div className="text-3xl font-bold">{todayData?.Score || 0}</div>
              <div className="text-sm opacity-70">Total Score</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {pieData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                }}
              />
              <span className="text-sm">{entry.name}</span>
              <span className="text-sm ml-auto">
                {Math.round((entry.value / entry.maxValue) * 100)}%
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-sm opacity-70">Score</div>
            <div className="text-2xl font-semibold">
              {todayData?.Score || 0}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm opacity-70">Study</div>
            <div className="text-2xl font-semibold">
              {Math.ceil((totalStudy * 100) / 45)}
            </div>
          </div>
        </div>
      </Glass>
    </motion.div>
  );
});

DailyProgress.displayName = "DailyProgress";

export default DailyProgress;
