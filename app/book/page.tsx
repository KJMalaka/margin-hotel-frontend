import { Navbar } from "@/components/layout/navbar";
import { FooterSection } from "@/components/layout/sections/footer";
import { GuestBookingForm } from "@/components/booking/guest-booking-form";
import { SectionHeading } from "@/components/brand/section";

export const metadata = {
    title: "Book Your Stay | Margin Hotel",
    description: "Reserve a room at Margin Hotel in a few simple steps.",
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Values arrive from the home page search bar - ignore anything malformed
// rather than pre-filling the form with junk.
function readDate(value: string | string[] | undefined) {
    return typeof value === "string" && ISO_DATE.test(value) ? value : undefined;
}

function readGuests(value: string | string[] | undefined) {
    const guests = Number(value);
    return Number.isInteger(guests) && guests >= 1 && guests <= 4 ? guests : undefined;
}

interface BookPageProps {
    searchParams: Record<string, string | string[] | undefined>;
}

export default function BookPage({ searchParams }: BookPageProps) {
    const initialStay = {
        checkInDate: readDate(searchParams.checkIn),
        checkOutDate: readDate(searchParams.checkOut),
        guests: readGuests(searchParams.guests),
    };

    return (
        <>
            <Navbar />
            <main className="container max-w-3xl py-20 sm:py-28">
                <SectionHeading
                    as="h1"
                    eyebrow="Reservations"
                    title="Book your stay"
                    description="Enter your details and pick a room - we'll confirm your booking right away."
                    className="mb-12"
                />

                <div className="border border-border bg-card p-6 sm:p-10">
                    <GuestBookingForm initialStay={initialStay} />
                </div>
            </main>
            <FooterSection />
        </>
    );
}
