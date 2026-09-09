import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const cookieStore = await cookies();
        const cookieNames = [
            "accessToken",
            "refreshToken",
            "freightagent.accessToken",
            "better-auth.session_token",
        ];

        cookieNames.forEach((name) => {
            cookieStore.delete(name);
            cookieStore.set(name, "", {
                path: "/",
                maxAge: 0,
                expires: new Date(0),
            });
        });

        return NextResponse.json({
            success: true,
            message: "Cookies cleared successfully",
        });
    } catch {
        return NextResponse.json(
            { success: true, message: "Cleared" },
            { status: 200 }
        );
    }
}
