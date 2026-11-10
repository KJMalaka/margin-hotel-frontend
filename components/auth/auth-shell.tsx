import Link from "next/link";
import { Logo } from "@/components/brand/logo";

/** Shared frame for the sign-in and sign-up pages: logo home link + card. */
export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main
      id="main"
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10"
    >
      <Link
        href="/"
        aria-label="Margin Hotel home"
        className="inline-flex min-h-tap items-center rounded-md"
      >
        <Logo tone="ink" className="text-base" markClassName="size-9" />
      </Link>

      <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-5 shadow-md sm:p-8">
        <div className="space-y-1">
          <h1 className="text-3xl">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </main>
  );
}
