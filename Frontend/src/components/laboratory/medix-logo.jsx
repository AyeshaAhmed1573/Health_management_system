export function MedixLogo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="40" height="40" rx="8" fill="#6FB3B5" />
        <path
          d="M20 10V30M10 20H30"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-2xl font-semibold text-[#2F3A40]">Medix</span>
    </div>
  );
}
