// 📋 COPY SELURUH INI
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { tweetUrl } = req.body;
  if (!tweetUrl) return res.status(400).json({ error: 'Tweet URL required' });

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) throw new Error('API Key not set in Vercel');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Buat reply Jepang natural untuk: ${tweetUrl}` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 100 }
        })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Error';
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
