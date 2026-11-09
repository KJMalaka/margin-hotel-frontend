"use client";

import { Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export const PROCESSING_STEPS = [
    { id: "verify", label: "Verifying payment details" },
    { id: "booking", label: "Creating your booking" },
    { id: "invoice", label: "Creating your invoice" },
    { id: "payment", label: "Confirming payment" },
] as const;

export type ProcessingStepId = (typeof PROCESSING_STEPS)[number]["id"];

interface PaymentProcessingProps {
    currentStep: ProcessingStepId;
    amountLabel: string;
    methodLabel: string;
}

/** Shown while BookingForm runs the booking -> invoice -> checkout calls. */
export function PaymentProcessing({ currentStep, amountLabel, methodLabel }: PaymentProcessingProps) {
    const currentIndex = PROCESSING_STEPS.findIndex((step) => step.id === currentStep);

    return (
        <section
            aria-live="polite"
            aria-busy="true"
            className="flex flex-col items-center gap-5 border bg-card px-6 py-10 text-center"
        >
            <Loader2 className="h-12 w-12 animate-spin text-gold" aria-hidden="true" />
            <div className="space-y-2">
                <h2 className="font-display text-3xl">Processing your payment</h2>
                <p className="text-sm text-muted-foreground">
                    Please don&apos;t close this page or press back.
                </p>
            </div>

            <ol className="w-full max-w-sm space-y-3 border-t pt-5 text-left text-sm">
                {PROCESSING_STEPS.map((step, index) => {
                    const done = index < currentIndex;
                    const active = index === currentIndex;
                    return (
                        <li
                            key={step.id}
                            className={cn(
                                "flex items-center gap-3",
                                active && "font-semibold",
                                !done && !active && "text-muted-foreground"
                            )}
                        >
                            {done ? (
                                <Check className="h-5 w-5 text-green-700 dark:text-green-400" aria-hidden="true" />
                            ) : active ? (
                                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                            ) : (
                                <span className="h-5 w-5 rounded-full border-2 border-border" aria-hidden="true" />
                            )}
                            <span>
                                {step.id === "payment" ? `${step.label} of ${amountLabel}` : step.label}
                                {done && <span className="sr-only"> (done)</span>}
                            </span>
                        </li>
                    );
                })}
            </ol>
            <p className="text-xs text-muted-foreground">{methodLabel}</p>
        </section>
    );
}
