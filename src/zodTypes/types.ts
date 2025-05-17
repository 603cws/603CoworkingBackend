import { z } from 'zod';

export const loginInputs = z.object({
  usernameOrEmail: z.string().nonempty('Username or email is required'),
  password: z.string().nonempty('Password is required'),
});

export const createuserInputs = z.object({
  companyName: z.string().optional(),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().optional(),
  username: z.string().nonempty('Username is required'),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  zipcode: z.string().optional(),
  location: z.string().optional(),
  monthlycredits: z.number().optional(),
  extracredits: z.number().optional(),
  creditsleft: z.number().optional(),
  member: z.boolean().optional(),
});
