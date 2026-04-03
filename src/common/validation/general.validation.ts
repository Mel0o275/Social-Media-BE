import z from "zod";

export const generalValidationFeilds = {
    email: z.string({ error: 'Email is required' }).email({ error: 'Invalid email format' }),
    password: z.string({ error: 'Password is required' }).regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, { error: 'Password must be at least 8 characters long and include at least one uppercase letter, and one number' }),
    username: z.string({ error: 'Username is required' }).min(3, { error: 'Username must be at least 3 characters long' }).max(20, { error: 'Username must be at most 20 characters long' }),
    confirmPassword: z.string({ error: 'Confirm Password is required' }),
    phone: z.string({ error: 'Phone number is required' }).regex(/^\+?[1-9]\d{1,14}$/, { error: 'Invalid phone number format' }),
}