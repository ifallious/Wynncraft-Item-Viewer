import { useState, useEffect } from 'react';
import type { WynncraftItem } from '../types.js';

interface UseItemDataReturn {
  items: Record<string, WynncraftItem>;
  itemsArray: WynncraftItem[];
  loading: boolean;
  error: string | null;
}

export const useItemData = (): UseItemDataReturn => {
  const [items, setItems] = useState<Record<string, WynncraftItem>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/v3/item/database?fullResult');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch items');
        console.error('Error fetching items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const itemsArray = Object.entries(items).map(([name, item]) => ({
    ...item,
    displayName: name
  }));

  return {
    items,
    itemsArray,
    loading,
    error
  };
};
