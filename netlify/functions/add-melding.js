// netlify/functions/add-melding.js
exports.handler = async function(event, context) {
    // Alleen POST requests toestaan
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }
    
    try {
        const melding = JSON.parse(event.body);
        
        // Valideer de melding
        if (!melding.type || !melding.dienst || !melding.bericht) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Ongeldige melding data' })
            };
        }
        
        // Voeg timestamp toe
        melding.timestamp = new Date().toISOString();
        melding.id = Date.now();
        melding.status = 'pending';
        
        // Hier zou je normaal naar een database schrijven
        // Voor nu returnen we gewoon de melding
        return {
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                success: true, 
                message: 'Melding toegevoegd',
                melding: melding 
            })
        };
        
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};