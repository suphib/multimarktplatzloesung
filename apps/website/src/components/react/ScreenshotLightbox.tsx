import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Global lightbox component — mount once in the layout.
 *
 * Any element on the page can open it by dispatching:
 *   window.dispatchEvent(new CustomEvent('lightbox:open', {
 *     detail: { screenshots: [...], index: 0 }
 *   }))
 *
 * Each screenshot: { src: string, alt: string }
 */

interface LightboxImage {
  src: string;
  alt: string;
}

interface LightboxEvent {
  screenshots: LightboxImage[];
  index: number;
}

export function ScreenshotLightbox() {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<LightboxImage[]>([]);
  const [index, setIndex] = useState(0);

  const close = useCallback(() => {
    setOpen(false);
    document.body.style.overflow = '';
  }, []);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  // Listen for open events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<LightboxEvent>).detail;
      setImages(detail.screenshots);
      setIndex(detail.index);
      setOpen(true);
      document.body.style.overflow = 'hidden';
    };
    window.addEventListener('lightbox:open', handler);
    return () => window.removeEventListener('lightbox:open', handler);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, close, prev, next]);

  const current = images[index];

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8"
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 rounded-full p-2 text-white transition-colors"
            aria-label="Schließen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
              {index + 1} / {images.length}
            </div>
          )}

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 rounded-full p-2 sm:p-3 text-white transition-colors"
              aria-label="Vorheriges Bild"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Image */}
          <motion.img
            key={current.src}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            src={current.src}
            alt={current.alt}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 rounded-full p-2 sm:p-3 text-white transition-colors"
              aria-label="Nächstes Bild"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Caption */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm text-center max-w-md">
            {current.alt}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
