import { NextFunction, Request, Response } from "express";

interface IError extends Error {
    statusCode: number;
}

export const globalErrorHandler = (
    err: IError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log(err);
    
    res.status(err.statusCode || 500).json({ 
        message: err.message || 'Internal Server Error', 
        error: err.message, 
        cause: err.cause,
        stack: err.stack
    });
};
