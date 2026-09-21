"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Package,
    MapPin,
    Weight,
    FileText,
    Calendar,
    ArrowLeft,
    Loader2,
    Send,
} from "lucide-react";
import { toast } from "sonner";
import { shipmentService } from "@/app/services/shipment.service";
import { useLocationStore } from "@/app/store/locationStore";
import { LocationSelect } from "@/components/ui/LocationSelect";
import type { ILocation } from "@/app/types/location.types";
import { ROUTES } from "@/app/constants/routes";
import { AppError } from "@/app/errorHelper/appError";

const createShipmentSchema = z
    .object({
        origin: z.string().min(2, "Origin location is required"),
        destination: z.string().min(2, "Destination location is required"),
        weight: z
            .number({ error: "Weight must be a valid number" })
            .positive("Weight must be greater than 0 kg"),
        description: z.string().optional(),
        estimatedDate: z.string().optional(),
    })
    .refine((data) => data.origin !== data.destination, {
        message: "Origin and destination cannot be the same location",
        path: ["destination"],
    });

type CreateShipmentFormValues = z.infer<typeof createShipmentSchema>;

export default function NewShipmentPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // ── Location Store Dynamic Integration ───────────────────
    const {
        fetchLocations,
        locations: storeLocations,
        isLoading: loadingLocations,
    } = useLocationStore();

    // Fetch dynamic locations on mount directly via useLocationStore
    useEffect(() => {
        // Skip network fetch if locations are already cached in store
        if (useLocationStore.getState().locations.length > 0) return;

        let isCancelled = false;
        const loadDynamicLocations = async () => {
            try {
                const res = await fetchLocations({
                    page: 1,
                    limit: 100,
                }, true);

                if (isCancelled) return;
                // If more locations exist than 100, query with full total
                if (res?.meta?.total && res.meta.total > 100) {
                    await fetchLocations({
                        page: 1,
                        limit: Math.min(res.meta.total, 200),
                    }, true);
                }
            } catch (err: unknown) {
                console.error("Failed to load dynamic locations from store:", err);
            }
        };

        loadDynamicLocations();
        return () => {
            isCancelled = true;
        };
    }, [fetchLocations]);

    // Synchronously derive active, deduplicated locations directly from locationStore
    const locations = useMemo<ILocation[]>(() => {
        const raw = Array.isArray(storeLocations) ? storeLocations : [];
        if (raw.length === 0) return [];
        const activeList = raw.filter((l) => l && !l.isBlocked && !l.isDeleted);
        const listToUse = activeList.length > 0 ? activeList : raw;
        const uniqueMap = new Map<string, ILocation>();
        listToUse.forEach((loc) => {
            const key = (loc.code || loc.id || "").toUpperCase();
            if (key && !uniqueMap.has(key)) {
                uniqueMap.set(key, loc);
            }
        });
        return Array.from(uniqueMap.values()).sort((a, b) =>
            (a.name || "").localeCompare(b.name || "")
        );
    }, [storeLocations]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        trigger,
        formState: { errors },
    } = useForm<CreateShipmentFormValues>({
        resolver: zodResolver(createShipmentSchema),
        defaultValues: {
            origin: "",
            destination: "",
            weight: 1,
            description: "",
            estimatedDate: "",
        },
    });

    const watchOrigin = watch("origin");
    const watchDestination = watch("destination");

    const handleSwapLocations = () => {
        if (!watchOrigin && !watchDestination) return;
        const temp = watchOrigin;
        setValue("origin", watchDestination, { shouldValidate: true });
        setValue("destination", temp, { shouldValidate: true });
    };

    const onSubmit = async (data: CreateShipmentFormValues) => {
        setSubmitting(true);
        try {
            const created = await shipmentService.createShipment({
                origin: data.origin.trim(),
                destination: data.destination.trim(),
                weight: Number(data.weight),
                description: data.description?.trim() || undefined,
                estimatedDate: data.estimatedDate ? new Date(data.estimatedDate).toISOString() : undefined,
            });

            toast.success("Shipment Booked Successfully!", {
                description: `Tracking ID: ${created.trackingId}. Carrier dispatch initiated.`,
            });

            router.push(`/dashboard/customer/tracking?trackingId=${encodeURIComponent(created.trackingId)}`);
        } catch (err: unknown) {
            const appErr = AppError.fromAxios(err);
            toast.error(appErr.message || "Failed to book shipment");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            {/* Navigation back */}
            <div className="flex items-center gap-2">
                <Link
                    href={ROUTES.DASHBOARD_CUSTOMER_SHIPMENTS}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7ecfc4] hover:text-[#00e5c0] transition-colors"
                >
                    <ArrowLeft size={14} />
                    <span>Back to My Shipments</span>
                </Link>
            </div>

            {/* Page Header */}
            <div className="p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#00c9a7]/15 border border-[#00c9a7]/30 flex items-center justify-center text-[#00c9a7]">
                        <Package size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/30">
                                Consignment Booking
                            </span>
                            {loadingLocations && locations.length === 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#112a2a] text-[#7ecfc4] border border-[#1a4a4a]">
                                    <Loader2 size={10} className="animate-spin text-[#00c9a7]" />
                                    <span>Syncing locations...</span>
                                </span>
                            ) : locations.length > 0 ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium font-mono bg-[#112a2a] text-[#7ecfc4] border border-[#1a4a4a]">
                                    {locations.length} Hubs Available
                                </span>
                            ) : null}
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-[#e0faf5] mt-1 tracking-tight">
                            Create New Freight Shipment
                        </h1>
                        <p className="text-xs text-[#7ecfc4] mt-0.5">
                            Enter consignment specifics, origin, destination, and cargo weight to generate a tracking code.
                        </p>
                    </div>
                </div>
            </div>

            {/* Booking Form Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Origin & Destination Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#e0faf5] uppercase tracking-wider">
                                Shipping Route & Facilities
                            </span>
                            {(watchOrigin || watchDestination) && (
                                <button
                                    type="button"
                                    onClick={handleSwapLocations}
                                    className="text-[11px] font-semibold text-[#00c9a7] hover:text-[#00e5c0] hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                    <span>Swap Route</span>
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Origin */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#e0faf5] flex items-center gap-1.5">
                                    <MapPin size={13} className="text-[#00c9a7]" />
                                    Origin Port / Facility <span className="text-[#f43f5e]">*</span>
                                </label>
                                <LocationSelect
                                    name="origin"
                                    value={watchOrigin}
                                    onChange={(val) => setValue("origin", val, { shouldValidate: true })}
                                    onBlur={() => trigger("origin")}
                                    locations={locations}
                                    loading={loadingLocations}
                                    placeholder="Search & select origin facility..."
                                    error={errors.origin?.message}
                                    className={
                                        errors.origin
                                            ? "border-[#e11d48] focus:border-[#e11d48] focus:ring-[#e11d48]/20"
                                            : "border-[#1a4a4a] focus:border-[#00c9a7] focus:ring-[#00c9a7]/20"
                                    }
                                />
                                {errors.origin && (
                                    <p className="text-[11px] text-[#f43f5e] font-medium">{errors.origin.message}</p>
                                )}
                            </div>

                            {/* Destination */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#e0faf5] flex items-center gap-1.5">
                                    <MapPin size={13} className="text-orange-400" />
                                    Destination Port / Facility <span className="text-[#f43f5e]">*</span>
                                </label>
                                <LocationSelect
                                    name="destination"
                                    value={watchDestination}
                                    onChange={(val) => setValue("destination", val, { shouldValidate: true })}
                                    onBlur={() => trigger("destination")}
                                    locations={locations}
                                    loading={loadingLocations}
                                    placeholder="Search & select destination facility..."
                                    excludeValue={watchOrigin}
                                    error={errors.destination?.message}
                                    className={
                                        errors.destination
                                            ? "border-[#e11d48] focus:border-[#e11d48] focus:ring-[#e11d48]/20"
                                            : "border-[#1a4a4a] focus:border-[#00c9a7] focus:ring-[#00c9a7]/20"
                                    }
                                />
                                {errors.destination && (
                                    <p className="text-[11px] text-[#f43f5e] font-medium">{errors.destination.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Weight & Estimated Date Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Weight */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#e0faf5] flex items-center gap-1.5">
                                <Weight size={13} className="text-[#00c9a7]" />
                                Cargo Weight (kg) <span className="text-[#f43f5e]">*</span>
                            </label>
                            <input
                                type="number"
                                step="any"
                                {...register("weight", { valueAsNumber: true })}
                                placeholder="e.g. 25.5"
                                className={`w-full px-4 py-2.5 rounded-xl bg-[#0a1a1a] border text-xs text-[#e0faf5] placeholder:text-[#7ecfc4]/40 focus:outline-hidden focus:ring-3 transition-all ${errors.weight
                                        ? "border-[#e11d48] focus:border-[#e11d48] focus:ring-[#e11d48]/20"
                                        : "border-[#1a4a4a] focus:border-[#00c9a7] focus:ring-[#00c9a7]/20"
                                    }`}
                            />
                            {errors.weight && (
                                <p className="text-[11px] text-[#f43f5e] font-medium">{errors.weight.message}</p>
                            )}
                        </div>

                        {/* Estimated Date */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#e0faf5] flex items-center gap-1.5">
                                <Calendar size={13} className="text-[#00c9a7]" />
                                Estimated Delivery Date
                            </label>
                            <input
                                type="date"
                                {...register("estimatedDate")}
                                className="w-full px-4 py-2.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#7ecfc4]/40 focus:outline-hidden focus:border-[#00c9a7] focus:ring-3 focus:ring-[#00c9a7]/20 transition-all cursor-pointer"
                            />
                            {errors.estimatedDate && (
                                <p className="text-[11px] text-[#f43f5e] font-medium">{errors.estimatedDate.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#e0faf5] flex items-center gap-1.5">
                            <FileText size={13} className="text-[#00c9a7]" />
                            Cargo Description & Handling Instructions
                        </label>
                        <textarea
                            rows={3}
                            {...register("description")}
                            placeholder="e.g. High-density textile boxes, palletized, keep dry during transit."
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#7ecfc4]/40 focus:outline-hidden focus:border-[#00c9a7] focus:ring-3 focus:ring-[#00c9a7]/20 transition-all resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2 flex items-center justify-end gap-3">
                        <Link
                            href={ROUTES.DASHBOARD_CUSTOMER_SHIPMENTS}
                            className="px-4 py-2.5 rounded-xl border border-[#1a4a4a] text-xs font-semibold text-[#7ecfc4] hover:bg-[#112a2a] transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2.5 rounded-xl bg-[#00c9a7] text-xs font-bold text-[#0a0f0f] hover:bg-[#00e5c0] transition-all flex items-center gap-2 shadow-lg shadow-[#00c9a7]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" />
                                    <span>Booking Shipment...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={15} />
                                    <span>Submit & Generate Tracking Code</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
