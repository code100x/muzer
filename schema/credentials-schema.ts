import { z } from "zod";

export const emailSchema = z
  .string({ required_error: "Email is required" })
  .email({ message: "Invalid email" });

export const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  });