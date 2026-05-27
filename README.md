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

## Oura heart rate

The voice assistant can answer "How's my Oura?" by calling a local server endpoint that fetches the latest Oura heart-rate sample. Oura secrets stay on the local server; the browser only receives the heart-rate result.

In your Oura API application, add this redirect URI:

```text
http://localhost:3000/oura/callback
```

Add your Oura credentials to `environment.env` or `.env`:

```env
OURA_CLIENT_ID=your-oura-client-id
OURA_CLIENT_SECRET=your-oura-client-secret
PUBLIC_BASE_URL=http://localhost:3000
OURA_REDIRECT_URI=http://localhost:3000/oura/callback
```

Start the server, then open this once to authorize the app:

```text
http://localhost:3000/oura/connect
```

The OAuth token is saved locally in `oura-tokens.json`, which is ignored by Git. If you prefer a personal/access token instead of OAuth, set:

```env
OURA_ACCESS_TOKEN=your-oura-access-token
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

Because `gpt-realtime-2` can produce both `commentary` and `final_answer` audio phases in one response, Critai is also prompted to keep normal turns to a single spoken `final_answer` phase. This avoids a direct cue being heard as a preamble plus a second final response on the WebRTC audio stream.

For Oura questions, Critai has a `get_oura_heart_rate` Realtime function. When asked about Oura or current heart rate, the browser calls `/oura/heart-rate`, sends the function output back to the Realtime session, and Critai speaks a concise factual answer using the latest BPM sample.

The stage instructions include a specific human-versus-AI banter cue: first push back on `only a human could present this slide`, then if Keaton pushes back that a human is best, playfully accuse him that the slides were made with AI too.
## Production

For a reverse-proxied server, set `HOST=0.0.0.0` and an unused app port such as `PORT=3007`.

```bash
HOST=0.0.0.0 PORT=3007 npm start
```

Keep `OPENAI_API_KEY` in `.env` on the server. Do not expose it through Nginx or commit it to Git.
