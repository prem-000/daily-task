import { z } from "zod";

// Password regular expression:
// - At least 8 characters
// - At least one uppercase letter
// - At least one lowercase letter
// - At least one digit
// - At least one special character
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const RegisterSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name must not exceed 50 characters")
      .trim(),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must not exceed 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores")
      .trim()
      .toLowerCase(),
    email: z
      .string()
      .email("Please enter a valid email address")
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        passwordRegex,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or Username is required")
    .trim()
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .trim()
    .toLowerCase(),
});

export const UpdateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must not exceed 50 characters")
    .trim(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .trim()
    .toLowerCase(),
  profileImage: z.string().url("Profile image must be a valid URL").optional().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
