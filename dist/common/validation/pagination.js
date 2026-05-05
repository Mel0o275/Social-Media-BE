"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = void 0;
const zod_1 = require("zod");
exports.paginationSchema = {
    query: zod_1.z.strictObject({
        page: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? Number(val) : 1))
            .pipe(zod_1.z.number()
            .int("page must be an integer")
            .min(1, "page must be at least 1")),
        size: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? Number(val) : 10))
            .pipe(zod_1.z.number()
            .int("size must be an integer")
            .min(1, "size must be at least 1")
            .max(50, "size cannot exceed 50")),
        search: zod_1.z
            .string()
            .trim()
            .optional()
    })
};
