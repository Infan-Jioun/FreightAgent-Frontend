"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    Phone,
    ArrowRight,
    Loader2,
    Compass,
    Plus,
    Trash2,
    X,
    ChevronDown,
    CheckCircle2,
    AlertCircle,
    Route,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    registerAgentSchema,
    type RegisterAgentInput,
} from "@/app/validations/auth.validation";
import { authService } from "@/app/services/auth.service";
import { ROUTES } from "@/app/constants/routes";
import { envConfig } from "@/app/config/env";
import api from "@/app/lib/api";
import { COUNTRIES, type ICountry } from "@/app/constants/countries";
import type { IRegisterAgentPayload } from "@/app/types/auth.types";
import { API } from "@/app/constants/api";
import { useLocationStore } from "@/app/store/locationStore";
import type { ILocation, ILocationListResponse } from "@/app/types/location.types";
import { CorridorRouteModal, type IAgentRoute } from "./CorridorRouteModal";
import RegisterVisual, { MobileRegisterSummary } from "./RegisterVisual";

const MAX_ROUTES = 10;

export type PhoneCheckStatus =
    | "empty"
    | "typing"
    | "invalid"
    | "checking"
    | "available"
    | "taken";

/**
 * Normalizes user input and country dial code into standard E.164 phone representation.
 * - Strips national trunk 0 (e.g. BD "01610240096" -> "1610240096" -> "+8801610240096")
 * - Strips dial code if already typed/pasted inside national input
 * - Returns clean national digits, national number with leading 0 (for legacy lookup), and standard E.164 string
 */
export function normalizePhoneToE164(country: ICountry, rawInput: string): {
    nationalDigits: string;
    nationalWithZero: string;
    fullNumber: string;
    hasValidLength: boolean;
} {
    let digits = rawInput.replace(/\D/g, "");
    const dialDigits = country.dialCode.replace(/\D/g, "");

    // If user pasted/typed the country dial code at the start, remove it
    if (digits.startsWith(dialDigits) && digits.length > dialDigits.length) {
        digits = digits.slice(dialDigits.length);
    }

    const nationalWithZero = digits.startsWith("0") ? digits : `0${digits}`;

    // Strip leading trunk zero for E.164 (e.g. 01610240096 -> 1610240096)
    const nationalDigits = digits.replace(/^0+/, "");
    const fullNumber = nationalDigits ? `${country.dialCode}${nationalDigits}` : "";
    const totalDigits = `${dialDigits}${nationalDigits}`.length;

    // Standard mobile number length: national digits at least 6, total E.164 digits 7 to 15
    const hasValidLength = nationalDigits.length >= 6 && totalDigits <= 15;

    return {
        nationalDigits,
        nationalWithZero,
        fullNumber,
        hasValidLength,
    };
}

