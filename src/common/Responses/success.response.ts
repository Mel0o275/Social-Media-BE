import { Response } from "express";

export const successResponse = <T>({
    res,
    data,
    message = "Success",
    statusCode = 200
}: {
    res: Response;
    data: T;
    message?: string;
    statusCode?: number;
}) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};