import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Fetching from Wynncraft API...');
    const response = await fetch('https://api.wynncraft.com/v3/item/database?fullResult', {
      headers: {
        'User-Agent': 'Wynncraft-Item-Viewer/1.0'
      }
    });

    console.log('Wynncraft API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Wynncraft API error response:', errorText);
      throw new Error(`Wynncraft API responded with status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully fetched and parsed data');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Detailed error in API route:', error);
    // Send more detailed error information
    return res.status(500).json({ 
      error: 'Failed to fetch items',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
} 