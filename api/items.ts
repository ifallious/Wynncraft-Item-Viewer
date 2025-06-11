export const config = {
  runtime: 'edge'
};

export default async function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    const response = await fetch('https://api.wynncraft.com/v3/item/database?fullResult', {
      headers: {
        'User-Agent': 'Wynncraft-Item-Viewer/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Wynncraft API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching from Wynncraft API:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch items' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 