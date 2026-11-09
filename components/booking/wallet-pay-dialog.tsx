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
                    "max-w-md gap-0 overflow-hidden p-0 sm:rounded-2xl",
                    isApple ? "bg-[#F2F2F7] text-[#1C1C1E]" : "bg-white text-[#202124]"
                )}
            >
                <div className="border-b border-black/10 bg-white px-5 py-4">
                    <DialogTitle className="font-sans text-xl font-semibold">
                        {isApple ? "Apple Pay" : "Google Pay"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-black/60">
                        Paying Margin Hotel
                    </DialogDescription>
                </div>

                <div className="space-y-4 p-4">
                    <div className="rounded-xl bg-white px-4 py-3">
                        <p className="text-sm text-black/60">{stayLabel}</p>
                        <p className="mt-1 text-3xl font-medium">{zar.format(total)}</p>
                    </div>

                    <fieldset className="space-y-2 rounded-xl bg-white p-3">
                        <legend className="px-1 pb-1 text-sm text-black/60">Pay with</legend>
                        {WALLET_CARDS.map((card) => (
                            <label
                                key={card.id}
                                className={cn(
                                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3",
                                    cardId === card.id
                                        ? isApple
                                            ? "border-[#0A66C2]"
                                            : "border-2 border-[#1A57C2]"
                                        : "border-black/15"
                                )}
                            >
                                <input
                                    type="radio"
                                    name="wallet-card"
                                    value={card.id}
                                    checked={cardId === card.id}
                                    onChange={() => setCardId(card.id)}
                                    className="h-4 w-4 accent-[#1A57C2]"
                                    disabled={authorising}
                                />
                                <span className="rounded bg-navy px-2 py-1 text-[0.65rem] font-bold text-white">
                                    {card.brand === "VISA" ? "VISA" : "MC"}
                                </span>
                                <span className="flex-1 text-sm">
                                    {card.label} •••• {card.last4}
                                </span>
                            </label>
                        ))}
                    </fieldset>

                    <div className="flex justify-between gap-4 rounded-xl bg-white px-4 py-3 text-sm">
                        <span className="text-black/60">Receipt to</span>
                        <span className="truncate">{email}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 px-5 pb-5">
                    {isApple ? (
                        <button
                            type="button"
                            onClick={confirm}
                            disabled={authorising}
                            className="flex flex-col items-center gap-2 rounded-lg px-6 py-2 text-[#0A66C2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66C2]"
                        >
                            <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#0A66C2]">
                                {authorising ? (
                                    <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" />
                                ) : (
                                    <Fingerprint className="h-8 w-8" aria-hidden="true" />
                                )}
                            </span>
                            <span className="font-semibold">
                                {authorising ? "Authorising..." : "Confirm with Touch ID"}
                            </span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={confirm}
                            disabled={authorising}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1A57C2] font-semibold text-white transition-colors hover:bg-[#123F8F] disabled:opacity-80"
                        >
                            {authorising && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                            {authorising ? "Authorising..." : `Pay ${zar.format(total)}`}
                        </button>
                    )}
                    <p className="text-xs text-black/60">
                        Simulated wallet - no real {isApple ? "Apple Pay" : "Google Pay"} transaction.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
