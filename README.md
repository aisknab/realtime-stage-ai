# Stage AI Controller

Minimal local web controller for OpenAI Realtime voice over WebRTC.

## Setup

```bash
npm install
copy .env.example .env
```

Add your OpenAI API key to `.env`:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

Start the local server:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## Safety

- Never run this project from `C:\Windows\System32`.
- Do not commit `.env`.
- Do not commit `environment.env` if you use it for local secrets.
- The browser never receives `OPENAI_API_KEY`; it only talks to the local Express server.
- The local Express server sends the WebRTC SDP offer to OpenAI Realtime.

## Usage

Click `CONNECT AI`, allow microphone access, and speak to the AI. The `ASK AI` button is still available as a manual cue, but normal spoken turns will trigger responses automatically.

The session uses `semantic_vad` with `eagerness: high` for responsive stage handoffs, plus `audio.input.noise_reduction: { type: "far_field" }` so coughs, room noise, and mic bleed are less likely to trigger false turns. Finale mode switches to a faster silence-based VAD so the closing human-versus-AI bit lands quickly. Response interruption stays disabled, spoken responses use the model's full available output budget to avoid app-level mid-sentence cutoffs, and rolling conversation context is limited with retention-ratio truncation to reduce long-session slowdown.

Critai is prompted to keep normal replies short, substantive, and stage-ready rather than being forced short with a hard output cap.

The stage instructions include a specific human-versus-AI banter cue: first push back on `only a human could present this slide`, then if Keaton pushes back that a human is best, playfully accuse him that the slides were made with AI too.
## Production

For a reverse-proxied server, set `HOST=0.0.0.0` and an unused app port such as `PORT=3007`.

```bash
HOST=0.0.0.0 PORT=3007 npm start
```

Keep `OPENAI_API_KEY` in `.env` on the server. Do not expose it through Nginx or commit it to Git.
