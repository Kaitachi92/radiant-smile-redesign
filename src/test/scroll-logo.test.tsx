import { describe, expect, it } from 'vitest';
import { LOGO_FRAME_COUNT, logoFramePath } from '@/components/site/scroll-logo';

describe('Uploaded logo sequence', () => {
  it('uses the actual zero-based WebP filenames', () => {
    expect(LOGO_FRAME_COUNT).toBe(300);
    expect(logoFramePath(0)).toBe('/frames-logo/frame-0001.webp');
    expect(logoFramePath(299)).toBe('/frames-logo/frame-0300.webp');
  });
  it('clamps and rounds frames within the uploaded sequence', () => {
    expect(logoFramePath(-1)).toBe(logoFramePath(0));
    expect(logoFramePath(500)).toBe(logoFramePath(299));
    expect(logoFramePath(95.8)).toBe(logoFramePath(96));
  });
});