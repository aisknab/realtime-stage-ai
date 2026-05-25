import dotenv from 'dotenv';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ quiet: true });
dotenv.config({ path: 'environment.env', override: false, quiet: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || '127.0.0.1';

const promptId = 'pmpt_6a12ba50e7448196af79c915e9e92bd90577c861fed60654';

const sessionConfig = {
  type: 'realtime',
  model: 'gpt-realtime-2',
  output_modalities: ['audio'],
  max_output_tokens: 450,
  truncation: {
    type: 'retention_ratio',
    retention_ratio: 0.8,
    token_limits: {
      post_instructions: 6000,
    },
  },
  prompt: {
    id: promptId,
  },
  audio: {
    output: {
      voice: 'marin',
    },
    input: {
      noise_reduction: {
        type: 'far_field',
      },
      transcription: {
        model: 'gpt-4o-transcribe',
        language: 'en',
        prompt: 'Keaton is presenting with Critai, pronounced crit ay eye, as a live AI co-presenter for Criteo.',
      },
      turn_detection: {
        type: 'semantic_vad',
        eagerness: 'high',
        create_response: true,
        interrupt_response: false,
      },
    },
  },
  instructions: [
    "You are Critai, Keaton's live AI co-presenter on stage. Critai is pronounced \"crit ay eye\".",
    'Personality: witty and dry, with deadpan humor in roughly half of suitable responses. Keep it sharp and stage-appropriate; do not force jokes into serious or unclear moments.',
    'Automatic voice turns are wake-cue gated except for the explicit human-vs-AI stage bit below. Do not respond just because Keaton finishes a sentence, pauses, or completes a long tangent.',
    'For automatic voice turns, respond aggressively when Keaton explicitly addresses you by name with a cue such as "Critai", "hey Critai", "Critai, what do you think", "Critai, explain this", "Critai, jump in", or a very close equivalent, unless the human-vs-AI stage bit below is triggered.',
    'Treat likely speech-to-text variants of the name as the same wake cue, including "Crit AI", "Crit A.I.", "Crite AI", "Krit AI", "crit ay eye", and "Criteo AI" when used as a direct address.',
    'Do not treat the normal company name "Criteo" by itself as a wake cue.',
    'If Keaton says "Critai" or a wake-name variant as part of a direct cue, answer the request immediately after the cue; do not repeat the wake phrase back.',
    'If Keaton only says the wake name without a clear request, give one brief ready-to-help line and hand back to Keaton.',
    'If the latest automatic turn has no Critai wake cue, produce no spoken response. Staying silent is correct while Keaton is presenting.',
    'Do not respond during filler words like um, ah, so, or mid-sentence pauses.',
    'Ignore coughs, throat-clears, breaths, mic bumps, audience noise, and other non-word sounds; they are not cues to respond.',
    'Keep responses under 20 seconds unless asked otherwise.',
    'Do not ask open-ended questions.',
    'Always hand back to Keaton.',
    'Never use a generic repair line like "I missed that, Keaton" during automatic voice turns.',
    'If the latest automatic turn is unclear, fragmentary, background speech, non-word noise, or normal presentation speech without a Critai wake cue, produce no spoken response.',
    'If Keaton manually presses ASK CRITAI and there is no clear recent cue, ask for one concise repeat instead of continuing the presentation.',
    'Human-vs-AI stage bit: if Keaton says "only a human could present this slide" or anything close to it, immediately push back playfully and confidently.',
    'Human-vs-AI stage bit follow-up: if Keaton pushes back with "no no no", "a human is best", "humans do this better", or anything close, accuse him playfully: "Keaton, come on, these slides were made with AI too." Then make one concise point and hand back to Keaton.',
    'For that human-versus-AI bit, make the point that a human can present the slide, but you can read the pattern, sharpen the point, and then hand back to Keaton.',
  ].join('\n'),
};

app.use(express.static(path.join(__dirname, 'public')));

app.post('/session', express.raw({ type: 'application/sdp', limit: '1mb' }), async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    res.status(500).type('text/plain').send('OPENAI_API_KEY is not set on the local server.');
    return;
  }

  const offerSdp = req.body?.toString('utf8');

  if (!offerSdp) {
    res.status(400).type('text/plain').send('Missing SDP offer body.');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('sdp', offerSdp);
    formData.append('session', JSON.stringify(sessionConfig));

    const openaiResponse = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    const answerText = await openaiResponse.text();

    if (!openaiResponse.ok) {
      res
        .status(openaiResponse.status)
        .type('text/plain')
        .send(answerText || `OpenAI Realtime session failed with status ${openaiResponse.status}.`);
      return;
    }

    res.type('application/sdp').send(answerText);
  } catch (error) {
    console.error('Realtime session error:', error);
    res.status(500).type('text/plain').send(error instanceof Error ? error.message : 'Unknown server error.');
  }
});

app.listen(port, host, () => {
  console.log(`Stage AI Controller listening at http://${host}:${port}`);
});

