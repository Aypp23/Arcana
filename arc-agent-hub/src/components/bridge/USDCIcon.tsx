interface USDCIconProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const USDCIcon = ({ size = "lg", className = "" }: USDCIconProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-20 w-20",
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer glow */}
        <circle cx="50" cy="50" r="48" fill="url(#usdc-gradient)" />
        {/* Inner ring */}
        <circle cx="50" cy="50" r="38" stroke="white" strokeWidth="3" strokeOpacity="0.9" fill="none" />
        {/* Dollar sign */}
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fill="white"
          fontSize="32"
          fontWeight="bold"
          fontFamily="system-ui, sans-serif"
        >
          $
        </text>
        {/* Outer arcs */}
        <path
          d="M 50 8 A 42 42 0 0 1 92 50"
          stroke="white"
          strokeWidth="3"
          strokeOpacity="0.6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 50 92 A 42 42 0 0 1 8 50"
          stroke="white"
          strokeWidth="3"
          strokeOpacity="0.6"
          fill="none"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="usdc-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(210, 100%, 60%)" />
            <stop offset="100%" stopColor="hsl(210, 100%, 45%)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
