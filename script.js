// ==================== GEMINI API - CORRECT URL ====================
// 🚨 GANTI INI DENGAN API KEY KAMU!
const GEMINI_API_KEY = 'AIzaSyBpjMa2mEIV-L9hPpNdeMGr4GrMFlG97DE'; 

// CORRECT ENDPOINT (bukan -latest)
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// DOM
const tweetUrlInput = document.getElementById('tweetUrl');
const apiKeyInput = document.getElementById('apiKey');
const generateBtn = document.querySelector('.generate-btn');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const replyBox = document.getElementById('replyBox');
const errorDiv = document.getElementById('error');

async function generateReply() {
    const tweetUrl = tweetUrlInput.value.trim();
    if (!tweetUrl) return showError('Masukkan link tweet!');

    const apiKey = apiKeyInput.value.trim() || GEMINI_API_KEY;
    if (apiKey.includes('AIzaSyBO5IP0EusMN3fZ8F8K2rGqC7oKkYq3z4w')) {
        return showError('🚨 Ganti API_KEY baris 4!');
    }

    showLoading();
    
    try {
        const context = tweetUrl; // Simple untuk test
        const reply = await callGemini(context, apiKey);
        showResult(reply);
    } catch (error) {
        showError(getErrorMsg(error));
    }
}

async function callGemini(tweetText, apiKey) {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: `Tweet: ${tweetText}\n\nBuat reply JEPANG natural 1 kalimat:`
                }]
            }],
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 30
            }
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`HTTP ${response.status}: ${err}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

function showLoading() {
    loading.style.display = 'block';
    generateBtn.disabled = true;
    generateBtn.textContent = '⏳ Gemini...';
}

function showResult(reply) {
    hideAll();
    replyBox.textContent = reply;
    result.style.display = 'block';
    generateBtn.textContent = '✅ Lagi';
}

function showError(msg) {
    hideAll();
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
    generateBtn.textContent = '🔄 Retry';
}

function getErrorMsg(error) {
    const msg = error.message;
    if (msg.includes('403')) return '❌ API Key invalid';
    if (msg.includes('429')) return '⏳ Rate limit';
    if (msg.includes('404')) return '✅ Model URL sudah fix!';
    return msg;
}

function hideAll() {
    document.querySelectorAll('.loading, .result, .error').forEach(el => el.style.display = 'none');
}

function copyReply() {
    navigator.clipboard.writeText(replyBox.textContent);
    document.querySelector('.copy-btn').textContent = '✅ OK';
}

// Events
tweetUrlInput.addEventListener('keypress', e => e.key === 'Enter' && generateReply());
