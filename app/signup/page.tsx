"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function CreateAccountPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email address";

    if (!formData.phone) newErrors.phone = "Phone number is required";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push("/signup/verify");
    }, 1500);
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-12 animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-zinc-900 mb-2">
          Create an account
        </h1>
        <p className="text-zinc-500">Let&#39;s get started...</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <input
            className={`w-full h-14 px-6 rounded-xl border ${errors.email ? "border-red-500 focus:ring-red-100" : "border-zinc-200 focus:ring-blue-100"} outline-none focus:border-blue-500 transition-all text-zinc-900 placeholder:text-zinc-400`}
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          {errors.email && (
            <p className="mt-1.5 ml-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <input
            className={`w-full h-14 px-6 rounded-xl border ${errors.phone ? "border-red-500 focus:ring-red-100" : "border-zinc-200 focus:ring-blue-100"} outline-none focus:border-blue-500 transition-all text-zinc-900 placeholder:text-zinc-400`}
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
          {errors.phone && (
            <p className="mt-1.5 ml-1 text-xs text-red-500">{errors.phone}</p>
          )}
        </div>

        <div className="relative">
          <input
            className={`w-full h-14 px-6 rounded-xl border ${errors.password ? "border-red-500 focus:ring-red-100" : "border-zinc-200 focus:ring-blue-100"} outline-none focus:border-blue-500 transition-all text-zinc-900 placeholder:text-zinc-400 pr-14`}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 transition-colors"
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
            className={`w-full h-14 px-6 rounded-xl border ${errors.confirmPassword ? "border-red-500 focus:ring-red-100" : "border-zinc-200 focus:ring-blue-100"} outline-none focus:border-blue-500 transition-all text-zinc-900 placeholder:text-zinc-400 pr-14`}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
          {errors.confirmPassword && (
            <p className="mt-1.5 ml-1 text-xs text-red-500">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              id="terms"
              checked={formData.acceptTerms}
              onChange={(e) =>
                setFormData({ ...formData, acceptTerms: e.target.checked })
              }
              className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-zinc-300 transition-all checked:bg-orange-500 checked:border-orange-500"
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
          <label
            htmlFor="terms"
            className="text-sm font-medium text-zinc-700 cursor-pointer"
          >
            By clicking, I accept{" "}
            <span className="text-orange-500 hover:underline">terms</span> and{" "}
            <span className="text-orange-500 hover:underline">conditions</span>{" "}
            of this project
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.acceptTerms}
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
