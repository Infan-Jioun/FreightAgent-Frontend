"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import api from "@/app/lib/api";

export default function GoogleCallbackPage() {
    const router = useRouter();
    const { setUser } = useAuthStore();

    useEffect(() => {
        api.get("/auth/google/jwt")
        .then((res) => {
            setUser(res.data.user);
            router.push(res.data.isNewUser ? "/dashboard?welcome=true" : "/dashboard");
        })
        .catch(() => {
            router.push("/login?error=google_failed");
        });
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Signing you in...</p>
        </div>
    );
}