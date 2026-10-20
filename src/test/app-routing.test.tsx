import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { treatments, whatsapp } from "@/lib/site-data";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it.each(["/a-doutora", "/tratamentos", "/o-consultorio", "/contato", "/politica-de-privacidade"])("matches the public page %s", (path) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes(path).at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches every treatment and preserves the original scheduling destination", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(treatments).toHaveLength(9);
    for (const treatment of treatments) {
      expect(router.matchRoutes(`/tratamentos/${treatment.slug}`).at(-1)?.routeId).toBe("/tratamentos/$slug");
    }
    expect(whatsapp).toBe("https://wa.me/5511996514034");
  });
});
