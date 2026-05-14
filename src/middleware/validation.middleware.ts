import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";
import { BadRequestException } from "../common/Exceptions/Application.exception";
import { GraphQLError } from "graphql";

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

            if(req.file) {
                req.body.file = req.file;
            }
            if(req.files) {
                req.body.files = req.files;
            }

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

export const GQLvalidation = async(schema: ZodType, args:any) => {
    const validationResult = schema.safeParse(args);

    if(!validationResult.success) {
        throw new GraphQLError("Validation Error", {
            extensions: {
                statusCode: 400,
                issues: validationResult.error.issues.map(issue => {return {path: issue.path, message:issue.message}})
            }
        })
    }
};

export const Socketvalidation = async(schema: ZodType, args:any) => {
    const validationResult = schema.safeParse(args);

    if(!validationResult.success) {
        throw new Error("Validation Error")
    }
};