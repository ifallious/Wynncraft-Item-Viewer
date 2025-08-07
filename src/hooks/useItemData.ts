import { useState, useEffect } from 'react';
import type { WynncraftItem } from '../types.js';
import { mockItems } from '../api/mockData.js';

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
        console.error('Error fetching items:', err);
        // Fallback to mock data so the app remains usable offline or when API fails
        try {
          if (mockItems && Object.keys(mockItems).length > 0) {
            setItems(mockItems as Record<string, WynncraftItem>);
            setError(`Using mock data: ${errorMessage}`);
          } else {
            setError(errorMessage);
          }
        } catch (mockErr) {
          setError(errorMessage);
        }
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
