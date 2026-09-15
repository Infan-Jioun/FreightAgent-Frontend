import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-3 focus:ring-ring/50",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/80",
                outline: "text-foreground border-border",
                teal: "border-[#00c9a7]/30 bg-[#00c9a7]/15 text-[#00e5c0]",
                blue: "border-blue-500/30 bg-blue-500/15 text-blue-400",
                purple: "border-purple-500/30 bg-purple-500/15 text-purple-400",
                amber: "border-amber-500/30 bg-amber-500/15 text-amber-400",
                orange: "border-orange-500/30 bg-orange-500/15 text-orange-400",
                green: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
                red: "border-rose-500/30 bg-rose-500/15 text-rose-400",
                gray: "border-neutral-700 bg-neutral-800/80 text-neutral-300",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
