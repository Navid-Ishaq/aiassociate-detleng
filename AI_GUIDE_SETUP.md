# AI Guide structure and next connection stage

The website now has one shared AI Guide panel on all routes, plus an Ask AI Guide button on every available Quick Review card. Live AI is disabled. Nothing has been deployed or connected to Render, Mastra or Groq.

## Content and conversations

- `src/guide-system/`: panel markup, browser runtime, protocol checks, lightweight styling and public configuration.
- `src/guide-system/config.json`: `enabled: false`, empty `apiBase`. This is intentionally the current state. Never put provider API keys in this public file or browser code.
- Build-generated `assets/guide-catalog.json`: all 96 exact lesson titles/objectives and availability. Loaded only when the Guide is first opened.
- Build-generated `assets/guide-content/[ID].json`: approved published lesson and review source, used by the future server. A Coming Soon lesson has only its outline; the Guide must not invent its full content.
- `guide-server/context.mjs`: resolves IDs against the authoritative build output; client text never replaces approved lesson content.
- `guide-server/GUIDE_INSTRUCTIONS.md`: teaching rules for the future provider adapter. They are not connected to a model yet.

Build automatically includes newly published lessons/reviews. Existing lesson and review publication workflows remain unchanged. Conversations are separate for general chat, each lesson and each selected Q&A, and exist in page memory only. Selecting a card loads its context without sending a message. Suggestions are deliberate send actions. Starting a new conversation clears only that selected conversation.

## Interaction

Enter sends; Shift+Enter inserts a newline. IME composition and key code 229 are guarded. Blank and overlong input are rejected; pending requests cannot be duplicated in the same conversation. The composer remains outside the scrolling conversation. Rendering updates scroll only that conversation, respect reduced motion and do not take focus from the composer. Users can scroll earlier content themselves.

A concise processing notice and expandable Privacy details explain online sharing. The inactive stage provides lesson/review links and an honest unavailable notice, with no fabricated AI replies.

## Local service scaffold

```powershell
npm run build
npm run guide:preview
```

The local scaffold binds to 127.0.0.1:4319. It is disabled by default. GET `/health` returns `{ "ready": false }`; POST `/chat` returns a clear unavailable response. No credentials or provider SDK are present.

Contract for later connection:

- GET `/health` returns `{ "ready": true }` only when replies are usable. A health probe must not generate an AI reply.
- POST `/chat` accepts `requestId`, `context: {lessonId, reviewId}`, `message`, and up to 10 recent user/assistant history messages, bounded to 12,000 characters in total. IDs may be null for general chat.
- Success: `{requestId, reply}`. Responses must match the request ID.
- The browser checks readiness, then sends the chat request once. A failed or timed-out chat request is never silently resubmitted. Explicit retry reuses the same request ID.

The scaffold validates context, body/history size, exact allowed origins, basic request limits and request-ID deduplication. Its deduplication cache is process-local and temporary; restarting a process loses it. Before a public live deployment, connect a provider adapter, review abuse controls/proxy handling, and use an appropriate durable request store if cross-restart or multi-instance deduplication is required. CORS is not authentication. Do not claim exactly-once provider processing.

For Render/Mastra/Groq later: choose and authorise the actual deployment/model, keep keys in server environment variables, wire the teaching instructions and approved source to the adapter, configure real allowed origins, update the processing/provider notice, and test the deployed service before switching public `enabled` on. The current localhost scaffold is not a completed Render deployment.

## Tests

`npm test` runs site checks and Guide protocol/service checks. `node tests/guide-browser-fixture.mjs` starts an isolated fixture at http://127.0.0.1:4174/guide-fixture/ with explicitly synthetic local replies. It tests waking, thinking, error and reply UI without contacting an AI provider. Never deploy or present this fixture as the live Guide.

The future provider adapter should select the current Q&A and relevant approved teaching excerpts rather than sending whole lesson JSON, every assessment answer, or all course content on every turn. The context resolver makes approved sources available; it does not yet implement model retrieval or call an AI provider.
