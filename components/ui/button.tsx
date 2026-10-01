import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-gold-deep",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-ocean underline-offset-4 hover:underline dark:text-gold",
        // Brand CTAs: solid champagne gold, deepening on hover.
        gold: "bg-gold text-navy-midnight transition-all hover:-translate-y-0.5 hover:bg-gold-deep hover:shadow-[0_12px_28px_-10px_rgba(185,154,69,0.65)] active:translate-y-0 motion-reduce:hover:translate-y-0",
        // Thin gold outline for secondary CTAs on navy or photography.
        goldOutline:
          "border-[1.5px] border-gold/60 bg-gold/[0.04] text-gold-light transition-all hover:border-gold hover:bg-gold hover:text-navy-midnight",
        // Navy outline for secondary CTAs on light sections.
        navyOutline:
          "border border-navy/40 text-navy hover:border-navy hover:bg-navy hover:text-ivory dark:border-gold/60 dark:text-gold dark:hover:bg-gold dark:hover:text-navy-midnight",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        // Uppercase, widely tracked label - the brand CTA style.
        brand:
          "h-[3.25rem] rounded-sm px-9 font-heading text-[0.7rem] font-medium uppercase tracking-brand duration-300",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
