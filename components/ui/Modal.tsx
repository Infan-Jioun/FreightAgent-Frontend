"use client";

import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

import {
    type ModalMaxWidth,
    type ModalHeaderProps,
    type ModalBodyProps,
    type ModalFooterProps,
    type ModalProps,
} from "@/app/types/interface";

export type {
    ModalMaxWidth,
    ModalHeaderProps,
    ModalBodyProps,
    ModalFooterProps,
    ModalProps,
};

const maxWidthClasses: Record<ModalMaxWidth, string> = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full: "max-w-full",
};

export function ModalHeader({
    title,
    description,
    icon,
    headerRight,
    showCloseButton = true,
    onClose,
    className,
    children,
}: ModalHeaderProps): React.JSX.Element {
    if (children) {
        return (
            <div
                className={cn(
                    "flex items-center justify-between border-b border-[#1a4a4a] pb-3 shrink-0",
                    className
                )}
            >
                {children}
            </div>
        );
    }

    const renderIcon = () => {
        if (!icon) return null;
        if (React.isValidElement(icon)) return icon;
        if (
            typeof icon === "function" ||
            (typeof icon === "object" && icon !== null && "$$typeof" in icon)
        ) {
            const IconComponent = icon as unknown as React.ComponentType<{
                size?: number;
                className?: string;
            }>;
            return <IconComponent size={20} />;
        }
        if (typeof icon === "string" || typeof icon === "number") return icon;
        return null;
    };

    return (
        <div
            className={cn(
                "flex items-center justify-between border-b border-[#1a4a4a] pb-3 shrink-0 gap-3",
                className
            )}
        >
            <div className="flex items-center gap-3 min-w-0">
                {icon && (
                    <div className="p-2.5 rounded-2xl bg-[#00c9a7]/15 border border-[#00c9a7]/30 text-[#00e5c0] shrink-0">
                        {renderIcon()}
                    </div>
                )}
                <div className="min-w-0">
                    {title && (
                        <h3 className="text-base font-extrabold text-[#e0faf5] tracking-tight truncate">
                            {title}
                        </h3>
                    )}
                    {description && (
                        <p className="text-xs text-[#7ecfc4]/80 mt-0.5 leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {headerRight}
                {showCloseButton && onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-xl bg-[#112a2a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#1a4a4a] border border-[#1a4a4a] transition-colors cursor-pointer focus:outline-hidden focus:ring-3 focus:ring-[#00c9a7]/40"
                        title="Close Modal"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}

export function ModalBody({
    children,
    className,
    scrollable = true,
}: ModalBodyProps): React.JSX.Element {
    return (
        <div
            className={cn(
                "flex-1",
                scrollable && "overflow-y-auto custom-modal-scrollbar pr-1",
                className
            )}
        >
            {children}
        </div>
    );
}

export function ModalFooter({
    children,
    className,
}: ModalFooterProps): React.JSX.Element {
    return (
        <div
            className={cn(
                "flex items-center justify-end gap-2.5 pt-3 border-t border-[#1a4a4a] shrink-0",
                className
            )}
        >
            {children}
        </div>
    );
}


export function Modal({
    isOpen = true,
    onClose,
    title,
    description,
    icon,
    headerRight,
    footer,
    maxWidth = "md",
    width,
    className,
    contentClassName,
    overlayClassName,
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEsc = true,
    children,
}: ModalProps): React.JSX.Element {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === "Escape" && closeOnEsc) {
                onClose();
            }
        },
        [closeOnEsc, onClose]
    );

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, handleKeyDown]);

    const resolvedMaxWidth = maxWidthClasses[maxWidth] || maxWidthClasses.md;

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className={cn(
                        "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs",
                        overlayClassName
                    )}
                    onClick={(e) => {
                        if (closeOnOverlayClick && e.target === e.currentTarget) {
                            onClose();
                        }
                    }}
                    role="dialog"
                    aria-modal="true"
                >
                    <motion.div
                        data-lenis-prevent
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        style={width ? { maxWidth: typeof width === "number" ? `${width}px` : width } : undefined}
                        className={cn(
                            "w-full bg-[#0d1f1f] border border-[#1a4a4a] rounded-3xl shadow-2xl shadow-black p-6 space-y-4 max-h-[92vh] flex flex-col relative",
                            resolvedMaxWidth,
                            className
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {(title || description || icon || headerRight || showCloseButton) && (
                            <ModalHeader
                                title={title}
                                description={description}
                                icon={icon}
                                headerRight={headerRight}
                                showCloseButton={showCloseButton}
                                onClose={onClose}
                            />
                        )}

                        <div className={cn("flex-1 overflow-y-auto custom-modal-scrollbar", contentClassName)}>
                            {children}
                        </div>

                        {footer && <ModalFooter>{footer}</ModalFooter>}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
