import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  BarChart3,
  Trash2,
} from "lucide-react";
import { ProgressCircle } from "./components/ProgressCircle";
import AnalyticsPanel from "./components/AnalyticsPanel";
import DailyProgress from "./components/DailyProgress";
import TimeDisplay from "./components/TimeDisplay";
import threeMonthsData from "./three_months_data.json";

const DEFAULT_TASKS = [
  {
    id: "wakeup",
    title: "Wakeup",
    time: "06:00",
    category: "routine",
    notes: "Hydrate, sunlight for 5–10 min.",
    done: true,
  },
  {
    id: "study1",
    title: "Study Session 1",
    time: "06:30 – 08:30",
    category: "study",
    notes: "Deep work: Algorithms + DSA. No phone.",
    done: false,
  },
  {
    id: "exercise",
    title: "Exercises & Freshup",
    time: "08:30 – 09:15",
    category: "health",
    notes: "Mobility + light cardio, stretch, shower.",
    done: false,
  },
  {
    id: "study2",
    title: "Study Session 2",
    time: "09:30 – 12:00",
    category: "study",
    notes: "Projects: MERN feature or bugs.",
    done: false,
  },
  {
    id: "nap",
    title: "Short Sleep",
    time: "12:30 – 13:00",
    category: "rest",
    notes: "20–30 min power nap. No alarms after 30.",
    done: false,
  },
  {
    id: "study3",
    title: "Study Session 3",
    time: "14:00 – 16:00",
    category: "study",
    notes: "Interview prep + system design notes.",
    done: false,
  },
  {
    id: "sleep",
    title: "Sleep",
    time: "22:45",
    category: "rest",
    notes: "Screens off an hour before.",
    done: false,
  },
];

const CATEGORY_COLORS = {
  study: "from-sky-400/30 to-violet-400/30",
  health: "from-green-400/30 to-emerald-400/30",
  rest: "from-amber-400/30 to-pink-400/30",
  routine: "from-cyan-400/30 to-blue-400/30",
  other: "from-fuchsia-400/30 to-indigo-400/30",
};

const Glass = ({ className = "", children }) => (
  <div
    className={
      "rounded-3xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-black/20 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] dark:text-white text-gray-800 " +
      className
    }
  >
    {children}
  </div>
);

function useLocalState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const x = localStorage.getItem(key);
      return x ? JSON.parse(x) : initial;
    } catch (_) {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {}
  }, [key, value]);
  return [value, setValue];
}

