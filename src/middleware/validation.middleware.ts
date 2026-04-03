import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";
import { BadRequestException } from "../common/Exceptions/Application.exception";

type keyRequestType = keyof Request;
type validationSchemaType = Partial<Record<keyRequestType, ZodType>>;

export const validation = (schema: validationSchemaType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const validationErrors: Array<{
            key: keyRequestType,
            issues: Array<{
                message: string,
                path: (string | number | undefined | symbol)[]
            }>
        }> = [];

        for (const key of Object.keys(schema) as keyRequestType[]) {
            if (!schema[key]) continue;

            const validationResult = (schema[key] as ZodType).safeParse(req[key]);
            if (!validationResult.success) {
                const error = validationResult.error as ZodError;

                validationErrors.push({
                    key,
                    issues: error.issues.map(issue => {
                        return{
                            message: issue.message,
                            path: issue.path
                        }
                    })
                });
            }
        }

        if (validationErrors.length > 0) {
            throw new BadRequestException("Validation failed", validationErrors);
        }

        next();
    };
};