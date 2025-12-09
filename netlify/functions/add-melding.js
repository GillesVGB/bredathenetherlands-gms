const fs = require('fs').promises;
const path = require('path');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  try {
    const dataPath = path.join(__dirname, '..', '..', 'data.json');
    const meldingData = JSON.parse(event.body);
    
    const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
    
    // Voeg ID en timestamp toe
    meldingData.id = Date.now();
    meldingData.timestamp = new Date().toISOString();
    
    if (!data.meldingen) data.meldingen = [];
    data.meldingen.unshift(meldingData);
    
    // Beperk tot laatste 50 meldingen
    if (data.meldingen.length > 50) {
      data.meldingen = data.meldingen.slice(0, 50);
    }
    
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, melding: meldingData })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};