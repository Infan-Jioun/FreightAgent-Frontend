# 🚢 FreightAgent Frontend — Enterprise AI-Powered Logistics Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.3.6-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-API-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=for-the-badge&logo=three.js&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5.0-brown?style=for-the-badge)

<p align="center">
  <strong>Next-Generation B2B Multi-Modal Freight Forwarding, Real-Time Dispatch & Shipment Orchestration System</strong>
</p>

[Key Features](#-key-features) • [Tech Stack](#-technical-stack) • [Architecture](#-system-architecture) • [Role Portals](#-role-based-dashboards) • [Real-Time Chat & Sockets](#-real-time-chat--websocket-system) • [Getting Started](#-getting-started) • [Environment Variables](#-environment-configuration)

---

</div>

## 📖 Overview

**FreightAgent** is a production-grade, enterprise-scale B2B freight forwarding and logistics orchestration web application. Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, and Three.js, it bridges the gap between enterprise cargo shippers, certified field freight agents, and platform dispatchers.

The platform provides end-to-end transparency across the entire freight lifecycle—from instantaneous quote estimation and automated Stripe payment collection to multi-modal live GPS telemetry, bidirectional encrypted dispatch chat, desktop push notifications, and domain-tuned RAG AI logistics assistance.

---

## 🚀 Key Features

### 🌐 1. High-Performance 3D & Interactive Visuals
- **Interactive 3D Container Model**: Custom WebGL rendering using `@react-three/fiber` and `@react-three/drei` showcasing multi-modal cargo containers with dynamic lighting and camera orbits.
- **Global Freight Network Globe**: Interactive 3D planetary sphere showing global shipping lanes, maritime routes, and air flight corridors connecting major international freight hubs.
- **Milestone Pipeline & Telemetry Simulator**: Interactive visual pipeline showing lifecycle progression (Quoted → Booked → In Transit → Customs Hold → Out for Delivery → Delivered).
- **Lenis Smooth Scrolling**: Butter-smooth inertial momentum scrolling integrated across public marketing layouts.

### 🔐 2. Enterprise Authentication & Security (RBAC)
- **Role-Based Access Control (RBAC)**: Strict separation of privileges across three distinct roles: `CUSTOMER`, `AGENT`, and `ADMIN`.
- **Edge Middleware Protection**: Zero-dependency Edge-safe JWT parsing with automatic token expiration verification and immediate redirection.
- **OAuth 2.0 Integration**: Single Sign-On (SSO) with Google OAuth (`/google/success` token handoff and state restoration).
- **Session & Device Audit Trail**: Comprehensive device fingerprinting, IP logging, user-agent parsing, and instant remote session revocation.
- **HTTP Security Headers**: Automated enforcement of Content Security Policy (`CSP`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Permissions-Policy`.
- **Axios Refresh Interceptor**: Transparent token rotation via `/auth/refresh-token` with automatic queue replay and seamless logout upon token revocation.

### 💼 3. Role-Based Dashboards & Workflows

#### 👤 Customer Portal (`/dashboard/customer`)
- **Interactive Dashboard Overview**: Real-time snapshot of active shipments, transit statuses, expenditure analytics, and recent activity.
- **Instant B2B Freight Quoting (`/quote`)**: Multi-modal quote calculator supporting FCL (Full Container Load), LCL, Air Cargo, and Overland trucking with dimensional weight (CBM/KG) calculations.
- **Booking Wizard (`/dashboard/customer/shipments/new`)**: Multi-step booking pipeline capturing pickup/delivery addresses, cargo classification, hazardous material flags, and customs documentation.
- **Shipment Management**: Tabular view with instant search, status filtering, date range sorting, and pagination.
- **Detailed Shipment Dossier (`CustomerShipmentDetailsModal.tsx`)**: Complete cargo specifications, assigned agent contacts, printable commercial invoices, and real-time status tracker.
- **Stripe Digital Checkout**: Secure credit card & bank payment processing via Stripe Elements modal (`StripePaymentModal.tsx`).
- **Contextual Agent Chat**: Instant two-way shipment chat modal directly accessible from any shipment card.

#### 🚛 Certified Agent Portal (`/dashboard/agent`)
- **Dispatch Operations Hub**: Streamlined command board for assigned cargo loads with urgency indicators and milestone deadlines.
- **Shipment Life-Cycle Controls (`/dashboard/agent/shipments`)**: In-transit checkpoint logger allowing agents to push live telemetry updates, report customs holds, and confirm deliveries.
- **Earnings Ledger & Wallet (`/dashboard/agent/earnings`)**: Visual revenue analytics, commission breakdowns, pending payouts, completed disbursement history, and financial statements.
- **Direct Shipper Communication**: Embedded real-time messaging interface for immediate client coordination and waybill transmission.

#### 🛡️ Admin Operations Control Center (`/dashboard/admin`)
- **Global Logistics Telemetry**: High-level platform KPIs, Gross Merchandise Value (GMV), active fleet volumes, and operational throughput charts powered by Recharts.
- **Dispatch & Assignment Engine (`/dashboard/admin/shipments`)**: Advanced shipment table with capabilities to assign/reassign certified agents (`AssignAgentModal.tsx`), alter cargo states (`UpdateStatusModal.tsx`), and supervise freight corridors.
- **Comprehensive User Management (`/dashboard/admin/users`)**: 
  - Complete user directory with role filtering (`ADMIN`, `AGENT`, `CUSTOMER`) and account status filtering (`ACTIVE`, `PENDING_KYC`, `SUSPENDED`).
  - **112 KB User Details Dossier (`UserDetailsModal.tsx`)**: In-depth KYC verification, operational activity logs, freight history, and account metrics.
  - **Remote Session Management (`UserSessionsModal.tsx`)**: Live inspection of active devices, IP addresses, and remote session termination.
  - Role promotion/demotion modal (`UpdateRoleModal.tsx`) and account suspension modal (`SuspendUserModal.tsx`).
- **Global Hub & Location Registry (`/dashboard/admin/locations`)**: Complete CRUD console for managing international seaports, airports, inland container depots (ICDs), and corridor pricing rules.
- **Financial Auditing & Refunds (`/dashboard/admin/finances`)**: Platform-wide transaction ledger, Stripe payment reconciliation, and dispute/refund modal (`RefundModal.tsx`).

---

### 💬 4. Real-Time Chat & Communication Suite
- **Socket.IO Real-Time Architecture**: Persistent bi-directional WebSocket connection managed by `SocketProvider.tsx` with automatic re-connection handling.
- **Dedicated Full-Page Dispatch Chat (`/dashboard/chat`)**:
  - Split-pane layout with searchable conversations list and real-time counterparty status.
  - Conversation search, unread badge counters, and active load indicators.
- **Shipment Contextual Chat Modal (`ShipmentChatModal.tsx`)**:
  - Lightweight modal launched from any shipment row or card without leaving the current view.
  - Pre-filtered to the specific shipment context with counterparty profile details in the header.
- **Modern Messaging Features**:
  - **Optimistic Message Delivery**: Messages render immediately with pending status, updating seamlessly on server ACK.
  - **Message Receipt Status Ticks**: Single tick (Sent) and double tick (Delivered/Read) via `MessageReceiptTicks.tsx`.
  - **Typing Indicators**: Real-time debounce typing notifications (`user_typing` socket event).
  - **File & Document Attachments**: Upload and preview shipping documents, bills of lading, customs releases, and images.
  - **Auto-Closure on Delivery**: Automatic locking of chat threads once a shipment reaches `DELIVERED` status.
  - **Admin Supervision**: Platform administrators can inspect and supervise ongoing freight communications.

---

### 🔔 5. Notification Center & Alerts
- **Real-Time Notification Pipeline**: Instant socket dispatch for critical freight events (`SHIPMENT_UPDATED`, `AGENT_ASSIGNED`, `MESSAGE_RECEIVED`, `PAYMENT_COMPLETED`).
- **Native Browser Desktop Notifications**: Cross-tab web notifications powered by `useDesktopNotification.ts` alerting users even when the app is running in the background.
- **Interactive Notification Center (`/dashboard/notifications`)**:
  - Notification drawer with filter tabs (All, Unread, Shipments, System).
  - One-click navigation to relevant shipment or chat threads (`notificationRoutes.ts`).
  - Mark as read, mark all read, and unread count badges.

---

### 🤖 6. AI-Powered Logistics Assistant (RAG Engine)
- **Floating AI Assistant Widget (`RagChatWidget.tsx`)**: Persistent floating concierge accessible on all pages.
- **Domain-Specific RAG Knowledge Base**: Answers complex freight inquiries regarding Incoterms (FOB, CIF, DDP), Harmonized System (HS) codes, customs tariff policies, and container dimensions.
- **Rich Markdown Renderer (`MarkdownRenderer.tsx`)**: Streamed markdown responses formatted with syntax-highlighted code, tables, callout notes, and lists.
- **Reactive State Hook (`useRagChat.ts`)**: Handles query caching, streaming state, error fallbacks, and conversation clearing.

---

### 💳 7. Payments & Financial Infrastructure
- **Stripe Elements Integration**: Embedded credit card, debit card, and digital payment collection via `@stripe/react-stripe-js`.
- **Payment Verification & Security**: Webhook-backed payment confirmation ensuring shipments are only cleared for dispatch upon verified settlement.
- **Automated Invoicing**: Client-side dynamic PDF invoice formatting and downloadable commercial freight receipts (`invoice.ts`).

---

## 🛠 Technical Stack

| Layer | Technologies |
|---|---|
| **Framework** | [Next.js 16.3.6](https://nextjs.org/) (App Router, Turbopack ready, Server & Client Components) |
| **Runtime & Core** | [React 19.2.8](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling & Design System** | [Tailwind CSS v4](https://tailwindcss.com/) (`@import "tailwindcss"`, CSS variables, zero legacy classes) |
| **UI Components** | [Radix UI](https://www.radix-ui.com/), [Shadcn UI](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/) |
| **3D Graphics & Animations** | [Three.js](https://threejs.org/), [@react-three/fiber](https://r3f.docs.pmnd.rs/), [@react-three/drei](https://github.com/pmndrs/drei), [Framer Motion 13](https://www.framer.com/motion/), [GSAP 3](https://greensock.com/gsap/) |
| **Real-Time WebSockets** | [Socket.IO Client 4.8.1](https://socket.io/) with custom React Provider architecture |
| **State Management** | [Zustand 5.0](https://zustand-demo.pmnd.rs/) (Persisted Auth Store, Location Store, Notification Store) |
| **Data Fetching & Table** | [TanStack React Query v5](https://tanstack.com/query), [TanStack React Table v9](https://tanstack.com/table), [Axios](https://axios-http.com/) |
| **Form Handling & Validation** | [React Hook Form 7](https://react-hook-form.com/), [Zod 4](https://zod.dev/), [@hookform/resolvers](https://github.com/react-hook-form/resolvers) |
| **Payments** | [Stripe.js](https://stripe.com/docs/js), [@stripe/react-stripe-js](https://stripe.com/docs/stripe-js/react) |
| **Smooth Scroll** | [Lenis 1.3](https://lenis.darkroom.engineering/) |
| **Feedback & Notifications** | [Sonner 2.0](https://sonner.emilkowal.ski/) (Custom dark theme toasts) |
| **Analytics & Data Vis** | [Recharts 3](https://recharts.org/) |

---

## 📂 Project Architecture

```
freightagent-frontend/
├── app/
│   ├── (auth)/                         # Authentication route group
│   │   ├── login/                      # User login
│   │   ├── register/                   # Customer registration
│   │   ├── register-agent/             # Agent career application & onboarding
│   │   ├── forgot-password/            # Password recovery request
│   │   ├── reset-password/             # Password reset execution
│   │   ├── verify-email/               # OTP/Token email verification
│   │   └── google/                     # OAuth callback & token synchronization
│   │
│   ├── (dashboard)/                    # Protected workspace route group
│   │   ├── DashboardShell.tsx          # Shell wrapper (auth gate, socket provider, sidebar)
│   │   ├── admin/                      # Admin routes
│   │   │   ├── finances/               # Platform transactions & refunds
│   │   │   ├── locations/              # Seaports, airports & hub manager
│   │   │   ├── shipments/              # Admin dispatch, agent assignment
│   │   │   └── users/                  # User directory, KYC dossier, session revoker
│   │   ├── agent/                      # Certified agent routes
│   │   │   ├── earnings/               # Commission ledger & payout wallet
│   │   │   └── shipments/              # Assigned freight loads & status updater
│   │   ├── customer/                   # Cargo shipper routes
│   │   │   ├── shipments/              # Customer shipments & new booking wizard
│   │   │   └── tracking/               # Live parcel & cargo telemetry tracker
│   │   ├── chat/                       # Full-page unified dispatch chat interface
│   │   ├── notifications/              # Centralized notification audit center
│   │   ├── profile/                    # User profile, 2FA, phone verification, active sessions
│   │   └── settings/                   # Account settings, security & notification preferences
│   │
│   ├── components/                     # High-level landing page sections
│   │   ├── Hero3D.tsx                  # 3D interactive hero container scene
│   │   ├── GlobalNetwork.tsx           # 3D global shipping route sphere
│   │   ├── LiveTracking.tsx            # Live cargo tracking showcase
│   │   ├── ShipmentLifecycle.tsx       # Freight milestone visualizer
│   │   ├── AICommandCenter.tsx         # Telemetry command showcase
│   │   ├── Navbar.tsx                  # Dynamic role-aware navigation bar
│   │   └── Footer.tsx                  # Footer & legal disclosures
│   │
│   ├── config/                         # Centralized configuration (SEO, env)
│   ├── constants/                      # Route maps, static enumerations
│   ├── errorHelper/                    # AppError normalization, status code parser
│   ├── lib/                            # Core utilities (API client, cookies, permissions, GSAP)
│   ├── providers/                      # LenisProvider, SocketProvider
│   ├── services/                       # Typed API service abstractions (auth, shipment, chat, etc.)
│   ├── store/                          # Zustand global stores (auth, notification, location)
│   ├── types/                          # TypeScript domain models and API contracts
│   └── validations/                    # Zod schemas for forms
│
├── components/                         # Reusable atomic UI components
│   ├── admin/                          # Admin-specific modals & inspection widgets
│   ├── auth/                           # Authentication forms & card wrappers
│   ├── chat/                           # ChatClient, ShipmentChatModal, MessageReceiptTicks
│   ├── payment/                        # Stripe CheckoutForm, PaymentSuccessCard, RefundModal
│   ├── rag/                            # RagChatWidget, MarkdownRenderer
│   ├── seo/                            # JsonLd structured data components
│   └── ui/                             # Buttons, inputs, modals, badges, sonner
│
├── hooks/                              # Custom React Hooks
│   ├── useConversationsList.ts         # Real-time conversations list with unread counter
│   ├── useShipmentChat.ts              # Full WebSocket chat hook (typing, receipts, pagination)
│   ├── useNotificationSocket.ts        # Real-time socket notification listener
│   ├── useDesktopNotification.ts       # Browser push notification controller
│   └── useRagChat.ts                   # RAG AI query & stream management hook
│
├── middleware.ts                       # Next.js Edge Middleware (Auth guard, RBAC, Security headers)
└── package.json                        # Dependencies & build scripts
```

---

## 🚦 Role-Based Access Control (RBAC) Matrix

| Route Path | Description | Public | Customer | Agent | Admin |
|---|---|:---:|:---:|:---:|:---:|
| `/` | Interactive 3D Landing Page | ✅ | ✅ | ✅ | ✅ |
| `/about`, `/services`, `/contact` | Company & Services Info | ✅ | ✅ | ✅ | ✅ |
| `/quote` | Instant Freight Cost Calculator | ✅ | ✅ | ✅ | ✅ |
| `/login`, `/register` | Authentication Portals | ✅ | 🔄 *(Redirect)* | 🔄 *(Redirect)* | 🔄 *(Redirect)* |
| `/register-agent` | Freight Agent Career Application | ✅ | 🔄 *(Redirect)* | 🔄 *(Redirect)* | 🔄 *(Redirect)* |
| `/dashboard` | Intelligent Role Router | ❌ | ➡️ `/dashboard/customer` | ➡️ `/dashboard/agent` | ➡️ `/dashboard/admin` |
| `/dashboard/customer/*` | Customer Shipments & Bookings | ❌ | ✅ | ❌ | ❌ |
| `/dashboard/agent/*` | Agent Dispatch & Wallet | ❌ | ❌ | ✅ | ❌ |
| `/dashboard/admin/*` | Full Admin Console & User Dossiers | ❌ | ❌ | ❌ | ✅ |
| `/dashboard/chat` | Real-time Dispatch Chat | ❌ | ✅ | ✅ | ✅ |
| `/dashboard/notifications` | Real-time Notification Center | ❌ | ✅ | ✅ | ✅ |
| `/profile`, `/settings` | Profile & Security Management | ❌ | ✅ | ✅ | ✅ |

---

## 🔌 Real-Time WebSocket Architecture

FreightAgent uses a bi-directional event-driven architecture powered by Socket.IO:

```
[ Frontend Client ] <==== WebSocket (WSS) ====> [ Express / Nest.js Backend ]
        │                                                   │
        ├── join_conversation (shipmentId)                  ├── Room Partitioning
        ├── send_message (content, attachments)             ├── Message Persistence
        ├── user_typing (senderId, isTyping)                ├── Broadcast to Counterparty
        ├── mark_messages_read (conversationId)             ├── Read Receipt Dispatch
        └── notification:new (event, payload)               └── Push Notification Engine
```

### Key Socket Events Handled:
- `join_conversation`: Joins a discrete private room for a given conversation/shipment.
- `receive_message`: Delivers incoming messages with audio chime and desktop notification triggers.
- `user_typing` / `user_stop_typing`: Triggers animated typing indicators with automatic timeout clearance.
- `messages_read`: Updates message delivery ticks to double-blue checkmarks in real-time.
- `conversation_closed`: Locks chat input when a shipment reaches final destination delivery.
- `notification:new`: Dispatches toast notifications and updates global unread badge counters.

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the root directory and configure the following variables:

```bash
# Backend REST API Endpoint
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"

# Frontend Application Origin URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# WebSocket Server URL
NEXT_PUBLIC_SOCKET_URL="http://localhost:5000"

# Cookie Token Keys
NEXT_PUBLIC_ACCESS_TOKEN_KEY="accessToken"
NEXT_PUBLIC_REFRESH_TOKEN_KEY="refreshToken"
NEXT_PUBLIC_SESSION_TOKEN_KEY="better-auth.session_token"

# Stripe Public Key (Client-side checkout)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key_here"
```

---

## 💻 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher (Recommended: Node 20 LTS or Node 22)
- **Package Manager**: `npm` (v10+), `pnpm` (v9+), or `yarn`

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Infan-Jioun/FreightAgent-Frontend.git
cd freightagent-frontend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Update values in .env.local to match your local backend API and socket ports
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience the application.

### 4. Build for Production
```bash
npm run build
npm run start
```

### 5. Linting
```bash
npm run lint
```

---

## 🎨 Design System & Aesthetics

- **Color Palette**: Curated dark cyber-logistics aesthetic:
  - Background Base: `#0a0f0f` / `#050808`
  - Cards & Containers: Glassmorphism (`rgba(10, 25, 25, 0.7)` with `backdrop-blur-md`)
  - Accent Colors: Bright Emerald/Teal (`#00c9a7`), Vivid Cyan (`#00e5c0`), Amber Warning (`#f59e0b`), Rose Destructive (`#ef4444`)
  - Typography: Geist Sans (`--font-geist`), Inter with tabular figures for financial metrics.
- **Strict Tailwind CSS v4 Compliance**:
  - Fully migrated to CSS theme variables and `@import "tailwindcss"`.
  - Slash-opacity color syntax (`bg-black/50`, `text-teal-400/80`).
  - Flexbox `grow` / `shrink` standard.
  - Linear gradients using `bg-linear-to-*`.
  - Modern outline utility (`outline-hidden`).

---

## 📄 License & Ownership

FreightAgent Frontend is proprietary software developed for high-volume enterprise freight forwarding and multi-modal logistics operations. All rights reserved.
