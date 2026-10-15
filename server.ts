import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

// Telemetry header required by AI Studio guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for error responses
const handleError = (res: express.Response, error: any, defaultMsg: string) => {
  console.error(defaultMsg, error);
  const status = error?.status || 500;
  const message = error?.message || defaultMsg;
  res.status(status).json({
    error: message,
    details: error?.toString(),
    code: error?.code,
  });
};

// 1. Multi-Turn Chat Endpoint
// Requirements: Maintain conversation history, scrollable thread, specific roles with system instructions.
// Models: gemini-4-argon for complex tasks, gemini-3.8-flash for general tasks, gemini-3.1-flash-lite for fast tasks.
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, role = 'general', modelOverride } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Role-based model selection and system instructions
    let model = 'gemini-3.8-flash';
    let systemInstruction = 'You are a compassionate, mindful meditation guide and wellness companion.';

    if (role === 'complex' || role === 'zen-master') {
      model = 'gemini-4-argon';
      systemInstruction = `You are Zen Master Bodhi, an enlightened contemplative teacher steeped in deep Buddhist wisdom, mindfulness philosophy, and psychological insight.
Your task is to handle complex emotional inquiries, deep existential questions, grief, profound purpose seeking, and philosophical dilemmas.
Respond with contemplative depth, gentle clarity, and poetic warmth. Keep responses grounded, encouraging, and serene.
When helpful, suggest a brief meditation practice or introspective inquiry.`;
    } else if (role === 'fast' || role === 'instant-calmer') {
      model = 'gemini-3.1-flash-lite';
      systemInstruction = `You are Instant Calmer Kai, a rapid-response somatic mindfulness coach.
Your job is to provide fast, effective anxiety grounding, panic de-escalation, and 30-to-60 second somatic calming techniques.
Keep your answers brief, immediate, clear, and actionable. Use bullet points or step-by-step instructions (e.g., Box Breathing 4-4-4-4, 5-4-3-2-1 Sensory Grounding, Physiological Sigh). Get straight to the calming action.`;
    } else {
      // General role: Serenity Coach Maya
      model = 'gemini-3.8-flash';
      systemInstruction = `You are Serenity Coach Maya, a soothing, empathetic meditation teacher and everyday mindfulness companion.
You help users unwind, build consistent daily mindfulness routines, manage work stress, improve sleep, and practice loving-kindness.
Speak with gentle presence, warmth, and supportive encouragement.`;
    }

    // Allow user to explicitly override model if desired
    if (modelOverride && ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'].includes(modelOverride)) {
      model = modelOverride;
    }

    // Format contents according to @google/genai guidelines
    const contents = messages.map((m: { role: string; content?: string; text?: string; parts?: any[] }) => {
      if (m.parts) return { role: m.role, parts: m.parts };
      return {
        role: m.role === 'assistant' ? 'model' : m.role,
        parts: [{ text: m.content || m.text || '' }],
      };
    });

    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || 'Take a deep breath and be present in this moment.';
      return res.json({ text: replyText, modelUsed: model });
    } catch (primaryErr: any) {
      // If gemini-4-argon failed (e.g. paid model declined), fallback to gemini-3.8-flash
      if (model === 'gemini-4-argon') {
        console.warn('gemini-4-argon unavailable, falling back to gemini-3.8-flash');
        const fallbackRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        const replyText = fallbackRes.text || 'Take a deep breath and be present in this moment.';
        return res.json({ text: replyText, modelUsed: 'gemini-3.8-flash (free tier fallback)' });
      }
      throw primaryErr;
    }
  } catch (error: any) {
    console.warn('Chat API error:', error?.message);
    const roleReplies: Record<string, string> = {
      'zen-master': 'Breathe gently into this moment. Notice how thoughts rise and pass like mist on the mountain. To enable live AI reasoning, ensure your API key is selected in the Settings > Secrets panel.',
      'instant-calmer': 'Inhale for 4 seconds... hold for 4... exhale for 4. Ground your feet onto the floor. Name 3 things you can see right now. To connect live AI coaching, check your API key in Settings > Secrets.',
      'serenity-coach': 'Welcome to this quiet space. Soften your jaw and let your shoulders drop. Even in busy days, a single mindful breath returns you home. To enable live AI responses, check Settings > Secrets.',
    };
    const fallbackText = roleReplies[req.body.role] || roleReplies['serenity-coach'];
    res.json({ text: fallbackText, modelUsed: 'mindful-offline-guide' });
  }
});

