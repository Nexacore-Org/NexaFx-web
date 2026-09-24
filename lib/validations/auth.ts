import { z } from "zod";

export const COMMON_WEAK_PASSWORDS = [
  "12345678",
  "password",
  "password1",
  "password123",
  "qwerty123",
  "letmein123",
  "welcome123",
  "admin123",
] as const;

export function isCommonWeakPassword(password: string): boolean {
  return COMMON_WEAK_PASSWORDS.includes(
    password.trim().toLowerCase() as (typeof COMMON_WEAK_PASSWORDS)[number],
  );
}

const weakPasswordMessage =
  "This password is too common. Please choose a stronger password";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or phone number is required"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine((password) => !isCommonWeakPassword(password), weakPasswordMessage),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    otp: z.string().length(6, "Please enter all 6 digits"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine((password) => !isCommonWeakPassword(password), weakPasswordMessage),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (isCommonWeakPassword(password)) return weakPasswordMessage;
  return null;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
}
