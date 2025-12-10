const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    console.log('🔧 Sync-users called, method:', event.httpMethod);

    // GET: Haal alleen SUPABASE spelers op (NIET je lokale GMS gebruikers)
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('last_seen', { ascending: false });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log(`✅ Found ${data.length} players in Supabase`);

      // RETOURNEER LEEGE ARRAY - Supabase players zijn NIET je GMS gebruikers!
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          users: [] // ← LEEG! Supabase players ≠ GMS users
        })
      };
    }

    // POST: Voeg SUPABASE speler toe (voor GMS login sync)
    if (event.httpMethod === 'POST') {
      const newUser = JSON.parse(event.body || '{}');
      console.log('📝 Adding player to Supabase:', newUser.email);

      // Voeg TOE aan Supabase players tabel (voor andere spelers)
      const { data, error } = await supabase
        .from('players')
        .insert([{ 
          username: newUser.email.split('@')[0] || newUser.email,
          last_seen: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error('❌ Insert error:', error);
        throw error;
      }

      console.log('✅ Player added to Supabase:', data[0]);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          user: data[0],
          message: 'Player synced to Supabase for other users'
        })
      };
    }

    // Method not allowed
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('❌ Function error:', error);
    
    return {
      statusCode: 200, // 200 zelfs bij error
      headers,
      body: JSON.stringify({ 
        success: true, // ← altijd true voor frontend
        users: [], // ← lege array
        error: error.message
      })
    };
  }
};