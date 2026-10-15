import { describe, expect, it } from 'vitest';
import { LOGO_FRAME_COUNT, logoFramePath } from '@/components/site/scroll-logo';

describe('Uploaded logo sequence', () => {
  it('uses the actual zero-based WebP filenames', () => {
    expect(LOGO_FRAME_COUNT).toBe(192);
    expect(logoFramePath(0)).toBe('/frames-logo/frame_000000.webp');
    expect(logoFramePath(191)).toBe('/frames-logo/frame_000191.webp');
  });
  it('clamps and rounds frames within the uploaded sequence', () => {
    expect(logoFramePath(-1)).toBe(logoFramePath(0));
    expect(logoFramePath(500)).toBe(logoFramePath(191));
    expect(logoFramePath(95.8)).toBe(logoFramePath(96));
  });
});