# Phase 1 verification report

Date: 25 October 2026

## Result

The complete local Phase 1 website is implemented. The dependency-free build produces **108 pages plus a custom 404**. All **9 automated acceptance tests pass**. No Git commit, push, remote repository change, deployment, authentication setup, or DNS change was performed.

## Automated acceptance checks

Run `npm test` from the project folder. It rebuilds the website, starts an isolated temporary HTTP server, runs the checks, and closes that server.

| Check | Result |
| --- | --- |
| 8 modules × 3 sections × 4 lessons, ordered unique IDs | Pass |
| Exact titles/objectives rendered on all 8 module and 96 lesson pages | Pass |
| All internal links, asset references, and fragment targets resolve | Pass |
| All 108 direct page routes return HTTP 200 | Pass |
| Extensionless/no-trailing-slash lesson request redirects to its real page | Pass |
| Unknown routes return HTTP 404 with the custom page; POST is rejected | Pass |
| One H1 per page, metadata, landmarks, unique IDs, labelled account dialog | Pass |
| Required ecosystem URLs, new-tab security attributes, footer order | Pass |
| No unresolved script token, credential service, analytics, or remote script/image dependency | Pass |
| Sitemap has 108 pages; CNAME and metadata use the configured origin | Pass |

Some tests contain several related assertions. The runner reports 9 test cases total.

## Source verification

All **96 lesson ID/title/objective triples independently matched the text extracted from the original curriculum DOCX**. Module names, focus descriptions, section names, and lesson order were extracted directly from the source.

Curriculum source SHA-256:

`73793BFD6C8216904F7F7EF2A5A318ED7ABC77F0510B01736786D159218C4608`

## Browser checks performed

Reviewed in the Codex in-app Chromium browser:

- Desktop homepage, directory, and Coming Soon lesson rendering.
- All three demo choices produce distinct, relevant feedback.
- Changing the selected answer hides previous feedback; reset clears selection and feedback.
- The evidence-based answer explains both the 20-place limit and the 12 November deadline.
- Journey step selection changes its explanation and example.
- Search by exact ID `M03-L10` finds the correct lesson and URL.
- Topic search `context` returns relevant matches; unknown text shows a helpful empty state.
- Clear search and Show all modules restore the full directory.
- Direct visit to `/learn/m03/l10` reaches the correct Coming Soon page.
- Header account entry opens the inactive account message with no credential fields.
- Continue Free closes the modal and restores focus to its entry point.
- Tab and Shift+Tab wrap between the modal controls; Escape closes it and restores focus.
- Mobile menu exposes curriculum, homepage anchors, About, account entry, and Automation Desk.
- Mobile Continue Free returns focus to the visible menu account entry. Escape closes the menu and focuses its toggle.

## Responsive and accessibility review

Local iframe test fixtures reviewed representative Home, Curriculum, Module, Lesson, and About layouts at **320, 390, 768, and 1024 px frame widths**. Browser scrollbars reduce the inner layout width slightly. No horizontal page overflow was detected in the nine representative frames, including a 390 px curriculum frame with scripts blocked.

A computed-color audit of visible text in those frames found a footer contrast issue. It was corrected; the final audit reported **no text-contrast failures** against its 4.5:1 normal-text / 3:1 large-text thresholds. This helper checks solid ancestor backgrounds and is a useful check, not a formal accessibility certification.

The implementation also includes a skip link, native labelled radio choices, visible focus outlines, semantic navigation, reduced-motion CSS, and no-JavaScript navigation/content fallbacks. Mobile module cards use one column for clearer reading.

## Scope and limits

- Browser review used one Chromium environment with responsive iframe fixtures; it is not a physical-device, cross-browser, screen-reader, or full WCAG audit.
- External ecosystem URLs and their attributes were verified in generated HTML. The availability and behavior of those separate websites were not audited.
- Live hosting, custom-domain DNS/TLS, and GitHub Pages repository settings have not been configured or tested. Publication remains with the owner.
- Canonical hostname is `www.aiassociate.detleng.com`, as supplied. See README if the intended hostname differs.
- All 96 lesson activities remain Coming Soon. Real authentication, progress tracking, AI Mentor, live chat, quizzes, flashcards, and full lesson labs are inactive or planned.

## Repository-root publishing migration

The generated website now lives at the project root: `index.html`, `assets/`, `learn/`, `about/`, and `privacy/`. The local preview serves that root. The previous `docs/` output was moved to a local backup outside the project. Source files and Git history were preserved.

- All 119 generated website files matched the previous docs output byte for byte after relocation. Design, interactions, lesson content, and URLs are unchanged.
- The updated acceptance suite has **10 tests**, including root output, source preservation, and local preview source/Git-path blocking. All 108 direct routes are tested.
- No browser rendering change was introduced; the earlier visual and interaction review applies to the identical generated assets.
- Root publishing also exposes committed source/test files as repository content on GitHub Pages. The local preview explicitly blocks source and Git metadata routes. No secrets are included in this project.
- Publication setting after the owner's push: **main → /(root)**. DNS/TLS remains a separate external configuration issue.
- No commit, push, Pages-settings edit, or DNS change was performed by the assistant during the migration.

