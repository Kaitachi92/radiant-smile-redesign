import { useEffect, useRef } from 'react';

export const LOGO_FRAME_COUNT = 300;
export function logoFramePath(index: number) {
  const frame = Math.max(0, Math.min(LOGO_FRAME_COUNT - 1, Math.round(index)));
  return `/frames-logo/frame-${String(frame + 1).padStart(4, '0')}.webp`;
}

// Crop of the 1280x720 source that frames the assembled diamond generously.
const SOURCE = { x: 200, y: 90, w: 880, h: 560 };

export function ScrollLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cache = new Map<number, HTMLImageElement>();
    let wanted = -1;
    let scheduled = 0;
    let disposed = false;

    const paint = (image: HTMLImageElement, frame: number) => {
      if (disposed || frame !== wanted || !image.complete || !image.naturalWidth) return;
      // Frames were rendered on a real green screen: key it out so the diamond sits on the page colour.
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, SOURCE.x, SOURCE.y, SOURCE.w, SOURCE.h, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      const d = pixels.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i]!, g = d[i + 1]!, b = d[i + 2]!;
        const other = Math.max(r, b);
        const spill = g - other;
        if (spill <= 12) continue;
        const alpha = Math.max(0, Math.min(1, 1 - (spill - 12) / 30));
        d[i + 1] = other; // remove green fringe on edges
        d[i + 3] = alpha * 255;
      }
      context.putImageData(pixels, 0, 0);
      canvas.dataset['frame'] = String(frame);
      canvas.dataset['loaded'] = 'true';
    };

    const load = (frame: number) => {
      if (frame < 0 || frame >= LOGO_FRAME_COUNT) return;
      const existing = cache.get(frame);
      if (existing) { paint(existing, frame); return; }
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => paint(image, frame);
      image.src = logoFramePath(frame);
      cache.set(frame, image);
      // Keep decoded image memory bounded, including during rapid scrolling.
      if (cache.size > 16) {
        const farthest = [...cache.keys()].sort((a, b) => Math.abs(b - wanted) - Math.abs(a - wanted))[0];
        if (farthest !== undefined) {
          const old = cache.get(farthest);
          if (old) { old.onload = null; if (!old.complete) old.src = ''; }
          cache.delete(farthest);
        }
      }
    };

    const update = () => {
      scheduled = 0;
      // Progress follows the pinned hero track: full sequence plays while the hero stays sticky.
      const track = canvas.closest<HTMLElement>('.hero-track');
      const pinned = canvas.closest<HTMLElement>('.hero');
      let progress = 1;
      if (track && pinned) {
        const distance = Math.max(1, track.offsetHeight - pinned.offsetHeight);
        progress = Math.max(0, Math.min(1, -track.getBoundingClientRect().top / distance));
      }
      const frame = reducedMotion.matches ? LOGO_FRAME_COUNT - 1 : Math.round(progress * (LOGO_FRAME_COUNT - 1));
      wanted = frame;
      load(frame);
      if (!reducedMotion.matches) {
        for (let offset = 1; offset <= 3; offset++) { load(frame + offset); load(frame - offset); }
      }
    };
    const schedule = () => { if (!scheduled) scheduled = window.requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reducedMotion.addEventListener('change', schedule);
    return () => {
      disposed = true;
      window.cancelAnimationFrame(scheduled);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reducedMotion.removeEventListener('change', schedule);
      for (const image of cache.values()) { image.onload = null; if (!image.complete) image.src = ''; }
      cache.clear();
    };
  }, []);

  return <div className="hero-logo-wrap">
    <canvas ref={canvasRef} className="hero-logo-canvas" width={880} height={560} role="img" aria-label="Animação do diamante roxo da Dra. Rebeca Galdino" />
  </div>;
}