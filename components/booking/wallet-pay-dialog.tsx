"use client";

import { useEffect, useState } from "react";
import { Fingerprint, Loader2 } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { SimulatedPaymentDetails } from "@/lib/validations/payment-schema";

const zar = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
});

// Cards "saved" in the simulated wallet.
const WALLET_CARDS = [
    { id: "visa", brand: "VISA", label: "Visa", last4: "4242" },
    { id: "mc", brand: "MASTERCARD", label: "Mastercard", last4: "5100" },
] as const;

type WalletMethod = "APPLE_PAY" | "GOOGLE_PAY";

interface WalletPayDialogProps {
    method: WalletMethod | null;
    total: number;
    email: string;
    stayLabel: string;
    onOpenChange: (open: boolean) => void;
    onConfirm: (details: SimulatedPaymentDetails) => void;
}

/**
 * A look-alike of the Apple Pay / Google Pay payment sheet for the demo.
 * Nothing talks to Apple or Google - confirming just hands a simulated
 * wallet card back to the payment step.
 */
export function WalletPayDialog({
    method,
    total,
    email,
    stayLabel,
    onOpenChange,
    onConfirm,
}: WalletPayDialogProps) {
    const [cardId, setCardId] = useState<(typeof WALLET_CARDS)[number]["id"]>("visa");
    const [authorising, setAuthorising] = useState(false);
    const isApple = method === "APPLE_PAY";

    useEffect(() => {
        if (method) {
            setCardId("visa");
            setAuthorising(false);
        }
    }, [method]);

    function confirm() {
        if (!method || authorising) return;
        const card = WALLET_CARDS.find((item) => item.id === cardId) ?? WALLET_CARDS[0];
        setAuthorising(true);
        // A short pause stands in for Touch ID / the wallet authorising.
        window.setTimeout(() => {
            onConfirm({
                method,
                brand: card.brand,
                last4: card.last4,
                simulateDecline: false,
            });
        }, 1200);
    }

    return (
        <Dialog open={method !== null} onOpenChange={(open) => !authorising && onOpenChange(open)}>
            <DialogContent
                className={cn(
                    "max-w-md gap-0 bg-muted p-0 text-foreground"
                )}
            >
                <div className="border-b border-border bg-card px-5 py-4 pr-14">
                    <DialogTitle>
                        {isApple ? "Apple Pay" : "Google Pay"}
                    </DialogTitle>
                    <DialogDescription>
                        Paying Margin Hotel
                    </DialogDescription>
                </div>

                <div className="space-y-4 p-4">
                    <div className="rounded-md bg-card px-4 py-3">
                        <p className="text-muted-foreground">{stayLabel}</p>
                        <p className="mt-1 text-3xl font-bold tabular-nums">{zar.format(total)}</p>
                    </div>

                    <fieldset className="space-y-2 rounded-md bg-card p-3">
                        <legend className="float-left mb-2 w-full px-1 font-bold">Pay with</legend>
                        {WALLET_CARDS.map((card) => (
                            <label
                                key={card.id}
                                className={cn(
                                    "flex min-h-tap cursor-pointer items-center gap-3 rounded-md border-2 p-3",
                                    cardId === card.id
                                        ? "border-primary bg-info-bg"
                                        : "border-border"
                                )}
                            >
                                <input
                                    type="radio"
                                    name="wallet-card"
                                    value={card.id}
                                    checked={cardId === card.id}
                                    onChange={() => setCardId(card.id)}
                                    className="size-5 accent-primary"
                                    disabled={authorising}
                                />
                                <span className="rounded bg-brand px-2 py-1 text-xs font-bold text-brand-foreground">
                                    {card.brand === "VISA" ? "VISA" : "MC"}
                                </span>
                                <span className="flex-1">
                                    {card.label} •••• {card.last4}
                                </span>
                            </label>
                        ))}
                    </fieldset>

                    <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 rounded-md bg-card px-4 py-3">
                        <span className="text-muted-foreground">Receipt to</span>
                        <span className="break-all">{email}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 px-5 pb-5">
                    {isApple ? (
                        <button
                            type="button"
                            onClick={confirm}
                            disabled={authorising}
                            className="flex flex-col items-center gap-2 rounded-md px-6 py-2 text-primary"
                        >
                            <span className="flex size-14 items-center justify-center rounded-full border-2 border-primary">
                                {authorising ? (
                                    <Loader2 className="size-7 motion-safe:animate-spin" aria-hidden="true" />
                                ) : (
                                    <Fingerprint className="size-8" aria-hidden="true" />
                                )}
                            </span>
                            <span className="font-bold">
                                {authorising ? "Authorising..." : "Confirm with Touch ID"}
                            </span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={confirm}
                            disabled={authorising}
                            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-lg font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-80"
                        >
                            {authorising && <Loader2 className="size-5 motion-safe:animate-spin" aria-hidden="true" />}
                            {authorising ? "Authorising..." : `Pay ${zar.format(total)}`}
                        </button>
                    )}
                    <p className="text-center text-muted-foreground">
                        Simulated wallet - no real {isApple ? "Apple Pay" : "Google Pay"} transaction.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
