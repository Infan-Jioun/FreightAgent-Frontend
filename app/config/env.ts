



interface EnvConfig {
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_APP_URL: string;
    NEXT_PUBLIC_ACCESS_TOKEN_KEY: string;
    NEXT_PUBLIC_REFRESH_TOKEN_KEY: string;
    NEXT_PUBLIC_SESSION_TOKEN_KEY: string;
 
}

const loadVariabales = (): EnvConfig => {
    // const requirementVariables = [
    //     "NEXT_PUBLIC_API_URL",
    //     "NEXT_PUBLIC_APP_URL",
    //     "NEXT_PUBLIC_ACCESS_TOKEN_KEY",
    //     "NEXT_PUBLIC_REFRESH_TOKEN_KEY",
    //     "NEXT_PUBLIC_SESSION_TOKEN_KEY",
     
    // ];

    // requirementVariables.forEach((variable) => {
    //     if (!process.env[variable]) {
    //         throw new AppError(
    //             status.INTERNAL_SERVER_ERROR,
    //             `Environment Variable ${variable} is required but not set in the .env file`
    //         );
    //     }
    // });

    return {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL as string,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL as string,
        NEXT_PUBLIC_ACCESS_TOKEN_KEY: process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY as string,
        NEXT_PUBLIC_REFRESH_TOKEN_KEY: process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY as string,
        NEXT_PUBLIC_SESSION_TOKEN_KEY: process.env.NEXT_PUBLIC_SESSION_TOKEN_KEY as string,
    };
};

export const envConfig = loadVariabales();