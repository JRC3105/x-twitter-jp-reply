// 📋 REPLACE SELURUH callGemini function:
async callGemini(tweetContent) {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tweetUrl: tweetContent })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API Error');
        }
        
        const data = await response.json();
        return data.reply;
    } catch (error) {
        throw new Error('Gagal: ' + error.message);
    }
}
