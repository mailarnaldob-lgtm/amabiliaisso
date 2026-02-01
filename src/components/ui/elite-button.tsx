import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * 2026 Elite Button Component
 * Features haptic-style CSS transitions with Cyan accent
 */

const eliteButtonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded",
    "text-sm font-semibold tracking-wide",
    "ring-offset-background transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "transform-gpu will-change-transform",
    "active:scale-[0.98] active:brightness-90",
    "hover:brightness-110",
    "transition-[transform,filter,box-shadow]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-r from-primary to-primary/90",
          "text-primary-foreground",
          "shadow-md shadow-primary/20",
          "hover:shadow-primary/40",
        ].join(" "),
        alpha: [
          "bg-gradient-to-r from-primary to-primary/90",
          "text-primary-foreground",
          "shadow-md shadow-primary/30",
          "hover:shadow-primary/50",
        ].join(" "),
        success: [
          "bg-gradient-to-r from-emerald-500 to-teal-600",
          "text-white",
          "shadow-md shadow-emerald-500/30",
          "hover:shadow-emerald-500/50",
        ].join(" "),
        vault: [
          "bg-gradient-to-r from-purple-500 to-pink-600",
          "text-white",
          "shadow-md shadow-purple-500/30",
          "hover:shadow-purple-500/50",
        ].join(" "),
        outline: [
          "border border-primary/50",
          "bg-transparent",
          "text-primary",
          "hover:bg-primary/10",
          "hover:border-primary",
        ].join(" "),
        ghost: [
          "bg-transparent",
          "text-foreground",
          "hover:bg-muted/50",
        ].join(" "),
        destructive: [
          "bg-gradient-to-r from-destructive to-destructive/80",
          "text-destructive-foreground",
          "shadow-md shadow-destructive/20",
          "hover:shadow-destructive/40",
        ].join(" "),
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 py-1 text-xs",
        lg: "h-14 px-8 py-3 text-base",
        xl: "h-16 px-10 py-4 text-lg",
        icon: "h-11 w-11 p-0",
      },
      loading: {
        true: "cursor-wait opacity-70",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false,
    },
  }
);

export interface EliteButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof eliteButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const EliteButton = React.forwardRef<HTMLButtonElement, EliteButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading,
      asChild = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(eliteButtonVariants({ variant, size, loading, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            <span className="ml-2">{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  }
);

EliteButton.displayName = "EliteButton";

export { EliteButton, eliteButtonVariants };
