"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  label?: string;
}

// Goes back in browser history, matching how the user arrived at the page.
export const BackButton = ({ label = "Back" }: BackButtonProps) => {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      className="-ml-3"
      onClick={() => router.back()}
    >
      <ArrowLeft aria-hidden />
      {label}
    </Button>
  );
};
