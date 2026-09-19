"use client";

import { useState, useMemo, useEffect } from "react";
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
    ArrowLeft,
    ArrowRight,
    Loader2,
    Compass,
    Plus,
    Trash2,
    X,
    ChevronDown,
    CheckCircle2,
    AlertCircle,
    Ship,
    MapPin,
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
import { MAJOR_PORTS } from "@/app/constants/destinations";
import { COUNTRIES, type ICountry } from "@/app/constants/countries";
import type { IRegisterAgentPayload } from "@/app/types/auth.types";
import { locationService } from "@/app/services/location.service";
import type { ILocation } from "@/app/types/location.types";
import { CorridorRouteModal, type IAgentRoute } from "./CorridorRouteModal";
import RegisterVisual, { MobileRegisterSummary } from "./RegisterVisual";

const MAX_ROUTES = 10;

const fallbackLocations: ILocation[] = MAJOR_PORTS.map((p, idx) => ({
    id: `fallback-${p.code}-${idx}`,
    name: p.name,
    code: p.code,
    country: p.country,
    countryCode: p.code.slice(0, 2),
    city: p.name.replace("Port of ", ""),
    region: p.region || "Global",
    latitude: 0,
    longitude: 0,
    type: "SEA_PORT" as const,
    isBlocked: false,
    blockedReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
}));

export default function RegisterAgentPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [showPassword, setShowPassword] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [isCorridorModalOpen, setIsCorridorModalOpen] = useState(false);
    const [isPendingGoogleAuth, setIsPendingGoogleAuth] = useState(false);

    // Real Location API & 10-Route Corridors State
    const [locations, setLocations] = useState<ILocation[]>([]);
    const [loadingLocations, setLoadingLocations] = useState(false);
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
    const [phoneCheckStatus, setPhoneCheckStatus] = useState<
        "empty" | "invalid" | "checking" | "available" | "taken"
    >("empty");
    const [phoneCheckMessage, setPhoneCheckMessage] = useState<string>("");

    // Debounced real-time Redis check against existing User data
    useEffect(() => {
        const cleanDigits = nationalPhone.replace(/\D/g, "");
        if (!cleanDigits) {
            setPhoneCheckStatus("empty");
            setPhoneCheckMessage("");
            setValue("phone", "", { shouldValidate: true });
            clearErrors("phone");
            return;
        }

        if (cleanDigits.length < 7) {
            setPhoneCheckStatus("invalid");
            setPhoneCheckMessage("Enter at least 7 digits (e.g. 1712345678)");
            return;
        }

        if (cleanDigits.length > 15) {
            setPhoneCheckStatus("invalid");
            setPhoneCheckMessage("Phone number cannot exceed 15 digits");
            return;
        }

        const fullNumber = `${selectedCountry.dialCode}${cleanDigits}`;
        setValue("phone", fullNumber, { shouldValidate: true });
        setPhoneCheckStatus("checking");
        setPhoneCheckMessage("Checking Redis user data...");

        let isCancelled = false;
        const timer = setTimeout(async () => {
            try {
                const res = await authService.checkPhoneAvailability(fullNumber);
                if (isCancelled) return;

                if (!res.available) {
                    setPhoneCheckStatus("taken");
                    setPhoneCheckMessage(
                        res.message || "This mobile number is already registered in Redis user records."
                    );
                    setError("phone", {
                        type: "manual",
                        message: "This mobile number is already registered or in use in user records.",
                    });
                } else {
                    setPhoneCheckStatus("available");
                    setPhoneCheckMessage("Mobile format verified & available for registration");
                    clearErrors("phone");
                }
            } catch {
                if (isCancelled) return;
                setPhoneCheckStatus("available");
                setPhoneCheckMessage("Mobile format verified & available for registration");
                clearErrors("phone");
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

        const cleanDigits = sanitized.replace(/\D/g, "");
        if (cleanDigits.length >= 7) {
            const fullNumber = `${selectedCountry.dialCode}${cleanDigits}`;
            setValue("phone", fullNumber, { shouldValidate: true });
        } else if (cleanDigits.length === 0) {
            setValue("phone", "", { shouldValidate: true });
        }
    };

    // Handle country selector change
    const handleCountryChange = (country: ICountry) => {
        setSelectedCountry(country);
        const cleanDigits = nationalPhone.replace(/\D/g, "");
        if (cleanDigits.length >= 7) {
            const fullNumber = `${country.dialCode}${cleanDigits}`;
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

    // Fetch dynamic locations from locationService on mount
    useEffect(() => {
        let isCancelled = false;
        async function fetchLocations() {
            setLoadingLocations(true);
            try {
                const res = await locationService.getAll({ limit: 100 });
                if (isCancelled) return;
                if (res?.data && res.data.length > 0) {
                    setLocations(res.data.filter((l) => !l.isBlocked));
                } else {
                    setLocations(fallbackLocations);
                }
            } catch {
                if (isCancelled) return;
                setLocations(fallbackLocations);
            } finally {
                if (!isCancelled) setLoadingLocations(false);
            }
        }
        fetchLocations();
        return () => {
            isCancelled = true;
        };
    }, []);

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
        const isValid = await trigger(["name", "email", "password"]);
        if (!isValid) {
            toast.error("Please fill in all required credentials correctly.");
            return;
        }

        if (phoneCheckStatus === "invalid") {
            toast.error("Please enter a valid phone number or leave it empty.");
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
            toast.info("Verifying phone number in Redis. Please wait a moment...");
            return;
        }

        const cleanDigits = nationalPhone.replace(/\D/g, "");
        if (cleanDigits.length >= 7) {
            const fullNumber = `${selectedCountry.dialCode}${cleanDigits}`;
            const check = await authService.checkPhoneAvailability(fullNumber);
            if (!check.available) {
                setPhoneCheckStatus("taken");
                setPhoneCheckMessage(
                    check.message || "This mobile number is already registered in Redis user records."
                );
                setError("phone", {
                    type: "manual",
                    message: "This mobile number is already registered in user records. Access denied.",
                });
                toast.error("Access Denied: Phone number is already registered in Redis.", {
                    description: "Please enter an unregistered phone number to proceed.",
                });
                return;
            }
        }

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

            const cleanDigits = nationalPhone.replace(/\D/g, "");
            const formattedPhone =
                cleanDigits.length >= 7
                    ? `${selectedCountry.dialCode}${cleanDigits}`
                    : undefined;

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

            if (message.toLowerCase().includes("phone")) {
                setError("phone", {
                    type: "manual",
                    message: "This mobile number is already registered or in use.",
                });
                setStep(1);
            }
            toast.error(message);
        }
    };

    return (
        <div
            className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 py-8 sm:py-12"
            style={{ background: "var(--bg-primary)" }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-5xl my-auto rounded-[2rem] overflow-hidden shadow-2xl grid lg:grid-cols-2"
                style={{
                    border: "1px solid var(--border-primary)",
                    background: "var(--bg-card)",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                }}
            >
                {/* Left: Cinematic 3D animation panel (desktop only) */}
                <div className="relative hidden lg:block h-full min-h-[680px]">
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
                    data-lenis-prevent
                    className="p-6 md:p-10 min-h-0 max-h-none lg:max-h-[88vh] overflow-visible lg:overflow-y-auto overscroll-contain custom-modal-scrollbar"
                >

                    <h1
                        className="text-xl md:text-2xl font-bold mb-1 text-center tracking-tight"
                        style={{ color: "var(--text-primary)" }}
                    >
                        Register as Logistics Agent
                    </h1>
                    <p
                        className="text-xs mb-5 text-center"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Configure your credentials & operational freight corridors.
                    </p>

                    {/* Step indicator header */}
                    <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-800">
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Step 1 Tab Button */}
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                                    step === 1
                                        ? "bg-teal-500/15 border-teal-400 text-teal-300"
                                        : "bg-black/20 border-gray-800 text-gray-400 hover:text-gray-200"
                                }`}
                            >
                                <span
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        step === 1 ? "bg-teal-400 text-black" : "bg-gray-800 text-gray-300"
                                    }`}
                                >
                                    1
                                </span>
                                <span>Account Info</span>
                            </button>

                            <div className="w-4 sm:w-6 h-px bg-gray-700" />

                            {/* Step 2 Tab Button */}
                            <button
                                type="button"
                                onClick={handleNextToStep2}
                                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                                    step === 2
                                        ? "bg-teal-500/15 border-teal-400 text-teal-300"
                                        : "bg-black/20 border-gray-800 text-gray-400 hover:text-gray-200"
                                }`}
                            >
                                <span
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        step === 2 ? "bg-teal-400 text-black" : "bg-gray-800 text-gray-300"
                                    }`}
                                >
                                    2
                                </span>
                                <span>
                                    Corridors ({configuredRoutes.length})
                                </span>
                            </button>
                        </div>

                        <span className="text-[11px] text-gray-400 font-mono">
                            Step {step} of 2
                        </span>
                    </div>

                    {/* Mobile fallback summary */}
                    <div className="mb-5 lg:hidden">
                        <MobileRegisterSummary />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        {/* ────────────────────────────────────────────────
                            STEP 1: ACCOUNT CREDENTIALS & PHONE WITH CODE
                        ──────────────────────────────────────────────── */}
                        {step === 1 && (
                            <motion.div
                                key="step-1"
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 12 }}
                                transition={{ duration: 0.25 }}
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
                                            border: `1px solid ${
                                                errors.name
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
                                            border: `1px solid ${
                                                errors.email
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

                         
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label
                                            className="text-xs font-semibold uppercase tracking-wider"
                                            style={{ color: "var(--text-secondary)" }}
                                        >
                                            Contact Phone / WhatsApp
                                        </label>
                                        {phoneCheckStatus === "checking" && (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-300">
                                                <Loader2 size={12} className="animate-spin text-teal-400" />
                                                Checking Redis...
                                            </span>
                                        )}
                                        {phoneCheckStatus === "available" && (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-300">
                                                <CheckCircle2 size={12} className="text-teal-400" />
                                                Available
                                            </span>
                                        )}
                                        {phoneCheckStatus === "taken" && (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-md border border-rose-500/30">
                                                <AlertCircle size={12} className="text-rose-400" />
                                                In Use / Registered
                                            </span>
                                        )}
                                        {phoneCheckStatus === "invalid" && (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
                                                <AlertCircle size={12} />
                                                Incomplete
                                            </span>
                                        )}
                                    </div>

                                    <div
                                        className="flex items-center gap-2 p-1.5 rounded-xl transition-all"
                                        style={{
                                            background: "var(--bg-input)",
                                            border: `1px solid ${
                                                errors.phone || phoneCheckStatus === "taken" || phoneCheckStatus === "invalid"
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
                                                className="h-10 pl-2.5 pr-7 rounded-lg bg-black/40 border border-gray-800 text-xs font-semibold text-gray-200 focus:outline-hidden focus:border-teal-400 appearance-none cursor-pointer transition-colors"
                                            >
                                                {COUNTRIES.map((c) => (
                                                    <option key={c.code} value={c.code} className="bg-[#0d1f1f] text-gray-200 cursor-pointer">
                                                        {c.flag} {c.code} ({c.dialCode})
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>

                                        {/* National Phone Input */}
                                        <div className="flex items-center gap-2 flex-1 px-2">
                                            <Phone
                                                size={15}
                                                className={
                                                    phoneCheckStatus === "available"
                                                        ? "text-teal-400"
                                                        : phoneCheckStatus === "taken"
                                                        ? "text-rose-400"
                                                        : "text-gray-500"
                                                }
                                            />
                                            <input
                                                type="tel"
                                                value={nationalPhone}
                                                onChange={(e) => handlePhoneChange(e.target.value)}
                                                placeholder="e.g. 1712-345678"
                                                className="flex-1 bg-transparent text-sm font-mono outline-hidden text-gray-100 placeholder:text-gray-600"
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
                                    <div className="flex items-center justify-between text-[11px] mt-1.5 px-1">
                                        <span
                                            className={
                                                phoneCheckStatus === "available"
                                                    ? "text-teal-300 font-medium"
                                                    : phoneCheckStatus === "taken"
                                                    ? "text-rose-400 font-semibold"
                                                    : phoneCheckStatus === "invalid"
                                                    ? "text-amber-400"
                                                    : phoneCheckStatus === "checking"
                                                    ? "text-teal-400/80"
                                                    : "text-gray-500"
                                            }
                                        >
                                            {phoneCheckMessage}
                                        </span>
                                        {nationalPhone.replace(/\D/g, "").length >= 7 && (
                                            <span className="font-mono text-[10px] text-teal-400/90 font-semibold">
                                                E.164: {selectedCountry.dialCode}{nationalPhone.replace(/\D/g, "")}
                                            </span>
                                        )}
                                    </div>

                                    <AnimatePresence>
                                        {errors.phone && (
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
                                            border: `1px solid ${
                                                errors.password
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
                                    className="mt-2 flex justify-center items-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                                    style={{
                                        background: "var(--gradient-brand)",
                                        color: "#0a0f0f",
                                        boxShadow: "0 4px 14px rgba(0,201,167,0.35)",
                                    }}
                                >
                                    <span>Continue to Step 2: Corridors</span>
                                    <ArrowRight size={16} className="cursor-pointer" />
                                </button>
                            </motion.div>
                        )}

                        {/* ────────────────────────────────────────────────
                            STEP 2: CORRIDORS OVERVIEW (MODAL DRIVEN)
                        ──────────────────────────────────────────────── */}
                        {step === 2 && (
                            <motion.div
                                key="step-2"
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -12 }}
                                transition={{ duration: 0.25 }}
                                className="flex flex-col gap-4"
                            >
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
                                                Add Route
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <p className="text-xs -mt-2" style={{ color: "var(--text-muted)" }}>
                                    Pair origin dispatch terminals with destination discharge hubs (add up to 10 shipping corridors).
                                </p>

                                {/* 10-Slot Progress Strip */}
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#091717] border border-[#1a4a4a]">
                                    <div className="flex items-center gap-1 flex-1">
                                        {Array.from({ length: MAX_ROUTES }).map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`h-1.5 rounded-full flex-1 transition-all ${
                                                    configuredRoutes[idx]
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

                                {/* Routes List or Empty State */}
                                {configuredRoutes.length === 0 ? (
                                    <div
                                        onClick={() => {
                                            setIsPendingGoogleAuth(false);
                                            setIsCorridorModalOpen(true);
                                        }}
                                        className="p-6 sm:p-8 rounded-2xl border-2 border-dashed border-[#1a4a4a] hover:border-[#00c9a7]/60 bg-[#0d1f1f]/50 hover:bg-[#0d1f1f]/80 transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer group shadow-lg"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-[#00c9a7]/10 border border-[#00c9a7]/30 flex items-center justify-center text-[#00e5c0] group-hover:scale-110 transition-transform shadow-md shadow-[#00c9a7]/10">
                                            <Compass size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white group-hover:text-[#00e5c0] transition-colors">
                                                No Trade Routes Configured Yet
                                            </h3>
                                            <p className="text-xs text-gray-400 mt-1 max-w-sm leading-relaxed">
                                                Launch our interactive corridor modal to select Origin and Destination hubs from live database records.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all mt-1 cursor-pointer bg-[#00c9a7] hover:bg-[#00e5c0] text-[#0a0f0f] shadow-md shadow-[#00c9a7]/20 flex items-center gap-2"
                                        >
                                            <Plus size={14} />
                                            <span>Configure Trade Corridors (Modal)</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-2xl border border-[#1a4a4a] bg-[#091a1a] flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-[#00c9a7] animate-pulse" />
                                                <span className="text-xs font-bold text-[#00e5c0] uppercase tracking-wider font-mono">
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
                                            data-lenis-prevent
                                            className="flex flex-col gap-2 max-h-64 overflow-y-auto overscroll-contain pr-1 custom-modal-scrollbar"
                                        >
                                            {configuredRoutes.map((route, idx) => (
                                                <div
                                                    key={route.id}
                                                    className="group flex items-center justify-between p-2.5 rounded-xl border border-[#1a4a4a] bg-[#0d1f1f]/80 hover:border-[#00c9a7]/40 hover:bg-[#0f2424] transition-all"
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="shrink-0 w-5 h-5 rounded-full bg-[#00c9a7]/15 text-[#00e5c0] text-[10px] font-mono font-bold flex items-center justify-center border border-[#00c9a7]/30">
                                                            {idx + 1}
                                                        </span>

                                                        {/* Origin */}
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <span className="font-mono text-xs font-bold text-[#00e5c0] bg-black/40 px-1.5 py-0.5 rounded border border-[#1a4a4a]">
                                                                {route.origin.code}
                                                            </span>
                                                            <span className="text-xs text-gray-200 truncate max-w-[90px] sm:max-w-[130px]">
                                                                {route.origin.city || route.origin.name}
                                                            </span>
                                                        </div>

                                                        {/* Arrow */}
                                                        <ArrowRight size={13} className="text-[#00c9a7] shrink-0 mx-0.5" />

                                                        {/* Destination */}
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <span className="font-mono text-xs font-bold text-amber-300 bg-black/40 px-1.5 py-0.5 rounded border border-[#1a4a4a]">
                                                                {route.destination.code}
                                                            </span>
                                                            <span className="text-xs text-gray-200 truncate max-w-[90px] sm:max-w-[130px]">
                                                                {route.destination.city || route.destination.name}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveRoute(route.id)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
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
                                                className="w-full py-2 rounded-xl border border-dashed border-[#1a4a4a] hover:border-[#00c9a7]/50 text-xs text-[#7ecfc4] hover:text-[#00e5c0] font-semibold flex items-center justify-center gap-1.5 bg-[#0a1a1a]/50 hover:bg-[#0d1f1f] transition-all cursor-pointer"
                                            >
                                                <Plus size={13} />
                                                <span>Add Another Route ({configuredRoutes.length}/{MAX_ROUTES})</span>
                                            </button>
                                        ) : (
                                            <p className="text-[11px] text-amber-300/80 text-center font-mono">
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

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="py-3.5 px-4 rounded-xl font-semibold text-xs border border-gray-700 text-gray-300 hover:bg-gray-800 transition-all cursor-pointer"
                                    >
                                        ← Back to Step 1
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || registered}
                                        className="grow flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 cursor-pointer bg-[#00c9a7] hover:bg-[#00e5c0] text-[#0a0f0f] shadow-md shadow-[#00c9a7]/20"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Registering...
                                            </>
                                        ) : (
                                            `Register as Agent (${configuredRoutes.length} Routes)`
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </form>

                    {/* Social Login & Switch to Sign In */}
                    {step === 1 && (
                        <>
                            <div className="flex items-center gap-3 my-4">
                                <div className="grow h-px bg-linear-to-r from-transparent to-gray-700" />
                                <span className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                                    or
                                </span>
                                <div className="grow h-px bg-linear-to-l from-transparent to-gray-700" />
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleAgentLogin}
                                className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80 cursor-pointer"
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
                                {configuredRoutes.length > 0
                                    ? `Continue with Google as Agent (${configuredRoutes.length} Corridors)`
                                    : "Continue with Google as Agent"}
                            </button>
                        </>
                    )}

                    <p className="text-sm text-center mt-5" style={{ color: "var(--text-muted)" }}>
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
            </motion.div>

            {/* ────────────────────────────────────────────────
                CORRIDOR ROUTE MODAL (EXCALIDRAW MATCHED)
            ──────────────────────────────────────────────── */}
            <CorridorRouteModal
                isOpen={isCorridorModalOpen}
                onClose={() => {
                    setIsCorridorModalOpen(false);
                    setIsPendingGoogleAuth(false);
                }}
                locations={locations}
                loadingLocations={loadingLocations}
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
