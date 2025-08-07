import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import type { WynncraftItem } from '../types.js';
import { ItemCard } from './ItemCard.js';
import { ItemDetailsModal } from './ItemDetailsModal.js';
import './ItemGrid.css';

interface ItemGridProps {
  items: (WynncraftItem & { displayName: string })[];
  sidebarOpen?: boolean;
}

type SortOption = 'name' | 'level' | 'rarity' | 'type' | 'dps';
type SortDirection = 'asc' | 'desc';

export const ItemGrid: React.FC<ItemGridProps> = ({ items, sidebarOpen = true }) => {
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [visibleItems, setVisibleItems] = useState<number>(24);
  const [selectedItem, setSelectedItem] = useState<(WynncraftItem & { displayName: string }) | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const sortedItems = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.displayName.toLowerCase();
          bValue = b.displayName.toLowerCase();
          break;
        case 'level':
          aValue = a.requirements.level;
          bValue = b.requirements.level;
          break;
        case 'rarity':
          const rarityOrder = { 'common': 1, 'set': 2, 'unique': 3, 'rare': 4, 'legendary': 5, 'fabled': 6, 'mythic': 7 };
          aValue = rarityOrder[a.rarity as keyof typeof rarityOrder] || 0;
          bValue = rarityOrder[b.rarity as keyof typeof rarityOrder] || 0;
          break;
        case 'type':
          aValue = a.type.toLowerCase();
          bValue = b.type.toLowerCase();
          break;
        case 'dps':
          aValue = a.averageDps || 0;
          bValue = b.averageDps || 0;
          break;
        default:
          aValue = a.displayName.toLowerCase();
          bValue = b.displayName.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [items, sortBy, sortDirection]);

  const displayedItems = useMemo(() => {
    return sortedItems.slice(0, visibleItems);
  }, [sortedItems, visibleItems]);

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('asc');
    }
    setVisibleItems(24); // Reset visible items when sorting changes
  };

  const loadMore = useCallback(() => {
    setVisibleItems(prev => prev + 24);
  }, []);

  const handleItemClick = (item: WynncraftItem & { displayName: string }) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleItems < sortedItems.length) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loadMore, visibleItems, sortedItems.length]);

  if (items.length === 0) {
    return (
      <div className="no-items">
        <h2>No items found</h2>
        <p>Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="item-grid-container">
      <div className="grid-controls">
        <div className="sort-controls">
          <span>Sort by:</span>
          {(['name', 'level', 'rarity', 'type', 'dps'] as SortOption[]).map(option => (
            <button
              key={option}
              onClick={() => handleSortChange(option)}
              className={`sort-button ${sortBy === option ? 'active' : ''}`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
              {sortBy === option && (
                <span className="sort-direction">
                  {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="item-grid">
        {displayedItems.map((item, index) => (
          <ItemCard
            key={`${item.internalName}-${index}`}
            item={item}
            onClick={handleItemClick}
          />
        ))}
      </div>

      <div ref={loadMoreRef} className="load-more-trigger" style={{ height: '20px', margin: '20px 0' }}>
        {visibleItems < sortedItems.length && (
          <div className="loading-more">Loading more items...</div>
        )}
      </div>

      <ItemDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        item={selectedItem}
        sidebarOpen={sidebarOpen}
      />
    </div>
  );
};
