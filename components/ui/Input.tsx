import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

function Input({
  className,
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  id,
  ...props
}: InputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-muted-foreground [&_svg]:size-4 pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive/20",
            leftIcon && "pl-9",
            rightIcon && "pr-9",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 text-muted-foreground [&_svg]:size-4 pointer-events-none">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${inputId}-helper`} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}

export { Input };
