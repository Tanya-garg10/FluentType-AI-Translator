// api/translate.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, sourceLang } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const API_KEY = process.env.GROQ_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({
        error: '❌ API key missing in Vercel ENV',
      });
    }

    const languageName =
      sourceLang === 'auto' ? 'the source language' : sourceLang;

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: `You are a translator. Translate the following text into English. Return ONLY the translated text with absolutely nothing else — no explanations, no notes, no quotes, no labels.`,
            },
            {
              role: 'user',
              content: text,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    // 🔥 SHOW REAL ERROR
    if (!response.ok) {
      console.error("❌ Groq Error FULL:", data);
      return res.status(500).json({
        error: JSON.stringify(data),
      });
    }

    const translatedText =
      data?.choices?.[0]?.message?.content?.trim();

    if (!translatedText) {
      return res.status(500).json({
        error: '❌ Empty response from AI',
      });
    }

    return res.status(200).json({ translatedText });

  } catch (err) {
    console.error("❌ Server Crash:", err);
    return res.status(500).json({
      error: err.message,
    });
  }
}
