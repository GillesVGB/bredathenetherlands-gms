// /netlify/functions/sync-users.js
const fs = require('fs').promises;
const path = require('path');

exports.handler = async function(event, context) {
  const dataPath = path.join(__dirname, '..', '..', 'data.json');
  
  try {
    // Zorg dat data.json bestaat
    try {
      await fs.access(dataPath);
    } catch {
      await fs.writeFile(dataPath, JSON.stringify({ users: [], meldingen: [] }, null, 2));
    }
    
    const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
    
    // GET: Haal alle gebruikers op
    if (event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: data.users || [] })
      };
    }
    
    // POST: Voeg/update gebruiker
    if (event.httpMethod === 'POST') {
      const userData = JSON.parse(event.body);
      
      if (!userData.id) {
        userData.id = Date.now();
      }
      
      if (!data.users) data.users = [];
      
      // Zoek of gebruiker al bestaat
      const existingIndex = data.users.findIndex(u => u.email === userData.email);
      
      if (existingIndex >= 0) {
        // Update bestaande
        data.users[existingIndex] = { ...data.users[existingIndex], ...userData };
      } else {
        // Voeg nieuwe toe
        data.users.push(userData);
      }
      
      await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
      
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, user: userData })
      };
    }
    
    return { statusCode: 405, body: 'Method Not Allowed' };
    
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};