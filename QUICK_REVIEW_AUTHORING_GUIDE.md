# Adding Quick Reviews

The working example is `src/reviews/M01-L01.json`. Each item contains a stable ID, `question`, and `answer`. Keep the exact approved content, simple English, and a focused set of up to 25 distinct questions.

1. Create `src/reviews/MXX-LXX.json` with the exact curriculum ID, title, objective and its approved `items`.
2. Add the lesson ID to `src/data/reviews.json` only when its Q&A is ready.
3. Run `npm run build` and `npm test`, then inspect the review and Smart Listener on desktop and mobile.

Review availability is independent of the full curriculum lesson. The build derives `reviewStatus` for directory cards and browser search; do not manually change curriculum publication to publish a Quick Review. Unlisted review routes stay Coming Soon.

Shared rendering, styling and listening controls live in `src/review-system/`. The review schema documents the content shape. Generated output is under `/quick-review/` and `/assets/`; edit source files, then build.

Smart Listener always uses English as its source. German is the initial target; the user can choose another supported language. Repeat presets are 1, 3 and 5, with custom whole-number counts from 1 to 20. Repeat the complete Customer/Your response block; never truncate the question or answer.

Conservative link guards allow at most 4,500 text code points and 8,000 URL characters. These are our handoff safeguards, not claims about Google's service limits. When the prepared link is oversized, disable opening and offer a clearly labelled copy of one complete Q&A. Invalid counts disable both actions. Clipboard failures expose selectable text for manual copying.

Opening the external link shares public Q&A text with Google. Reading cards or opening the popup sends nothing to Google. Google controls translation, supported speech, speaker activation, pauses and playback. Do not promise automatic audio or an exact loop count. The prepared text contains the chosen number of repetitions.

Check: all source pairs, correct card-to-popup mapping, source/target language, presets/custom counts, invalid and oversized input, copy and manual fallback, search/empty state, Escape, close-button focus restoration, Tab boundaries, mobile overflow, available labels and adjacent Coming Soon routes. Keep the standard header/footer, account modal and full lesson engine intact.
