export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tweetUrl } = req.body;
  if (!tweetUrl) {
    return res.status(400).json({ error: 'Tweet URL required' });
  }

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new Error('API Key not configured');
    }

    const prompt = `Buat reply dalam bahasa Jepang yang natural untuk tweet dari link: "${tweetUrl}"

Requirements:
- Bahasa Jepang conversational seperti orang Jepang asli
- Sesuai konteks tweet  
- Maks 100 karakter
- Tidak spam/bot-like
- Pakai emoji secukupnya`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.7, 
            maxOutputTokens: 100 
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Gagal generate reply';

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}