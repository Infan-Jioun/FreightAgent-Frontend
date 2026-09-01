/* eslint-disable @typescript-eslint/no-explicit-any */
// app/errors/AppError.ts
export class AppError extends Error {
    public statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AppError";
    }

    static fromAxios(err: any): AppError {
        const statusCode = err?.response?.status || 500;
        const message = err?.response?.data?.message || "Something went wrong";
        return new AppError(statusCode, message);
    }

    get isUnauthorized() {
        return this.statusCode === 401;
    }

    get isForbidden() {
        return this.statusCode === 403;
    }

    get isNotFound() {
        return this.statusCode === 404;
    }
}