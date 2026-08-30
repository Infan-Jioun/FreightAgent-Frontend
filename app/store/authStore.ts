// store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IUser } from "../types/auth.types";


interface AuthState {
    user: IUser | null;
    isAuthenticated: boolean;
    setUser: (user: IUser) => void;
    clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,

            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: true,
                }),

            clearUser: () =>
                set({
                    user: null,
                    isAuthenticated: false,
                }),
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);