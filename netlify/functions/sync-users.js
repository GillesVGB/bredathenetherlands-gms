const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// TEMP: Simpele in-memory store voor gebruikers
let sharedUsers = [];

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // GET: Geef ALLE gedeelde gebruikers terug
    if (event.httpMethod === 'GET') {
      // Haal spelers uit Supabase
      const { data: players, error } = await supabase
        .from('players')
        .select('*')
        .order('last_seen', { ascending: false });

      if (error) throw error;

      // Combineer Supabase players met sharedUsers
      const allUsers = [
        ...players.map(p => ({
          id: p.id,
          email: p.username + '@gms.nl',  // Maak email van username
          password: 'wachtwoord123',      // DEFAULT wachtwoord!
          name: p.username,
          roepnummer: `RN-${p.id}`,
          dienst: 'politie',
          role: 'gebruiker',
          status: 'uit',
          source: 'supabase'
        })),
        ...sharedUsers
      ];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          users: allUsers 
        })
      };
    }

    // POST: Voeg nieuwe gebruiker toe (voor sharing)
    if (event.httpMethod === 'POST') {
      const newUser = JSON.parse(event.body || '{}');
      
      // Voeg toe aan Supabase
      const { data, error } = await supabase
        .from('players')
        .insert([{ 
          username: newUser.email.split('@')[0] || newUser.email,
          last_seen: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      // Ook toevoegen aan shared array
      sharedUsers.push({
        ...newUser,
        id: Date.now(),
        source: 'shared'
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          user: data[0],
          message: 'User gedeeld met alle spelers'
        })
      };
    }

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        users: sharedUsers, // Fallback
        error: error.message 
      })
    };
  }
};