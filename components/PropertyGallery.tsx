"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

interface GalleryImage {
  src: string;
  alt: string;
}

const PREVIEW_COUNT = 5;

export default function PropertyGallery({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length],
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [openIndex, close, prev, next]);

  if (images.length === 0) return null;

  const preview = images.slice(0, PREVIEW_COUNT);
  const remaining = images.length - PREVIEW_COUNT;

  return (
    <>
      <div className="mt-8 grid grid-cols-4 grid-rows-2 gap-3">
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="relative col-span-4 row-span-1 aspect-[16/9] overflow-hidden rounded-sm bg-ink/10 sm:col-span-2 sm:row-span-2 sm:aspect-auto"
        >
          <Image
            src={preview[0].src}
            alt={preview[0].alt}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
            priority
          />
        </button>

        {preview.slice(1).map((img, i) => {
          const index = i + 1;
          const isLastThumb = index === preview.length - 1 && remaining > 0;
          return (
            <button
              key={img.src}
              type="button"
              onClick={() => setOpenIndex(index)}
              className="relative col-span-2 row-span-1 aspect-[4/3] overflow-hidden rounded-sm bg-ink/10 sm:col-span-1"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
              {isLastThumb && (
                <span className="absolute inset-0 flex items-center justify-center bg-ink/60 font-mono text-lg text-limestone">
                  +{remaining}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4"
            onClick={close}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Κλείσιμο"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-limestone/30 text-limestone transition-colors hover:border-limestone"
            >
              ✕
            </button>

            <span className="absolute left-4 top-4 font-mono text-xs uppercase tracking-wide text-limestone/70">
              {openIndex + 1} / {images.length}
            </span>

            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Προηγούμενη"
                className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-limestone/30 text-limestone transition-colors hover:border-limestone sm:left-8"
              >
                ←
              </button>
            )}

            <motion.div
              key={openIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="relative h-[80vh] w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[openIndex].src}
                alt={images[openIndex].alt}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
            </motion.div>

            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Επόμενη"
                className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-limestone/30 text-limestone transition-colors hover:border-limestone sm:right-8"
              >
                →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
