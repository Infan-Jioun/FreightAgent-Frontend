
import status from "http-status";
import AppError from "../errorHelper/appError";



interface EnvConfig {
    NODE_ENV: string;
    PORT: string;
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_APP_URL: string;
    NEXT_PUBLIC_ACCESS_TOKEN_KEY: string;
    ACCESS_TOKEN_EXPIRES_IN: string;
    NEXT_PUBLIC_REFRESH_TOKEN_KEY: string;
    REFRESH_TOKEN_EXPIRES_IN: string;
    NEXT_PUBLIC_SESSION_TOKEN_KEY: string;
 
}

const loadVariabales = (): EnvConfig => {
    const requirementVariables = [
        "NODE_ENV",
        "PORT",
        "NEXT_PUBLIC_API_URL",
        "NEXT_PUBLIC_APP_URL",
        "TRACKING_URL",
        "BETTER_AUTH_SECRET",
        "BETTER_AUTH_URL",
        "DATABASE_URL",
        "NEXT_PUBLIC_ACCESS_TOKEN_KEY",
        "ACCESS_TOKEN_EXPIRES_IN",
        "NEXT_PUBLIC_REFRESH_TOKEN_KEY",
        "REFRESH_TOKEN_EXPIRES_IN",
        "EMAIL_HOST",
        "NEXT_PUBLIC_SESSION_TOKEN_KEY",
        "EMAIL_SMTP_PASS",
        "EMAIL_PORT",
        "EMAIL_SMTP_FROM",
        "SWAGGER_USER",
        "SWAGGER_PASS",
        "UPSTASH_REDIS_REST_URL",
        "UPSTASH_REDIS_REST_TOKEN"
    ];

    requirementVariables.forEach((variable) => {
        if (!process.env[variable]) {
            throw new AppError(
                status.INTERNAL_SERVER_ERROR,
                `Environment Variable ${variable} is required but not set in the .env file`
            );
        }
    });

    return {
        NODE_ENV: process.env.NODE_ENV as string,
        PORT: process.env.PORT as string,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL as string,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL as string,
        NEXT_PUBLIC_ACCESS_TOKEN_KEY: process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY as string,
        ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
        NEXT_PUBLIC_REFRESH_TOKEN_KEY: process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY as string,
        REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
        NEXT_PUBLIC_SESSION_TOKEN_KEY: process.env.NEXT_PUBLIC_SESSION_TOKEN_KEY as string,
    };
};

export const envConfig = loadVariabales();