export function RegisterAgentClient(): React.JSX.Element {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [showPassword, setShowPassword] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [isCorridorModalOpen, setIsCorridorModalOpen] = useState(false);
    const [isPendingGoogleAuth, setIsPendingGoogleAuth] = useState(false);

    // Initialized from useLocationStore
    const [configuredRoutes, setConfiguredRoutes] = useState<IAgentRoute[]>([]);

    // Phone Country Code & National Number State
    const [selectedCountry, setSelectedCountry] = useState<ICountry>(COUNTRIES[0]); // Bangladesh (+880)
    const [nationalPhone, setNationalPhone] = useState<string>("");

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        trigger,
        setError,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm<RegisterAgentInput>({
        resolver: zodResolver(registerAgentSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
            corridors: [],
            assignedArea: "",
        },
    });

    const password = watch("password", "");
    const name = watch("name", "");
    const email = watch("email", "");

    // Real-time Redis phone availability check state
    const [phoneCheckStatus, setPhoneCheckStatus] = useState<PhoneCheckStatus>("empty");
    const [phoneCheckMessage, setPhoneCheckMessage] = useState<string>("");

    // Debounced real-time check against existing User data
    useEffect(() => {
        const rawDigits = nationalPhone.replace(/\D/g, "");
        if (!rawDigits) {
            setPhoneCheckStatus("empty");
            setPhoneCheckMessage("");
            setValue("phone", "");
            clearErrors("phone");
            return;
        }

        const { nationalDigits, nationalWithZero, fullNumber, hasValidLength } =
            normalizePhoneToE164(selectedCountry, nationalPhone);

        if (nationalDigits.length < 6) {
            setPhoneCheckStatus("typing");
            setPhoneCheckMessage("Enter at least 7 digits (e.g. 01712345678)");
            setValue("phone", fullNumber);
            clearErrors("phone");
            return;
        }

        if (!hasValidLength || fullNumber.replace(/\D/g, "").length > 15) {
            setPhoneCheckStatus("invalid");
            setPhoneCheckMessage("Phone number cannot exceed 15 digits");
            setValue("phone", fullNumber);
            setError("phone", {
                type: "manual",
                message: "Phone number cannot exceed 15 digits.",
            });
            return;
        }

        setValue("phone", fullNumber)


        let isCancelled = false;
        const timer = setTimeout(async () => {
            try {
                const res = await authService.checkPhoneAvailability(fullNumber, nationalWithZero);
                if (isCancelled) return;

                if (!res.available) {
                    setPhoneCheckStatus("taken");
                    setPhoneCheckMessage(
                        res.message || "This mobile number is already registered in user records."
                    );
                    setError("phone", {
                        type: "manual",
                        message: "This mobile number is already registered or in use in user records.",
                    });
                } else {

                    clearErrors("phone");
                }
            } catch (err: unknown) {
                if (isCancelled) return;
                const errObj = err as { response?: { status?: number; data?: { message?: string } } };
                const msg = (errObj?.response?.data?.message || "").toLowerCase();
                if (errObj?.response?.status === 409 || msg.includes("already") || msg.includes("in use") || msg.includes("exist")) {
                    setPhoneCheckStatus("taken");
                    setPhoneCheckMessage(errObj?.response?.data?.message || "This phone number is already in use by another account.");
                    setError("phone", {
                        type: "manual",
                        message: "This phone number is already registered in database records.",
                    });
                } else {


                    clearErrors("phone");
                }
            }
        }, 400);

        return () => {
            isCancelled = true;
            clearTimeout(timer);
        };
    }, [nationalPhone, selectedCountry, setValue, setError, clearErrors]);

    // Handle national phone input change and sync full E.164 string
    const handlePhoneChange = (val: string) => {
        const sanitized = val.replace(/[^\d\s-]/g, "");
        setNationalPhone(sanitized);

        const { fullNumber, nationalDigits } = normalizePhoneToE164(selectedCountry, sanitized);
        if (nationalDigits.length >= 6) {
            setValue("phone", fullNumber);
        } else if (nationalDigits.length === 0) {
            setValue("phone", "");
            clearErrors("phone");
        }
    };

    // Handle country selector change
    const handleCountryChange = (country: ICountry) => {
        setSelectedCountry(country);
        const { fullNumber } = normalizePhoneToE164(country, nationalPhone);
        if (fullNumber) {
            setValue("phone", fullNumber, { shouldValidate: true });
        }
    };

    const passwordStrength = (() => {
        if (!password) return undefined;
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        const levels = [
            { label: "Weak", color: "#EF4444" },
            { label: "Fair", color: "#F59E0B" },
            { label: "Good", color: "#3B82F6" },
            { label: "Strong", color: "#00C9A7" },
        ];
        const lvl = levels[Math.max(0, score - 1)] ?? levels[0];
        return { score, label: lvl.label, color: lvl.color };
    })();

// Curated standard trade hubs across Asia and global freight corridors used when store is syncing or unseeded
const DEFAULT_FALLBACK_LOCATIONS: ILocation[] = [
    { id: "hub-cgp", name: "Chittagong Port Terminal", code: "CGP", city: "Chittagong", country: "Bangladesh", countryCode: "BD", region: "South Asia", type: "SEA_PORT", latitude: 22.3475, longitude: 91.8123, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "hub-dac", name: "Shahjalal Cargo Terminal", code: "DAC", city: "Dhaka", country: "Bangladesh", countryCode: "BD", region: "South Asia", type: "AIR_PORT", latitude: 23.8433, longitude: 90.3978, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "hub-mgl", name: "Mongla Sea Terminal", code: "MGL", city: "Mongla", country: "Bangladesh", countryCode: "BD", region: "South Asia", type: "SEA_PORT", latitude: 22.4833, longitude: 89.5833, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "hub-zyl", name: "Osmani Air Cargo Hub", code: "ZYL", city: "Sylhet", country: "Bangladesh", countryCode: "BD", region: "South Asia", type: "AIR_PORT", latitude: 24.8949, longitude: 91.8687, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "hub-sgp", name: "Port of Singapore (PSA)", code: "SGP", city: "Singapore", country: "Singapore", countryCode: "SG", region: "Southeast Asia", type: "SEA_PORT", latitude: 1.2644, longitude: 103.8222, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "hub-sin", name: "Changi Air Cargo Hub", code: "SIN", city: "Singapore", country: "Singapore", countryCode: "SG", region: "Southeast Asia", type: "AIR_PORT", latitude: 1.3644, longitude: 103.9915, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "hub-jea", name: "Jebel Ali Freezone Terminal", code: "JEA", city: "Dubai", country: "United Arab Emirates", countryCode: "AE", region: "Middle East", type: "SEA_PORT", latitude: 24.9857, longitude: 55.0611, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "hub-dxb", name: "Dubai Air Logistics Hub", code: "DXB", city: "Dubai", country: "United Arab Emirates", countryCode: "AE", region: "Middle East", type: "AIR_PORT", latitude: 25.2528, longitude: 55.3644, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "hub-cmb", name: "Port of Colombo (JCT)", code: "CMB", city: "Colombo", country: "Sri Lanka", countryCode: "LK", region: "South Asia", type: "SEA_PORT", latitude: 6.9271, longitude: 79.8612, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "hub-pvg", name: "Shanghai Yangshan Port", code: "PVG", city: "Shanghai", country: "China", countryCode: "CN", region: "East Asia", type: "SEA_PORT", latitude: 31.2304, longitude: 121.4737, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "hub-szx", name: "Shenzhen Yantian Hub", code: "SZX", city: "Shenzhen", country: "China", countryCode: "CN", region: "East Asia", type: "SEA_PORT", latitude: 22.5431, longitude: 114.0579, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "hub-can", name: "Guangzhou Nansha Port", code: "CAN", city: "Guangzhou", country: "China", countryCode: "CN", region: "East Asia", type: "SEA_PORT", latitude: 23.1291, longitude: 113.2644, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "hub-pek", name: "Beijing Capital Cargo Terminal", code: "PEK", city: "Beijing", country: "China", countryCode: "CN", region: "East Asia", type: "AIR_PORT", latitude: 40.0799, longitude: 116.6031, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "hub-bom", name: "Jawaharlal Nehru Port (JNPT)", code: "BOM", city: "Mumbai", country: "India", countryCode: "IN", region: "South Asia", type: "SEA_PORT", latitude: 18.9220, longitude: 72.8347, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "hub-del", name: "Indira Gandhi Cargo Terminal", code: "DEL", city: "New Delhi", country: "India", countryCode: "IN", region: "South Asia", type: "AIR_PORT", latitude: 28.5562, longitude: 77.1000, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "hub-maa", name: "Chennai Port Terminal", code: "MAA", city: "Chennai", country: "India", countryCode: "IN", region: "South Asia", type: "SEA_PORT", latitude: 13.0827, longitude: 80.2707, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "hub-ccu", name: "Kolkata Syama Prasad Port", code: "CCU", city: "Kolkata", country: "India", countryCode: "IN", region: "South Asia", type: "SEA_PORT", latitude: 22.5726, longitude: 88.3639, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "hub-pkg", name: "Port Klang Westports", code: "PKG", city: "Klang", country: "Malaysia", countryCode: "MY", region: "Southeast Asia", type: "SEA_PORT", latitude: 3.0319, longitude: 101.3868, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "hub-kul", name: "Kuala Lumpur Air Cargo Hub", code: "KUL", city: "Kuala Lumpur", country: "Malaysia", countryCode: "MY", region: "Southeast Asia", type: "AIR_PORT", latitude: 2.7456, longitude: 101.7099, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "hub-nrt", name: "Tokyo Narita Air Terminal", code: "NRT", city: "Tokyo", country: "Japan", countryCode: "JP", region: "East Asia", type: "AIR_PORT", latitude: 35.7720, longitude: 140.3929, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "hub-pus", name: "Busan New Port Container Terminal", code: "PUS", city: "Busan", country: "South Korea", countryCode: "KR", region: "East Asia", type: "SEA_PORT", latitude: 35.1796, longitude: 129.0756, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: "hub-rtm", name: "Port of Rotterdam (Maasvlakte)", code: "RTM", city: "Rotterdam", country: "Netherlands", countryCode: "NL", region: "Europe", type: "SEA_PORT", latitude: 51.9225, longitude: 4.4792, isBlocked: false, blockedReason: null, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
];

    const { fetchLocations: fetchStoreLocations, locations: storeLocations, isLoading: loadingLocations } = useLocationStore();

    // Fetch dynamic locations directly from useLocationStore with standard 100 limit
    const fetchLocations = useCallback(async () => {
        try {
            const res = await fetchStoreLocations({ page: 1, limit: 100 }, true);
            if (res?.meta?.total && res.meta.total > 100) {
                await fetchStoreLocations({ page: 1, limit: Math.min(res.meta.total, 200) }, true);
            }
        } catch (err: unknown) {
            console.error("Store query error:", err);
            try {
                await fetchStoreLocations(undefined, true);
            } catch (retryErr) {
                console.error("Store query retry error:", retryErr);
            }
        }
    }, [fetchStoreLocations]);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    // Synchronously derive active, deduplicated locations with seamless fallback hubs
    const locations = useMemo<ILocation[]>(() => {
        const raw = Array.isArray(storeLocations) ? storeLocations : [];
        const activeList = raw.filter((l) => l && l.isBlocked !== true && l.isDeleted !== true);

        const uniqueMap = new Map<string, ILocation>();
        // Add dynamic backend locations first
        activeList.forEach((loc) => {
            const key = (loc.code || loc.id || "").toUpperCase();
            if (key && !uniqueMap.has(key)) {
                uniqueMap.set(key, loc);
            }
        });

        // Augment with fallback trade hubs if database returns 0 records or is syncing
        if (uniqueMap.size === 0) {
            DEFAULT_FALLBACK_LOCATIONS.forEach((loc) => {
                const key = loc.code.toUpperCase();
                if (!uniqueMap.has(key)) {
                    uniqueMap.set(key, loc);
                }
            });
        }

        const uniqueList = Array.from(uniqueMap.values());
        uniqueList.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        return uniqueList;
    }, [storeLocations]);

// Sync configured routes with react-hook-form fields
const syncRoutesToForm = (routes: IAgentRoute[]) => {
    const corridorStrings = routes.map(
        (r) => `${r.origin.code} → ${r.destination.code}`
    );
    setValue("corridors", corridorStrings, { shouldValidate: true });

    const areaString = routes
        .map(
            (r) =>
                `${r.origin.name} (${r.origin.code}) → ${r.destination.name} (${r.destination.code})`
        )
        .join(", ");
    setValue("assignedArea", areaString);
};

const handleAddRoute = (route: IAgentRoute) => {
    if (configuredRoutes.length >= MAX_ROUTES) {
        toast.error(`Maximum limit reached (${MAX_ROUTES} routes).`);
        return;
    }
    const exists = configuredRoutes.some(
        (r) =>
            r.origin.code === route.origin.code &&
            r.destination.code === route.destination.code
    );
    if (exists) {
        toast.warning("This corridor route is already added.");
        return;
    }
    const next = [...configuredRoutes, route];
    setConfiguredRoutes(next);
    syncRoutesToForm(next);
    toast.success(
        `Route added: ${route.origin.code} ➔ ${route.destination.code} (${next.length}/${MAX_ROUTES})`
    );
};

const handleRemoveRoute = (routeId: string) => {
    const next = configuredRoutes.filter((r) => r.id !== routeId);
    setConfiguredRoutes(next);
    syncRoutesToForm(next);
};

const handleClearAllRoutes = () => {
    setConfiguredRoutes([]);
    syncRoutesToForm([]);
};

const handleNextToStep2 = async () => {
    const isValid = await trigger(["name", "email", "password", "phone"]);
    if (!isValid) {
        toast.error("Please fill in all required credentials correctly.");
        return;
    }

    const { nationalDigits, nationalWithZero, fullNumber, hasValidLength } =
        normalizePhoneToE164(selectedCountry, nationalPhone);

    if (!nationalDigits || nationalDigits.length < 6) {
        setError("phone", {
            type: "manual",
            message: "Contact phone number is required (min 7 digits).",
        });
        toast.error("Contact phone number is required to proceed.");
        return;
    }

    if (!hasValidLength || phoneCheckStatus === "invalid") {
        setError("phone", {
            type: "manual",
            message: "Phone number cannot exceed 15 digits.",
        });
        toast.error("Please enter a valid phone number (7 to 15 digits).");
        return;
    }

    if (phoneCheckStatus === "taken") {
        toast.error("Access Denied: This mobile number is already registered in user records.", {
            description: "Please provide a different, unregistered phone number to proceed.",
        });
        setError("phone", {
            type: "manual",
            message: "This mobile number is already registered in user records. Access denied.",
        });
        return;
    }

    if (phoneCheckStatus === "checking") {
        toast.info("Verifying phone number. Please wait a moment...");
        return;
    }

    const check = await authService.checkPhoneAvailability(fullNumber, nationalWithZero);
    if (!check.available) {
        setPhoneCheckStatus("taken");
        setPhoneCheckMessage(
            check.message || "This mobile number is already registered in user records."
        );
        setError("phone", {
            type: "manual",
            message: "This mobile number is already registered in user records. Access denied.",
        });
        toast.error("Access Denied: Phone number is already registered.", {
            description: "Please enter an unregistered phone number to proceed.",
        });
        return;
    }

    setPhoneCheckStatus("available");
    setPhoneCheckMessage("Mobile number is available for registration");
    setStep(2);
    // Automatically launch the corridor selection modal when navigating to Step 2
    setIsCorridorModalOpen(true);
};

const handleGoogleAgentLogin = () => {
    if (configuredRoutes.length === 0) {
        setIsPendingGoogleAuth(true);
        setIsCorridorModalOpen(true);
        toast.info(
            "Please configure your operational trade corridors before continuing with Google.",
            {
                description:
                    "Set up origin and destination routes in the modal to link with your Google account.",
            }
        );
        return;
    }

    const corridorStrings = configuredRoutes.map(
        (r) => `${r.origin.code} → ${r.destination.code}`
    );
    sessionStorage.setItem("agent_pending_corridors", JSON.stringify(corridorStrings));
    window.location.href = `${envConfig.NEXT_PUBLIC_API_URL}/auth/google/agent`;
};

const handleModalApply = () => {
    if (isPendingGoogleAuth) {
        if (configuredRoutes.length === 0) {
            toast.error("Please add at least one trade route before continuing with Google.");
            return;
        }
        const corridorStrings = configuredRoutes.map(
            (r) => `${r.origin.code} → ${r.destination.code}`
        );
        sessionStorage.setItem("agent_pending_corridors", JSON.stringify(corridorStrings));
        window.location.href = `${envConfig.NEXT_PUBLIC_API_URL}/auth/google/agent`;
        return;
    }
    setIsCorridorModalOpen(false);
};

const onSubmit = async (data: RegisterAgentInput) => {
    if (configuredRoutes.length === 0) {
        await trigger("corridors");
        toast.error("Please add at least one operational trade corridor route.");
        setStep(2);
        setIsCorridorModalOpen(true);
        return;
    }

    try {
        const corridorStrings = configuredRoutes.map(
            (r) => `${r.origin.code} → ${r.destination.code}`
        );
        const areaString = configuredRoutes
            .map(
                (r) =>
                    `${r.origin.name} (${r.origin.code}) → ${r.destination.name} (${r.destination.code})`
            )
            .join(", ");

        const { nationalDigits, fullNumber } = normalizePhoneToE164(
            selectedCountry,
            nationalPhone
        );
        if (!nationalDigits || nationalDigits.length < 6) {
            setError("phone", {
                type: "manual",
                message: "Contact phone number is required (min 7 digits).",
            });
            toast.error("Contact phone number is required to register.");
            setStep(1);
            return;
        }

        const formattedPhone = fullNumber;

        const payload: IRegisterAgentPayload = {
            name: data.name.trim(),
            email: data.email.trim().toLowerCase(),
            password: data.password,
            phone: formattedPhone,
            assignedArea: areaString,
            corridors: corridorStrings,
        };

        await authService.createAgent(payload);
        toast.success("Agent account registered successfully!", {
            description: "Check your email for the OTP verification code.",
        });
        sessionStorage.setItem("verify_email", data.email);
        setRegistered(true);
    } catch (err: unknown) {
        const errObj = err as { response?: { data?: { message?: string } } };
        const message =
            errObj?.response?.data?.message ||
            "Agent registration failed. Please check your credentials.";

        if (message.toLowerCase().includes("phone") || message.toLowerCase().includes("mobile")) {
            setPhoneCheckStatus("taken");
            setPhoneCheckMessage(message);
            setError("phone", {
                type: "manual",
                message: message,
            });
            setStep(1);
        }
        toast.error(message);
    }
};

return (
    <div
        className="min-h-screen w-full flex flex-col items-center justify-start lg:justify-center p-4 sm:p-6 lg:p-8 py-6 sm:py-10 lg:py-12"
        style={{ background: "var(--bg-primary)" }}
    >
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full max-w-5xl my-auto rounded-[2rem] overflow-hidden shadow-2xl grid lg:grid-cols-2 lg:min-h-[720px]"
            style={{
                border: "1px solid var(--border-primary)",
                background: "var(--bg-card)",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            }}
        >
            {/* Left: Cinematic 3D animation panel (desktop only) */}
            <div className="relative hidden lg:block h-full min-h-[720px]">
                <RegisterVisual
                    name={name}
                    email={email}
                    passwordStrength={passwordStrength}
                    success={registered}
                    onSuccessComplete={() => router.push(ROUTES.VERIFY_EMAIL)}
                />
            </div>

            {/* Right: Stepped Agent Registration Form */}
            <div
                className="p-5 sm:p-6 md:p-10 flex flex-col justify-between h-auto lg:h-full lg:min-h-[720px] lg:overflow-y-auto custom-modal-scrollbar"
            >
                <div>
                    <h1
                        className="text-lg sm:text-xl md:text-2xl font-bold mb-1 text-center tracking-tight"
                        style={{ color: "var(--text-primary)" }}
                    >
                        Register as Logistics Agent
                    </h1>
                    <p
                        className="text-xs mb-4 sm:mb-5 text-center leading-relaxed"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Configure your credentials {"&"} operational freight corridors.
                    </p>

                    {/* Step indicator header */}
                    <div className="flex items-center justify-between mb-4 sm:mb-5 pb-3 border-b border-gray-800">
                        <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
                            {/* Step 1 Tab Button */}
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className={`flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${step === 1
                                    ? "bg-teal-500/15 border-teal-400 text-teal-300"
                                    : "bg-black/20 border-gray-800 text-gray-400 hover:text-gray-200"
                                    }`}
                            >
                                <span
                                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold shrink-0 ${step === 1 ? "bg-teal-400 text-black" : "bg-gray-800 text-gray-300"
                                        }`}
                                >
                                    1
                                </span>
                                <span className="hidden sm:inline">Account Info</span>
                                <span className="sm:hidden">Acct</span>
                            </button>

                            <div className="w-3 sm:w-6 h-px bg-gray-700 shrink-0" />

                            {/* Step 2 Tab Button */}
                            <button
                                type="button"
                                onClick={handleNextToStep2}
                                className={`flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${step === 2
                                    ? "bg-teal-500/15 border-teal-400 text-teal-300"
                                    : "bg-black/20 border-gray-800 text-gray-400 hover:text-gray-200"
                                    }`}
                            >
                                <span
                                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold shrink-0 ${step === 2 ? "bg-teal-400 text-black" : "bg-gray-800 text-gray-300"
                                        }`}
                                >
                                    2
                                </span>
                                <span>
                                    Corridors ({configuredRoutes.length})
                                </span>
                            </button>
                        </div>

                        <span className="text-[10px] sm:text-[11px] text-gray-400 font-mono shrink-0">
                            Step {step} of 2
                        </span>
                    </div>

                    {/* Mobile fallback summary */}
                    <div className="mb-5 lg:hidden">
                        <MobileRegisterSummary />
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        {/* ────────────────────────────────────────────────
                                STEP 1: ACCOUNT CREDENTIALS & PHONE WITH CODE
                            ──────────────────────────────────────────────── */}
                        {step === 1 && (
                            <motion.div
                                key="step-1"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col gap-4"
                            >
                                {/* Full Name */}
                                <div>
                                    <label
                                        className="text-xs font-semibold mb-1.5 block uppercase tracking-wider"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        Full Name <span className="text-rose-400">*</span>
                                    </label>
                                    <div
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                                        style={{
                                            background: "var(--bg-input)",
                                            border: `1px solid ${errors.name
                                                ? "var(--danger)"
                                                : name
                                                    ? "var(--border-accent)"
                                                    : "var(--border-primary)"
                                                }`,
                                        }}
                                    >
                                        <User
                                            size={16}
                                            style={{
                                                color: name ? "var(--accent-primary)" : "var(--text-muted)",
                                            }}
                                        />
                                        <input
                                            {...register("name")}
                                            type="text"
                                            placeholder="e.g. Infan Jioun"
                                            className="flex-1 bg-transparent text-sm outline-hidden"
                                            style={{ color: "var(--text-primary)" }}
                                        />
                                    </div>
                                    <AnimatePresence>
                                        {errors.name && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-xs mt-1 text-rose-400"
                                            >
                                                {errors.name.message}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Business Email */}
                                <div>
                                    <label
                                        className="text-xs font-semibold mb-1.5 block uppercase tracking-wider"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        Business Email <span className="text-rose-400">*</span>
                                    </label>
                                    <div
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                                        style={{
                                            background: "var(--bg-input)",
                                            border: `1px solid ${errors.email
                                                ? "var(--danger)"
                                                : email
                                                    ? "var(--border-accent)"
                                                    : "var(--border-primary)"
                                                }`,
                                        }}
                                    >
                                        <Mail
                                            size={16}
                                            style={{
                                                color: email ? "var(--accent-primary)" : "var(--text-muted)",
                                            }}
                                        />
                                        <input
                                            {...register("email")}
                                            type="email"
                                            placeholder="agent@freightlogistics.com"
                                            className="flex-1 bg-transparent text-sm outline-hidden"
                                            style={{ color: "var(--text-primary)" }}
                                        />
                                    </div>
                                    <AnimatePresence>
                                        {errors.email && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-xs mt-1 text-rose-400"
                                            >
                                                {errors.email.message}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Phone / WhatsApp */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label
                                            className="text-xs font-semibold uppercase tracking-wider"
                                            style={{ color: "var(--text-secondary)" }}
                                        >
                                            Contact Phone / WhatsApp <span className="text-rose-400">*</span>
                                        </label>

                                    </div>

                                    <div
                                        className="flex items-center gap-1.5 p-1.5 rounded-xl transition-all"
                                        style={{
                                            background: "var(--bg-input)",
                                            border: `1px solid ${errors.phone || phoneCheckStatus === "taken" || phoneCheckStatus === "invalid"
                                                ? "var(--danger)"
                                                : phoneCheckStatus === "available"
                                                    ? "var(--border-accent)"
                                                    : "var(--border-primary)"
                                                }`,
                                        }}
                                    >
                                        {/* Country Selector Dropdown */}
                                        <div className="relative shrink-0 cursor-pointer">
                                            <select
                                                value={selectedCountry.code}
                                                onChange={(e) => {
                                                    const found = COUNTRIES.find((c) => c.code === e.target.value);
                                                    if (found) handleCountryChange(found);
                                                }}
                                                className="h-9 pl-2 pr-6 rounded-lg bg-black/40 border border-gray-800 text-[10px] sm:text-xs font-semibold text-gray-200 focus:outline-hidden focus:border-teal-400 appearance-none cursor-pointer transition-colors max-w-[100px] sm:max-w-none"
                                            >
                                                {COUNTRIES.map((c) => (
                                                    <option key={c.code} value={c.code} className="bg-[#0d1f1f] text-gray-200 cursor-pointer">
                                                        {c.flag} {c.code} ({c.dialCode})
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>

                                        {/* National Phone Input */}
                                        <div className="flex items-center gap-2 flex-1 px-2 min-w-0">
                                            <Phone
                                                size={15}
                                                className={
                                                    phoneCheckStatus === "available"
                                                        ? "text-teal-400"
                                                        : phoneCheckStatus === "taken" || phoneCheckStatus === "invalid"
                                                            ? "text-rose-400"
                                                            : "text-gray-500"
                                                }
                                            />
                                            <input
                                                type="tel"
                                                value={nationalPhone}
                                                onChange={(e) => handlePhoneChange(e.target.value)}
                                                placeholder="e.g. 1712-345678"
                                                className="flex-1 min-w-0 bg-transparent text-sm font-mono outline-hidden text-gray-100 placeholder:text-gray-600"
                                            />
                                            {nationalPhone && (
                                                <button
                                                    type="button"
                                                    onClick={() => handlePhoneChange("")}
                                                    className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer p-1"
                                                >
                                                    <X size={13} className="cursor-pointer" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Real-time Phone Availability / Format Indicator */}
                                    {phoneCheckMessage && (
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] mt-1.5 px-1">
                                            <span
                                                className={
                                                    phoneCheckStatus === "available"
                                                        ? "text-teal-300 font-medium"
                                                        : phoneCheckStatus === "taken" || phoneCheckStatus === "invalid"
                                                            ? "text-rose-400 font-semibold"
                                                            : phoneCheckStatus === "checking"
                                                                ? "text-teal-400/80"
                                                                : "text-gray-500"
                                                }
                                            >
                                                {phoneCheckMessage}
                                            </span>
                                            {normalizePhoneToE164(selectedCountry, nationalPhone).fullNumber && (
                                                <span className="font-mono text-[10px] text-teal-400/90 font-semibold shrink-0">
                                                    E.164: {normalizePhoneToE164(selectedCountry, nationalPhone).fullNumber}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <AnimatePresence>
                                        {errors.phone && (!phoneCheckMessage || errors.phone.message !== phoneCheckMessage) && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-xs mt-1 text-rose-400"
                                            >
                                                {errors.phone.message}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Password */}
                                <div>
                                    <label
                                        className="text-xs font-semibold mb-1.5 block uppercase tracking-wider"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        Password <span className="text-rose-400">*</span>
                                    </label>
                                    <div
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                                        style={{
                                            background: "var(--bg-input)",
                                            border: `1px solid ${errors.password
                                                ? "var(--danger)"
                                                : password
                                                    ? "var(--border-accent)"
                                                    : "var(--border-primary)"
                                                }`,
                                        }}
                                    >
                                        <Lock
                                            size={16}
                                            style={{
                                                color: password ? "var(--accent-primary)" : "var(--text-muted)",
                                            }}
                                        />
                                        <input
                                            {...register("password")}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min 8 characters"
                                            className="flex-1 bg-transparent text-sm outline-hidden"
                                            style={{ color: "var(--text-primary)" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ color: "var(--text-muted)" }}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            className="cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff size={16} className="cursor-pointer" /> : <Eye size={16} className="cursor-pointer" />}
                                        </button>
                                    </div>
                                    <AnimatePresence>
                                        {errors.password && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-xs mt-1 text-rose-400"
                                            >
                                                {errors.password.message}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Continue to Step 2 Button */}
                                <button
                                    type="button"
                                    onClick={handleNextToStep2}
                                    className="mt-1 flex justify-center items-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer w-full"
                                    style={{
                                        background: "var(--gradient-brand)",
                                        color: "#0a0f0f",
                                        boxShadow: "0 4px 14px rgba(0,201,167,0.35)",
                                    }}
                                >
                                    <span>Continue to Step 2: Corridors</span>
                                    <ArrowRight size={16} className="cursor-pointer shrink-0" />
                                </button>
                            </motion.div>
                        )}

                        {/* ────────────────────────────────────────────────
                                STEP 2: CORRIDORS OVERVIEW (ALIGNED TO MATCH STEP 1)
                            ──────────────────────────────────────────────── */}
                        {step === 2 && (
                            <motion.div
                                key="step-2"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col gap-3.5"
                            >
                                {/* Header & Badges matching step 1 label layout */}
                                <div className="flex items-center justify-between">
                                    <label
                                        className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        <Route size={15} style={{ color: "var(--accent-primary)" }} />
                                        Operational Trade Corridors
                                        <span className="text-rose-400">*</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#00c9a7]/10 text-[#00e5c0] border border-[#00c9a7]/30 font-semibold">
                                            {configuredRoutes.length} / {MAX_ROUTES} Routes
                                        </span>
                                        {configuredRoutes.length < MAX_ROUTES && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsPendingGoogleAuth(false);
                                                    setIsCorridorModalOpen(true);
                                                }}
                                                className="inline-flex items-center gap-1 text-xs text-[#00e5c0] hover:text-[#00c9a7] font-semibold cursor-pointer underline underline-offset-4"
                                            >
                                                <Plus size={13} />
                                                Add Road
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Subtitle with hub counter */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 -mt-1.5">
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                        Pair origin dispatch terminals with destination discharge hubs.
                                    </p>
                                    <span className="text-[11px] font-mono text-[#7ecfc4] shrink-0 font-medium">
                                        {loadingLocations ? "Loading hubs..." : `${locations.length} shipping hubs available`}
                                    </span>
                                </div>

                                {/* 10-Slot Progress Strip */}
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#091717] border border-[#1a4a4a]">
                                    <div className="flex items-center gap-1 flex-1">
                                        {Array.from({ length: MAX_ROUTES }).map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`h-1.5 rounded-full flex-1 transition-all ${configuredRoutes[idx]
                                                    ? "bg-[#00c9a7] shadow-xs shadow-[#00c9a7]/30"
                                                    : "bg-[#112a2a] border border-[#1a4a4a]"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-mono text-[#7ecfc4] shrink-0 font-medium">
                                        {configuredRoutes.length}/{MAX_ROUTES} slots
                                    </span>
                                </div>

                                {/* Routes Container / Empty State (Sized stably to match Step 1 input box height) */}
                                {configuredRoutes.length === 0 ? (
                                    <div
                                        onClick={() => {
                                            setIsPendingGoogleAuth(false);
                                            setIsCorridorModalOpen(true);
                                        }}
                                        className="h-[210px] rounded-2xl border-2 border-dashed border-[#1a4a4a] hover:border-[#00c9a7]/60 bg-[#0d1f1f]/50 hover:bg-[#0d1f1f]/80 transition-all flex flex-col items-center justify-center text-center p-4 gap-2.5 cursor-pointer group shadow-lg"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-[#00c9a7]/10 border border-[#00c9a7]/30 flex items-center justify-center text-[#00e5c0] group-hover:scale-110 transition-transform shadow-md shadow-[#00c9a7]/10">
                                            <Compass size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white group-hover:text-[#00e5c0] transition-colors">
                                                No Trade Routes Configured Yet
                                            </h3>
                                            <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
                                                Launch the interactive corridor modal to pair Origin and Destination hubs from 225 database records.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            className="px-4 py-2 rounded-xl text-xs font-bold transition-all mt-0.5 cursor-pointer bg-[#00c9a7] hover:bg-[#00e5c0] text-[#0a0f0f] shadow-md shadow-[#00c9a7]/20 flex items-center gap-1.5"
                                        >
                                            <Plus size={14} />
                                            <span>Configure Trade Corridors (Modal)</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="h-[210px] p-3 rounded-2xl border border-[#1a4a4a] bg-[#091a1a] flex flex-col justify-between">
                                        <div className="flex items-center justify-between pb-1.5 border-b border-gray-800">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-[#00c9a7] animate-pulse" />
                                                <span className="text-[11px] font-bold text-[#00e5c0] uppercase tracking-wider font-mono">
                                                    Configured Routes ({configuredRoutes.length} / {MAX_ROUTES})
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {configuredRoutes.length < MAX_ROUTES && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsPendingGoogleAuth(false);
                                                            setIsCorridorModalOpen(true);
                                                        }}
                                                        className="text-xs text-[#00e5c0] hover:text-[#00c9a7] font-semibold cursor-pointer underline"
                                                    >
                                                        + Add More
                                                    </button>
                                                )}
                                                <span className="text-gray-600">·</span>
                                                <button
                                                    type="button"
                                                    onClick={handleClearAllRoutes}
                                                    className="text-xs text-gray-400 hover:text-rose-400 underline cursor-pointer"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                        </div>

                                        {/* Dynamic Route Cards Grid */}
                                        <div
                                            className="flex flex-col gap-1.5 overflow-y-auto pr-1 flex-1 my-1.5 custom-modal-scrollbar"
                                        >
                                            {configuredRoutes.map((route, idx) => (
                                                <div
                                                    key={route.id}
                                                    className="group flex items-center justify-between p-2 rounded-xl border border-[#1a4a4a] bg-[#0d1f1f]/80 hover:border-[#00c9a7]/40 hover:bg-[#0f2424] transition-all"
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="shrink-0 w-4 h-4 rounded-full bg-[#00c9a7]/15 text-[#00e5c0] text-[9px] font-mono font-bold flex items-center justify-center border border-[#00c9a7]/30">
                                                            {idx + 1}
                                                        </span>

                                                        {/* Origin */}
                                                        <div className="flex items-center gap-1 min-w-0">
                                                            <span className="font-mono text-[11px] font-bold text-[#00e5c0] bg-black/40 px-1.5 py-0.5 rounded border border-[#1a4a4a]">
                                                                {route.origin.code}
                                                            </span>
                                                            <span className="text-xs text-gray-200 truncate max-w-[85px] sm:max-w-[120px]">
                                                                {route.origin.city || route.origin.name}
                                                            </span>
                                                        </div>

                                                        {/* Arrow */}
                                                        <ArrowRight size={12} className="text-[#00c9a7] shrink-0 mx-0.5" />

                                                        {/* Destination */}
                                                        <div className="flex items-center gap-1 min-w-0">
                                                            <span className="font-mono text-[11px] font-bold text-amber-300 bg-black/40 px-1.5 py-0.5 rounded border border-[#1a4a4a]">
                                                                {route.destination.code}
                                                            </span>
                                                            <span className="text-xs text-gray-200 truncate max-w-[85px] sm:max-w-[120px]">
                                                                {route.destination.city || route.destination.name}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveRoute(route.id)}
                                                        className="p-1 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                                                        title="Delete this corridor route"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {configuredRoutes.length < MAX_ROUTES ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsPendingGoogleAuth(false);
                                                    setIsCorridorModalOpen(true);
                                                }}
                                                className="w-full py-1.5 rounded-xl border border-dashed border-[#1a4a4a] hover:border-[#00c9a7]/50 text-xs text-[#7ecfc4] hover:text-[#00e5c0] font-semibold flex items-center justify-center gap-1 bg-[#0a1a1a]/50 hover:bg-[#0d1f1f] transition-all cursor-pointer"
                                            >
                                                <Plus size={12} />
                                                <span>Add Another Route ({configuredRoutes.length}/{MAX_ROUTES})</span>
                                            </button>
                                        ) : (
                                            <p className="text-[10px] text-amber-300/80 text-center font-mono py-0.5">
                                                Maximum limit reached ({MAX_ROUTES}/{MAX_ROUTES} routes configured)
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Validation error for corridors */}
                                <AnimatePresence>
                                    {errors.corridors && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="text-xs text-rose-400 font-medium"
                                        >
                                            {errors.corridors.message}
                                        </motion.p>
                                    )}
                                </AnimatePresence>

                                {/* Action Buttons: Aligned consistently with Step 1 buttons */}
                                <div className="flex items-center gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="py-3.5 px-3 sm:px-4 rounded-xl font-semibold text-xs border border-gray-700 text-gray-300 hover:bg-gray-800 transition-all cursor-pointer shrink-0"
                                    >
                                        ← Back
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || registered}
                                        className="grow flex justify-center items-center gap-2 py-3.5 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 cursor-pointer bg-[#00c9a7] hover:bg-[#00e5c0] text-[#0a0f0f] shadow-md shadow-[#00c9a7]/20 text-center"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin shrink-0" />
                                                <span>Registering...</span>
                                            </>
                                        ) : (
                                            <span>Register as Agent ({configuredRoutes.length} Routes)</span>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </form>
                </div>

                {/* Bottom Area: Social Login & Sign In Link strictly anchored at bottom */}
                <div className="mt-3 sm:mt-4 pt-2">
                    {step === 1 && (
                        <>
                            <div className="flex items-center gap-3 my-2 sm:my-3">
                                <div className="grow h-px bg-linear-to-r from-transparent to-gray-700" />
                                <span className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                                    or
                                </span>
                                <div className="grow h-px bg-linear-to-l from-transparent to-gray-700" />
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleAgentLogin}
                                className="flex items-center justify-center gap-3 w-full py-2.5 sm:py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-80 cursor-pointer"
                                style={{
                                    border: "1px solid var(--border-primary)",
                                    color: "var(--text-primary)",
                                    background: "var(--bg-input)",
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span>Continue with Google as Agent</span>
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <div className="pt-2 text-center">
                            <button
                                type="button"
                                onClick={handleGoogleAgentLogin}
                                className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-gray-400 hover:text-teal-300 transition-colors cursor-pointer py-1"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span>Or register with Google and link these {configuredRoutes.length} corridor(s)</span>
                            </button>
                        </div>
                    )}

                    <p className="text-xs text-center mt-3" style={{ color: "var(--text-muted)" }}>
                        Already have an account?{" "}
                        <Link
                            href={ROUTES.LOGIN}
                            className="font-bold hover:underline underline-offset-4 cursor-pointer"
                            style={{ color: "var(--accent-primary)" }}
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </motion.div>

        {/* ────────────────────────────────────────────────
                CORRIDOR ROUTE MODAL (FIXED HEIGHT, LIVE API)
            ──────────────────────────────────────────────── */}
        <CorridorRouteModal
            isOpen={isCorridorModalOpen}
            onClose={() => {
                setIsCorridorModalOpen(false);
                setIsPendingGoogleAuth(false);
            }}
            locations={locations}
            loadingLocations={loadingLocations}
            onRefreshLocations={fetchLocations}
            configuredRoutes={configuredRoutes}
            onAddRoute={handleAddRoute}
            onRemoveRoute={handleRemoveRoute}
            onClearAll={handleClearAllRoutes}
            maxRoutes={MAX_ROUTES}
            isPendingGoogleAuth={isPendingGoogleAuth}
            onApplyGoogleAuth={handleModalApply}
        />
    </div>
);
}

export default RegisterAgentClient;