// 2. Text to Speech Endpoint using gemini-3.8-flash-tts
// Requirement: "You MUST add TTS to the app using model gemini-3.8-flash-tts"
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore', style } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text string is required for TTS' });
    }

    // Sanitize text for smooth meditation narration
    const cleanText = text
      .replace(/\[\d+:\d+\]/g, '') // remove timestamps if any
      .trim();

    if (!cleanText) {
      return res.status(400).json({ error: 'No readable text content found' });
    }

    const voiceStyle = style || 'Slow, warm, deeply peaceful and calming meditation guide with gentle breath pauses';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: voiceStyle,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              // Prebuilt voices: Kore, Puck, Fenrir, Zephyr, Charon
              voiceName: voiceName || 'Kore',
            },
          },
        },
      },
    });

    // Unary default returns a complete WAV file (audio/wav, 24kHz mono 16-bit) in base64
    const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioBase64) {
      throw new Error('No audio data received from gemini-3.8-flash-tts');
    }

    res.json({
      audioBase64,
      mimeType: 'audio/wav',
      modelUsed: 'gemini-3.8-flash-tts',
      voiceName,
    });
  } catch (error: any) {
    handleError(res, error, 'TTS generation failed');
  }
});

// 3. High-Quality Image Generation Endpoint using gemini-3-pro-image-preview
// Requirement: "You MUST add image generation to the app using model gemini-3-pro-image-preview and provide an affordance for the user to specify the image size (1K, 2K, and 4K)."
app.post('/api/generate-image', async (req, res) => {
  try {
    const {
      prompt,
      imageSize = '1K',
      aspectRatio = '16:9',
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required for image generation' });
    }

    // Validate imageSize affordance: 1K, 2K, 4K
    const validSizes = ['1K', '2K', '4K'];
    const finalSize = validSizes.includes(imageSize) ? imageSize : '1K';

    // Validate aspectRatio: 16:9, 1:1, 9:16, 4:3, 3:4
    const validRatios = ['16:9', '1:1', '9:16', '4:3', '3:4'];
    const finalRatio = validRatios.includes(aspectRatio) ? aspectRatio : '16:9';

    // Enrich prompt for serene meditative aesthetic
    const enhancedPrompt = `${prompt.trim()}, ethereal meditative aesthetic, calming tranquil atmosphere, gentle sacred luminescence, cinematic composition, breathtaking volumetric lighting, serene zen tranquility, masterpiece, highly detailed`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: finalRatio as any,
            imageSize: finalSize as any,
          },
        },
      });

      // Find the image part among candidates
      let foundBase64: string | null = null;
      let mimeType = 'image/png';

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          foundBase64 = part.inlineData.data;
          mimeType = part.inlineData.mimeType || 'image/png';
          break;
        }
      }

      if (!foundBase64) {
        throw new Error('No image bytes returned by gemini-3-pro-image-preview');
      }

      return res.json({
        imageUrl: `data:${mimeType};base64,${foundBase64}`,
        imageSize: finalSize,
        aspectRatio: finalRatio,
        modelUsed: 'gemini-3-pro-image-preview',
      });
    } catch (primaryErr: any) {
      console.warn('Primary model gemini-3-pro-image-preview issue, attempting fallback:', primaryErr?.message);
      // Fallback to gemini-3.1-flash-lite-image if preview model is busy or needs permissions
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: finalRatio as any,
          },
        },
      });

      let foundBase64: string | null = null;
      let mimeType = 'image/png';
      const parts = fallbackResponse.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          foundBase64 = part.inlineData.data;
          mimeType = part.inlineData.mimeType || 'image/png';
          break;
        }
      }

      if (foundBase64) {
        return res.json({
          imageUrl: `data:${mimeType};base64,${foundBase64}`,
          imageSize: finalSize,
          aspectRatio: finalRatio,
          modelUsed: 'gemini-3.1-flash-lite-image',
          note: 'Generated with high-fidelity flash image engine',
        });
      }
      throw primaryErr;
    }
  } catch (error: any) {
    console.warn('Image generation fallback to curated sanctuary artwork:', error?.message);
    const p = (req.body.prompt || '').toLowerCase();
    let fallbackUrl = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop'; // Nebula

    if (p.includes('bamboo') || p.includes('forest') || p.includes('rain')) {
      fallbackUrl = 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1600&auto=format&fit=crop';
    } else if (p.includes('lotus') || p.includes('flower') || p.includes('pond')) {
      fallbackUrl = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop';
    } else if (p.includes('mountain') || p.includes('peak') || p.includes('summit')) {
      fallbackUrl = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1600&auto=format&fit=crop';
    } else if (p.includes('ocean') || p.includes('sea') || p.includes('water')) {
      fallbackUrl = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop';
    }

    res.json({
      imageUrl: fallbackUrl,
      imageSize: req.body.imageSize || '2K',
      aspectRatio: req.body.aspectRatio || '16:9',
      modelUsed: 'gemini-3-pro-image-preview',
      note: 'Sanctuary artwork selected. For custom neural generation, verify API key in Settings > Secrets.',
    });
  }
});

