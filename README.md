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

`build` recreates `docs/` from `src/`. `preview` serves the existing build. Use an HTTP server rather than double-clicking HTML files; routes and assets start at the website root.

## Included

- Interactive homepage with the DeTLeng learning journey, expandable explanations, curriculum previews, learning-evidence example, audience guidance, and FAQs.
- A working, explicitly simulated summary-check demo with three answer paths, evidence-based feedback, an improved summary, and reset.
- Curriculum directory with browser-local search across modules, sections, lesson IDs, titles, and objectives.
- 8 module pages, 24 sections, and all 96 official lessons.
- 96 real, directly addressable Coming Soon lesson pages, with objectives, breadcrumbs, previous/next navigation, and return actions.
- About, Privacy, custom 404, sitemap, metadata, local icon assets, and secure ecosystem links.
- Header/footer Login / Create Account buttons. The accessible information modal accepts no credentials. Continue Free closes it. Authentication is inactive.
- Responsive layouts, visible keyboard focus, native controls, skip link, dialog focus handling, reduced-motion styles, and a readable fallback when JavaScript is unavailable.

There are 108 content pages plus the 404 page. Lessons, labs, quizzes, flashcards, accounts, AI Mentor, saved progress, and live chat are not presented as available.

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
| `tests/qa/` | Local responsive and contrast fixtures, excluded from `docs/` |
| `docs/` | Generated, ready-to-host static website |

Do not edit generated HTML in `docs/`; edit the source and rebuild. The build safely checks the output path and cleans `docs/` to remove stale pages.

## Hosting preparation — owner performs publication

Nothing has been pushed or deployed. The generated website is prepared for GitHub Pages at a custom domain.

After reviewing and pushing the files yourself, configure Pages to deploy from your chosen branch and the `/docs` folder. Commit the generated `docs/` folder along with the source. No GitHub Actions workflow or hosting account has been created.

GitHub supports publishing from a branch's root or `/docs` folder: [official publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

The canonical origin is **https://www.aiassociate.detleng.com**, matching the hostname supplied in the request. `docs/CNAME`, metadata, robots.txt, and sitemap.xml are generated from `src/config.mjs`. If your intended DNS hostname is instead `aiassociate.detleng.com`, change `origin` there and rebuild before publishing. A CNAME file alone does not configure DNS or the repository's custom-domain setting. Those external settings were not changed or verified in this local build.

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

Open `/__qa/layouts.html` for 320, 390, 768, and 1024 px test frames, a no-JavaScript frame, and visible overflow/contrast reports. These fixtures are served from `tests/qa/` only with `SITE_QA=1` and are never copied into the production output. Clear the variable afterward with `Remove-Item Env:SITE_QA`.

See `QA_REPORT.md` for checks performed and `CONTENT_SOURCES.md` for source mapping.
