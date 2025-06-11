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
        
        const response = await fetch('/api/items');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json() as Record<string, WynncraftItem>;
        setItems(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch items';
        setError(errorMessage);
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
