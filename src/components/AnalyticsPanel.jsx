import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  // PieChart,
  // Pie,
  // BarChart,
  // Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  // Cell,
  LineChart,
  Line,
} from "recharts";
import { Glass } from "./Glass";
import threeMonthsData from "../three_months_data.json";

// Add styles to remove focus outlines
const globalStyles = `
  .recharts-wrapper {
    outline: none !important;
  }
  .recharts-surface {
    outline: none !important;
  }
`;

const COLORS = [
  "#60a5fa",
  "#34d399",
  "#fb7185",
  "#a78bfa",
  "#22d3ee",
  "#fbbf24",
];

const CATEGORIES = [
  "Score",
  "Study",
  "SS1",
  "SS2",
  "SS3",
  "Health",
  "Routine",
  "Rest",
];

const categoriesMaxRange = {
  Score: 100,
  Study: 45,
  SS1: 15,
  SS2: 15,
  SS3: 15,
  Health: 15,
  Routine: 25,
  Rest: 15,
};

const TIME_RANGES = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

function AnalyticsPanel() {
  const [activeView, setActiveView] = useState("trends");
  const [timeRange, setTimeRange] = useState("daily");
  const [selectedCategories, setSelectedCategories] = useState([
    "Score",
    "Study",
    "SS1",
    "SS2",
    "SS3",
    "Health",
    "Routine",
    "Rest",
  ]);
  const [chartData, setChartData] = useState([]);
  const [dataOffset, setDataOffset] = useState(0);
  const [hasMorePrevData, setHasMorePrevData] = useState(false);
  const [hasMoreNextData, setHasMoreNextData] = useState(false);

  // const navItems = [
  //   { id: "overview", icon: "📊", label: "Overview" },
  //   { id: "study", icon: "📚", label: "Study Analysis" },
  //   { id: "health", icon: "🏃", label: "Health & Routine" },
  //   { id: "trends", icon: "📈", label: "Trends" },
  // ];

  const calculateStudyScore = (categories) => {
    return categories.SS1 + categories.SS2 + categories.SS3 || 0;
  };

  const processData = (data, range, offset = 0) => {
    let processedData = [];

    // Reset navigation flags
    setHasMorePrevData(false);
    setHasMoreNextData(false);

    switch (range) {
      case "daily":
        const dailyStartIndex = data.length - 7 - offset;
        const dailyEndIndex = data.length - offset;

        // Check if we have more data in either direction
        setHasMorePrevData(dailyStartIndex > 0);
        setHasMoreNextData(offset > 0);

        processedData = data
          .slice(Math.max(0, dailyStartIndex), dailyEndIndex)
          .map((day) => ({
            date: new Date(
              day.Date.split("-").reverse().join("-")
            ).toLocaleDateString("en-US", { weekday: "short" }),
            Score: day.Score,
            Study: calculateStudyScore(day.Categories),
            ...day.Categories,
          }));
        break;

      case "weekly":
        const weeks = {};
        let currentDate = new Date();
        let pastDate = new Date();
        let futureDate = new Date(currentDate);

        // Adjust dates based on offset
        currentDate.setDate(currentDate.getDate() - offset * 28);
        pastDate.setDate(currentDate.getDate() - 28);
        futureDate.setDate(currentDate.getDate() + 28);

        // Check if we have more data in either direction
        const hasEarlierWeeks = data.some(
          (item) =>
            new Date(item.Date.split("-").reverse().join("-")) < pastDate
        );
        const hasLaterWeeks = data.some(
          (item) =>
            new Date(item.Date.split("-").reverse().join("-")) > currentDate
        );

        setHasMorePrevData(hasEarlierWeeks);
        setHasMoreNextData(hasLaterWeeks && offset > 0);

        data.forEach((day) => {
          const date = new Date(day.Date.split("-").reverse().join("-"));
          if (date < pastDate) return; // Skip if older than 4 weeks

          // Calculate week number from the end (0 is current week)
          const timeDiff = currentDate - date;
          const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const weekNum = Math.floor(daysDiff / 7);
          const weekKey = `Week ${4 - weekNum}`;
          console.log(
            currentDate,
            pastDate,
            futureDate,
            daysDiff,
            weekNum,
            weekKey
          );

          if (!weeks[weekKey]) {
            weeks[weekKey] = {
              days: [],
              count: 0,
              Score: 0,
              Study: 0,
              SS1: 0,
              SS2: 0,
              SS3: 0,
              Health: 0,
              Routine: 0,
              Rest: 0,
            };
          }

          weeks[weekKey].days.push(day);
          weeks[weekKey].count++;
          weeks[weekKey].Score += day.Score;
          weeks[weekKey].Study += calculateStudyScore(day.Categories);
          Object.entries(day.Categories).forEach(([key, value]) => {
            weeks[weekKey][key] += value;
          });
          console.log(weeks);
        });

        processedData = Object.entries(weeks)
          .sort(
            (a, b) =>
              parseInt(a[0].split(" ")[1]) - parseInt(b[0].split(" ")[1])
          ) // Sort by week number
          .map(([week, data]) => {
            // Convert raw scores to percentages based on category maximums
            return {
              date: week,
              Score: Math.round(
                (data.Score / data.count) * (100 / categoriesMaxRange.Score)
              ),
              Study: Math.round(
                (data.Study / data.count) * (100 / categoriesMaxRange.Study)
              ),
              SS1: Math.round(
                (data.SS1 / data.count) * (100 / categoriesMaxRange.SS1)
              ),
              SS2: Math.round(
                (data.SS2 / data.count) * (100 / categoriesMaxRange.SS2)
              ),
              SS3: Math.round(
                (data.SS3 / data.count) * (100 / categoriesMaxRange.SS3)
              ),
              Health: Math.round(
                (data.Health / data.count) * (100 / categoriesMaxRange.Health)
              ),
              Routine: Math.round(
                (data.Routine / data.count) * (100 / categoriesMaxRange.Routine)
              ),
              Rest: Math.round(
                (data.Rest / data.count) * (100 / categoriesMaxRange.Rest)
              ),
              daysCount: data.count, // Include days count for reference
            };
          });
        break;

      case "monthly":
        const months = {};
        const today = new Date();
        const monthStart = new Date(today);
        const futureMonth = new Date(today);

        // Adjust dates based on offset
        today.setMonth(today.getMonth() - offset * 4);
        monthStart.setMonth(today.getMonth() - 4);
        futureMonth.setMonth(today.getMonth() + 4);

        // Check if we have more data in either direction
        const hasEarlierMonths = data.some(
          (item) =>
            new Date(item.Date.split("-").reverse().join("-")) < monthStart
        );
        const hasLaterMonths = data.some(
          (item) => new Date(item.Date.split("-").reverse().join("-")) > today
        );

        setHasMorePrevData(hasEarlierMonths);
        setHasMoreNextData(hasLaterMonths && offset > 0);

        // First pass: group data by months and collect only last 4 months
        data.forEach((day) => {
          const date = new Date(day.Date.split("-").reverse().join("-"));
          if (date < monthStart) return; // Skip if older than 4 months

          // Get month name and calculate month number from current date
          const monthName = date.toLocaleString("en-US", { month: "short" });
          const monthDiff =
            (today.getFullYear() - date.getFullYear()) * 12 +
            (today.getMonth() - date.getMonth());
          const monthKey = `${monthName}`;

          if (!months[monthKey]) {
            months[monthKey] = {
              monthNumber: monthDiff,
              days: [],
              count: 0,
              Score: 0,
              Study: 0,
              SS1: 0,
              SS2: 0,
              SS3: 0,
              Health: 0,
              Routine: 0,
              Rest: 0,
            };
          }

          months[monthKey].days.push(day);
          months[monthKey].count++;
          months[monthKey].Score += day.Score;
          months[monthKey].Study += calculateStudyScore(day.Categories);
          Object.entries(day.Categories).forEach(([key, value]) => {
            months[monthKey][key] += value;
          });
        });

        // Calculate total days in current month for percentage adjustment
        const getDaysInMonth = (date) => {
          return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        };
        const currentMonthDays = getDaysInMonth(today);

        // Process each month's data with percentage calculations
        processedData = Object.entries(months)
          .sort((a, b) => b[1].monthNumber - a[1].monthNumber) // Sort by month number (most recent first)
          .slice(-4) // Take only last 4 months
          .map(([month, data]) => {
            // For current month, adjust calculations based on days passed
            const daysMultiplier =
              month === today.toLocaleString("en-US", { month: "short" })
                ? currentMonthDays / data.count // Adjust for partial current month
                : 1; // No adjustment needed for past months

            // Calculate percentage of the maximum possible value for each category
            const getPercentage = (value, maxRange) => {
              return Math.round((value / data.count) * (100 / maxRange));
            };

            return {
              date: month,
              Score: getPercentage(data.Score, categoriesMaxRange.Score),
              Study: getPercentage(data.Study, categoriesMaxRange.Study),
              SS1: getPercentage(data.SS1, categoriesMaxRange.SS1),
              SS2: getPercentage(data.SS2, categoriesMaxRange.SS2),
              SS3: getPercentage(data.SS3, categoriesMaxRange.SS3),
              Health: getPercentage(data.Health, categoriesMaxRange.Health),
              Routine: getPercentage(data.Routine, categoriesMaxRange.Routine),
              Rest: getPercentage(data.Rest, categoriesMaxRange.Rest),
              daysCount: data.count, // Include days count for reference
            };
          });
        break;
    }

    setChartData(processedData);

    // const totals = processedData.reduce((acc, curr) => {
    //   selectedCategories.forEach((cat) => {
    //     if (curr[cat]) {
    //       acc[cat] = (acc[cat] || 0) + curr[cat];
    //     }
    //   });
    //   return acc;
    // }, {});

    // const pieDataTemp = Object.entries(totals).map(([name, value]) => ({
    //   name,
    //   value: Math.round(value / processedData.length),
    // }));

    // setPieData(pieDataTemp);
  };

  useEffect(() => {
    processData(threeMonthsData, timeRange, dataOffset);
  }, [timeRange, selectedCategories, dataOffset]);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // const Overview = () => (
  //   <div>
  //     <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
  //     <div className="h-64">
  //       <ResponsiveContainer width="100%" height="100%">
  //         <BarChart data={chartData}>
  //           <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
  //           <XAxis dataKey="date" />
  //           <YAxis domain={[0, 100]} />
  //           <Tooltip
  //             contentStyle={{
  //               background: "rgba(255,255,255,0.1)",
  //               backdropFilter: "blur(8px)",
  //               border: "1px solid rgba(255,255,255,0.2)",
  //               borderRadius: 12,
  //             }}
  //           />
  //           {selectedCategories.map((category, index) => (
  //             <Bar
  //               key={category}
  //               dataKey={category}
  //               fill={COLORS[index % COLORS.length]}
  //               radius={[4, 4, 0, 0]}
  //             />
  //           ))}
  //         </BarChart>
  //       </ResponsiveContainer>
  //     </div>
  //   </div>
  // );

  // const StudyView = () => (
  //   <div>
  //     <h3 className="text-lg font-semibold mb-4">Study Analysis</h3>
  //     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  //       <div className="p-4 rounded-xl bg-white/5 border border-white/10">
  //         <h4 className="text-sm opacity-70 mb-2">Daily Study Hours</h4>
  //         <div className="text-3xl font-bold">
  //           {chartData[chartData.length - 1]?.Study || 0}
  //           <span className="text-sm opacity-50 ml-1">hrs</span>
  //         </div>
  //       </div>
  //       <div className="p-4 rounded-xl bg-white/5 border border-white/10">
  //         <h4 className="text-sm opacity-70 mb-2">Study Streak</h4>
  //         <div className="text-3xl font-bold">
  //           {chartData.filter((d) => d.Study > 0).length}
  //           <span className="text-sm opacity-50 ml-1">days</span>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  // const HealthView = () => (
  //   <div>
  //     <h3 className="text-lg font-semibold mb-4">Health & Routine</h3>
  //     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  //       <div className="p-4 rounded-xl bg-white/5 border border-white/10">
  //         <h4 className="text-sm opacity-70 mb-2">Health Score</h4>
  //         <div className="text-3xl font-bold">
  //           {chartData[chartData.length - 1]?.Health || 0}%
  //         </div>
  //       </div>
  //       <div className="p-4 rounded-xl bg-white/5 border border-white/10">
  //         <h4 className="text-sm opacity-70 mb-2">Routine Score</h4>
  //         <div className="text-3xl font-bold">
  //           {chartData[chartData.length - 1]?.Routine || 0}%
  //         </div>
  //       </div>
  //       <div className="p-4 rounded-xl bg-white/5 border border-white/10">
  //         <h4 className="text-sm opacity-70 mb-2">Rest Score</h4>
  //         <div className="text-3xl font-bold">
  //           {chartData[chartData.length - 1]?.Rest || 0}%
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  const TrendsView = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Performance Trends</h3>
        <div className="flex gap-2">
          {hasMorePrevData && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              onClick={() => setDataOffset((prev) => prev + 1)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </motion.button>
          )}
          {hasMoreNextData && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              onClick={() => setDataOffset((prev) => prev - 1)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.button>
          )}
        </div>
      </div>
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} style={{ outline: "none" }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="date" />
            <YAxis
            // domain={selectedCategories.map((category) =>
            //   (category === "Score" || category === "Study")
            //     ? [0, 100]
            //     : [0, 30]
            // )}
            // domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 12,
              }}
            />
            {selectedCategories.map((category, index) => (
              <Line
                key={category}
                type="monotone"
                dataKey={category}
                stroke={COLORS[index % COLORS.length]}
                dot={{ fill: COLORS[index % COLORS.length] }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <Glass className="p-4 h-full">
      <style>{globalStyles}</style>
      {/* Header */}
      <div className="flex items-center justify-between pb-6">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
          Analytics
        </div>
        <div className="flex gap-2">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => {
                setTimeRange(range.value);
                setDataOffset(0); // Reset offset when changing time range
              }}
              className={`px-2 py-1 rounded-xl transition-all ${
                timeRange === range.value
                  ? "bg-white/20 shadow-lg"
                  : "hover:bg-white/10"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => toggleCategory(category)}
            className={`px-3 py-1 rounded-xl border transition-all ${
              selectedCategories.includes(category)
                ? "border-white/40 bg-white/20 shadow-lg"
                : "border-white/20 hover:bg-white/10"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {/* {activeView === "overview" && <Overview />}
          {activeView === "study" && <StudyView />}
          {activeView === "health" && <HealthView />} */}
          {activeView === "trends" && <TrendsView />}
        </motion.div>
      </AnimatePresence>

      {/* Floating Navigation */}
      {/* <motion.div
        className="fixed bottom-24 right-6 z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => setShowFloatingNav((prev) => !prev)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {showFloatingNav ? "✕" : "≡"}
        </motion.button>

        <AnimatePresence>
          {showFloatingNav && (
            <motion.div
              className="absolute bottom-16 right-0 bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20 shadow-xl"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeView === item.id
                      ? "bg-white/20 shadow-lg"
                      : "hover:bg-white/10"
                  }`}
                  onClick={() => {
                    setActiveView(item.id);
                    setShowFloatingNav(false);
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="whitespace-nowrap">{item.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div> */}
    </Glass>
  );
}

export default AnalyticsPanel;
