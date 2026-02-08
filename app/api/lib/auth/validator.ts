
import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .trim()
    .optional(),
  secondName: z
    .string()
    .min(2, 'Second name must be at least 2 characters')
    .max(50, 'Second name must be less than 50 characters')
    .trim(),
  bio: z
    .string()
    .max(1000, 'Bio must be less than 1000 characters')
    .trim()
    .optional(),
  avatar: z
    .string()
    .url('Avatar must be a valid URL')
    .optional(),
  role: z.enum(['LEARNER', 'INSTRUCTOR', 'ADMIN']).optional().default('LEARNER'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;