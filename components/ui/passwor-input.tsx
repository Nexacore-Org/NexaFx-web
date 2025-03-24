"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff, Lock } from "lucide-react"

interface PasswordInputProps {
  id: string
  name: string
  label: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  helperText?: string
}

export function PasswordInput({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  error,
  helperText,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-900 mb-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`block w-full pl-10 pr-10 py-2.5 border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
        </button>
      </div>
      {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

