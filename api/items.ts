import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
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
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching from Wynncraft API:', error);
    return res.status(500).json({ error: 'Failed to fetch items' });
  }
} 