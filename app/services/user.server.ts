import { cookies } from "next/headers";
import { envConfig } from "../config/env";
import { API } from "../constants/api";
import { IApiResponse } from "../types/auth.types";
import { IUserProfile, ISessionsData } from "../types/user.types";

/**
 * Server-Side Data Fetching Service for User Profile & Sessions.
 * Executes strictly on the Next.js Server (SSR), reading session cookies directly.
 */
export async function getServerProfile(): Promise<IUserProfile | null> {
    try {
        const cookieStore = await cookies();
        const token =
            cookieStore.get("accessToken")?.value ||
            cookieStore.get("freightagent.accessToken")?.value;

        if (!token) {
            return null;
        }

        const cookieHeader = cookieStore
            .getAll()
            .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
            .join("; ");

        const res = await fetch(`${envConfig.NEXT_PUBLIC_API_URL}${API.USER.ME}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                Cookie: cookieHeader,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            return null;
        }

        const data: IApiResponse<IUserProfile> = await res.json();
        return data.data || null;
    } catch {
        return null;
    }
}

/**
 * Fetch user active sessions on the server side during SSR.
 */
export async function getServerSessions(): Promise<ISessionsData> {
    const fallback: ISessionsData = {
        sessions: [],
        breakdown: { total: 0, mobile: 0, tablet: 0, desktop: 0 },
    };

    try {
        const cookieStore = await cookies();
        const token =
            cookieStore.get("accessToken")?.value ||
            cookieStore.get("freightagent.accessToken")?.value;

        if (!token) {
            return fallback;
        }

        const cookieHeader = cookieStore
            .getAll()
            .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
            .join("; ");

        const res = await fetch(
            `${envConfig.NEXT_PUBLIC_API_URL}${API.USER.ACTIVE_SESSIONS}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Cookie: cookieHeader,
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            }
        );

        if (!res.ok) {
            return fallback;
        }

        const data: IApiResponse<ISessionsData> = await res.json();
        return data.data || fallback;
    } catch {
        return fallback;
    }
}
