# AI Associate by DeTLeng — Phase 1

A local, static-first learning website in clear English. No framework, live AI API, authentication service, tracking scripts, or package installation is needed.

## Run locally

Use Node.js 20 or newer. In this project folder, run:

```powershell
npm run dev
```

Then open http://127.0.0.1:4173. Stop the server with Ctrl+C.

Other commands:

```powershell
npm run build
npm test
npm run preview
```

`build` writes the generated website directly into the project root from `src/`. `preview` serves the existing build. Use an HTTP server rather than double-clicking HTML files; routes and assets start at the website root.

## Included

- Interactive homepage with the DeTLeng learning journey, expandable explanations, curriculum previews, learning-evidence example, audience guidance, and FAQs.
- A working, explicitly simulated summary-check demo with three answer paths, evidence-based feedback, an improved summary, and reset.
- Curriculum directory with browser-local search across modules, sections, lesson IDs, titles, and objectives.
- 8 module pages, 24 sections, and all 96 official lessons.
- 96 real, directly addressable Coming Soon lesson pages, with objectives, breadcrumbs, previous/next navigation, and return actions.
- About, Privacy, custom 404, sitemap, metadata, local icon assets, and secure ecosystem links.
- Header/footer Login / Create Account buttons. The accessible information modal accepts no credentials. Continue Free closes it. Authentication is inactive.
- Responsive layouts, visible keyboard focus, native controls, skip link, dialog focus handling, reduced-motion styles, and a readable fallback when JavaScript is unavailable.

There are 213 content pages plus the 404 page, including 105 Quick Review directory/module/lesson pages. Lessons, labs, quizzes, flashcards, accounts, AI Mentor, saved progress, and live chat are not presented as available.

## Project map

| Location | Purpose |
| --- | --- |
| `src/data/curriculum.json` | Exact curriculum records and per-lesson availability |
| `src/config.mjs` | Site name, description, and canonical origin |
| `src/templates.mjs` | Shared layout, directory, module, and lesson templates |
| `src/pages.mjs` | Homepage, demo, About, and Privacy content |
| `src/styles.css` | Visual design, responsive layout, accessibility styles |
| `src/app.js` | Browser interactions; journey data is inserted during build |
| `scripts/build.mjs` | Dependency-free static page generator |
| `scripts/serve.mjs` | Local HTTP preview with direct routes and real 404 status |
| `tests/site.test.mjs` | Structural, content, link, and HTTP acceptance tests |
| `tests/qa/` | Optional local responsive and contrast fixtures |
| `index.html`, `assets/`, `learn/`, `about/`, `privacy/` | Generated website at the repository root |

Edit content and styles in `src/`, then rebuild. Generated root website files are overwritten by the build. The build never recursively deletes the project root, source, or Git history.

## Root publishing — owner performs publication

This root-publishing migration is local only. No commit, push, deployment, or DNS change was performed during the migration.

After reviewing and pushing the files yourself, configure Pages to deploy from your chosen branch and **`/(root)`**. Commit the generated root website files along with the source, including deletions of the old `docs/` output. No GitHub Actions workflow or hosting account has been created.

GitHub supports publishing from a branch's root or `/docs` folder: [official publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

The canonical origin is **https://www.aiassociate.detleng.com**, matching the hostname supplied in the request. `CNAME`, metadata, robots.txt, and sitemap.xml are generated from `src/config.mjs`. If your intended DNS hostname is instead `aiassociate.detleng.com`, change `origin` there and rebuild before publishing. A CNAME file alone does not configure DNS or the repository's custom-domain setting. Those external settings were not changed or verified in this local build.

The site expects to run at a domain root. A default repository-subfolder URL would need a base-path adaptation.

## Adding an approved lesson later

1. Write and review the lesson content, expected answers, explanations, and simulations.
2. Put its trusted editorial HTML in `src/lessons/M01-L01.html` (use the actual ID). Supply content sections only; the build supplies the heading, objective, breadcrumb, and surrounding layout.
3. Change only that lesson's `status` from `coming-soon` to `published` in the curriculum data.
4. Update general availability copy to reflect the release, then rebuild and review all affected pages.

The build fails if a published lesson's HTML file is missing or empty. The module's lesson link and search result show its individual availability. Routes stay the same. This mechanism does not configure accounts or external services. Publishing untrusted user HTML is outside this site's scope.

Phase 1 acceptance tests deliberately expect all 96 lessons to be Coming Soon. Update those release assertions when an intentionally approved lesson is introduced.

## Local browser QA fixtures

For a local responsive review only:

```powershell
$env:SITE_QA='1'
npm run dev
```

Open `/__qa/layouts.html` for 320, 390, 768, and 1024 px test frames, a no-JavaScript frame, and visible overflow/contrast reports. These fixtures are served from `tests/qa/` only with `SITE_QA=1` and are available through that local route only when the flag is set. Repository-root hosting also makes committed source and tests public; keep credentials out of this repository. Clear the variable afterward with `Remove-Item Env:SITE_QA`.

See `QA_REPORT.md` for checks performed and `CONTENT_SOURCES.md` for source mapping.

## Push this migration

After review:

```powershell
git add -A
git commit -m "Publish AI Associate website from repository root"
git push origin main
```

Then select **Settings → Pages → Deploy from a branch → main → /(root) → Save**. DNS configuration is separate from this migration. The old docs output has been moved out of the project to a local backup.

## Blue interface refresh — 26 October 2026

The website now uses a blue/navy palette, modern sans-serif headings, larger reading text, and a standard four-column footer shared across all pages. Main reading copy is generally 18–19 px; buttons and navigation are 16–17 px; supporting labels are generally 14–16 px. The footer stacks on smaller screens. Root publishing and all lesson URLs remain unchanged.

## Quick Review navigation — 26 October 2026

Quick Review is now available in the shared header and footer. Its directory uses the heading **Lesson Questions & Answers** and the introduction **Refresh your understanding with short, practical questions and clear answers.**

- `/quick-review/`: 8 labelled Quick Review module cards and browser-local lesson search.
- `/quick-review/m01/`: 3 official sections and 12 labelled lesson review links per module.
- `/quick-review/m01/l06/`: a directly addressable Quick Review Coming Soon page with the exact ID, title, objective, breadcrumbs, previous/next review links, and return actions.

The same curriculum JSON supplies both hierarchies. Review routes and availability are independent of the curriculum lesson pages. Search remains local and only loads the existing small curriculum JSON; no Q&A banks are loaded or generated in this release. The 96 Q&A banks and detailed lesson content will be authored and integrated separately after review. Root publishing stays `main → /(root)`. No additional installation is needed.
