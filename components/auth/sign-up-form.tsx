"use client"

import { useFormik } from "formik"
import Link from "next/link"
import { User, Mail } from "lucide-react"
import { FormInput } from "../ui/form-input"
import { PasswordInput } from "../ui/passwor-input"
import { Button } from "../ui/button"
import { signUpSchema } from "@/utils/authValidationSchema"

export default function SignUpForm() {
  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
    validationSchema: signUpSchema,
    onSubmit: async (values) => {
      try {
        console.log("Form submitted:", values)
      } catch (error) {
        console.error("Signup error:", error)
      }
    },
  })

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <FormInput
        id="fullName"
        name="fullName"
        label="Full Name"
        placeholder="John Doe"
        icon={<User className="h-5 w-5 text-gray-400" />}
        value={formik.values.fullName}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.fullName && formik.errors.fullName}
      />

      <FormInput
        id="email"
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        icon={<Mail className="h-5 w-5 text-gray-400" />}
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && formik.errors.email}
      />

      <PasswordInput
        id="password"
        name="password"
        label="Password"
        placeholder="••••••••"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && formik.errors.password}
        helperText="Password must be at least 8 characters with uppercase, lowercase, and numbers"
      />

      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm Password"
        placeholder="••••••••"
        value={formik.values.confirmPassword}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.confirmPassword && formik.errors.confirmPassword}
      />

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="agreeToTerms"
            name="agreeToTerms"
            type="checkbox"
            checked={formik.values.agreeToTerms}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="agreeToTerms" className="text-gray-700 font-bold">
            I agree to the{" "}
            <Link href="/terms" className="text-blue-500 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-500 hover:underline">
              Privacy Policy
            </Link>
          </label>
          {formik.touched.agreeToTerms && formik.errors.agreeToTerms && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.agreeToTerms}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        size={"lg"}
        className="w-full bg-gradient-to-r from-[#3B82F6] to-[#EAB308] hover:opacity-90 shadow-sm font-medium"
        disabled={formik.isSubmitting}
      >
        Create Account
      </Button>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-blue-500 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  )
}