export default function App() {
  const [tasks, setTasks] = useLocalState("tasks-v2", DEFAULT_TASKS);
  const [expanded, setExpanded] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [themeDark, setThemeDark] = useLocalState("theme-dark", true);
  const [query, setQuery] = useState("");
  const [date, setDate] = useLocalState(
    "date",
    new Date().toISOString().slice(0, 10)
  );
  const [currentTime] = useState(new Date());

  useEffect(() => {
    document.documentElement.classList.toggle("dark", themeDark);
  }, [themeDark]);

  const filtered = useMemo(() => {
    if (!query) return tasks;
    return tasks.filter((t) =>
      [t.title, t.category, t.notes]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [tasks, query]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.done).length;
    return { total, completed };
  }, [tasks]);

  const addTask = () => {
    const id = Math.random().toString(36).slice(2, 8);
    setTasks((prev) => [
      ...prev,
      {
        id,
        title: "New Task",
        time: "--:--",
        category: "other",
        notes: "Describe the task…",
        done: false,
      },
    ]);
  };

  const deleteTask = (id) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));
  const toggleTask = (id) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

  // Get today's data
  const todayData = useMemo(() => {
    const today = currentTime.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return threeMonthsData.find((item) => {
      const [day, month, year] = item.Date.split("-");
      return `${month}/${day}/${year}` === today;
    });
  }, [currentTime]);

  return (
    <div className="h-screen w-full transition-colors duration-500 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0b0f15] dark:to-[#0d1117] text-gray-800 dark:text-gray-200 flex flex-col">
      {/* Animated background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl bg-gradient-to-br from-fuchsia-500/20 to-sky-400/20 dark:from-fuchsia-500/10 dark:to-sky-400/10"
          animate={{ y: [0, 20, -10, 0], x: [0, 10, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl bg-gradient-to-br from-emerald-400/20 to-blue-500/20 dark:from-emerald-400/10 dark:to-blue-500/10"
          animate={{ y: [0, -20, 15, 0], x: [0, -10, 10, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto h-screen  flex flex-col">
        {/* Header */}
        <div className="h-[10vh] p-2 flex items-center justify-between w-[100%] mx-auto">
          {/* Left side - Analytics */}
          <button
            onClick={() => setShowAnalytics((s) => !s)}
            className="p-3 hover:bg-white/5 rounded-2xl backdrop-blur-md hover:shadow-lg active:scale-95 transition flex items-center justify-center"
            title="Toggle analytics"
          >
            <BarChart3 className="h-6 w-6" />
          </button>

          {/* Center - Title */}
          <motion.div
            className="flex-1 text-center px-8 cursor-pointer"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 tracking-tight"
              onClick={() => setThemeDark((v) => !v)}
            >
              SyncTask
            </h1>
          </motion.div>

          {/* Right side - Progress and Time */}
          <div className="flex items-center gap-3 py-3 rounded-2xl backdrop-blur-md transition-all">
            <TimeDisplay />
            <div
              className="relative cursor-pointer"
              onClick={() => setShowProgress(true)}
            >
              <ProgressCircle
                progress={(stats.completed / stats.total) * 100}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                {Math.round((stats.completed / stats.total) * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div className="mx-2 mb-2 grid lg:grid-cols-3 gap-6">
          {/* Phone-like stack */}
          <div className="lg:col-span-2">
            <Glass className="p-2 h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
              <Reorder.Group
                axis="y"
                values={tasks}
                onReorder={setTasks}
                className="space-y-3"
              >
                {filtered.map((task) => (
                  <Reorder.Item key={task.id} value={task}>
                    <TaskCard
                      task={task}
                      expanded={expanded}
                      setExpanded={setExpanded}
                      onToggle={() => toggleTask(task.id)}
                      onDelete={() => deleteTask(task.id)}
                      onUpdate={(patch) =>
                        setTasks((prev) =>
                          prev.map((t) =>
                            t.id === task.id ? { ...t, ...patch } : t
                          )
                        )
                      }
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </Glass>
          </div>

          {/* Analytics Popup */}
          <AnimatePresence>
            {showAnalytics && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                onClick={() => setShowAnalytics(false)}
              >
                <motion.div
                  className="w-[90%] max-w-4xl m-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AnalyticsPanel />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Popup */}
          <AnimatePresence>
            {showProgress && (
              <DailyProgress
                todayData={todayData}
                currentTime={currentTime}
                onClose={() => setShowProgress(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  expanded,
  setExpanded,
  onToggle,
  onDelete,
  onUpdate,
}) {
  const isOpen = expanded === task.id;
  const categoryShade = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.other;

  return (
    <Glass
      className={`relative overflow-hidden px-4 pt-3 ${
        task.done ? "opacity-80" : ""
      }`}
    >
      {/* Accent gradient stripe */}
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${categoryShade}`}
      />

      <div className="flex items-center gap-3 pb-2">
        <button
          onClick={onToggle}
          className="p-2 rounded-2xl border border-white/20 bg-white/10 hover:shadow-lg active:scale-95 transition"
          title={task.done ? "Mark as not done" : "Mark as done"}
        >
          {task.done ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <div
              // value={task.title}
              // onChange={(e) => onUpdate({ title: e.target.value })}
              className="bg-transparent text-base font-semibold outline-none w-full dark:text-gray-200 text-gray-800"
            >
              {task.title}
            </div>
            <span className="text-xs opacity-80 whitespace-nowrap">
              {task.time}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[11px] rounded-full border border-white/20 bg-white/10 px-2 py-0.5 backdrop-blur">
              {task.category}
            </span>
            <span className="text-[11px] opacity-80">
              {task.done ? "Completed" : "Planned"}
            </span>
          </div>
        </div>
        <button
          onClick={() => setExpanded(isOpen ? null : task.id)}
          className="p-2 rounded-2xl border border-white/20 bg-white/10 hover:shadow-lg active:scale-95 transition"
          title="Show details"
        >
          <ChevronDown
            className={`h-5 w-5 transition ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs opacity-80">Time</label>
                <input
                  value={task.time}
                  onChange={(e) => onUpdate({ time: e.target.value })}
                  className="w-full rounded-xl border border-white/20 dark:border-white/10 dark:bg-black/20 bg-white/70 px-3 py-2 outline-none backdrop-blur dark:text-gray-200 text-gray-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs opacity-80">Category</label>
                <select
                  value={task.category}
                  onChange={(e) => onUpdate({ category: e.target.value })}
                  className="w-full rounded-xl border border-white/20 dark:border-white/10 dark:bg-black/20 bg-white/70 px-3 py-2 outline-none backdrop-blur dark:text-gray-200 text-gray-800"
                >
                  {Object.keys(CATEGORY_COLORS).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs opacity-80">Notes</label>
                <textarea
                  value={task.notes}
                  onChange={(e) => onUpdate({ notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-white/20 dark:border-white/10 dark:bg-black/20 bg-white/70 px-3 py-2 outline-none backdrop-blur dark:text-gray-200 text-gray-800"
                />
              </div>
              <div className="flex items-center justify-between sm:col-span-2">
                <button
                  onClick={onToggle}
                  className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md transition hover:shadow-xl active:scale-95"
                >
                  {task.done ? "Mark as Not Done" : "Mark as Done"}
                </button>
                <button
                  onClick={onDelete}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-red-300 backdrop-blur-md transition hover:shadow-xl active:scale-95"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
            <div
              className={`mt-3 h-0.5 w-full bg-gradient-to-r ${categoryShade}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Glass>
  );
}
