const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('📊 Get-meldingen called');

    // 1. Haal spelers op
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*');

    if (playersError) {
      console.error('Players error:', playersError);
      throw playersError;
    }

    // 2. Haal meldingen op (als de tabel bestaat)
    let meldingen = [];
    try {
      const { data: meldingenData, error: meldingenError } = await supabase
        .from('meldingen')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!meldingenError) {
        meldingen = meldingenData || [];
      }
    } catch (tableError) {
      console.log('⚠️ Meldingen table not found, using empty array');
    }

    // 3. Geef response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        users: players.map(p => ({
          id: p.id,
          email: p.username + '@gms.nl',
          name: p.username,
          status: 'uit'
        })),
        meldingen: meldingen.map(m => ({
          id: m.id,
          type: m.type,
          dienst: m.dienst,
          bericht: m.bericht,
          prioriteit: m.prioriteit,
          urgent: m.urgent,
          status: m.status,
          tijd: m.tijd,
          datum: m.datum,
          ingediendDoor: m.ingediend_door,
          created_at: m.created_at
        }))
      })
    };

  } catch (error) {
    console.error('❌ Get-meldingen error:', error);
    
    // Fallback response als er iets misgaat
    return {
      statusCode: 200, // 200 zelfs bij error voor frontend
      headers,
      body: JSON.stringify({ 
        success: true,
        users: [],
        meldingen: [],
        warning: error.message
      })
    };
  }
};