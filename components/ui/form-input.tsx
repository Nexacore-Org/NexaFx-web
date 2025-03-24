"use client"

import type React from "react"

interface FormInputProps {
  id: string
  name: string
  label: string
  placeholder?: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  icon?: React.ReactNode
}

export function FormInput({
  id,
  name,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
  icon,
}: FormInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-900 mb-1">
        {label}
      </label>
      <div className="relative">
        {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>}
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`block w-full ${icon ? "pl-10" : "pl-3"} pr-3 py-2.5 border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

