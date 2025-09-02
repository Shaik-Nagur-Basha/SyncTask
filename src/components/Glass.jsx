export const Glass = ({ className = "", children }) => (
  <div
    className={
      "rounded-3xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-black/20 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] dark:text-white text-gray-800 " +
      className
    }
  >
    {children}
  </div>
);
