"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { User, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { FormInput } from "../ui/form-input"
import { PasswordInput } from "../ui/passwor-input"

export default function SignUpForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const validateForm = () => {
    let valid = true
    const newErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: "",
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
      valid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
      valid = false
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
      valid = false
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
      valid = false
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must include uppercase, lowercase, and numbers"
      valid = false
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      valid = false
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        // Here you would typically call an API endpoint
        console.log("Form submitted:", formData)

        // Simulate successful signup
        // router.push("/auth/verification");
      } catch (error) {
        console.error("Signup error:", error)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormInput
        id="fullName"
        name="fullName"
        label="Full Name"
        placeholder="John Doe"
        icon={<User className="h-5 w-5 text-gray-400" />}
        value={formData.fullName}
        onChange={handleChange}
        error={errors.fullName}
      />

      <FormInput
        id="email"
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        icon={<Mail className="h-5 w-5 text-gray-400" />}
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />

      <PasswordInput
        id="password"
        name="password"
        label="Password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        helperText="Password must be at least 8 characters with uppercase, lowercase, and numbers"
      />

      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm Password"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
      />

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="agreeToTerms"
            name="agreeToTerms"
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="agreeToTerms" className="text-gray-700">
            I agree to the{" "}
            <Link href="/terms" className="text-blue-500 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-500 hover:underline">
              Privacy Policy
            </Link>
          </label>
          {errors.agreeToTerms && <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>}
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Create Account
      </button>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-blue-500 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  )
}

