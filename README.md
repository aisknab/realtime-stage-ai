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

The session uses `semantic_vad` with `eagerness: medium` so filler words and mid-sentence pauses are less likely to trigger an early response, while still responding automatically. Response interruption stays disabled, and rolling conversation context is limited with retention-ratio truncation to reduce long-session slowdown.

The stage instructions include a specific human-versus-AI banter cue for lines like `only a human could present this slide` and `no no no, a human is best for this job`.


