import React from "react";

export function Avatar({ initials, color = "#4f46e5", size = "md" }: { initials: string; color?: string; size?: "sm" | "md" | "lg" }) {
  const s = size === "sm" ? "w-7 h-7 text-xs" : size === "lg" ? "w-12 h-12 text-base" : "w-9 h-9 text-sm";
  return (
    <div className={`${s} rounded-full flex items-center justify-center font-bold text-white shrink-0`} style={{ backgroundColor: color }}>
      {initials}
    </div>
  );
}
