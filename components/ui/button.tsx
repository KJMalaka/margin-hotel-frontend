import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
  Button roles - pick by meaning, not by look:
  - default (primary): the one main action in a view (Book, Save, Sign in)
  - secondary:         alternative actions next to a primary (Cancel, Back)
  - view:              opening or viewing something (View room, View invoice)
  - destructive:       deletes or removes data (Delete, Log out confirm)
  - ghost / link:      low-emphasis toolbar and inline actions
  - brand / brandOutline: CTAs on the navy header and other navy surfaces
  Every size is at least 44px tall so it is easy to tap. Focus uses the
  global :focus-visible outline from globals.css.
*/
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-bold transition-colors disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary:
          "border-2 border-primary bg-secondary text-primary hover:bg-accent dark:text-primary",
        outline:
          "border border-input bg-card text-foreground hover:bg-accent",
        view: "bg-view text-view-foreground hover:bg-view-hover",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive-hover",
        ghost: "text-foreground hover:bg-accent",
        link: "text-primary underline underline-offset-4 hover:no-underline",
        brand: "bg-brand-gold text-brand hover:bg-brand-foreground",
        brandOutline:
          "border-2 border-brand-gold text-brand-foreground hover:bg-brand-gold hover:text-brand",
      },
      size: {
        default: "min-h-tap px-5 py-2 text-base",
        sm: "min-h-tap px-3 py-1.5 text-base",
        lg: "min-h-12 px-7 py-3 text-lg",
        icon: "size-tap",
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
