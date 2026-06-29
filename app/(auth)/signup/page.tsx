"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signup } from "@/lib/api/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s().-]+$/;

function isValidPhone(phone: string) {
  const digitsOnly = phone.replace(/\D/g, "");
  return (
    PHONE_REGEX.test(phone) &&
    digitsOnly.length >= 8 &&
    digitsOnly.length <= 15
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});

  const validate = () => {
    const nextErrors: Partial<typeof formData> = {};

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = "Phone number is required";
    } else if (!isValidPhone(formData.phone.trim())) {
      nextErrors.phone = "Enter a valid international phone number";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setApiError("");

    if (!validate()) return;

    setIsLoading(true);

    try {
      await signup({
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });
      sessionStorage.setItem("signup-email", formData.email.trim());
      router.push("/signup/verify");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An account with this email already exists";
      setApiError(
        message === "Request failed with status 400"
          ? "An account with this email already exists"
          : message,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-3xl border border-border/50 bg-card p-8 text-card-foreground shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in zoom-in duration-500 sm:p-12">
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-4xl font-bold text-foreground">
          Create an account
        </h1>
        <p className="text-muted-foreground">Let&apos;s get you set up.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <input
            className={`w-full h-14 rounded-xl border bg-background px-6 outline-none transition-all text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
              errors.email
                ? "border-red-500 focus:ring-red-100"
                : "border-zinc-200 dark:border-border"
            }`}
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(event) =>
              setFormData({ ...formData, email: event.target.value })
            }
          />
          {errors.email && (
            <p className="mt-1.5 ml-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <input
            className={`w-full h-14 rounded-xl border bg-background px-6 outline-none transition-all text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
              errors.phone
                ? "border-red-500 focus:ring-red-100"
                : "border-zinc-200 dark:border-border"
            }`}
            type="tel"
            inputMode="tel"
            placeholder="+234 801 234 5678"
            value={formData.phone}
            onChange={(event) =>
              setFormData({ ...formData, phone: event.target.value })
            }
          />
          {errors.phone && (
            <p className="mt-1.5 ml-1 text-xs text-red-500">{errors.phone}</p>
          )}
        </div>

        <div className="relative">
          <input
            className={`w-full h-14 rounded-xl border bg-background px-6 pr-14 outline-none transition-all text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
              errors.password
                ? "border-red-500 focus:ring-red-100"
                : "border-zinc-200 dark:border-border"
            }`}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={(event) =>
              setFormData({ ...formData, password: event.target.value })
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
          {errors.password && (
            <p className="mt-1.5 ml-1 text-xs text-red-500">
              {errors.password}
            </p>
          )}
        </div>

        <div className="relative">
          <input
            className={`w-full h-14 rounded-xl border bg-background px-6 pr-14 outline-none transition-all text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
              errors.confirmPassword
                ? "border-red-500 focus:ring-red-100"
                : "border-zinc-200 dark:border-border"
            }`}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={(event) =>
              setFormData({ ...formData, confirmPassword: event.target.value })
            }
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((current) => !current)}
            className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
          {errors.confirmPassword && (
            <p className="mt-1.5 ml-1 text-xs text-red-500">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {apiError && (
          <p className="text-center text-xs text-red-500">{apiError}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 h-16 w-full rounded-xl bg-orange-500 text-lg font-bold text-white shadow-[0_4px_14px_0_rgb(249,115,22,0.39)] transition-all hover:scale-[1.01] hover:bg-orange-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-orange-300"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>Creating account...</span>
            </div>
          ) : (
            "Create an account"
          )}
        </button>
      </form>
    </div>
  );
}
