// api/generate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tweetUrl } = req.body;

  if (!tweetUrl) {
    return res.status(400).json({ error: 'Tweet URL required' });
  }

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Aman di environment variable
    
    const prompt = `Buat reply dalam bahasa Jepang yang sesuai konteks tweet dari link ini: "${tweetUrl}"

Requirements:
- Bahasa Jepang natural seperti orang Jepang asli
- Sesuai konteks tweet
- Maksimal 100 karakter
- Tidak spam/bot-like
- Gunakan emoji secukupnya
- Cocok untuk X/Twitter`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${AIzaSyAJud5BP5OXXwHhzlGkza-MyAZvmUOy-7A}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Error generating reply';

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate reply' });
  }
}