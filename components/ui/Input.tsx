import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => (
    <div>
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-2.5 bg-muted border border-border rounded-md",
          "focus:outline-none focus:ring-2 focus:ring-[#F39A00] transition-all text-sm text-foreground",
          "placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-destructive focus:ring-destructive/30",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
);

Input.displayName = "Input";

export { Input };
