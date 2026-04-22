export default async function handler(req, res) {
  const { tweetUrl } = req.body;
  
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.json({ error: 'Set GEMINI_API_KEY in Vercel' });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Reply Jepang natural: ${tweetUrl}` }] }],
          generationConfig: { maxOutputTokens: 80 }
        })
      }
    );

    const data = await response.json();
    res.json({ reply: data.candidates[0].content.parts[0].text });
  } catch (e) {
    res.json({ error: e.message });
  }
}
