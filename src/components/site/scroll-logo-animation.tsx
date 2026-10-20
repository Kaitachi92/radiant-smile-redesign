import { useEffect, useRef, useState } from "react";

const FRAME_COUNT = 300;
const FRAME_DIRECTORY = "/frameia-sequencia";
const FRAME_CROP = { x: 280, y: 72, width: 720, height: 648 };
const CHROMA_KEY = { red: 61, green: 137, blue: 66, threshold: 5, feather: 64 };

export function getMobileScrollProgress(
  scrollY: number,
  trackTop: number,
  trackHeight: number,
  sceneHeight: number,
  stickyTop: number,
) {
  const scrollDistance = Math.max(1, trackHeight - sceneHeight);
  return Math.max(0, Math.min(1, (scrollY + stickyTop - trackTop) / scrollDistance));
}

export function getMobileAnimationFrame(progress: number) {
  const normalizedProgress = Math.max(0, Math.min(1, progress));
  return Math.round(normalizedProgress * (FRAME_COUNT - 1));
}

export function ScrollLogoAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadingState, setLoadingState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const container = containerRef.current;
    const sticky = stickyRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!container || !sticky || !canvas || !context) {
      console.error("The scroll logo animation could not initialize its canvas.");
      return;
    }
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    const processingCanvas = document.createElement("canvas");
    processingCanvas.width = FRAME_CROP.width;
    processingCanvas.height = FRAME_CROP.height;
    const processingContext = processingCanvas.getContext("2d", { willReadFrequently: true });
    if (!processingContext) {
      console.error("The scroll logo animation could not initialize its frame processor.");
      return;
    }

    const images: HTMLImageElement[] = [];
    const failedFrames = new Set<number>();
    let drawRequest = 0;
    let disposed = false;
    let settledFrames = 0;
    let usableFrames = 0;
    let lastDrawnFrame = -1;
    let lastCanvasWidth = 0;
    let lastCanvasHeight = 0;

    const getScrollProgress = () => {
      const hero = container.closest<HTMLElement>(".hero");
      const scene = hero?.querySelector<HTMLElement>(".hero-scene");

      if (window.matchMedia("(max-width: 560px)").matches && hero && scene) {
        const trackTop = hero.getBoundingClientRect().top + window.scrollY;
        const stickyTop = Number.parseFloat(window.getComputedStyle(scene).top);
        return getMobileScrollProgress(
          window.scrollY,
          trackTop,
          hero.offsetHeight,
          scene.offsetHeight,
          stickyTop,
        );
      }

      const trackTop = container.getBoundingClientRect().top + window.scrollY;
      const stickyTop = Number.parseFloat(window.getComputedStyle(sticky).top);
      const scrollDistance = container.offsetHeight - sticky.offsetHeight;
      return Math.max(
        0,
        Math.min(1, (window.scrollY + stickyTop - trackTop) / Math.max(scrollDistance, 1)),
      );
    };

    const draw = () => {
      drawRequest = 0;
      if (disposed) return;

      const progress = getScrollProgress();
      const isMobile = window.matchMedia("(max-width: 560px)").matches;
      const frame = isMobile
        ? getMobileAnimationFrame(progress)
        : Math.round(progress * (FRAME_COUNT - 1));

      const image = images[frame];
      if (
        !image ||
        failedFrames.has(frame) ||
        !image.complete ||
        !image.naturalWidth ||
        !image.naturalHeight
      ) {
        return;
      }

      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const pixelRatio = Math.max(window.devicePixelRatio || 1, 1);
      const pixelWidth = Math.round(bounds.width * pixelRatio);
      const pixelHeight = Math.round(bounds.height * pixelRatio);

      if (
        frame === lastDrawnFrame &&
        canvas.width === pixelWidth &&
        canvas.height === pixelHeight &&
        lastCanvasWidth === bounds.width &&
        lastCanvasHeight === bounds.height
      ) {
        return;
      }

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      const scaleX = canvas.width / bounds.width;
      const scaleY = canvas.height / bounds.height;
      context.setTransform(scaleX, 0, 0, scaleY, 0, 0);
      context.clearRect(0, 0, bounds.width, bounds.height);

      if (frame === 0) {
        lastDrawnFrame = frame;
        lastCanvasWidth = bounds.width;
        lastCanvasHeight = bounds.height;
        return;
      }

      const scale =
        Math.min(bounds.width / FRAME_CROP.width, bounds.height / FRAME_CROP.height) *
        (isMobile ? 1.12 : 1);
      const width = FRAME_CROP.width * scale;
      const height = FRAME_CROP.height * scale;

      try {
        processingContext.clearRect(0, 0, FRAME_CROP.width, FRAME_CROP.height);
        processingContext.drawImage(
          image,
          FRAME_CROP.x,
          FRAME_CROP.y,
          FRAME_CROP.width,
          FRAME_CROP.height,
          0,
          0,
          FRAME_CROP.width,
          FRAME_CROP.height,
        );

        const framePixels = processingContext.getImageData(
          0,
          0,
          FRAME_CROP.width,
          FRAME_CROP.height,
        );
        const pixels = framePixels.data;
        const { red: keyRed, green: keyGreen, blue: keyBlue, threshold, feather } = CHROMA_KEY;

        for (let offset = 0; offset < pixels.length; offset += 4) {
          const red = pixels[offset]!;
          const green = pixels[offset + 1]!;
          const blue = pixels[offset + 2]!;
          const sourceAlpha = pixels[offset + 3]! / 255;
          const dominance = green - Math.max(red, blue);
          const progress = Math.min(1, Math.max(0, (dominance - threshold) / feather));
          const smooth = progress * progress * (3 - 2 * progress);
          const alpha = sourceAlpha * (1 - smooth);

          if (alpha <= 0.01) {
            pixels[offset] = 0;
            pixels[offset + 1] = 0;
            pixels[offset + 2] = 0;
            pixels[offset + 3] = 0;
            continue;
          }

          if (alpha >= 0.995) continue;

          const background = 1 - alpha;
          const foregroundRed = Math.min(255, Math.max(0, (red - background * keyRed) / alpha));
          const foregroundGreen = Math.min(
            255,
            Math.max(0, (green - background * keyGreen) / alpha),
          );
          const foregroundBlue = Math.min(255, Math.max(0, (blue - background * keyBlue) / alpha));

          pixels[offset] = Math.round(foregroundRed);
          pixels[offset + 1] = Math.round(
            Math.min(Math.max(foregroundRed, foregroundBlue), foregroundGreen),
          );
          pixels[offset + 2] = Math.round(foregroundBlue);
          pixels[offset + 3] = Math.round(alpha * 255);
        }

        processingContext.putImageData(framePixels, 0, 0);
        context.drawImage(
          processingCanvas,
          (bounds.width - width) / 2,
          (bounds.height - height) / 2,
          width,
          height,
        );
        lastDrawnFrame = frame;
        lastCanvasWidth = bounds.width;
        lastCanvasHeight = bounds.height;
      } catch (error) {
        failedFrames.add(frame);
        console.error(`The scroll logo frame could not be drawn: ${image.src}`, error);
        if (failedFrames.size === FRAME_COUNT && settledFrames === FRAME_COUNT) {
          setLoadingState("error");
        }
        scheduleDraw();
      }
    };

    const scheduleDraw = () => {
      if (drawRequest === 0) {
        drawRequest = window.requestAnimationFrame(draw);
      }
    };

    window.addEventListener("scroll", scheduleDraw, { passive: true });
    window.addEventListener("resize", scheduleDraw);

    const resizeObserver = new ResizeObserver(scheduleDraw);
    resizeObserver.observe(container);
    resizeObserver.observe(sticky);

    const settleFrame = () => {
      settledFrames += 1;
      if (settledFrames === FRAME_COUNT && usableFrames === 0) {
        setLoadingState("error");
      }
    };

    for (let index = 0; index < FRAME_COUNT; index += 1) {
      const image = new Image();
      images[index] = image;
      image.decoding = "async";
      image.onload = () => {
        settleFrame();
        if (image.naturalWidth > 0 && image.naturalHeight > 0) {
          usableFrames += 1;
          setLoadingState("ready");
          scheduleDraw();
          return;
        }

        failedFrames.add(index);
        console.error(`The scroll logo frame is invalid: ${image.src}`);
        scheduleDraw();
      };
      image.onerror = () => {
        failedFrames.add(index);
        settleFrame();
        console.error(`The scroll logo frame failed to load: ${image.src}`);
        scheduleDraw();
      };
      image.src = `${FRAME_DIRECTORY}/frame-${String(index + 1).padStart(4, "0")}.webp`;
    }

    scheduleDraw();

    return () => {
      disposed = true;
      window.removeEventListener("scroll", scheduleDraw);
      window.removeEventListener("resize", scheduleDraw);
      resizeObserver.disconnect();
      window.cancelAnimationFrame(drawRequest);

      for (const image of images) {
        image.onload = null;
        image.onerror = null;
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="hero-logo-animation">
      <div ref={stickyRef} className="hero-logo-sticky">
        <div className="hero-logo-stage">
          <div className="hero-logo-panel">
            <canvas
              ref={canvasRef}
              role="img"
              aria-label="Logo roxo tridimensional animado pelo scroll"
            />
            {loadingState !== "ready" && (
              <span className="hero-logo-status" role="status">
                {loadingState === "loading" ? "Carregando animação" : "Animação indisponível"}
              </span>
            )}
            <div className="hero-logo-caption" aria-hidden="true">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
