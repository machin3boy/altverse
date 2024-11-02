import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hideControls?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, hideControls = false, ...props }, ref) => {
    const isNumber = type === 'number';
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          // Add specific styles for number inputs
          isNumber && hideControls && "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          // If not hiding controls, style them
          isNumber && !hideControls && `
            [&::-webkit-outer-spin-button]:opacity-100 
            [&::-webkit-inner-spin-button]:opacity-100
            [&::-webkit-inner-spin-button]:h-full
            [&::-webkit-inner-spin-button]:m-0
            [&::-webkit-inner-spin-button]:cursor-pointer
            [&::-webkit-inner-spin-button]:hover:bg-accent
            [&::-webkit-inner-spin-button]:rounded-r-md
          `,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }