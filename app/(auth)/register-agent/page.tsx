// app/(auth)/register-agent/page.tsx
"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
    Search,
    Check,
    X,
    Maximize2,
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
import type { IRegisterAgentPayload } from "@/app/types/auth.types";
import RegisterVisual, { MobileRegisterSummary } from "./RegisterVisual";

const REGION_FILTERS = [
    "All",
    "Bangladesh",
    "Middle East",
    "Asia",
    "Europe",
    "Americas",
] as const;

export default function RegisterAgentPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [showPassword, setShowPassword] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [isCorridorModalOpen, setIsCorridorModalOpen] = useState(false);

    // Corridor multi-select & filtering state
    const [selectedCorridors, setSelectedCorridors] = useState<string[]>([]);
    const [regionFilter, setRegionFilter] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState<string>("");

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        trigger,
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
    const phone = watch("phone", "");

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

    // Filter ports based on region tab and quick-search
    const filteredPorts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return MAJOR_PORTS.filter((port) => {
            const matchesRegion =
                regionFilter === "All" ||
                port.region.toLowerCase() === regionFilter.toLowerCase() ||
                (regionFilter === "Bangladesh" && port.country === "Bangladesh");

            const matchesSearch =
                !query ||
                port.name.toLowerCase().includes(query) ||
                port.code.toLowerCase().includes(query) ||
                port.country.toLowerCase().includes(query) ||
                port.region.toLowerCase().includes(query);

            return matchesRegion && matchesSearch;
        });
    }, [regionFilter, searchQuery]);

    const toggleCorridor = (code: string) => {
        const isSelected = selectedCorridors.includes(code);
        const next = isSelected
            ? selectedCorridors.filter((c) => c !== code)
            : [...selectedCorridors, code];

        setSelectedCorridors(next);
        setValue("corridors", next, { shouldValidate: true });

        const areaString = next
            .map((c) => {
                const port = MAJOR_PORTS.find((p) => p.code === c);
                return port ? `${port.name} (${port.code})` : c;
            })
            .join(", ");
        setValue("assignedArea", areaString);
    };

    const removeCorridor = (code: string) => {
        const next = selectedCorridors.filter((c) => c !== code);
        setSelectedCorridors(next);
        setValue("corridors", next, { shouldValidate: true });

        const areaString = next
            .map((c) => {
                const port = MAJOR_PORTS.find((p) => p.code === c);
                return port ? `${port.name} (${port.code})` : c;
            })
            .join(", ");
        setValue("assignedArea", areaString);
    };

    const clearAllCorridors = () => {
        setSelectedCorridors([]);
        setValue("corridors", [], { shouldValidate: true });
        setValue("assignedArea", "");
    };

    const selectAllFiltered = () => {
        const filteredCodes = filteredPorts.map((p) => p.code);
        const set = new Set([...selectedCorridors, ...filteredCodes]);
        const next = Array.from(set);
        setSelectedCorridors(next);
        setValue("corridors", next, { shouldValidate: true });

        const areaString = next
            .map((c) => {
                const port = MAJOR_PORTS.find((p) => p.code === c);
                return port ? `${port.name} (${port.code})` : c;
            })
            .join(", ");
        setValue("assignedArea", areaString);
    };

    const handleNextToStep2 = async () => {
        const isValid = await trigger(["name", "email", "password"]);
        if (!isValid) {
            toast.error("Please fill in all required credentials correctly.");
            return;
        }
        setStep(2);
    };

    const onSubmit = async (data: RegisterAgentInput) => {
        if (selectedCorridors.length === 0) {
            await trigger("corridors");
            toast.error("Please select at least one operational corridor or port.");
            setStep(2);
            return;
        }

        try {
            const selectedPortNames = selectedCorridors.map((code) => {
                const port = MAJOR_PORTS.find((p) => p.code === code);
                return port ? `${port.name} (${port.code})` : code;
            });

            const payload: IRegisterAgentPayload = {
                name: data.name.trim(),
                email: data.email.trim().toLowerCase(),
                password: data.password,
                phone: data.phone?.trim() || undefined,
                assignedArea: selectedPortNames.join(", "),
                corridors: selectedCorridors,
            };

            await authService.createAgent(payload);
            toast.success("Agent account registered successfully!", {
                description: "Check your email for the OTP verification code.",
            });
            sessionStorage.setItem("verify_email", data.email);
            setRegistered(true);
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message || "Agent registration failed. Please check your credentials."
            );
        }
    };

    const handleGoogleAgentLogin = () => {
        window.location.href = `${envConfig.NEXT_PUBLIC_API_URL}/auth/google/agent`;
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 sm:p-8"
            style={{ background: "var(--bg-primary)" }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-5xl rounded-[2rem] overflow-hidden shadow-2xl grid lg:grid-cols-2"
                style={{
                    border: "1px solid var(--border-primary)",
                    background: "var(--bg-card)",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                }}
            >
                {/* Left: cinematic 3D animation panel (desktop only) */}
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
                <div className="p-6 md:p-10 max-h-[92vh] overflow-y-auto">
                    <Link
                        href={ROUTES.REGISTER}
                        className="inline-flex items-center gap-1.5 text-xs mb-4 hover:underline"
                        style={{ color: "var(--text-muted)" }}
                    >
                        <ArrowLeft size={14} />
                        Back to standard registration
                    </Link>

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
                        Two-step onboarding to configure your account & operational freight corridors.
                    </p>

                    {/* Step indicator header */}
                    <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-800">
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Step 1 Button */}
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
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

                            {/* Step 2 Button */}
                            <button
                                type="button"
                                onClick={handleNextToStep2}
                                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
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
                                    Corridors ({selectedCorridors.length})
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
                            STEP 1: ACCOUNT CREDENTIALS
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
                                            placeholder="e.g. Captain Karim Ahmed"
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

                                {/* Contact Phone / WhatsApp */}
                                <div>
                                    <label
                                        className="text-xs font-semibold mb-1.5 block uppercase tracking-wider"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        Contact Phone / WhatsApp
                                    </label>
                                    <div
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                                        style={{
                                            background: "var(--bg-input)",
                                            border: `1px solid ${
                                                errors.phone
                                                    ? "var(--danger)"
                                                    : phone
                                                    ? "var(--border-accent)"
                                                    : "var(--border-primary)"
                                            }`,
                                        }}
                                    >
                                        <Phone
                                            size={16}
                                            style={{
                                                color: phone ? "var(--accent-primary)" : "var(--text-muted)",
                                            }}
                                        />
                                        <input
                                            {...register("phone")}
                                            type="tel"
                                            placeholder="+880 1712-345678 or +971 50-123-4567"
                                            className="flex-1 bg-transparent text-sm outline-hidden"
                                            style={{ color: "var(--text-primary)" }}
                                        />
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
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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

                                {/* Quick Corridor Preview & Modal Launcher */}
                                <div className="p-3 rounded-xl bg-teal-950/20 border border-teal-800/40 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <Compass size={16} className="text-teal-400 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-gray-200 truncate">
                                                Corridors: {selectedCorridors.length > 0 ? `${selectedCorridors.length} Selected` : "None configured"}
                                            </p>
                                            <p className="text-[11px] text-gray-400 truncate">
                                                {selectedCorridors.length > 0
                                                    ? selectedCorridors.slice(0, 3).join(", ") + (selectedCorridors.length > 3 ? ` +${selectedCorridors.length - 3} more` : "")
                                                    : "Select ports in Step 2 or via picker modal"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsCorridorModalOpen(true)}
                                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 transition-all cursor-pointer shrink-0"
                                    >
                                        Open Modal
                                    </button>
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
                                    <ArrowRight size={16} />
                                </button>
                            </motion.div>
                        )}

                        {/* ────────────────────────────────────────────────
                            STEP 2: CORRIDORS & SUGGESTED DESTINATIONS
                        ──────────────────────────────────────────────── */}
                        {step === 2 && (
                            <motion.div
                                key="step-2"
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -12 }}
                                transition={{ duration: 0.25 }}
                                className="flex flex-col gap-3"
                            >
                                <div className="flex items-center justify-between">
                                    <label
                                        className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        <Compass size={14} style={{ color: "var(--accent-primary)" }} />
                                        Suggested Corridors & Port Hubs
                                        <span className="text-rose-400">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setIsCorridorModalOpen(true)}
                                        className="inline-flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 underline cursor-pointer"
                                    >
                                        <Maximize2 size={11} />
                                        Enlarge Modal
                                    </button>
                                </div>

                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                    Select the domestic & international shipping destinations where you manage cargo operations.
                                </p>

                                {/* Region Filter Pills */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                                    {REGION_FILTERS.map((reg) => {
                                        const isActive = regionFilter === reg;
                                        return (
                                            <button
                                                key={reg}
                                                type="button"
                                                onClick={() => setRegionFilter(reg)}
                                                className="text-[11px] px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all border cursor-pointer"
                                                style={{
                                                    background: isActive ? "var(--accent-primary)" : "var(--bg-input)",
                                                    color: isActive ? "#0a0f0f" : "var(--text-secondary)",
                                                    borderColor: isActive ? "var(--accent-primary)" : "var(--border-primary)",
                                                }}
                                            >
                                                {reg}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Search Bar */}
                                <div
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-800"
                                    style={{ background: "var(--bg-input)" }}
                                >
                                    <Search size={14} style={{ color: "var(--text-muted)" }} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search port or code (e.g. Chattogram, Dubai, SGSIN)..."
                                        className="flex-1 bg-transparent text-xs outline-hidden text-gray-200 placeholder:text-gray-500"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery("")}
                                            className="text-gray-400 hover:text-gray-200 cursor-pointer"
                                            aria-label="Clear search"
                                        >
                                            <X size={13} />
                                        </button>
                                    )}
                                    {filteredPorts.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={selectAllFiltered}
                                            className="text-[10px] text-teal-400 hover:text-teal-300 font-semibold border-l border-gray-700 pl-2 ml-1 cursor-pointer"
                                        >
                                            Select All ({filteredPorts.length})
                                        </button>
                                    )}
                                </div>

                                {/* Active Selected Corridor Badges */}
                                {selectedCorridors.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-teal-950/20 border border-teal-800/40">
                                        <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider mr-1">
                                            Active ({selectedCorridors.length}):
                                        </span>
                                        {selectedCorridors.map((code) => {
                                            const p = MAJOR_PORTS.find((item) => item.code === code);
                                            return (
                                                <span
                                                    key={code}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-teal-500/20 text-teal-200 border border-teal-500/40"
                                                >
                                                    <span className="font-mono text-[10px] text-teal-300">{code}</span>
                                                    <span>{p ? p.name.split(" / ")[0].replace("Port of ", "") : code}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCorridor(code)}
                                                        className="hover:text-rose-400 transition-colors ml-0.5 cursor-pointer"
                                                        title={`Remove ${code}`}
                                                    >
                                                        <X size={11} />
                                                    </button>
                                                </span>
                                            );
                                        })}
                                        <button
                                            type="button"
                                            onClick={clearAllCorridors}
                                            className="text-[10px] text-gray-400 hover:text-rose-400 underline ml-auto cursor-pointer"
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                )}

                                {/* Suggested Destination Cards Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                                    {filteredPorts.length === 0 ? (
                                        <div className="col-span-2 py-6 text-center text-xs text-gray-400">
                                            No ports found matching &quot;{searchQuery}&quot;.
                                        </div>
                                    ) : (
                                        filteredPorts.map((port) => {
                                            const isSelected = selectedCorridors.includes(port.code);
                                            return (
                                                <button
                                                    key={port.code}
                                                    type="button"
                                                    onClick={() => toggleCorridor(port.code)}
                                                    className={`flex items-start justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                                        isSelected
                                                            ? "bg-teal-500/15 border-teal-400 shadow-xs shadow-teal-500/10"
                                                            : "bg-black/20 hover:bg-black/40 border-gray-800"
                                                    }`}
                                                >
                                                    <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-gray-800 text-teal-300 border border-teal-500/30">
                                                                {port.code}
                                                            </span>
                                                            <span className="text-xs font-semibold text-gray-100 truncate">
                                                                {port.name}
                                                            </span>
                                                        </div>
                                                        <span className="text-[11px] text-gray-400 truncate">
                                                            {port.country} · {port.region}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={`shrink-0 w-4 h-4 rounded-md flex items-center justify-center border mt-0.5 transition-colors ${
                                                            isSelected
                                                                ? "bg-teal-400 border-teal-300 text-black"
                                                                : "border-gray-600 bg-transparent"
                                                        }`}
                                                    >
                                                        {isSelected && <Check size={11} strokeWidth={3} />}
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>

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

                                {/* Back & Register Action Buttons */}
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
                                        className="grow flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                                        style={{
                                            background: "var(--gradient-brand)",
                                            color: "#0a0f0f",
                                            boxShadow: "0 4px 14px rgba(0,201,167,0.35)",
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Registering...
                                            </>
                                        ) : (
                                            `Register as Agent (${selectedCorridors.length} Corridors)`
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
                                Continue with Google as Agent
                            </button>
                        </>
                    )}

                    <p className="text-sm text-center mt-5" style={{ color: "var(--text-muted)" }}>
                        Already have an account?{" "}
                        <Link
                            href={ROUTES.LOGIN}
                            className="font-bold hover:underline underline-offset-4"
                            style={{ color: "var(--accent-primary)" }}
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>

            {/* ────────────────────────────────────────────────
                CORRIDORS MODAL PICKER (MODAL ER MODDE)
            ──────────────────────────────────────────────── */}
            <AnimatePresence>
                {isCorridorModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 8 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-2xl rounded-2xl overflow-hidden border border-teal-800/60 shadow-2xl p-6 flex flex-col gap-4 max-h-[88vh]"
                            style={{
                                background: "var(--bg-card)",
                                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.7)",
                            }}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                                <div className="flex items-center gap-2.5">
                                    <Compass className="text-teal-400" size={20} />
                                    <div>
                                        <h2 className="text-base font-bold text-white">
                                            Select Operational Corridors & Port Hubs
                                        </h2>
                                        <p className="text-xs text-gray-400">
                                            Multi-select the freight corridors and ports where you manage shipments.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsCorridorModalOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
                                    aria-label="Close modal"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Region Filters */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                                {REGION_FILTERS.map((reg) => {
                                    const isActive = regionFilter === reg;
                                    return (
                                        <button
                                            key={reg}
                                            type="button"
                                            onClick={() => setRegionFilter(reg)}
                                            className="text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all border cursor-pointer"
                                            style={{
                                                background: isActive ? "var(--accent-primary)" : "var(--bg-input)",
                                                color: isActive ? "#0a0f0f" : "var(--text-secondary)",
                                                borderColor: isActive ? "var(--accent-primary)" : "var(--border-primary)",
                                            }}
                                        >
                                            {reg}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Search and Select All in Modal */}
                            <div
                                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-800"
                                style={{ background: "var(--bg-input)" }}
                            >
                                <Search size={15} style={{ color: "var(--text-muted)" }} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search ports by name, country, or UN/LOCODE..."
                                    className="flex-1 bg-transparent text-xs outline-hidden text-gray-200 placeholder:text-gray-500"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="text-gray-400 hover:text-gray-200 cursor-pointer"
                                        aria-label="Clear search"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                                {filteredPorts.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={selectAllFiltered}
                                        className="text-xs text-teal-400 hover:text-teal-300 font-semibold border-l border-gray-700 pl-2 ml-1 cursor-pointer"
                                    >
                                        Select All ({filteredPorts.length})
                                    </button>
                                )}
                            </div>

                            {/* Active Chips in Modal */}
                            {selectedCorridors.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-teal-950/20 border border-teal-800/40 max-h-24 overflow-y-auto">
                                    <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider mr-1">
                                        Selected ({selectedCorridors.length}):
                                    </span>
                                    {selectedCorridors.map((code) => {
                                        const p = MAJOR_PORTS.find((item) => item.code === code);
                                        return (
                                            <span
                                                key={code}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-teal-500/20 text-teal-200 border border-teal-500/40"
                                            >
                                                <span className="font-mono text-[10px] text-teal-300">{code}</span>
                                                <span>{p ? p.name.split(" / ")[0].replace("Port of ", "") : code}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeCorridor(code)}
                                                    className="hover:text-rose-400 transition-colors ml-0.5 cursor-pointer"
                                                >
                                                    <X size={11} />
                                                </button>
                                            </span>
                                        );
                                    })}
                                    <button
                                        type="button"
                                        onClick={clearAllCorridors}
                                        className="text-xs text-gray-400 hover:text-rose-400 underline ml-auto cursor-pointer"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            )}

                            {/* Suggested Ports Grid in Modal */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                                {filteredPorts.length === 0 ? (
                                    <div className="col-span-2 py-8 text-center text-xs text-gray-400">
                                        No ports found matching &quot;{searchQuery}&quot;.
                                    </div>
                                ) : (
                                    filteredPorts.map((port) => {
                                        const isSelected = selectedCorridors.includes(port.code);
                                        return (
                                            <button
                                                key={port.code}
                                                type="button"
                                                onClick={() => toggleCorridor(port.code)}
                                                className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "bg-teal-500/15 border-teal-400 shadow-xs shadow-teal-500/10"
                                                        : "bg-black/20 hover:bg-black/40 border-gray-800"
                                                }`}
                                            >
                                                <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-gray-800 text-teal-300 border border-teal-500/30">
                                                            {port.code}
                                                        </span>
                                                        <span className="text-xs font-semibold text-gray-100 truncate">
                                                            {port.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] text-gray-400 truncate">
                                                        {port.country} · {port.region}
                                                    </span>
                                                </div>
                                                <div
                                                    className={`shrink-0 w-4.5 h-4.5 rounded-md flex items-center justify-center border mt-0.5 transition-colors ${
                                                        isSelected
                                                            ? "bg-teal-400 border-teal-300 text-black"
                                                            : "border-gray-600 bg-transparent"
                                                    }`}
                                                >
                                                    {isSelected && <Check size={12} strokeWidth={3} />}
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                                <span className="text-xs text-gray-400">
                                    {selectedCorridors.length} corridor(s) selected
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setIsCorridorModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                                    style={{
                                        background: "var(--gradient-brand)",
                                        color: "#0a0f0f",
                                    }}
                                >
                                    Done & Apply ({selectedCorridors.length})
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
