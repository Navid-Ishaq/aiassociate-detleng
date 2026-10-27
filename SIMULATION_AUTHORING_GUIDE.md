# Speaking Practice authoring

Speaking Practice is independent of AI Guide. It uses approved text, checkboxes and deterministic sentence composition. No microphone, recording, scoring or provider calls are used. Google receives practice text only after the learner explicitly opens Google Translate.

## Three source documents per lesson

Supply the lesson DOCX, Quick Review DOCX, and matching simulations DOCX with the current repository. Keep the three content banks separate: src/lessons/[ID]/, src/reviews/[ID].json and src/simulations/[ID]-simulations.json. DOCX files are editorial input; convert their learning content into the website's existing structures. Do not publish editorial notes, draft/version labels or implementation commentary as learner content.

The first bank was transcribed from M01-L01-simulations..docx in the supplied Simulations/M01 folder. It contains 18 companion simulations, 72 points and 18 example responses. Original customer questions/answers remain authoritative in the review bank and are not duplicated here.

## Add a simulation bank

1. Copy the shape of src/simulations/M01-L01-simulations.json. Set lessonId to the exact curriculum/review ID.
2. Add items keyed by the review's stable reviewId. Each needs goal, exactly four points (id, title, explanation, sentence), and professionalResponse. IDs must be unique. Partial lesson banks are allowed; only matching questions get a button. Never fabricate missing content.
3. Register the lesson ID in src/data/simulations.json. Its Quick Review must already be published.
4. Run npm run build and npm test. Test new sentences in all 15 nonempty combinations: each must make sense independently and retain factual limitations. Do not force greetings or generic closing filler. Selected points are a practice guide, not necessarily a complete customer reply.
5. Check desktop/mobile dialogs, selection, reveal, copy fallback, both listening materials and return from Smart Listener. Publish only when intentionally authorised.

## Shared implementation

src/simulation-system/simulation.schema.json documents the content shape. src/simulation-system/content.js validates banks and composes selected sentences in original point order. render.mjs provides accessible markup; runtime.js manages per-question selection/reveal state for this page visit. styles.css follows the site's blue design. The build emits assets/simulations/[ID].json. That bank is fetched only on first Speaking Practice click, then cached for this page visit. The other 95 banks are not fetched.

Smart Listener's shared prepareTextListener helper validates languages/counts and preserves complete blocks, with text/URL size guards. One dialog is visible at a time: the simulation closes temporarily for the listener, then returns with selections intact. The listener can use My Speaking Guide or Professional Response. Professional material is available without selecting points. Repetitions describe repeated text; Google controls translation and actual audio playback.

Do not send simulation data to AI Guide or its backend. Future unfamiliar interaction types require explicit shared-engine work; ordinary new banks need only content and manifest updates.
