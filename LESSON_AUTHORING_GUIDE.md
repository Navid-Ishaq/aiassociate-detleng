# Adding interactive lessons

M01-L01 is the working example. Keep learner content clean; authoring notes belong in this repository, never on lesson pages.

## Files to edit

- `src/lessons/MXX-LXX/lesson.json`: lesson title, exact curriculum objective, readable content, activity definitions, hints and worked solutions.
- `src/lessons/MXX-LXX/questions.json`: one assessment bank. Quiz and flashcards both use these records.
- `src/data/curriculum.json`: set only the reviewed lesson to `published`.

The shared renderer, browser runtime and stylesheet are in `src/lesson-system/`. The build loads the two content files for published lessons and fails if they are missing or do not match the curriculum. Quick Review has separate availability and stays Coming Soon until its own Q&A is implemented.

## Content structure

Use stable section IDs and a `kind`. Existing kinds are `theory`, `opening`, `simulation`, `reply`, `explanation-practice`, `challenges`, `checklist`, `recap`, `assessment`, and `final-application`. Paragraph/table source blocks are stored in `blocks`. Simulation cases have `context`, `options`, zero-based `correct`, per-option `feedback`, `explanation`, and `hint`.

Each question needs a unique stable ID, question text, four options, zero-based correct answer, explanation and four feedback entries. Do not maintain a second flashcard bank. The current lesson has 15 questions; the engine uses the actual array length.

Challenges are structured records with IDs, titles, introductory paragraphs, hints, suggested solutions and self-review criteria. Classification challenges include their categories/items, with matching answer keys in `classifications`. Writing challenges have a prompt and optional table. Their responses stay in memory and are never automatically graded.

M01-L01 also retains the full original section blocks for source comparison. The renderer converts the approved teaching sequence into learner activities. Some components currently recognise source headings such as `Suggested answer:` and `Example Answer`. When adding a lesson, review these mappings rather than merely swapping the document text. A different teaching sequence or a new interaction needs an explicit renderer extension and tests. Do not silently force a new lesson into the wrong interaction.

## Working behaviour

Choices must provide meaningful feedback for every option, missing-selection guidance, retry and reset. A simulation is labelled as educational and makes no live AI request. Correct answers contribute to visit-only progress. Written practice contributes only after the learner writes, compares and explicitly self-reviews. Changing a reviewed answer clears its self-review check. No accounts or persistent progress are implemented.

Keep the existing readable font sizes, blue palette, responsive layout, native controls and visible keyboard focus. Preserve all approved concepts, examples, explanations and assessment keys. Correct formatting artefacts without changing meaning. Recover real reference URLs from Word relationships, verify their destinations, and remove tracking parameters.

## Validate and build

```powershell
npm run build
npm test
```

Then test the actual lesson in a browser: all answer paths, missing input, wrong answers, hints, retry/reset, quiz results, mistakes-only review, flashcards, written comparison, timer and checklist. Check narrow mobile widths, keyboard use, link targets, and neighbouring lesson navigation. Confirm other lesson routes and Quick Review remain correct.

Generated root files must be included with the source when the owner publishes. Do not edit generated HTML as the source of truth.

## What to give another assistant

Give it the latest complete project ZIP (excluding `.git` and dependencies), the new lesson DOCX, and this guide. Ask it to follow the working M01-L01 example, preserve the curriculum, integrate locally, and test before marking a lesson available. The authoring kit is a reference subset; it does not replace the latest project when integration is required.
