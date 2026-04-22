// X/Twitter URL Regex - SUPPORT x.com DAN twitter.com
const xTwitterRegex = /^https?:\/\/(x\.com|twitter\.com)\/[a-zA-Z0-9_]+\/status\/(\d+)/;

// METHOD 1: Working Nitter instances (UPDATE 2024)
const workingNitter = [
    'https://nitter.privacyredirect.com',
    'https://nitter.domain.glass',
    'https://nitter.fdn.fr',
    'https://nitter.kuuro.net'
];

// METHOD 2: Twitter JSON endpoint (DIRECT)
async function fetchTweetJson(tweetId) {
    try {
        const response = await fetch(`https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}`);
        if (response.ok) {
            const data = await response.json();
            return {
                content: data.text || 'Tweet tidak bisa dibaca',
                author: data.user_results?.result?.legacy?.name || 'Unknown',
                username: data.user_results?.result?.legacy?.screen_name || 'user'
            };
        }
    } catch (e) {
        console.log('JSON method failed:', e);
    }
    return null;
}

// METHOD 3: ViewSource proxy (RELIABLE)
async function fetchTweetViewSource(tweetId) {
    try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://twitter.com/i/status/${tweetId}`)}`);
        if (response.ok) {
            const data = await response.json();
            const html = data.contents;
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract dari Twitter HTML
            const text = doc.querySelector('[data-testid="tweetText"]')?.textContent?.trim() ||
                        Array.from(doc.querySelectorAll('div[lang]')).find(el => el.textContent.length < 500)?.textContent?.trim() ||
                        'Tweet tidak bisa dibaca';
            
            const author = doc.querySelector('[data-testid="User-Name"] span')?.textContent?.trim() || 'Unknown';
            
            return { content: text, author, username: 'user' };
        }
    } catch (e) {
        console.log('ViewSource failed:', e);
    }
    return null;
}

// MAIN: Try all methods sequentially
async function fetchTweet(tweetId) {
    console.log('🔍 Fetching tweet:', tweetId);
    
    // METHOD 1: Twitter JSON (FASTEST)
    let tweetData = await fetchTweetJson(tweetId);
    if (tweetData) {
        console.log('✅ JSON method success');
        return tweetData;
    }
    
    // METHOD 2: ViewSource
    tweetData = await fetchTweetViewSource(tweetId);
    if (tweetData) {
        console.log('✅ ViewSource success');
        return tweetData;
    }
    
    // METHOD 3: Nitter fallback
    for (const instance of workingNitter) {
        try {
            console.log(`Trying Nitter: ${instance}`);
            const response = await fetch(`${instance}/${tweetId}`);
            if (response.ok) {
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                const content = doc.querySelector('div.tweet-content')?.textContent?.trim() ||
                               doc.querySelector('[data-testid="tweetText"]')?.textContent?.trim() ||
                               'Tweet tidak bisa dibaca';
                
                const author = doc.querySelector('span.username-or-displayname')?.textContent?.trim() ||
                              'Unknown User';
                
                console.log('✅ Nitter success');
                return { content, author };
            }
        } catch (error) {
            console.log(`${instance} failed`);
        }
    }
    
    // ULTIMATE FALLBACK: Generic prompt
    console.log('❌ All methods failed - using generic');
    return {
        content: 'tweet menarik ini',
        author: 'user'
    };
}

// Generate reply menggunakan Gemini API
async function generateReply(tweetData) {
    const prompt = `Buat balasan tweet yang cerdas, menarik, dan engaging untuk tweet ini:

TWEET: "${tweetData.content.substring(0, 200)}..."
AUTHOR: ${tweetData.author}

Aturan:
1. Bahasa Indonesia natural & santai
2. Maksimal 280 karakter  
3. Menarik perhatian 🔥
4. Positif & membangun 👍
5. 1-2 emoji relevan 😎
6. Akhiri dengan pertanyaan/perintah

Balasan:`;

    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyB6sZ1jzvyVaDourFZwNXQsILeitQSkHwc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.9,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 200,
                }
            })
        });

        const data = await response.json();
        let reply = data.candidates[0].content.parts[0].text.trim();
        
        // Clean up
        reply = reply.replace(/^Balasan:\s*/i, '').trim();
        return reply || 'Wah menarik banget! 👍 Apa pendapatmu?';
        
    } catch (error) {
        console.error('Gemini Error:', error);
        return `Wah tweet ${tweetData.author} keren! 🔥 Setuju gak nih?`;
    }
}

// Event Listeners (SAMA seperti sebelumnya)
document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('urlInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const status = document.getElementById('status');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const replyContent = document.getElementById('replyContent');
    const copyBtn = document.getElementById('copyBtn');
    const btnText = document.getElementById('btnText');
    const btnIcon = document.getElementById('btnIcon');

    urlInput.addEventListener('input', function() {
        const url = this.value.trim();
        const tweetId = extractTweetId(url);
        
        if (tweetId) {
            status.innerHTML = `✅ Valid! <strong>${tweetId.slice(-10)}</strong>`;
            status.className = 'mt-3 font-medium text-green-400';
            analyzeBtn.disabled = false;
        } else if (url) {
            status.textContent = '❌ Link X/Twitter tidak valid';
            status.className = 'mt-3 font-medium text-red-400';
            analyzeBtn.disabled = true;
        } else {
            status.textContent = '📎 Paste link X/Twitter...';
            status.className = 'mt-3 font-medium text-gray-300';
            analyzeBtn.disabled = true;
        }
    });

    analyzeBtn.addEventListener('click', async function() {
        const url = urlInput.value.trim();
        const tweetId = extractTweetId(url);
        
        loading.classList.remove('hidden');
        result.classList.add('hidden');
        analyzeBtn.disabled = true;
        btnText.textContent = 'Loading...';
        btnIcon.className = 'fas fa-spinner loading-spinner ml-2';

        try {
            const tweetData = await fetchTweet(tweetId);
            const reply = await generateReply(tweetData);
            
            replyContent.textContent = reply;
            result.classList.remove('hidden');
            status.textContent = `✅ Success! (${tweetData.author})`;
            
        } catch (error) {
            status.textContent = `❌ ${error.message}`;
            status.className = 'mt-3 font-medium text-red-400';
        } finally {
            loading.classList.add('hidden');
            analyzeBtn.disabled = false;
            btnText.textContent = 'Generate Reply';
            btnIcon.className = 'fas fa-magic ml-2';
        }
    });

    copyBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(replyContent.textContent).then(() => {
            const original = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
            copyBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
            copyBtn.classList.add('bg-emerald-500');
            setTimeout(() => {
                copyBtn.innerHTML = original;
                copyBtn.classList.add('bg-green-500', 'hover:bg-green-600');
                copyBtn.classList.remove('bg-emerald-500');
            }, 1500);
        });
    });

    // Auto-analyze on paste
    urlInput.addEventListener('paste', function() {
        setTimeout(() => {
            if (extractTweetId(this.value.trim())) {
                analyzeBtn.click();
            }
        }, 200);
    });
});