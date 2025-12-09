// netlify/functions/sync-meldingen.js
exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }
    
    try {
        const { meldingen, lastSync } = JSON.parse(event.body);
        
        // Hier zou je normaal synchronisatie logica implementeren
        // met je database of externe API
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                success: true,
                message: 'Meldingen gesynchroniseerd',
                synced: meldingen.length,
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};