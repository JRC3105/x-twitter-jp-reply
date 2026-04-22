import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { link } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key belum diatur di Vercel Settings." });
  }

  if (!link) {
    return res.status(400).json({ error: "Link postingan X harus diisi." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prompt sesuai permintaan Anda
    const prompt = `Ini adalah link postingan dari aplikasi X: ${link}. Berdasarkan link tersebut, buat reply dalam bahasa jepang yang natural, sesuai konteks dan tidak spam.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });
  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ error: "Gagal memproses permintaan: " + error.message });
  }
}
