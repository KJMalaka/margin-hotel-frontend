"use client";
import { useEffect, useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addDays, format } from "date-fns";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const toIsoDate = (date: Date) => format(date, "yyyy-MM-dd");

// Largest room (the suites) sleeps four - see data/rooms.ts.
const guestOptions = ["1", "2", "3", "4"];


interface BookingSearchProps {
  className?: string;
  /** "stacked" for the booking panel; "bar" for the one-row hero search bar. */
  layout?: "stacked" | "bar";
}

/** Availability search - sends guests to /book with their dates pre-filled. */
export const BookingSearch = ({ className, layout = "stacked" }: BookingSearchProps) => {
  const router = useRouter();
  // Unique ids - this form can appear more than once on a page.
  const uid = useId();
  const ids = {
    checkIn: `${uid}-check-in`,
    checkOut: `${uid}-check-out`,
    guests: `${uid}-guests`,
    error: `${uid}-error`,
  };
  const isBar = layout === "bar";
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [today, setToday] = useState<string>();
  const [error, setError] = useState<string>();

  // Set on the client only, so the date limits use the guest's own timezone
  // and don't mismatch the server-rendered HTML.
  useEffect(() => setToday(toIsoDate(new Date())), []);

  const minCheckOut = checkIn
    ? toIsoDate(addDays(new Date(`${checkIn}T00:00`), 1))
    : today;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checkIn && checkOut && checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }
    setError(undefined);

    const params = new URLSearchParams({ guests });
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    router.push(`/book?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      // Unique names: the home page shows this form twice (hero + reservations).
      aria-label={isBar ? "Quick availability search" : "Check availability"}
      className={cn(
        "grid gap-5 sm:grid-cols-3",
        isBar && "lg:grid-cols-[1fr_1fr_0.8fr_auto] lg:items-end",
        className
      )}
    >
      <div className="space-y-2">
        <Label htmlFor={ids.checkIn}>
          Check-in
        </Label>
        <Input
          id={ids.checkIn}
          type="date"
          min={today}
          value={checkIn}
          onChange={(e) => {
            setCheckIn(e.target.value);
            if (checkOut && e.target.value >= checkOut) setCheckOut("");
          }}
          className="dark:[color-scheme:dark]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={ids.checkOut}>
          Check-out
        </Label>
        <Input
          id={ids.checkOut}
          type="date"
          min={minCheckOut}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? ids.error : undefined}
          className="dark:[color-scheme:dark]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={ids.guests}>
          Guests
        </Label>
        <Select value={guests} onValueChange={setGuests}>
          <SelectTrigger id={ids.guests}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {guestOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option} {option === "1" ? "guest" : "guests"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p
          id={ids.error}
          role="alert"
          className={cn(
            "flex items-start gap-1.5 font-bold text-danger sm:col-span-3",
            isBar && "lg:order-last lg:col-span-4"
          )}
        >
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span>
            <span className="sr-only">Error: </span>
            {error}
          </span>
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className={cn("sm:col-span-3 sm:justify-self-start", isBar && "lg:col-span-1")}
      >
        Check availability
      </Button>
    </form>
  );
};
