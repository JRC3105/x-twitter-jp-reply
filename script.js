// ==================== GEMINI API CONFIG ====================
// 🚨 GANTI INI DENGAN API KEY KAMU DARI aistudio.google.com/app/apikey
const GEMINI_API_KEY = 'AIzaSyBpjMa2mEIV-L9hPpNdeMGr4GrMFlG97DE'; 
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

// DOM Elements
const tweetUrlInput = document.getElementById('tweetUrl');
const apiKeyInput = document.getElementById('apiKey');
const generateBtn = document.querySelector('.generate-btn');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const replyBox = document.getElementById('replyBox');
const errorDiv = document.getElementById('error');

// ==================== MAIN FUNCTION ====================
async function generateReply() {
    const tweetUrl = tweetUrlInput.value.trim();
    if (!tweetUrl) return showError('Masukkan link tweet X!');

    const apiKey = apiKeyInput.value.trim() || GEMINI_API_KEY;
    if (!apiKey || apiKey.includes('AIzaSyBO5IP0EusMN3fZ8F8K2rGqC7oKkYq3z4w')) {
        return showError('🚨 Ganti API_KEY di script.js baris 5 atau input di atas!');
    }

    showLoading();
    
    try {
        const tweetContext = await getTweetContext(tweetUrl);
        const reply = await callGeminiAPI(tweetContext, apiKey);
        showResult(reply);
    } catch (error) {
        console.error('Error detail:', error);
        showError(getErrorMessage(error));
    }
}

// ==================== EXTRACT TWEET TEXT ====================
async function getTweetContext(url) {
    try {
        const nitterUrl = url.replace(/twitter\.com|x\.com/, 'nitter.poast.org');
        const response = await fetch(nitterUrl);
        const html = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        let tweetText = doc.querySelector('div[data-testid="tweetText"]')?.textContent ||
                       doc.querySelector('.tweet-content')?.textContent ||
                       'Tweet content';
                       
        return tweetText?.trim().substring(0, 300) || `X post: ${url}`;
    } catch {
        return `X/Twitter post: ${url}`;
    }
}

// ==================== GEMINI API CALL ====================
async function callGeminiAPI(tweetText, apiKey) {
    const prompt = `Buat reply tweet JEPANG natural (1 kalimat):
TWEET: "${tweetText}"

Format: 「reply disini」`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 50
            }
        })
    });

    const data = await response.json();
    
    if (!response.ok || !data.candidates?.[0]) {
        throw new Error(`API Error ${response.status}`);
    }
    
    return data.candidates[0].content.parts[0].text.trim();
}

// ==================== UI FUNCTIONS ====================
function showLoading() {
    loading.style.display = 'block';
    generateBtn.disabled = true;
    generateBtn.innerHTML = '🤖 Gemini...';
}

function showResult(reply) {
    hideAll();
    replyBox.textContent = reply;
    result.style.display = 'block';
    generateBtn.disabled = false;
    generateBtn.innerHTML = '✨ Generate Lagi';
}

function showError(message) {
    hideAll();
    errorDiv.innerHTML = message;
    errorDiv.style.display = 'block';
    generateBtn.disabled = false;
    generateBtn.innerHTML = '🔄 Coba Lagi';
}

function getErrorMessage(error) {
    if (error.message.includes('403')) return '❌ API Key invalid. Buat baru!';
    if (error.message.includes('429')) return '⏳ Kuota habis. Tunggu 1 menit';
    return `❌ ${error.message}`;
}

function hideAll() {
    document.querySelectorAll('.loading, .result, .error').forEach(el => el.style.display = 'none');
}

function copyReply() {
    navigator.clipboard.writeText(replyBox.textContent).then(() => {
        document.querySelector('.copy-btn').textContent = '✅ Copied!';
        setTimeout(() => document.querySelector('.copy-btn').textContent = '📋 Copy ke Clipboard', 2000);
    });
}

// Events
tweetUrlInput.addEventListener('keypress', e => e.key === 'Enter' && generateReply());