## Blue redesign and readable typography — 26 October 2026

- Replaced the green palette with blue/navy across pages, illustrations, favicon, metadata, and social artwork.
- Updated heading typography to a modern system sans-serif style; increased reading copy, navigation, button labels, and supporting text across responsive rules.
- Replaced ecosystem cards with a standard four-column footer: site identity, site navigation, ecosystem navigation, and learning message, followed by domain/copyright and a scope note. Required ecosystem destinations retain their order and secure new-tab behavior.
- Browser reviewed desktop at 1440 px and mobile at 390 px. The footer account entry opens the inactive modal; Continue Free closes it.
- Responsive fixtures at 320/390/768/1024 px showed no page overflow; the computed solid-background contrast helper reported no failures after refinements. Gradient surfaces also have explicit dark background colors for reliable contrast fallback.
- This remains local work; no commit, push, deployment, DNS change, or authentication activation was performed.

Final redesign acceptance run: **11/11 tests passed**, including 108 direct page routes and the shared standard footer. Browser smoke checks confirmed the demo feedback, exact lesson search on mobile, and footer Continue Free behavior.

## Quick Review integration — 26 October 2026

Current acceptance result: **15/15 tests passed**, covering **213 direct page routes plus custom 404 behavior**. The added hierarchy comprises one directory, 8 module pages, and 96 lesson-review Coming Soon pages.

Verified:
- All 96 official IDs, exact lesson titles, and objectives independently matched the supplied curriculum DOCX again.
- Every page includes header/footer Quick Review entry points; review pages show the correct active section.
- All new module/lesson links, section fragments, breadcrumbs, previous/next review links, and return actions resolve. Review navigation stays inside `/quick-review/`; the explicit curriculum cross-link points to the matching detailed-lesson route.
- All 213 direct routes return HTTP 200. No-slash review URLs redirect correctly, and invalid review paths return HTTP 404.
- Browser search for M01-L06 returns the correct review title and `/quick-review/m01/l06/` URL.
- Mobile navigation at 390 px opens Quick Review, then its module and lesson; the menu closes after selection.
- Responsive/contrast fixtures at 320, 390, 768, and 1440 px include new review pages. No horizontal page overflow or computed solid-background text contrast failures were found.
- Blue design, readable typography, standard footer, root publishing, inactive account modal, and the existing curriculum are retained.

No Q&A banks or detailed lessons have been generated or published. No commit, push, remote setting change, deployment, or authentication activation was performed.

## Interactive M01-L01 acceptance

- The current M01-L01.docx is implemented at `/learn/m01/l01/` with its exact title and learning objective. The curriculum record is published; 95 curriculum lessons and all 96 Quick Reviews remain Coming Soon.
- Three simulations: contextual continuation, evidence decisions, and a safe customer response. Both case simulations include three cases, per-option feedback, hints, retry, navigation and reset.
- Five independent challenges; classification and written response practice; guided spoken explanation with optional 30/45-second timer; work checklist; final application and self-assessment.
- Fifteen source MCQs, with the same records used for flashcards. Question keys, options, explanations and distractor feedback were preserved. Browser quiz path tested: 14/15 with one deliberate wrong answer, then mistakes review 1/1.
- Opening decision, empty answer validation, simulation options, hints, retry/reset, reply alternatives, writing comparison/self-review, classification, timer pause/reset, checklist and flashcard keyboard activation checked in the local browser.
- Written responses remain in page memory, are never uploaded, and are not automatically graded. Practice progress is visit-only and counts completed checks, not scrolling.
- Responsive browser checks at 320, 390, 768 and 1440px: no document overflow. Reading text is 18px on mobile and 19px on desktop. Tables scroll within their own labelled containers. Sticky outline tracking and feedback focus were verified.
- Three Word hyperlink targets recovered and opened: Google Developers, Microsoft Learn and OpenAI Help. Tracking parameters removed. External links use secure new-tab attributes.
- Automated suite: 21/21 passed, covering all 213 content routes, links/fragments, metadata, retained account modal and ecosystem, Quick Review independence, published lesson content, malformed assessment rejection, source answer keys, safe JSON embedding, Unicode and local assets.
- Source: `src/lessons/M01-L01/lesson.json`, `questions.json`. Shared components: `src/lesson-system/`. See `LESSON_AUTHORING_GUIDE.md` for the next lesson. Some specialised source-to-component mappings are explicit; a new activity type requires an engine extension and verification.
- No commit, push, deployment, DNS change or live authentication was performed.

## MCQ feedback update acceptance

