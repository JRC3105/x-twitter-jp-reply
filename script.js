// HANYA ganti fungsi callGemini:
async callGemini(tweetContent) {
    this.showLoading();
    
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tweetUrl: tweetContent })
        });

        if (!response.ok) throw new Error('API Error');
        
        const data = await response.json();
        return data.reply;
    } catch (error) {
        throw new Error('Gagal generate reply. Cek koneksi.');
    }
}