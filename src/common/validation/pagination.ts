import { z } from "zod";

export const paginationSchema = {
    query: z.strictObject({
        page: z
            .string()
            .optional()
            .transform((val) => (val ? Number(val) : 1))
            .pipe(
                z.number()
                    .int("page must be an integer")
                    .min(1, "page must be at least 1")
            ),

        size: z
            .string()
            .optional()
            .transform((val) => (val ? Number(val) : 10))
            .pipe(
                z.number()
                    .int("size must be an integer")
                    .min(1, "size must be at least 1")
                    .max(50, "size cannot exceed 50")
            ),

        search: z
            .string()
            .trim()
            .optional()
    })
};