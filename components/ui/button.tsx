import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-all duration-200 select-none cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#00c9a7]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0a0f0f] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
    {
        variants: {
            variant: {
                // Signature brand cyan-to-blue linear gradient (Primary CTA)
                gradient:
                    "bg-linear-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] font-bold shadow-md shadow-[#00c9a7]/20 hover:opacity-95 hover:shadow-lg hover:shadow-[#00c9a7]/30 border border-transparent",
                
                // Solid brand teal action
                teal:
                    "bg-[#00c9a7] hover:bg-[#00e5c0] text-[#0a0f0f] font-bold shadow-md shadow-[#00c9a7]/20 border border-transparent",
                
                // Dark slate card surface with subtle cyan border on hover (Secondary action)
                secondary:
                    "bg-[#0d1f1f] hover:bg-[#112a2a] text-[#7ecfc4] hover:text-[#e0faf5] border border-[#1a4a4a] hover:border-[#00c9a7]/40 shadow-xs",
                
                // Dark cyber glass with vibrant cyan text and border (Cyber outline)
                outline:
                    "bg-[#112a2a] hover:bg-[#00c9a7]/15 border border-[#1a4a4a] hover:border-[#00c9a7] text-[#00e5c0] font-bold shadow-xs",
                
                // Ghost button with minimal ambient hover
                ghost:
                    "bg-transparent hover:bg-[#1a4a4a]/40 text-[#7ecfc4] hover:text-[#00e5c0] border border-transparent",
                
                // Amber pending / alert action
                warning:
                    "bg-[#f59e0b]/15 hover:bg-[#f59e0b]/25 text-[#f59e0b] border border-[#f59e0b]/30 font-semibold shadow-xs",
                
                // Danger / Destructive action
                destructive:
                    "bg-[#ff6b6b]/15 hover:bg-[#ff6b6b]/25 text-[#ff6b6b] border border-[#ff6b6b]/30 font-semibold shadow-xs",
                
                // Ocean / maritime blue action
                blue:
                    "bg-[#00b4d8] hover:bg-[#00b4d8]/90 text-[#0a0f0f] font-bold shadow-md shadow-[#00b4d8]/20 border border-transparent",
                
                // Blue outline action
                "blue-outline":
                    "bg-[#00b4d8]/15 hover:bg-[#00b4d8]/25 text-[#00b4d8] border border-[#00b4d8]/40 font-semibold shadow-xs",
                
                // Filter Pill - Active state
                "pill-active":
                    "bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7] shadow-xs",
                
                // Filter Pill - Inactive state
                "pill-inactive":
                    "bg-[#0d1f1f] hover:bg-[#112a2a] text-[#7ecfc4] hover:text-[#e0faf5] border border-[#1a4a4a] hover:border-[#00c9a7]/40",

                // Default alias mapped to gradient primary
                default:
                    "bg-linear-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] font-bold shadow-md shadow-[#00c9a7]/20 hover:opacity-95 border border-transparent",

                // Link styled button
                link:
                    "text-[#00c9a7] underline-offset-4 hover:underline hover:text-[#00e5c0] p-0 h-auto border-none",
            },
            size: {
                xs: "h-6 px-2.5 text-[10px] gap-1",
                sm: "h-8 px-3.5 text-xs gap-1.5",
                default: "h-10 px-4 text-xs sm:text-sm gap-2",
                lg: "h-11 px-6 text-sm font-bold gap-2.5",
                xl: "h-12 px-7 text-base font-bold gap-3",
                icon: "size-9 p-2",
                "icon-xs": "size-6 p-1",
                "icon-sm": "size-7 p-1.5",
                "icon-lg": "size-11 p-2.5",
            },
            shape: {
                default: "rounded-xl",
                pill: "rounded-full",
                box: "rounded-2xl",
                square: "rounded-lg",
                md: "rounded-md",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            shape: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    isLoading?: boolean;
    loadingText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            shape,
            asChild = false,
            isLoading = false,
            loadingText,
            leftIcon,
            rightIcon,
            disabled,
            children,
            ...props
        },
        ref
    ): React.JSX.Element => {
        const Comp = asChild ? Slot : "button";

        return (
            <Comp
                ref={ref}
                data-slot="button"
                disabled={disabled || isLoading}
                className={cn(buttonVariants({ variant, size, shape, className }))}
                {...props}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="size-4 animate-spin shrink-0" />
                        <span>{loadingText || children}</span>
                    </>
                ) : (
                    <>
                        {leftIcon && <span className="shrink-0 inline-flex">{leftIcon}</span>}
                        {children}
                        {rightIcon && <span className="shrink-0 inline-flex">{rightIcon}</span>}
                    </>
                )}
            </Comp>
        );
    }
);

Button.displayName = "Button";

export { Button, buttonVariants };
