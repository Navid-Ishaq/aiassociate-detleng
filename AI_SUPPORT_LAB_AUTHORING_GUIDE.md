# AI Support Lab

Route: /support-lab/. Header/footer navigation places it after Quick Review. The standard website layout accepts guide:false for this independent page; other pages retain AI Guide.

## Source and structure

Adapted from the user-supplied Downloads/ai-support-lab.html. The original green standalone shell, multiple H1s, duplicate quiz, escaped details tags, keyword-based communication scoring and separate reset handlers were replaced. The three learning phases and eight skill topics remain. New missions use plausible choices with option-specific explanations, same-question retry, and evidence-based reasoning. A complete fictional case distinguishes website 503 from provider 404 model_not_found, then practises investigation, handover, customer communication and verification.

- src/support-lab/learning.html: the supplied API/log/support teaching material with a corrected heading hierarchy.
- src/support-lab/skills.json: eight skill records and answer explanations.
- src/support-lab/logic.js: mission/error data, progress validation and ticket composition.
- src/support-lab/render.mjs: page markup, labels, sections and fictional case.
- src/support-lab/runtime.js: tabs, activities, local progress, copy/export and single reset dialog.
- src/support-lab/styles.css: scoped blue/navy design; desktop sidebar and mobile section selector.

Run npm run build and npm test. Build generates the page, sitemap entry and three local assets. No provider, authentication or backend is required. No lesson/Quick Review bank is fetched by this page.

## Privacy and progress

Only allowlisted completed-activity IDs and explored/practised skill indexes are saved under detleng-support-lab-progress. Draft text is held only in the current page. Storage failure degrades to visit-only progress with an accurate notice. Reset confirmation clears this lab's key and current page drafts; cancel does nothing. It never clears unrelated site storage.

The Customer Update Coach is a learner checklist, not keyword scoring or AI assessment. Complete Case records self-reviewed practice, not job qualification or proof of a real resolved incident. Ticket output includes an explicit unconfirmed-root-cause field. Do not infer factual correctness from completion counters.

Case export is an explicit local .txt download; clipboard copying has a manual fallback. No message or draft is sent to a provider or customer. Use fictional information only.

## Add or revise activities

Keep factual observations separate from hypotheses and next checks. Use three plausible options, one best answer given the evidence, and a distinct explanation per option. Avoid guarantees, unsafe retries and fabricated model/product features. If progress identifiers change, consider compatibility with saved progress. Keep headers/footers in the shared template, not this page. Do not publish without user authorization.
