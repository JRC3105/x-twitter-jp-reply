const tweetUrlInput = document.getElementById('tweetUrl');
const generateBtn = document.querySelector('.generate-btn');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const replyBox = document.getElementById('replyBox');
const errorDiv = document.getElementById('error');

// 👇 GANTI INI DENGAN API KEY KAMU!
const API_KEY = 'AIzaSyBpjMa2mEIV-L9hPpNdeMGr4GrMFlG97DE'; 

async function generateReply() {
    const tweetUrl = tweetUrlInput.value.trim();
    
    if (!tweetUrl || !API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        showError('❌ Masukkan API Key Gemini yang valid!');
        return;
    }

    hideAll();
    showLoading();

    try {
        const tweetText = await getTweetText(tweetUrl);
        const reply = await callGemini(tweetText);
        showResult(reply);
    } catch (error) {
        console.error('Error:', error);
        showError(`❌ ${error.message}. Cek API Key!`);
    }
}

async function getTweetText(url) {
    // Simple fallback - langsung pakai URL sebagai konteks
    return `Tweet dari: ${url}`;
}

async function callGemini(tweetText) {
    const prompt = `Buat reply dalam bahasa Jepang yang natural dan tidak spam untuk tweet ini: "${tweetText}"\n\nReply:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 100,
            }
        })
    });

    const data = await response.json();
    
    if (!response.ok || !data.candidates) {
        throw new Error(`Status: ${response.status}. ${data.error?.message || 'API Key invalid'}`);
    }

    return data.candidates[0].content.parts[0].text.trim();
}

function showLoading() {
    loading.style.display = 'block';
    generateBtn.disabled = true;
    generateBtn.innerHTML = '⏳ Gemini berpikir...';
}

function showResult(reply) {
    hideAll();
    replyBox.textContent = reply;
    result.style.display = 'block';
    generateBtn.disabled = false;
    generateBtn.innerHTML = '✅ Generate Lagi';
}

function showError(message) {
    hideAll();
    errorDiv.innerHTML = message;
    errorDiv.style.display = 'block';
    generateBtn.disabled = false;
    generateBtn.innerHTML = '🔄 Coba Lagi';
}

function hideAll() {
    loading.style.display = 'none';
    result.style.display = 'none';
    errorDiv.style.display = 'none';
}

function copyReply() {
    navigator.clipboard.writeText(replyBox.textContent);
    const btn = document.querySelector('.copy-btn');
    btn.textContent = '✅ Dicopy!';
    setTimeout(() => btn.textContent = '📋 Copy', 1500);
}

// Enter key
tweetUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') generateReply();
});
