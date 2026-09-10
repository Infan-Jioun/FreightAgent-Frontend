// app/errorHelper/appError.ts

export class AppError extends Error {
    public statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AppError";
    }

    static fromAxios(err: unknown): AppError {
        let statusCode = 500;
        if (typeof err === "object" && err !== null && "response" in err) {
            const resStatus = (err as { response?: { status?: number } }).response?.status;
            if (typeof resStatus === "number") {
                statusCode = resStatus;
            }
        }
        const message = getErrorMessage(err, "Something went wrong");
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

export function getErrorMessage(err: unknown, fallback: string = "Something went wrong"): string {
    if (typeof err === "object" && err !== null && "response" in err) {
        const res = (err as {
            response?: {
                status?: number;
                data?: unknown;
            };
            message?: string;
        }).response;

        const resData = res?.data;

        // If backend returned a plain text string
        if (typeof resData === "string" && resData.trim().length > 0) {
            return resData.trim();
        }

        if (typeof resData === "object" && resData !== null) {
            const dataObj = resData as Record<string, unknown>;

            // 1. Check all standard backend validation arrays: errorSources, errors, errorMessages, data
            const candidates = [
                dataObj.errorSources,
                dataObj.errors,
                dataObj.errorMessages,
                dataObj.data,
            ];

            let specificValidationMsg: string | undefined;
            for (const candidate of candidates) {
                if (Array.isArray(candidate) && candidate.length > 0) {
                    const first = candidate[0];
                    if (typeof first === "string" && first.trim()) {
                        specificValidationMsg = first.trim();
                        break;
                    } else if (typeof first === "object" && first !== null) {
                        const msg = (first as Record<string, unknown>).message;
                        if (typeof msg === "string" && msg.trim()) {
                            specificValidationMsg = msg.trim();
                            break;
                        }
                    }
                }
            }

            const mainMessage = typeof dataObj.message === "string" && dataObj.message.trim()
                ? dataObj.message.trim()
                : undefined;

            // If main message is generic (e.g. "Validation Error", "Validation failed"), prioritize specific field message
            if (mainMessage && /validation/i.test(mainMessage) && specificValidationMsg) {
                return specificValidationMsg;
            }

            if (mainMessage && !/validation/i.test(mainMessage)) {
                return mainMessage;
            }

            if (specificValidationMsg) {
                return specificValidationMsg;
            }

            if (mainMessage) {
                return mainMessage;
            }

            if (typeof dataObj.error === "string" && dataObj.error.trim()) {
                return dataObj.error.trim();
            }
        }

        // Meaningful contextual message based on HTTP status code if body had no readable text
        const status = res?.status;
        if (status === 400) {
            return fallback !== "Something went wrong"
                ? fallback
                : "Invalid request data. Please check your inputs and try again.";
        }
        if (status === 401) return "Authentication required. Please sign in again.";
        if (status === 403) return "Access denied. You do not have permission to perform this action.";
        if (status === 404) return "Requested resource was not found.";
        if (status === 409) return "Resource conflict detected. This record may already exist.";
        if (status === 429) return "Too many requests. Please wait a moment before trying again.";
    }

    if (err instanceof Error) {
        // Suppress generic technical Axios message strings like "Request failed with status code 400"
        if (err.message.includes("Request failed with status code")) {
            return fallback;
        }
        return err.message;
    }

    return fallback;
}