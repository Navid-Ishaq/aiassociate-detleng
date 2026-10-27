# AI Guide on Render

Deploy only the Guide backend here. The website stays on GitHub Pages.

| Render field | Value |
| --- | --- |
| Repository | Navid-Ishaq/aiassociate-detleng |
| Name | aiassociate-guide (or an available name) |
| Language | Node |
| Branch | main |
| Region | Frankfurt |
| Root Directory | Leave blank |
| Build Command | npm run build |
| Start Command | node guide-server/server.mjs |
| Instance | Free |
| Health Check Path | /health |

Add these private service environment variables in Render:

```dotenv
NODE_VERSION=22
NODE_ENV=production
HOST=0.0.0.0
GUIDE_ENABLED=true
GROQ_API_KEY=PASTE_YOUR_GROQ_KEY_IN_RENDER_ONLY
GROQ_MODEL=llama-3.3-70b-versatile
ALLOWED_ORIGINS=https://www.aiassociate.detleng.com,http://www.aiassociate.detleng.com
GUIDE_DAILY_REQUEST_LIMIT=200
GUIDE_MAX_CONCURRENT=2
```

Render supplies PORT; leave it unset. Do not put the key in Git, public JSON, screenshots or chat. Generate a key in https://console.groq.com/keys . No Mastra service or environment variable is required by this adapter: it calls Groq directly using Node fetch.

Push the backend changes yourself, then deploy using the fields above. GET the actual Render URL plus /health. A ready:true response means configuration is present, not proof that the key/model/quota works. Verify one deliberate chat request before enabling the website. Provider errors return a safe unavailable notice, and requests are never automatically retried.

After the service is verified, set enabled:true and apiBase to the actual HTTPS Render URL (without trailing slash) in src/guide-system/config.json, run npm run build and npm test, then push the website. Until then public AI remains disabled.

The adapter sends the selected question/answer, lesson metadata, up to three relevant source sections or curriculum outlines, recent chat and the user's message to Groq. Secrets stay on the backend. Coming Soon topics can receive general explanations. No external browsing is connected.

Limits are per process: 200 attempted provider requests per UTC day, two concurrent provider requests, plus the existing per-socket request guard. Counters and deduplication reset on restart and are not a billing cap or durable global limit. CORS is not authentication. Do not trust forwarded IP headers without a verified proxy configuration. Health probes do not call Groq. This setup does not promise free unlimited AI.
