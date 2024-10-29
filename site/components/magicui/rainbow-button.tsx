import React from "react";

import { cn } from "@/lib/utils";
interface RainbowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function RainbowButton({
  children,
  className,
  ...props
}: RainbowButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex h-11 animate-[rainbow_8s_ease_infinite] cursor-pointer items-center justify-center rounded-md border-0 bg-[length:200%] px-8 py-2 font-medium text-white transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.12*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
 
        // before styles - extended glow
        "before:absolute before:bottom-[-20%] before:left-0 before:z-0 before:h-1/5 before:w-full before:animate-[rainbow_8s_ease_infinite] before:bg-[linear-gradient(90deg,#92400e,#d97706,#0ea5e9,#f59e0b,#78350f)] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))]",
 
        // dark mode colors (default) - more amber focused
        "bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,#92400e,#d97706,#0ea5e9,#f59e0b,#78350f)]",
 
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
