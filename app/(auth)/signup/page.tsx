"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { signUp } from "@/lib/api/auth";
import { signupSchema, type SignupFormValues } from "@/lib/validations/auth";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { acceptTerms: true },
  });

  const acceptTerms = watch("acceptTerms");

  const onSubmit = async (data: SignupFormValues) => {
    setApiError("");
    setIsLoading(true);
    try {
      await signUp({ email: data.email, phone: data.phone, password: data.password });
      sessionStorage.setItem("signup_email", data.email);
      router.push("/signup/verify");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-card text-card-foreground rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-12 animate-in fade-in zoom-in duration-500 border border-border/50">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-foreground mb-2">Create an account</h1>
        <p className="text-muted-foreground">Let&#39;s get started...</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          {...register("email")}
          type="email"
          placeholder="Email address"
          error={errors.email?.message}
          className="h-14 px-6 rounded-xl border bg-background border-zinc-200 dark:border-border outline-none focus:border-blue-500 focus:ring-blue-100"
        />

        <Input
          {...register("phone")}
          type="tel"
          placeholder="Phone Number"
          error={errors.phone?.message}
          className="h-14 px-6 rounded-xl border bg-background border-zinc-200 dark:border-border outline-none focus:border-blue-500 focus:ring-blue-100"
        />

        <div className="relative">
          <Input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            error={errors.password?.message}
            className="h-14 px-6 pr-14 rounded-xl border bg-background border-zinc-200 dark:border-border outline-none focus:border-blue-500 focus:ring-blue-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
        </div>

        <div className="relative">
          <Input
            {...register("confirmPassword")}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            error={errors.confirmPassword?.message}
            className="h-14 px-6 pr-14 rounded-xl border bg-background border-zinc-200 dark:border-border outline-none focus:border-blue-500 focus:ring-blue-100"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              id="terms"
              {...register("acceptTerms")}
              className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-zinc-300 dark:border-border transition-all checked:bg-orange-500 checked:border-orange-500"
            />
            <svg
              className="pointer-events-none absolute h-5 w-5 stroke-white opacity-0 peer-checked:opacity-100"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <label htmlFor="terms" className="text-sm font-medium text-muted-foreground cursor-pointer">
            By clicking, I accept{" "}
            <span className="text-orange-500 hover:underline">terms</span> and{" "}
            <span className="text-orange-500 hover:underline">conditions</span> of this project
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="text-xs text-red-500">{errors.acceptTerms.message}</p>
        )}

        {apiError && <p className="text-xs text-red-500 text-center">{apiError}</p>}

        <button
          type="submit"
          disabled={isLoading || !acceptTerms}
          className="w-full h-16 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-[0_4px_14px_0_rgb(249,115,22,0.39)] transition-all hover:scale-[1.01] active:scale-[0.99] mt-6"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            "Create an account"
          )}
        </button>
      </form>
    </div>
  );
}
