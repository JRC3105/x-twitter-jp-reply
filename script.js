// https://github.com/JRC3105/x-reply-gemini/blob/main/script.js
// GANTI FUNGSI callGemini() INI SAJA:

async callGemini(tweetContent) {
    this.showLoading();
    
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tweetUrl: tweetContent })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API Error');
        }
        
        const data = await response.json();
        return data.reply;
    } catch (error) {
        throw new Error('Gagal generate reply: ' + error.message);
    }
}