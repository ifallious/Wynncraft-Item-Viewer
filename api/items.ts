import { normalizeWynncraftItemsToArray } from '../src/utils/itemNormalization.js';

export const config = {
  runtime: 'edge'
};

const WYNNCRAFT_ITEMS_URL = 'https://api.wynncraft.com/v3/item/database?fullResult';
const MEMORY_CACHE_TTL_MS = 60 * 60 * 1000;
const CDN_CACHE_CONTROL = 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400';

type CachedItems = {
  fetchedAt: number;
  items: ReturnType<typeof normalizeWynncraftItemsToArray>;
};

let cachedItems: CachedItems | null = null;

const createHeaders = (cacheControl: string): HeadersInit => ({
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': cacheControl,
  'Content-Type': 'application/json',
});

const jsonResponse = (body: unknown, status: number, cacheControl = 'no-store'): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: createHeaders(cacheControl),
  });

const isCacheFresh = (cache: CachedItems | null): cache is CachedItems => {
  if (!cache) {
    return false;
  }

  return Date.now() - cache.fetchedAt < MEMORY_CACHE_TTL_MS;
};

const fetchItemsFromWynncraft = async (): Promise<ReturnType<typeof normalizeWynncraftItemsToArray>> => {
  const apiKey = process.env.ITEMS_API_KEY;
  const requestHeaders: Record<string, string> = {
    'User-Agent': 'Wynncraft-Item-Viewer/1.0'
  };

  if (apiKey) {
    requestHeaders['x-api-key'] = apiKey;
  }

  const response = await fetch(WYNNCRAFT_ITEMS_URL, {
    headers: requestHeaders
  });

  if (!response.ok) {
    throw new Error(`Wynncraft API responded with status: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data) && (typeof data !== 'object' || data === null)) {
    throw new Error('Unexpected Wynncraft API payload for items endpoint');
  }

  const normalizedItems = normalizeWynncraftItemsToArray(data);
  cachedItems = {
    fetchedAt: Date.now(),
    items: normalizedItems,
  };

  return normalizedItems;
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: createHeaders('no-store'),
    });
  }

  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    if (isCacheFresh(cachedItems)) {
      return jsonResponse(cachedItems.items, 200, CDN_CACHE_CONTROL);
    }

    const items = await fetchItemsFromWynncraft();
    return jsonResponse(items, 200, CDN_CACHE_CONTROL);
  } catch (error) {
    console.error('Error fetching from Wynncraft API:', error);

    if (cachedItems) {
      return jsonResponse(cachedItems.items, 200, CDN_CACHE_CONTROL);
    }

    return jsonResponse({ error: 'Failed to fetch items' }, 500);
  }
}
