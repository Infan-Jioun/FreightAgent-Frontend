import { Metadata } from "next";
import { getServerProfile, getServerSessions } from "@/app/services/user.server";
import ProfileContainer from "./components/ProfileContainer";

export const metadata: Metadata = {
    title: "Profile & Account Settings | FreightAgent",
    description: "Manage personal details, verified credentials, and multi-device active sessions.",
};

/**
 * Profile Page Server Component (SSR).
 * Adheres strictly to the Single Responsibility Principle (SRP):
 * Solely responsible for server-side data fetching and orchestrating the page presentation container.
 */
export default async function ProfilePage() {
    // Concurrent server-side fetching of profile details and active sessions
    const [initialProfile, initialSessions] = await Promise.all([
        getServerProfile(),
        getServerSessions(),
    ]);

    return (
        <ProfileContainer
            initialProfile={initialProfile}
            initialSessions={initialSessions}
        />
    );
}
