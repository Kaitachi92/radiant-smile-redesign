import { useEffect, useRef } from 'react';

export const LOGO_FRAME_COUNT = 192;
export function logoFramePath(index: number) {
  const frame = Math.max(0, Math.min(LOGO_FRAME_COUNT - 1, Math.round(index)));
  return `/frames-logo/frame_${String(frame).padStart(6, '0')}.webp`;
}

export function ScrollLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cache = new Map<number, HTMLImageElement>();
    let wanted = -1;
    let scheduled = 0;
    let disposed = false;

    const paint = (image: HTMLImageElement, frame: number) => {
      if (disposed || frame !== wanted || !image.complete || !image.naturalWidth) return;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.dataset.frame = String(frame);
      canvas.dataset.loaded = 'true';
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
      const rect = canvas.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
      const start = Math.max(0, top - window.innerHeight * 0.8);
      const end = Math.max(start + 1, top + rect.height * 0.65 - headerHeight);
      const progress = Math.max(0, Math.min(1, (window.scrollY - start) / (end - start)));
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
    <img className="hero-logo-poster" src={logoFramePath(LOGO_FRAME_COUNT - 1)} width={1280} height={720} alt="Diamante roxo do logotipo da Dra. Rebeca Galdino" fetchPriority="high" />
    <canvas ref={canvasRef} className="hero-logo-canvas" width={1280} height={720} role="img" aria-label="Animação do diamante roxo da Dra. Rebeca Galdino" />
  </div>;
}