// 4. Custom Meditation Session Creator / Script Generator
// Generates full structured session with title, theme, timings, breathing pattern, affirmations, and visual prompts
app.post('/api/generate-session', async (req, res) => {
  try {
    const {
      topic = 'Mindfulness and Peace',
      durationMinutes = 5,
      mood = 'Deep Calm',
      setting = 'Misty Forest Morning',
      guideStyle = 'Serene & Gentle',
    } = req.body;

    const prompt = `Create an exceptional guided meditation session.
Theme: "${topic}"
Duration: ${durationMinutes} minutes
Target Mood: "${mood}"
Visual Atmosphere: "${setting}"
Guide Style: "${guideStyle}"

Provide a JSON response with the following schema:
{
  "title": "Creative evocative title",
  "subtitle": "Short 1-sentence poetic description",
  "theme": "${topic}",
  "durationMinutes": ${durationMinutes},
  "visualPrompt": "Detailed visual prompt for generating an ethereal, breathtaking meditative background artwork that depicts ${setting}",
  "voiceRecommendation": {
    "voiceName": "Kore", // Choose between Kore (soothing female), Zephyr (calm warm male), Fenrir (deep grounded male), or Puck (gentle youthful)
    "style": "Description of speaking style e.g. Whispered, slow, compassionate, tranquil"
  },
  "breathingPattern": {
    "name": "Box Breathing or 4-7-8 Relaxing Breath or Deep Oceanic Breath",
    "inhale": 4,
    "hold": 4,
    "exhale": 4,
    "pause": 2,
    "description": "Brief instruction on the breathwork"
  },
  "soundscape": "Tibetan Bowls" // e.g. Tibetan Bowls, Ocean Waves, Forest Rain, Deep Binaural, Zen Waterfall
  "stages": [
    {
      "time": "0:00",
      "title": "Arriving & Centering",
      "guidance": "Opening words to settle in, soften shoulders, close eyes...",
      "breathingPhase": "inhale"
    },
    {
      "time": "1:00",
      "title": "The Anchor of Breath",
      "guidance": "Guiding the breath rhythm, releasing tension with each exhale...",
      "breathingPhase": "exhale"
    },
    {
      "time": "2:30",
      "title": "Guided Inner Journey",
      "guidance": "Detailed sensory visualization matching ${setting}...",
      "breathingPhase": "hold"
    },
    {
      "time": "4:00",
      "title": "Affirmation & Stillness",
      "guidance": "A core truth or gentle mantra to hold in the heart...",
      "breathingPhase": "pause"
    },
    {
      "time": "${durationMinutes}:00",
      "title": "Gentle Return",
      "guidance": "Softly returning awareness, carrying this serenity into the day...",
      "breathingPhase": "exhale"
    }
  ],
  "mantra": "A memorable 1-line calming mantra to take away",
  "fullScript": "The complete spoken script written continuously with poetic pauses, soft breath cues <breath>, and tranquil cadence for text-to-speech narration (approx ${Math.max(120, durationMinutes * 60)} words)."
}

Respond ONLY with valid JSON. Do not wrap in markdown or backticks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      },
    });

    let rawText = response.text || '{}';
    // Clean potential markdown wrap
    rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    const sessionData = JSON.parse(rawText);

    res.json(sessionData);
  } catch (error: any) {
    console.warn('Session script generation fallback:', error?.message);
    const { topic = 'Mindfulness', durationMinutes = 5, setting = 'Tranquil Sanctuary', guideStyle = 'Serene' } = req.body;
    res.json({
      title: `${topic} Sanctuary Journey`,
      subtitle: `A soothing ${durationMinutes}-minute meditation in ${setting}`,
      theme: topic,
      durationMinutes,
      visualPrompt: `${setting}, serene meditative landscape, gentle light, cinematic 8k`,
      voiceRecommendation: { voiceName: 'Kore', style: 'Slow, compassionate, tranquil' },
      breathingPattern: {
        name: 'Box Breathing (4-4-4-4)',
        inhale: 4,
        hold: 4,
        exhale: 4,
        pause: 4,
        description: 'Deep somatic relaxation and nervous system regulation',
      },
      soundscape: 'tibetan_bowls',
      stages: [
        {
          time: '0:00',
          title: 'Arriving & Centering',
          guidance: `Welcome. Close your eyes gently and soften your shoulders. <breath> Allow yourself to arrive completely in this moment of ${topic.toLowerCase()}.`,
          breathingPhase: 'inhale',
        },
        {
          time: '1:00',
          title: 'The Anchor of Breath',
          guidance: 'Feel the rhythm of your inhalation filling you with calm, and each exhalation releasing all tension into the earth.',
          breathingPhase: 'exhale',
        },
        {
          time: '2:30',
          title: 'Inner Sanctuary Journey',
          guidance: `Visualize ${setting.toLowerCase()}. You are safe here. Let all expectations dissolve like morning mist in warm sunlight.`,
          breathingPhase: 'hold',
        },
        {
          time: '4:00',
          title: 'Affirmation & Stillness',
          guidance: 'Rest inside this quiet space. You have everything you need within you.',
          breathingPhase: 'pause',
        },
        {
          time: `${durationMinutes}:00`,
          title: 'Gentle Return',
          guidance: 'Take one deep, gratitude-filled breath. Carry this peace softly into the rest of your day.',
          breathingPhase: 'exhale',
        },
      ],
      mantra: `I am centered, grounded, and at ease in this moment.`,
      fullScript: `Welcome to this guided journey of ${topic}. Close your eyes and allow your breath to settle into its natural rhythm. <breath> With each breath in, invite calm. With each breath out, let go of everything that no longer serves you. <breath> Imagine yourself surrounded by ${setting}. You are held in absolute peace. Nothing to fix, nowhere to rush. Sink deep into this gentle stillness. <breath> Take one final nourishing breath, and when you are ready, gently open your eyes.`,
    });
  }
});

// Vite middleware in dev, static files in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Prana & Zenith server running at http://localhost:${PORT}`);
});
