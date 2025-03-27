import * as Yup from "yup"

// Email validation
export const emailValidation = Yup.string()
  .email("Invalid email address")
  .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address. Please include a valid email address.")
  .required("Email is required!")

// Password validation
export const passwordValidation = Yup.string()
  .min(8, "Password must be at least 8 characters long")
  .matches(
    /^(?=.*[A-Z])(?=.*[!@#$%^&*.])(?=.*[a-z])/,
    "Password must include at least one uppercase letter, one lowercase letter, one special character, and one number.",
  )
  .required("Password is required")

// Form schemas
export const signUpSchema = Yup.object({
  fullName: Yup.string().min(2, "Name must be at least 2 characters").required("Full name is required"),
  email: emailValidation,
  password: passwordValidation,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
  agreeToTerms: Yup.boolean().oneOf([true], "You must agree to the terms").required("You must agree to the terms"),
})

export const signInSchema = Yup.object({
  email: emailValidation,
  password: Yup.string().required("Password is required"),
  rememberMe: Yup.boolean(),
})

export const contactSchema = Yup.object({
  firstname: Yup.string().required("First name is required"),
  lastname: Yup.string().required("Last name is required"),
  email: emailValidation,
  phone: Yup.string().optional(),
  subject: Yup.string(),
  message: Yup.string().required("Message is required"),
  inquiryType: Yup.string().required("Please select an inquiry type"),
})

export const forgotPasswordSchema = Yup.object({
  email: emailValidation,
})

export const resetPasswordSchema = Yup.object().shape({
  password: passwordValidation,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
})

