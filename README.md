# Margin Hotel — Frontend

Frontend for Margin Hotel — a capstone project (ADP372S) that digitises front-desk operations for a small hotel chain in South Africa. This is the public booking site and the admin/staff pages that talk to the [Spring Boot backend](../MarginHotelManagement).

## Tech stack

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui (Radix UI components)
- Axios for API calls
- React Hook Form + Zod for form validation

## Getting started

1. Install dependencies:

```
npm install
```

2. Create `.env.local` in the project root and point it at your running backend:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/marginhotel
```

If this variable isn't set, the API client falls back to that same URL, so `.env.local` is only needed if your backend runs somewhere else.

3. Run the dev server:

```
npm run dev
```

4. Open `http://localhost:3000`.

The backend must be running (see the backend repo's README) for pages that fetch live data — rooms, bookings, payments, invoices, staff — to work.

## Notes

- The backend doesn't require login for most GET requests yet, so admin pages currently call the API directly without an auth token. This will change once the frontend login flow is wired up to the backend's JWT auth.
- Personal guest details (name, phone) are only ever shown to staff on admin pages — the public booking flow only ever prefills an email for a returning guest, never their name or number.
