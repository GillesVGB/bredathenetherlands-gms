// netlify/functions/sync-data.js
exports.handler = async function(event, context) {
    try {
        const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/GillesVGB/bredathenetherlands-gms/main/data.json';
        
        const response = await fetch(GITHUB_RAW_URL + '?t=' + Date.now());
        const data = await response.json();
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};