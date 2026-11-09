"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Lock, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { WalletPayDialog } from "@/components/booking/wallet-pay-dialog";
import { cn } from "@/lib/utils";
import {
    CARD_BRAND_LABELS,
    PAYMENT_METHOD_LABELS,
    TEST_CARD_DECLINED,
    TEST_CARD_SUCCESS,
    cardPaymentDefaultValues,
    cardPaymentSchema,
    detectCardBrand,
    digitsOnly,
    formatCardNumber,
    formatExpiry,
    type CardPaymentValues,
    type PaymentMethod,
    type SimulatedPaymentDetails,
} from "@/lib/validations/payment-schema";

const zar = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
});

const METHOD_OPTIONS: { value: PaymentMethod; icon: typeof CreditCard }[] = [
    { value: "CARD", icon: CreditCard },
    { value: "APPLE_PAY", icon: Smartphone },
    { value: "GOOGLE_PAY", icon: Smartphone },
];

interface PaymentMethodStepProps {
    total: number;
    email: string;
    stayLabel: string;
    disabled?: boolean;
    onPay: (details: SimulatedPaymentDetails) => void;
}

/**
 * Simulated payment step: card form plus Apple Pay / Google Pay sheets.
 * It only validates on the client and hands back the brand + last four
 * digits; BookingForm then runs the real booking -> invoice -> checkout calls.
 */
export function PaymentMethodStep({
    total,
    email,
    stayLabel,
    disabled,
    onPay,
}: PaymentMethodStepProps) {
    const [method, setMethod] = useState<PaymentMethod>("CARD");
    const [walletOpen, setWalletOpen] = useState<"APPLE_PAY" | "GOOGLE_PAY" | null>(null);

    const form = useForm<CardPaymentValues>({
        resolver: zodResolver(cardPaymentSchema),
        defaultValues: cardPaymentDefaultValues,
    });

    const cardBrand = detectCardBrand(form.watch("cardNumber"));

    function submitCard(values: CardPaymentValues) {
        const digits = digitsOnly(values.cardNumber);
        onPay({
            method: "CARD",
            brand: detectCardBrand(digits),
            last4: digits.slice(-4),
            cardholderName: values.cardholderName.trim(),
            simulateDecline: digits === digitsOnly(TEST_CARD_DECLINED),
        });
    }

    function fillTestCard() {
        form.setValue("cardNumber", TEST_CARD_SUCCESS, { shouldValidate: true });
        form.setValue("expiry", "12/30", { shouldValidate: true });
        form.setValue("cvc", "123", { shouldValidate: true });
    }

    return (
        <div className="space-y-5 border bg-card p-5">
            <h3 className="font-semibold">Choose how to pay</h3>

            <div role="radiogroup" aria-label="Payment method" className="grid grid-cols-3 gap-2">
                {METHOD_OPTIONS.map(({ value, icon: Icon }) => (
                    <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={method === value}
                        disabled={disabled}
                        onClick={() => setMethod(value)}
                        className={cn(
                            "flex h-16 flex-col items-center justify-center gap-1 border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                            method === value
                                ? "border-2 border-navy bg-secondary text-navy dark:border-gold dark:text-gold"
                                : "border-input bg-background hover:bg-accent"
                        )}
                    >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                        {PAYMENT_METHOD_LABELS[value]}
                    </button>
                ))}
            </div>

            {method === "CARD" ? (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(submitCard)} className="space-y-4" noValidate>
                        <FormField
                            control={form.control}
                            name="cardholderName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name on card</FormLabel>
                                    <FormControl>
                                        <Input autoComplete="cc-name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="cardNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Card number</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input
                                                inputMode="numeric"
                                                autoComplete="cc-number"
                                                placeholder="1234 5678 9012 3456"
                                                className="pr-24 tracking-wider"
                                                {...field}
                                                onChange={(event) =>
                                                    field.onChange(formatCardNumber(event.target.value))
                                                }
                                            />
                                        </FormControl>
                                        {cardBrand !== "CARD" && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded border bg-background px-2 py-0.5 text-xs font-bold text-navy dark:text-gold">
                                                {CARD_BRAND_LABELS[cardBrand]}
                                            </span>
                                        )}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="expiry"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expiry (MM/YY)</FormLabel>
                                        <FormControl>
                                            <Input
                                                inputMode="numeric"
                                                autoComplete="cc-exp"
                                                placeholder="MM/YY"
                                                {...field}
                                                onChange={(event) =>
                                                    field.onChange(formatExpiry(event.target.value))
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cvc"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CVC</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                inputMode="numeric"
                                                autoComplete="cc-csc"
                                                placeholder="123"
                                                {...field}
                                                onChange={(event) =>
                                                    field.onChange(digitsOnly(event.target.value).slice(0, 3))
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="saveCard"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-2 space-y-0">
                                    <FormControl>
                                        <input
                                            type="checkbox"
                                            checked={field.value}
                                            onChange={(event) => field.onChange(event.target.checked)}
                                            className="h-4 w-4 accent-navy"
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal text-muted-foreground">
                                        Save this card for future stays
                                    </FormLabel>
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            variant="gold"
                            size="brand"
                            className="w-full"
                            disabled={disabled}
                        >
                            <Lock className="mr-2 h-4 w-4" aria-hidden="true" />
                            Pay {zar.format(total)}
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                            Demo only - no real card is charged.{" "}
                            <button
                                type="button"
                                onClick={fillTestCard}
                                className="text-ocean underline underline-offset-4 dark:text-gold"
                            >
                                Fill test card
                            </button>{" "}
                            · Use {TEST_CARD_DECLINED} to see a declined payment.
                        </p>
                    </form>
                </Form>
            ) : (
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        You&apos;ll confirm the payment in the {PAYMENT_METHOD_LABELS[method]} sheet.
                    </p>
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => setWalletOpen(method)}
                        className={cn(
                            "flex h-12 w-full items-center justify-center rounded-md text-base font-semibold transition-opacity hover:opacity-90 disabled:opacity-50",
                            method === "APPLE_PAY"
                                ? "bg-black text-white"
                                : "border border-[#DADCE0] bg-white text-[#202124]"
                        )}
                    >
                        Pay with {PAYMENT_METHOD_LABELS[method]}
                    </button>
                </div>
            )}

            <WalletPayDialog
                method={walletOpen}
                total={total}
                email={email}
                stayLabel={stayLabel}
                onOpenChange={(open) => !open && setWalletOpen(null)}
                onConfirm={(details) => {
                    setWalletOpen(null);
                    onPay(details);
                }}
            />
        </div>
    );
}
