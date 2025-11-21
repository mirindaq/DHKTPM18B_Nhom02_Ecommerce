import { cn } from "@/lib/utils";

interface CustomBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "error" | "warning" | "info" | "secondary";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

export function CustomBadge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  pulse = false,
  className,
}: CustomBadgeProps) {
  const variantStyles = {
    default: "bg-primary/10 text-primary border border-primary/20",
    success: "bg-green-50 text-green-700 border border-green-200",
    error: "bg-red-50 text-red-700 border border-red-200",
    warning: "bg-orange-50 text-orange-700 border border-orange-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
    secondary: "bg-gray-100 text-gray-700 border border-gray-200",
  };

  const sizeStyles = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-0.5 text-xs",
    lg: "px-2.5 py-1 text-sm",
  };

  const dotColors = {
    default: "bg-primary",
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-orange-500",
    info: "bg-blue-500",
    secondary: "bg-gray-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "inline-block w-1.5 h-1.5 rounded-full",
            dotColors[variant],
            pulse && "animate-pulse"
          )}
        />
      )}
      {children}
    </span>
  );
}

interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: "default" | "error";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CountBadge({
  count,
  max = 99,
  variant = "error",
  size = "md",
  className,
}: CountBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  const variantStyles = {
    default: "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
    error: "bg-red-500 text-white shadow-lg shadow-red-500/30",
  };

  const sizeStyles = {
    sm: "min-w-[16px] h-4 text-[10px] px-1",
    md: "min-w-[20px] h-5 text-xs px-1.5",
    lg: "min-w-[24px] h-6 text-sm px-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold border-2 border-white",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {displayCount}
    </span>
  );
}

interface StatusBadgeProps {
  status: "online" | "offline" | "busy" | "away";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusBadge({
  status,
  showLabel = true,
  size = "md",
  className,
}: StatusBadgeProps) {
  const statusConfig = {
    online: {
      color: "bg-green-500",
      label: "Đang hoạt động",
    },
    offline: {
      color: "bg-gray-400",
      label: "Offline",
    },
    busy: {
      color: "bg-red-500",
      label: "Bận",
    },
    away: {
      color: "bg-orange-500",
      label: "Vắng mặt",
    },
  };

  const sizeStyles = {
    sm: { dot: "w-1.5 h-1.5", text: "text-xs" },
    md: { dot: "w-2 h-2", text: "text-xs" },
    lg: { dot: "w-2.5 h-2.5", text: "text-sm" },
  };

  const config = statusConfig[status];
  const sizes = sizeStyles[size];

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "inline-block rounded-full",
          config.color,
          sizes.dot,
          status === "online" && "animate-pulse"
        )}
      />
      {showLabel && (
        <span className={cn("text-muted-foreground", sizes.text)}>
          {config.label}
        </span>
      )}
    </span>
  );
}

