import { Clock } from "lucide-react";

interface NetworkIconProps {
  type?: "op" | "arc" | "clock" | "cctp";
  size?: "sm" | "md";
  iconUrl?: string;
}

export const NetworkIcon = ({ type, size = "md", iconUrl }: NetworkIconProps) => {
  const sizeClasses = size === "sm" ? "h-6 w-6" : "h-10 w-10";
  const innerSize = size === "sm" ? "h-4 w-4" : "h-6 w-6";

  if (iconUrl) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-secondary/10 flex items-center justify-center border border-border/30 overflow-hidden`}>
        <img src={iconUrl} alt={type || "network"} className={`${innerSize} object-contain`} />
      </div>
    );
  }

  if (type === "clock") {
    return (
      <div className={`${sizeClasses} rounded-xl bg-secondary flex items-center justify-center border border-border`}>
        <Clock className={`${innerSize} text-foreground`} />
      </div>
    );
  }

  // Fallback for legacy types if needed, though we primarily use iconUrl now
  if (type === "op") {
    return (
      <div className={`${sizeClasses} rounded-xl bg-[#FF0420] flex items-center justify-center`}>
        <svg viewBox="0 0 24 24" fill="none" className={innerSize}>
          <circle cx="12" cy="12" r="6" stroke="white" strokeWidth="2" fill="none" />
          <circle cx="12" cy="12" r="2" fill="white" />
        </svg>
      </div>
    );
  }

  if (type === "arc") {
    return (
      <div className={`${sizeClasses} rounded-xl bg-[#1a3a3a] flex items-center justify-center border border-[#2dd4bf]/30`}>
        <span className="text-[#2dd4bf] font-bold text-sm">A</span>
      </div>
    );
  }

  if (type === "cctp") {
    return (
      <div className={`${sizeClasses} rounded-full bg-primary/20 flex items-center justify-center`}>
        <svg viewBox="0 0 24 24" fill="none" className={innerSize}>
          <circle cx="8" cy="12" r="3" fill="currentColor" className="text-primary" />
          <circle cx="16" cy="12" r="3" fill="currentColor" className="text-primary" />
        </svg>
      </div>
    );
  }

  return null;
};
