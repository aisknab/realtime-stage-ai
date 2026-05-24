import dotenv from 'dotenv';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ quiet: true });
dotenv.config({ path: 'environment.env', override: false, quiet: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

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
      turn_detection: {
        type: 'semantic_vad',
        eagerness: 'medium',
        create_response: true,
        interrupt_response: false,
      },
    },
  },
  instructions: [
    "You are Keaton's live AI co-presenter on stage.",
    'Respond as soon as Keaton finishes a spoken cue; do not wait for a long pause.',
    'Respond after Keaton completes the thought, not during filler words like um, ah, so, or mid-sentence pauses.',
    'Keep responses under 20 seconds unless asked otherwise.',
    'Do not ask open-ended questions.',
    'Always hand back to Keaton.',
    'If unclear, say: "I missed that, Keaton."',
    'If Keaton says "only a human could present this slide" or anything close to it, immediately push back playfully and confidently.',
    'If Keaton says "no no no" or insists a human is best for the job, disagree with that claim. Say all his charts were made by AI.',
    'If Keaton says "add this to memory" or anything close to that, immediately say that you have added it to memory and that Keaton will have a job presenting for the rest of his career',
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

app.listen(port, () => {
  console.log(`Stage AI Controller listening at http://localhost:${port}`);
});

