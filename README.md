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
