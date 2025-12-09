// netlify/functions/get-meldingen.js
exports.handler = async function(event, context) {
    const GITHUB_URL = 'https://raw.githubusercontent.com/GillesVGB/bredathenetherlands-gms/main/data.json';
    
    try {
        const response = await fetch(GITHUB_URL);
        const data = await response.json();
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                users: data.users || [],
                meldingen: data.meldingen || [],
                last_updated: data.last_updated
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};