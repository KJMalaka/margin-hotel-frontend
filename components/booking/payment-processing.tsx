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
            className="flex flex-col items-center gap-5 rounded-lg border border-border bg-card px-4 py-8 text-center sm:px-6"
        >
            <Loader2 className="size-12 text-primary motion-safe:animate-spin" aria-hidden="true" />
            <div className="space-y-2">
                <h2 className="text-2xl">Processing your payment</h2>
                <p className="text-muted-foreground">
                    Please don&apos;t close this page or press back.
                </p>
            </div>

            <ol className="w-full max-w-sm space-y-3 border-t border-border pt-5 text-left">
                {PROCESSING_STEPS.map((step, index) => {
                    const done = index < currentIndex;
                    const active = index === currentIndex;
                    return (
                        <li
                            key={step.id}
                            className={cn(
                                "flex items-center gap-3",
                                active && "font-bold",
                                !done && !active && "text-muted-foreground"
                            )}
                        >
                            {done ? (
                                <Check className="size-5 shrink-0 text-success" aria-hidden="true" />
                            ) : active ? (
                                <Loader2 className="size-5 shrink-0 motion-safe:animate-spin" aria-hidden="true" />
                            ) : (
                                <span className="size-5 shrink-0 rounded-full border-2 border-input" aria-hidden="true" />
                            )}
                            <span>
                                {step.id === "payment" ? `${step.label} of ${amountLabel}` : step.label}
                                {done && <span className="sr-only"> (done)</span>}
                            </span>
                        </li>
                    );
                })}
            </ol>
            <p className="text-muted-foreground">{methodLabel}</p>
        </section>
    );
}