- Wrong selections now show a light red bar/background and cross, plus the selected distractor's explanation. The correct choice is not highlighted or revealed in this feedback.
- Retry this question clears only the current question. Browser checks confirmed Question 2 remained Question 2 after repeated retries, with Question 1's earned progress preserved.
- Correct selections show a green bar/background and tick. Feedback includes the correct explanation and all three distractor explanations. Next question and See results appear only after a correct answer.
- Browser validation covered empty selection, repeated incorrect answers, retry reset, correct highlights, progress counted once, keyboard retry, mobile 390px without overflow, full 15-question completion, and retry inside the mistakes-only run.
- End-to-end run: 15/15 correct after practice, with four questions retained in incorrect-attempt history. No browser console errors were observed.
- Existing 21 automated checks passed after the update. The shared engine and generated root assets are updated; no content bank, curriculum availability, authentication or simulation behaviour changed.
- No commit or push was performed.

## Quick Review and Smart Listener acceptance

- Source: the supplied M01.docx contains the approved 18-pair What Is an LLM? review only. All pairs were imported into `src/reviews/M01-L01.json`, preserving the question/answer text and fixing paragraph-boundary formatting during import.
- Only M01-L01 Quick Review is available. The other 95 reviews stay Coming Soon. Full curriculum lesson status remains independent. Directory/module cards and local search use the build-derived review availability.
- Two Q&A cards per desktop row; one per mobile row; both Customer and Your response remain visible. Each numbered card opens its own accessible Smart Listener dialog. Local full-text search includes questions and answers, with empty-state feedback.
- Source English fixed; target German initially, with 13 target-language choices. Presets 1x/3x/5x and custom 1–20 whole-number counts prepare repeated complete Q&A blocks. No automatic Google request is made on reading, searching, or opening a popup.
- Generated handoff URLs specify the exact source/target languages and preserve Unicode and every repeated block. Oversized links are disabled with a clear explanation; the copy fallback copies one complete Q&A rather than truncating it. Invalid counts disable the link and copy action.
- Browser checked: correct card mapping, repeat payload, selected language, invalid count, oversized-link state, normal copy, one-complete-Q&A copy fallback, Escape, focus restoration, Shift+Tab/Tab boundaries, no-match search, Available search result, mobile single column, and no overflow at 320px and 390px. No console errors observed in the review.
- External handoff opened a new Google tab and reached its consent screen. Consent was dismissed, but further automated reading of the Google page failed. Translation output and audible playback were not verified. The site leaves speaker activation and playback to Google, as the popup explains.
- Automated suite: 27/27 passed, including all existing 213 route checks plus independent review availability, source content, complete repeated payloads, every supported language code, invalid/oversized input, validator rejection, local assets and inert JSON escaping.
- Shared implementation: `src/review-system/`; publication manifest: `src/data/reviews.json`. See `QUICK_REVIEW_AUTHORING_GUIDE.md` for adding future Q&As.
- No commit, push, deployment, DNS change or authentication activation.

## Shared AI Guide structure acceptance

- One recognisable AI Guide panel and launcher are present on all 213 routes plus 404. Each of the 18 Quick Review cards has its own AI Guide button alongside Smart Listener.
- Card handoff carries stable lesson/review IDs and displays the exact approved question and answer. General chat, lesson chat and each selected Q&A have separate in-page histories. Changing a topic does not mix conversations.
- The generated Guide catalog includes all 96 exact lesson outlines and availability. Full approved content is included only for published lessons/reviews. New published content is picked up automatically by the build. Coming Soon lessons remain explicitly outlines only.
- Live AI is disabled in public configuration; no Render/Mastra/Groq service or model was connected, no provider credential was added and no external AI requests were made. Normal Send shows an honest not-connected notice and useful lesson/review links, not a fabricated AI answer.
- Enter sends, Shift+Enter supports multiline text, and input-method composition is guarded. Blank and overlong messages are rejected. Pending sends are guarded; the composer stays visible and rendering does not take focus from it.
- Chat rendering scrolls only the conversation container with reduced-motion support. The local browser fixture verified connection/waking notice, deliberate retry, thinking, synthetic reply, failure, duplicate Enter protection, composer focus, independent contexts and unchanged page scroll. Fixture replies were explicitly labelled synthetic and used no online provider.
- Mobile viewport checks at 390x844 and 320x740 showed no horizontal document overflow and the composer/Send control remained within the viewport. Closing restored the launcher. The production browser check showed 97 topic options (general plus 96 lessons), correct approved Q&A context, and zero synthetic/live assistant replies.
- Local service scaffold has health/chat contracts, server-side context lookup, validation, explicit origins, basic limits, bounded history and temporary request-ID deduplication. A unit test confirmed concurrent duplicate requests and explicit retry invoked the synthetic generator only once. This cache is per-process; durable production deduplication and the actual provider adapter remain next-stage work.
- Privacy details distinguish this inactive stage from future online processing. Messages remain in page memory for this stage; future online request-result handling and provider sharing are explained. No accounts, saved chat history or microphone access are enabled.
- Automated suite: 34/34 passed. Existing lesson MCQ retry, Smart Listener, curriculum, availability, account dialog, footer, routes and metadata checks still pass.
- Shared source: src/guide-system/. Local service scaffold: guide-server/. Setup and next-stage notes: AI_GUIDE_SETUP.md. The isolated browser fixture is tests/guide-browser-fixture.mjs and must not be deployed as the actual Guide.
- No commit, push, deployment, DNS change or paid-plan activation was performed.
