/**
 * FreightAgent — Centralized Shared TypeScript Interfaces & Types
 * Single Source of Truth for shared domain, API, logistics, UI components, and animations.
 * 
 * Usage:
 *   import type { IShipment, UserRole, IApiResponse, SidebarProps } from "@/app/types/interface";
 *   or:
 *   import type { IShipment, UserRole, IApiResponse, SidebarProps } from "@/app/types";
 */

import React from "react";
import type * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// 1. GENERIC API & PAGINATION CONTRACTS
// ─────────────────────────────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc";
export type SortOrder = "asc" | "desc";

export interface IPaginationMeta {
    page?: number;
    limit?: number;
    total?: number;
    totalPage?: number;
    totalPages?: number;
    count?: number;
}

export interface RateLimitInfo {
    limit: number;
    remaining: number;
    resetSeconds: number;
}

export interface IApiResponse<T = unknown> {
    statusCode?: number;
    success: boolean;
    message: string;
    meta?: IPaginationMeta;
    data: T;
}

export type IApiResponseWithRateLimit<T = unknown> = IApiResponse<T> & {
    rateLimit?: RateLimitInfo | null;
};

export interface IPaginatedResult<T> {
    items?: T[];
    meta?: IPaginationMeta;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. USER, IDENTITY & ACCESS CONTROL CONTRACTS
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "AGENT" | "CUSTOMER";
export type UserStatus = "ACTIVE" | "PENDING_KYC" | "SUSPENDED" | string;

export interface IUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    image: string | null;
    phone?: string | null;
    address?: string | null;
    emailVerified: boolean;
    isBlocked?: boolean;
    twoFactorEnabled?: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface IUserProfile {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    image: string | null;
    phone: string | null;
    address: string | null;
    emailVerified: boolean;
    isBlocked: boolean;
    isDeleted?: boolean;
    createdAt: string;
    updatedAt?: string;
    twoFactorEnabled?: boolean;
    lastLoginAt?: string | null;
    lastLoginIp?: string | null;
    shipments?: Array<{
        id: string;
        trackingId: string;
        origin: string;
        destination: string;
        weight: number | string;
        status: string;
        estimatedDate: string | null;
        createdAt: string;
    }>;
}

export interface IUpdateProfilePayload {
    name?: string;
    address?: string;
}

export interface IRequestPhonePayload {
    phone: string;
}

export interface IVerifyPhonePayload {
    phone: string;
    code: string;
}

export interface IAdminUserShipment {
    id: string;
    trackingId: string;
    origin: string;
    destination: string;
    status: string;
    createdAt: string;
    weight?: number;
    paymentStatus?: PaymentStatus | string;
    cost?: IShipmentCost | null;
    assignedAgentId?: string | null;
    assignedAgent?: IRoadAgent | null;
    assignedById?: string | null;
    assignedBy?: IAdminAssignee | null;
    user?: IShipmentSender;
    userId?: string;
    description?: string | null;
    estimatedDate?: string | null;
}

export interface IAdminUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status?: UserStatus;
    image?: string | null;
    isBlocked?: boolean;
    blockedReason?: string | null;
    blockedAt?: string | null;
    emailVerified?: boolean;
    lastLoginAt?: string | null;
    phone?: string | null;
    address?: string | null;
    assignedArea?: string | null;
    shipments?: IAdminUserShipment[];
    corridors?: string[];
    locations?: unknown[];
    shipmentsCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ISessionItem {
    id: string;
    deviceName: string | null;
    deviceType: string | null;
    browser: string | null;
    os: string | null;
    ipAddress: string | null;
    isCurrent: boolean;
    createdAt: string;
    expiresAt: string;
}

export interface ISessionsBreakdown {
    total: number;
    mobile: number;
    tablet: number;
    desktop: number;
}

export interface ISessionsData {
    sessions: ISessionItem[];
    breakdown: ISessionsBreakdown;
}

export interface PasswordStrength {
    score: number;
    label: string;
    color: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CONSIGNMENT & FREIGHT CONTRACTS
// ─────────────────────────────────────────────────────────────────────────────

export type ShipmentStatus =
    | "PENDING"
    | "ASSIGNED"
    | "ACCEPTED"
    | "PICKED_UP"
    | "IN_TRANSIT"
    | "AT_CUSTOMS"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PROCESSING" | "PAID" | "FAILED" | "REFUNDED";

export interface IShipmentCost {
    id?: string;
    shipmentId?: string;
    originHandling: number;
    oceanFreight: number;
    bafSurcharge: number;
    thcOrigin: number;
    thcDestination: number;
    transshipmentFee: number;
    customsClearance: number;
    customsDuty: number;
    vat: number;
    destinationHandling: number;
    cargoInsurance: number;
    lastMileDelivery: number;
    agencyFee: number;
    platformFee: number;
    totalCost: number;
    currency: string;
    exchangeRate?: number;
    convertedTotal?: number;
}

export interface IRoadAgent {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    assignedArea?: string | null;
    isAvailable?: boolean;
    activeShipmentsCount?: number;
}

export interface IAdminAssignee {
    id: string;
    name: string;
    email: string;
}

export interface IStatusLogUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface IStatusLog {
    id: string;
    shipmentId?: string;
    status: ShipmentStatus;
    location: string;
    note?: string | null;
    updateBy?: string | null;
    updatedByUser?: IStatusLogUser | null;
    createdAt: string;
}

export interface IShipmentSender {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
}

export interface IShipment {
    id: string;
    trackingId: string;
    userId: string;
    origin: string;
    destination: string;
    weight: number;
    description?: string | null;
    status: ShipmentStatus;
    paymentStatus?: PaymentStatus;
    stripePaymentIntentId?: string | null;
    stripeRefundId?: string | null;
    paidAt?: string | null;
    invoiceUrl?: string | null;
    cost?: IShipmentCost | null;
    declaredCargoValue?: number;
    estimatedDate?: string | null;
    assignedAgentId?: string | null;
    assignedAgent?: IRoadAgent | null;
    assignedById?: string | null;
    assignedBy?: IAdminAssignee | null;
    createdAt: string;
    updatedAt: string;
    statusLogs?: IStatusLog[];
    user?: IShipmentSender;
}

export interface IResolvedAgentInfo {
    name: string;
    email?: string | null;
    phone?: string | null;
}

export interface TrackingEvent {
    id: string;
    title: string;
    description: string;
    location: string;
    timestamp: string;
    completed: boolean;
    current?: boolean;
    author?: string;
}

export interface ShipmentDetails {
    trackingCode: string;
    status: ShipmentStatus;
    origin: string;
    originAddress: string;
    destination: string;
    destAddress: string;
    eta: string;
    carrier: string;
    driverName: string;
    driverPhone: string;
    vehiclePlate: string;
    weight: string;
    dimensions: string;
    serviceType: string;
    events: TrackingEvent[];
    assignedBy?: string;
    assignedAgentArea?: string;
}

export interface PortStop {
    id: string;
    name: string;
    lat: number;
    lng: number;
    status: "visited" | "current" | "next";
    label: string;
}

export interface IPortStopRoute {
    port: string;
    country: string;
    iso: string;
}

export interface ShipmentOrder {
    id: string;
    code: string;
    status: "In Transit" | "Delivered" | "Waiting Courier";
    type: "Document" | "Parcel";
    departureDate: string;
    departureTime: string;
    destinationCity: string;
    destinationAddress: string;
    courierName: string;
    courierAvatar: string;
}

export interface PortNode {
    id: string;
    name: string;
    code: string;
    country: "Bangladesh" | "China" | "Transit Hub";
    flag: string;
    x: number;
    y: number;
    status: "ORIGIN" | "DESTINATION" | "TRANSIT" | "FEEDER";
    congestion: "OPTIMAL" | "MODERATE" | "BUSY";
    draft: string;
    berths: number;
    arrivalEstimate?: string;
    details: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. LOGISTICS HUBS & LOCATIONS CONTRACTS
// ─────────────────────────────────────────────────────────────────────────────

export type LocationType =
    | "SEA_PORT"
    | "AIR_PORT"
    | "INLAND_PORT"
    | "RAIL_TERMINAL"
    | "ROAD_HUB"
    | "INLAND_CONTAINER_DEPOT";

export interface ILocation {
    [x: string]: any;
    id: string;
    name: string;
    code: string;
    country: string;
    countryCode: string;
    city: string;
    region?: string | null;
    latitude: number;
    longitude: number;
    type: LocationType;
    isBlocked?: boolean;
    blockedReason?: string | null;
    blockedAt?: string | null;
    deletedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: {
        id: string;
        name: string;
        email: string;
    } | null;
}

export interface ILocationOption {
    id: string;
    name: string;
    code: string;
    city: string;
    country: string;
    countryCode: string;
    type: LocationType;
    latitude: number;
    longitude: number;
}

export type LocationOption = ILocationOption;

export interface LocationHint {
    city: string;
    country: string;
    countryCode: string;
    region: string;
    lat: number | string;
    lng: number | string;
    type: LocationType | string;
}

export interface LocationSelectProps {
    name?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    locations?: ILocation[];
    loading?: boolean;
    placeholder?: string;
    excludeValue?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
    icon?: React.ReactNode;
}

export interface IAgentRoute {
    id: string;
    origin: ILocation;
    destination: ILocation;
}

export interface CorridorRouteModalProps {
    isOpen: boolean;
    onClose: () => void;
    locations: ILocation[];
    loadingLocations?: boolean;
    configuredRoutes: IAgentRoute[];
    onAddRoute: (route: IAgentRoute) => void;
    onRemoveRoute: (routeId: string) => void;
    onClearAll?: () => void;
    maxRoutes?: number;
    isPendingGoogleAuth?: boolean;
    onApplyGoogleAuth?: () => void;
    onRefreshLocations?: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SETTLEMENT, BILLING & FINANCIALS CONTRACTS
// ─────────────────────────────────────────────────────────────────────────────

export interface IVerifyPaymentStatusPayload {
    shipmentId: string;
}

export interface IVerifyPaymentStatusResult {
    paymentStatus: PaymentStatus;
    invoiceUrl?: string;
    paidAt?: string;
    shipment?: IShipment;
}

export interface IAgentEarningsSummary {
    totalEarnedUSD: number;
    totalWithdrawnUSD: number;
    availableBalanceUSD: number;
    pendingBalanceUSD?: number;
}

export interface IAgentEarningItem {
    id: string;
    shipmentId: string;
    trackingId: string;
    origin?: string;
    destination?: string;
    weight?: number;
    agencyFeeUSD: number;
    totalCostUSD: number;
    paymentStatus: string;
    paidAt?: string;
    createdAt: string;
}

export interface IAgentEarningsResponse {
    summary: IAgentEarningsSummary;
    earnings: IAgentEarningItem[];
}

export interface IAgentWithdrawPayload {
    amount: number;
    bankInfo: string;
    note?: string;
}

export interface IAgentWithdrawalItem {
    id: string;
    voucherNumber: string;
    amount: number;
    status: string;
    bankInfo: string;
    note?: string;
    receiptUrl?: string;
    createdAt: string;
}

export interface IAgentWithdrawResult {
    receiptUrl?: string;
    withdrawal: IAgentWithdrawalItem;
    remainingBalance: number;
}

export interface IAdminFinancialOverview {
    totalRevenueUSD: number;
    totalPlatformFeeUSD: number;
    totalAgencyFeeUSD: number;
    totalWithdrawalsPaidUSD: number;
    netPlatformBalanceUSD: number;
}

export interface IAdminRecentTransaction {
    id: string;
    shipmentId?: string;
    trackingId: string;
    customerName?: string;
    amount: number;
    paymentStatus: string;
    invoiceUrl?: string;
    createdAt: string;
}

export interface IAdminFinanceStatsResponse {
    financialOverview: IAdminFinancialOverview;
    recentTransactions: IAdminRecentTransaction[];
}

export interface IAdminWithdrawalAuditItem {
    id: string;
    voucherNumber: string;
    agentId: string;
    agentName?: string;
    agentEmail?: string;
    amount: number;
    status: string;
    bankInfo: string;
    note?: string;
    receiptUrl?: string;
    createdAt: string;
}

export interface ICalculatePricingParams {
    origin: string;
    destination: string;
    weightKg: number;
    declaredCargoValueUSD?: number;
}

export interface ICalculatePricingResult {
    costBreakdown: IShipmentCost;
    totalUSD: number;
    currency: string;
}

export interface IRefundPaymentResult {
    success: boolean;
    refundId: string;
    status: string;
    amountUSD: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. UI COMPONENT & INTERACTION CONTRACTS
// ─────────────────────────────────────────────────────────────────────────────

export interface SidebarProps {
    open?: boolean;
    onToggle?: () => void;
    mobileOpen?: boolean;
    onCloseMobile?: () => void;
}

export interface FilterTabOption<TTab extends string | number = string> {
    key: TTab;
    label: string;
    count?: number;
    icon?: React.ComponentType<{ className?: string; size?: number }>;
    disabled?: boolean;
}

export interface StatusFilterOption {
    label: string;
    value: ShipmentStatus | "ALL";
}

export interface FilterSelectOption {
    label: string;
    value: string | number;
}

export interface FilterSelectProps {
    value: string | number;
    onChange: (val: string) => void;
    options: FilterSelectOption[];
    placeholder?: string;
    title?: string;
    className?: string;
}

export interface DataTableColumn<T> {
    id?: string;
    header: React.ReactNode | ((context: { data: T[]; sortDirection?: SortDirection | null }) => React.ReactNode);
    accessorKey?: keyof T;
    cell?: (item: T, index: number) => React.ReactNode;
    headerClassName?: string;
    className?: string;
    align?: "left" | "center" | "right";
    width?: string | number;
    sortable?: boolean;
    sortKey?: string;
}

export interface DataTableSortConfig {
    sortBy?: string;
    sortDirection?: SortDirection;
    onSortChange?: (columnKey: string, direction: SortDirection) => void;
}

export interface DataTableSearchConfig {
    value: string;
    onChange: (query: string) => void;
    placeholder?: string;
    debounceMs?: number;
    className?: string;
}

export interface DataTablePaginationConfig {
    currentPage: number;
    totalPages: number;
    totalCount?: number;
    pageSize?: number;
    itemName?: string;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
    className?: string;
}

export interface DataTableEmptyStateConfig {
    icon?: React.ComponentType<{ className?: string; size?: number }>;
    title?: string;
    description?: string;
    action?: React.ReactNode;
}

export interface FilterTabsProps<TTab extends string | number = string> {
    tabs: FilterTabOption<TTab>[];
    activeTab: TTab;
    onTabChange: (tab: TTab) => void;
    title?: string;
    showFilterIcon?: boolean;
    className?: string;
    size?: "sm" | "md";
}

export interface DataTableToolbarProps<TTab extends string | number = string> {
    tabs?: FilterTabOption<TTab>[];
    activeTab?: TTab;
    onTabChange?: (tab: TTab) => void;
    tabsTitle?: string;
    showFilterIcon?: boolean;
    search?: DataTableSearchConfig;
    searchConfig?: DataTableSearchConfig;
    filters?: React.ReactNode;
    filterContent?: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}

export interface DataTableProps<T> {
    data: T[];
    columns: DataTableColumn<T>[];
    rowKey?: (item: T, index: number) => string | number;
    keyExtractor?: (item: T, index: number) => string | number;
    loading?: boolean;
    loadingRowCount?: number;
    loadingRowsCount?: number;
    emptyState?: DataTableEmptyStateConfig;
    onRowClick?: (item: T, index: number) => void;
    rowClassName?: string | ((item: T, index: number) => string);
    tableClassName?: string;
    containerClassName?: string;
    sortConfig?: DataTableSortConfig;
    className?: string;
}

export interface PaginatedDataTableProps<T, TTab extends string | number = string> {
    data: T[];
    columns: DataTableColumn<T>[];
    rowKey?: (item: T, index: number) => string | number;
    keyExtractor?: (item: T, index: number) => string | number;
    tabs?: FilterTabOption<TTab>[];
    activeTab?: TTab;
    onTabChange?: (tab: TTab) => void;
    tabsTitle?: string;
    showFilterIcon?: boolean;
    search?: DataTableSearchConfig;
    searchConfig?: DataTableSearchConfig;
    toolbarFilters?: React.ReactNode;
    toolbarActions?: React.ReactNode;
    toolbarClassName?: string;
    filterContent?: React.ReactNode;
    actions?: React.ReactNode;
    sortConfig?: DataTableSortConfig;
    pagination?: DataTablePaginationConfig;
    paginationConfig?: DataTablePaginationConfig;
    loading?: boolean;
    loadingRowCount?: number;
    loadingRowsCount?: number;
    emptyState?: DataTableEmptyStateConfig;
    rowClassName?: string | ((item: T, index: number) => string);
    onRowClick?: (item: T, index: number) => void;
    className?: string;
    tableClassName?: string;
    containerClassName?: string;
    tableWrapperClassName?: string;
}

export interface DataTableWrapperProps {
    children: React.ReactNode;
    className?: string;
}

export interface PaginationBarProps {
    currentPage: number;
    totalPages: number;
    totalCount?: number;
    pageSize?: number;
    itemName?: string;
    onPageChange: (page: number) => void;
    className?: string;
}

export interface PageHeaderProps {
    title: string;
    subtitle?: string;
    badge?: string;
    badgeColor?: "red" | "teal" | "amber" | "emerald" | "blue" | "purple";
    actions?: React.ReactNode;
    backUrl?: string;
    backLabel?: string;
    className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATS CARDS & METRIC GRID CONTRACTS
// ─────────────────────────────────────────────────────────────────────────────

export type StatCardVariant =
    | "teal"
    | "cyan"
    | "blue"
    | "purple"
    | "amber"
    | "orange"
    | "rose"
    | "neutral";

export interface StatCardTrend {
    value: string | number;
    isPositive?: boolean;
    neutral?: boolean;
    label?: string;
}

export interface StatCardProps {
    title: React.ReactNode;
    value?: React.ReactNode;
    icon?: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }> | React.ReactNode;
    subtitle?: React.ReactNode;
    variant?: StatCardVariant;
    trend?: StatCardTrend | string;
    badge?: React.ReactNode;
    loading?: boolean;
    href?: string;
    onClick?: () => void;
    className?: string;
    ariaLabel?: string;
}

export interface StatCardsGridProps {
    children: React.ReactNode;
    columns?: 1 | 2 | 3 | 4;
    className?: string;
}

export type ModalMaxWidth = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";

export interface ModalHeaderProps {
    title?: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ReactNode;
    showCloseButton?: boolean;
    onClose?: () => void;
    headerRight?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
}

export interface ModalBodyProps {
    children: React.ReactNode;
    className?: string;
    scrollable?: boolean;
    noPadding?: boolean;
}

export interface ModalFooterProps {
    children: React.ReactNode;
    className?: string;
    borderTop?: boolean;
}

export interface ModalProps {
    isOpen?: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ReactNode;
    headerRight?: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: ModalMaxWidth;
    width?: number | string;
    className?: string;
    contentClassName?: string;
    overlayClassName?: string;
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    closeOnEsc?: boolean;
    children?: React.ReactNode;
}

export interface CtaButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
    loading?: boolean;
    type?: "button" | "submit" | "reset";
    className?: string;
    variant?: "primary" | "secondary" | "danger";
}

export interface ActionBtnProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    color?: string;
    variant?: "primary" | "info" | "warning" | "danger" | "success" | "default";
    disabled?: boolean;
    className?: string;
}

export interface SearchBarProps {
    value: string;
    onChange: (query: string) => void;
    placeholder?: string;
    debounceMs?: number;
    className?: string;
}

export interface StatusBadgeProps {
    status: ShipmentStatus | string;
    className?: string;
    showIcon?: boolean;
}

export interface PaymentStatusBadgeProps {
    status?: PaymentStatus | string | null;
    className?: string;
    showIcon?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. INTERACTIVE VISUAL, AUTH & ANIMATION CONTRACTS
// ─────────────────────────────────────────────────────────────────────────────

export interface VisualCardProps {
    reducedMotion: boolean;
    className?: string;
}

export interface LiveShipmentCardProps {
    reducedMotion: boolean;
    success?: boolean;
    className?: string;
}

export interface NetworkStatusCardProps {
    reducedMotion: boolean;
    className?: string;
}

export interface ContainerInfoCardProps {
    reducedMotion: boolean;
    className?: string;
}

export interface LocationNodeProps {
    position: [number, number, number];
    label: string;
    sublabel: string;
    active?: boolean;
    reducedMotion: boolean;
}

export interface ShipmentParticleProps {
    curve: THREE.CatmullRomCurve3;
    reducedMotion: boolean;
    duration?: number;
    boosted?: boolean;
}

export interface RegisterSuccessAnimationProps {
    active: boolean;
    reducedMotion: boolean;
    onComplete: () => void;
}

export interface ShipmentSceneProps {
    reducedMotion: boolean;
    success?: boolean;
}

export interface ShipmentRouteProps {
    reducedMotion: boolean;
    boosted?: boolean;
}

export interface RegisterVisualProps {
    name?: string;
    email?: string;
    passwordStrength?: PasswordStrength;
    success?: boolean;
    onSuccessComplete?: () => void;
}

export type TrackingLocationCardProps = VisualCardProps;
export type ShipmentStatusCardProps = VisualCardProps;

