import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { link } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Coba gunakan gemini-1.5-flash-latest
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `Ini adalah link postingan dari aplikasi X: ${link}. Berdasarkan link tersebut, buat reply dalam bahasa jepang yang natural, sesuai konteks dan tidak spam.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });
  } catch (error) {
    // Memberikan pesan error yang lebih spesifik di log Vercel
    console.error("Detail Error:", error);
    return res.status(500).json({ 
      error: "Gagal memproses permintaan", 
      message: error.message 
    });
  }
}
