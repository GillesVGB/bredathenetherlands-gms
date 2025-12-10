const { createClient } = require('@supabase/supabase-js');

// Debug: check of environment variables bestaan
console.log('Supabase URL exists:', !!process.env.SUPABASE_URL);
console.log('Supabase Key exists:', !!process.env.SUPABASE_KEY);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Valideer credentials
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ MISSING Supabase credentials!');
  console.error('URL:', supabaseUrl);
  console.error('Key length:', supabaseKey?.length || 0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    // GET: Haal alle gebruikers op
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

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          users: data.map(player => ({
            id: player.id,
            email: player.username + '@gms.nl',  // Maak email van username
            name: player.username,
            roepnummer: `RN-${player.id}`,
            dienst: 'politie',
            role: 'gebruiker',
            status: 'uit',
            last_seen: player.last_seen
          }))
        })
      };
    }

    // POST: Voeg nieuwe gebruiker toe
    if (event.httpMethod === 'POST') {
      const newUser = JSON.parse(event.body || '{}');
      console.log('📝 Adding new user:', newUser.email);

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

      console.log('✅ User added to Supabase:', data[0]);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          user: data[0],
          message: 'User synced to Supabase database'
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
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        error: error.message,
        details: 'Server sync failed',
        timestamp: new Date().toISOString()
      })
    };
  }
};