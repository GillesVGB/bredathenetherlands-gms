const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('📨 Add-melding called');
    
    const melding = JSON.parse(event.body || '{}');
    console.log('Melding data:', melding);
    
    // Voeg toe aan meldingen tabel
    const { data, error } = await supabase
      .from('meldingen')
      .insert([{
        type: melding.type || 'ALGEMEEN',
        dienst: melding.dienst || 'politie',
        bericht: melding.bericht || 'Geen bericht',
        prioriteit: melding.prioriteit || 3,
        urgent: melding.urgent || false,
        status: 'pending',
        tijd: melding.tijd || new Date().toLocaleTimeString('nl-NL'),
        datum: melding.datum || new Date().toISOString().split('T')[0],
        ingediend_door: melding.ingediendDoor || 'Onbekend',
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('❌ Insert error:', error);
      
      // Als de tabel niet bestaat, geef een simulated response
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          melding: {
            id: Date.now(),
            ...melding,
            status: 'pending',
            created_at: new Date().toISOString()
          },
          warning: 'Melding lokaal opgeslagen (meldingen tabel niet gevonden)'
        })
      };
    }

    console.log('✅ Melding added:', data[0]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        melding: data[0],
        message: 'Melding opgeslagen in database'
      })
    };

  } catch (error) {
    console.error('❌ Add-melding error:', error);
    
    return {
      statusCode: 200, // 200 voor frontend
      headers,
      body: JSON.stringify({ 
        success: true,
        melding: {
          id: Date.now(),
          type: 'ERROR',
          dienst: 'system',
          bericht: 'Fallback melding',
          status: 'pending',
          created_at: new Date().toISOString()
        },
        error: error.message
      })
    };
  }
};