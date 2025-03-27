"use client"

import { useFormik } from "formik"
import Link from "next/link"
import { FormInput } from "../ui/form-input"
import { Mail } from "lucide-react"
import { PasswordInput } from "../ui/passwor-input"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { signInSchema } from "@/utils/authValidationSchema"

export default function SignInForm() {
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema: signInSchema,
    onSubmit: async (values) => {
      try {
        // Here you would typically call an API endpoint
        console.log("Form submitted:", values)
        // Simulate successful signin
        // router.push("/dashboard");
      } catch (error) {
        console.error("Signin error:", error)
      }
    },
  })

  return (
    <section className="space-y-6">
      <form onSubmit={formik.handleSubmit} className="space-y-6">
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

        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="text-sm font-medium text-gray-900">
              Password
            </label>
            <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            label=""
            placeholder="••••••••"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && formik.errors.password}
          />
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formik.values.rememberMe}
              onChange={formik.handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="rememberMe" className="text-gray-700 font-bold">
              Remember me for 30 days
            </label>
          </div>
        </div>

        <Button
          type="submit"
          size={"lg"}
          className="w-full bg-gradient-to-r from-[#3B82F6] to-[#EAB308] hover:opacity-90 shadow-sm font-medium"
          disabled={formik.isSubmitting}
        >
          Sign In
        </Button>
      </form>

      <div className="flex items-center my-6 gap-2">
        <Separator className="flex-1 bg-gray-300" />
        <span className="text-sm text-muted-foreground uppercase">Or continue with</span>
        <Separator className="flex-1 bg-gray-300" />
      </div>

      <div className="flex items-center gap-4 justify-center">
        <Button variant={"outline"} className="flex-1">
          <svg
            viewBox="0 0 262.00 262.00"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid"
            fill="#000000"
            stroke="#000000"
            strokeWidth="0.00262"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              strokeLinecap="round"
              strokeLinejoin="round"
              stroke="#CCCCCC"
              strokeWidth="0.524"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <path
                d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                fill="#000000000"
              ></path>
              <path
                d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                fill="#0000000"
              ></path>
              <path
                d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                fill="#000"
              ></path>
              <path
                d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                fill="#00000"
              ></path>
            </g>
          </svg>{" "}
          Google
        </Button>
        <Button variant={"outline"} className="flex-1">
          <svg viewBox="0 0 266.895 266.895" xmlns="http://www.w3.org/2000/svg" fill="#ffffff">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path
                d="M252.164 266.895c8.134 0 14.729-6.596 14.729-14.73V14.73c0-8.137-6.596-14.73-14.729-14.73H14.73C6.593 0 0 6.594 0 14.73v237.434c0 8.135 6.593 14.73 14.73 14.73h237.434z"
                fill="#000"
              ></path>
              <path
                d="M184.152 266.895V163.539h34.692l5.194-40.28h-39.887V97.542c0-11.662 3.238-19.609 19.962-19.609l21.329-.01V41.897c-3.689-.49-16.351-1.587-31.08-1.587-30.753 0-51.807 18.771-51.807 53.244v29.705h-34.781v40.28h34.781v103.355h41.597z"
                fill="#00000ff"
              ></path>
            </g>
          </svg>
          Facebook
        </Button>
      </div>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/auth/sign-up" className="text-blue-500 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </section>
  )
}

