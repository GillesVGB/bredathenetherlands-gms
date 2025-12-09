const fs = require('fs').promises;
const path = require('path');

exports.handler = async function(event, context) {
  try {
    const dataPath = path.join(__dirname, '..', '..', 'data.json');
    const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        users: data.users || [],
        meldingen: data.meldingen || []
      })
    };
  } catch (error) {
    return {
      statusCode: 200,
      body: JSON.stringify({ users: [], meldingen: [] })
    };
  }
};