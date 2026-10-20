import { describe, expect, it } from "vitest";
import {
  getMobileAnimationFrame,
  getMobileScrollProgress,
} from "@/components/site/scroll-logo-animation";

describe("mobile scroll logo progress", () => {
  const progressAt = (scrollY: number) => getMobileScrollProgress(scrollY, 72, 1600, 800, 72);

  it("starts at the hero, advances with its pinned scene, and ends at the next section", () => {
    expect(progressAt(0)).toBe(0);
    expect(progressAt(400)).toBeCloseTo(0.5);
    expect(progressAt(800)).toBe(1);
  });

  it("clamps before and after the scene while reversing consistently on upward scroll", () => {
    expect(progressAt(-40)).toBe(0);
    expect(progressAt(400)).toBeCloseTo(0.5);
    expect(progressAt(200)).toBeCloseTo(0.25);
    expect(progressAt(1000)).toBe(1);
  });

  it("starts on the empty frame and reveals the complete diamond sequence", () => {
    expect(getMobileAnimationFrame(0)).toBe(0);
    expect(getMobileAnimationFrame(0.25)).toBe(75);
    expect(getMobileAnimationFrame(0.5)).toBe(150);
    expect(getMobileAnimationFrame(0.75)).toBe(224);
    expect(getMobileAnimationFrame(1)).toBe(299);
    expect(getMobileAnimationFrame(-1)).toBe(0);
    expect(getMobileAnimationFrame(2)).toBe(299);
  });
});
