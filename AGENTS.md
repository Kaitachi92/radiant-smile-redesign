<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Site architecture
- Keep shared clinic contacts, real photo pointers, treatment content and metadata helpers in src/lib/site-data.ts so all pages stay consistent.
- Use the shared SiteShell and editorial sections for public pages; keep individual treatment pages under the dynamic treatment route with validated slugs.
- Use only verified original-site photography; missing clinic and clinical photography must be visibly marked as awaiting real images, never replaced by synthetic or stock clinic claims.
- Keep the site informational with direct WhatsApp scheduling; do not introduce forms, storage or patient diagnostics without a separate request.
- Defer sitemap origin configuration until the redesigned site's public domain is confirmed; never use the preview origin.
- Keep the uploaded logo sequence in public/frames-logo with its original numeric filenames; the homepage ScrollLogo canvas uses a bounded frame cache and reduced-motion fallback to preserve performance without changing the surrounding layout.
