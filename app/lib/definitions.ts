import { z } from 'zod'

export const SignupFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Please enter a valid email').trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .trim(),
})

export const LoginFormSchema = z.object({
  email: z.string().email('Please enter a valid email').trim(),
  password: z.string().min(1, 'Password is required'),
})

export type FormState =
  | { errors?: { name?: string[]; email?: string[]; password?: string[] }; message?: string }
  | undefined

export const ScoreFormSchema = z.object({
  score: z.coerce.number().int().min(1, 'Score must be at least 1').max(45, 'Score must be 45 or less (Stableford)'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
})

export type SessionPayload = {
  userId: string
  role: 'user' | 'admin'
  expiresAt: Date
}
