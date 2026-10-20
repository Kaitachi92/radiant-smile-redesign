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

  it("starts with a visible part of the diamond and finishes on the final assembled frame", () => {
    expect(getMobileAnimationFrame(0)).toBe(44);
    expect(getMobileAnimationFrame(0.225)).toBe(52);
    expect(getMobileAnimationFrame(0.45)).toBe(59);
    expect(getMobileAnimationFrame(0.725)).toBe(179);
    expect(getMobileAnimationFrame(1)).toBe(299);
    expect(getMobileAnimationFrame(-1)).toBe(44);
    expect(getMobileAnimationFrame(2)).toBe(299);
  });
});
