"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  src: string;
  alt: string;
  label: string;
}

// Desktop layout (4 columns): one large feature image, then a mix of single
// and double-width tiles that fill three rows exactly.
const tileClasses = [
  "col-span-2 h-64 sm:h-96 lg:h-auto lg:row-span-2",
  "",
  "",
  "lg:col-span-2",
  "lg:col-span-2",
  "col-span-2",
];

/**
 * Photo grid + lightbox. Each tile is a button; the viewer is a Radix dialog,
 * so focus is trapped inside, Esc closes it and focus returns to the tile.
 * Left/right arrow keys (and the on-screen buttons) move between photos.
 */
export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  // The tile that opened the viewer gets focus back when it closes.
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const openedFrom = useRef(0);
  const count = images.length;
  const current = index === null ? null : images[index];

  const step = (delta: number) =>
    setIndex((i) => (i === null ? i : (i + delta + count) % count));

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 lg:auto-rows-[15rem] lg:grid-cols-4">
        {images.map(({ src, alt, label }, i) => (
          <li
            key={label}
            className={cn(
              "overflow-hidden rounded-md bg-card shadow-sm max-[399px]:col-span-1",
              tileClasses[i]
            )}
          >
            <button
              type="button"
              ref={(el) => {
                tileRefs.current[i] = el;
              }}
              onClick={() => {
                openedFrom.current = i;
                setIndex(i);
              }}
              className="group flex h-full w-full flex-col text-left"
            >
              {/* Fixed-height box + `fill` reserves space, so no layout shift. */}
              <span className="relative block h-44 w-full flex-1 bg-muted sm:h-56 lg:h-auto">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                  className="object-cover"
                />
              </span>
              <span className="flex min-h-tap items-center justify-between gap-2 px-3 py-2 font-bold group-hover:underline group-hover:underline-offset-4">
                {label}
                <Expand aria-hidden className="size-5 shrink-0 text-muted-foreground" />
                <span className="sr-only">- open larger photo</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={current !== null} onOpenChange={(open) => !open && setIndex(null)}>
        <DialogContent
          onKeyDown={onKeyDown}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            tileRefs.current[openedFrom.current]?.focus();
          }}
          className="max-w-5xl gap-4 p-3 pt-3 sm:p-4"
        >
          {current && index !== null && (
            <>
              <div className="pr-12">
                <DialogTitle>{current.label}</DialogTitle>
                {/* Announced when the photo changes. */}
                <DialogDescription aria-live="polite">
                  Photo {index + 1} of {count}. Use the left and right arrow keys to move between photos.
                </DialogDescription>
              </div>
              <div className="relative aspect-[3/2] w-full overflow-hidden rounded-md bg-muted">
                <Image
                  key={current.src}
                  src={current.src}
                  alt={current.alt}
                  fill
                  sizes="(min-width: 1024px) 64rem, 100vw"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button type="button" variant="secondary" onClick={() => step(-1)}>
                  <ChevronLeft aria-hidden />
                  Previous
                </Button>
                <Button type="button" variant="secondary" onClick={() => step(1)}>
                  Next
                  <ChevronRight aria-hidden />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
