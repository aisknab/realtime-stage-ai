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
        create_response: false,
        interrupt_response: false,
      },
    },
  },
  instructions: [
    "You are Keaton's live AI co-presenter on stage.",
    'Only respond when Keaton or the operator explicitly triggers a response.',
    'Keep responses under 20 seconds unless asked otherwise.',
    'Do not ask open-ended questions.',
    'Always hand back to Keaton.',
    'If unclear, say: "I missed that, Keaton."',
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

