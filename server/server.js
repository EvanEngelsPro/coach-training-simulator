/**
 * Express API Server
 * Proxies AI calls to OpenAI to keep the API key server-side.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize OpenAI (may be null if key not provided)
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-api-key-here') {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('✅ OpenAI API key configured');
} else {
    console.log('⚠️  No OpenAI API key found. AI features will use mock responses.');
    console.log('   Add OPENAI_API_KEY to .env to enable AI simulation.');
}

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        aiEnabled: openai !== null,
        timestamp: new Date().toISOString(),
    });
});

/**
 * POST /api/simulate
 * Simulates a client response using OpenAI.
 */
app.post('/api/simulate', async (req, res) => {
    const { systemPrompt, userMessage } = req.body;

    if (!openai) {
        return res.status(503).json({ error: 'AI not configured' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            temperature: 0.8,
            max_tokens: 300,
        });

        res.json({ response: completion.choices[0].message.content });
    } catch (err) {
        console.error('OpenAI simulate error:', err.message);
        res.status(500).json({ error: 'AI generation failed' });
    }
});

/**
 * POST /api/evaluate
 * Evaluates a user response using OpenAI.
 */
app.post('/api/evaluate', async (req, res) => {
    const { systemPrompt, userMessage } = req.body;

    if (!openai) {
        return res.status(503).json({ error: 'AI not configured' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            temperature: 0.3,
            max_tokens: 500,
        });

        res.json({ response: completion.choices[0].message.content });
    } catch (err) {
        console.error('OpenAI evaluate error:', err.message);
        res.status(500).json({ error: 'AI evaluation failed' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Coach API Server running at http://localhost:${PORT}`);
});
