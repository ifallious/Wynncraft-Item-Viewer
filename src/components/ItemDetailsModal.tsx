import React, { useEffect, useState } from 'react';
import type { WynncraftItem } from '../types.js';
import { getRarityColor } from '../utils/filterUtils.js';
import './ItemDetailsModal.css';

interface ItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: (WynncraftItem & { displayName: string }) | null;
  sidebarOpen?: boolean; // Add sidebar state to calculate proper centering
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  isOpen,
  onClose,
  item,
  sidebarOpen = true
}) => {
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);

  // Calculate modal position based on viewport and scroll position
  useEffect(() => {
    if (isOpen) {
      const calculatePosition = () => {
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        // Modal dimensions (approximate)
        const isMobile = viewportWidth <= 768;
        const modalWidth = isMobile ? viewportWidth * 0.98 : Math.min(700, viewportWidth * 0.95);
        const modalHeight = Math.min(viewportHeight * (isMobile ? 0.9 : 0.85), 600);

        // Calculate sidebar offset for proper centering within main content
        let sidebarOffset = 0;
        if (!isMobile) {
          // On desktop, account for sidebar width
          sidebarOffset = sidebarOpen ? 320 : 50;
        }

        // Calculate the main content area dimensions
        const mainContentWidth = viewportWidth - sidebarOffset;

        // Center within the main content area (relative to the viewport)
        // The main content starts at sidebarOffset and has width mainContentWidth
        const centerX = (mainContentWidth / 2) - sidebarOffset;
        const centerY = viewportHeight / 2;

        // Position modal in center of main content area, accounting for scroll
        let left = scrollLeft + centerX - (modalWidth / 2);
        let top = scrollTop + centerY - (modalHeight / 2);

        // Ensure modal doesn't go off-screen within the main content area
        const padding = isMobile ? 10 : 20;
        const minLeft = scrollLeft + padding - sidebarOffset;
        const maxLeft = scrollLeft + viewportWidth - modalWidth - padding;
        const minTop = scrollTop + padding;
        const maxTop = scrollTop + viewportHeight - modalHeight - padding;

        left = Math.max(minLeft, Math.min(left, maxLeft));
        top = Math.max(minTop, Math.min(top, maxTop));

        setModalPosition({ top, left });
        setIsPositioned(true);
      };

      // Reset positioning state when modal opens
      setIsPositioned(false);

      // Small delay to ensure smooth animation
      const timer = setTimeout(calculatePosition, 10);

      // Recalculate position if window is resized while modal is open
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', calculatePosition);
        window.removeEventListener('scroll', calculatePosition);
      };
    }
  }, [isOpen, sidebarOpen]);

  // Handle escape key to close modal and prevent main-content scroll
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      const mainContent = document.querySelector('.main-content') as HTMLElement;
      if (mainContent) {
        mainContent.style.overflow = 'hidden';
      }
      return () => {
        document.removeEventListener('keydown', handleEscape);
        const mainContent = document.querySelector('.main-content') as HTMLElement;
        if (mainContent) {
          mainContent.style.overflow = 'unset';
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const rarityColor = getRarityColor(item.rarity);

  const formatCoordinates = (coords: number[] | number[][] | null): string => {
    if (!coords) {
      return 'Unknown location';
    }

    if (Array.isArray(coords[0])) {
      // Multiple coordinate arrays
      return (coords as number[][])
        .map(coord => {
          if (coord.length >= 4) {
            return `X: ${coord[0]}, Y: ${coord[1]}, Z: ${coord[2]} (Radius: ${coord[3]})`;
          } else {
            return `X: ${coord[0]}, Y: ${coord[1]}, Z: ${coord[2]}`;
          }
        })
        .join(' • ');
    } else {
      // Single coordinate array
      const coord = coords as number[];
      if (coord.length >= 4) {
        return `X: ${coord[0]}, Y: ${coord[1]}, Z: ${coord[2]} (Radius: ${coord[3]})`;
      } else {
        return `X: ${coord[0]}, Y: ${coord[1]}, Z: ${coord[2]}`;
      }
    }
  };

  const renderDropInformation = () => {
    const hasDroppedBy = item.droppedBy && item.droppedBy.length > 0;
    const hasDropMeta = item.dropMeta;

    if (!hasDroppedBy && !hasDropMeta) {
      return (
        <div className="no-drop-info">
          <p>No drop location information available for this item.</p>
          <p>Most likely obtainable from chests.</p>
        </div>
      );
    }

    return (
      <div className="drop-info-container">
        {hasDroppedBy && (
          <div className="dropped-by-section">
            <h3 className="section-title">Dropped By Mobs</h3>
            <div className="drop-sources">
              {item.droppedBy!.map((mob, index) => (
                <div key={index} className="drop-source">
                  <div className="source-header">
                    <span className="source-name">{mob.name}</span>
                    <span className="source-type mob">Mob</span>
                  </div>
                  <div className="coordinates">
                    <span className="coord-label">Location:</span>
                    <span className="coord-values">{formatCoordinates(mob.coords)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasDropMeta && item.dropMeta && (
          <div className="drop-meta-section">
            <h3 className="section-title">Drop Source</h3>
            <div className="drop-sources">
              <div className="drop-source">
                <div className="source-header">
                  <span className="source-name">{item.dropMeta.name}</span>
                  <span className={`source-type ${item.dropMeta.type.toLowerCase()}`}>{item.dropMeta.type}</span>
                </div>
                <div className="coordinates">
                  <span className="coord-label">Location:</span>
                  <span className="coord-values">{formatCoordinates(item.dropMeta.coordinates)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="modal-overlay item-details-modal-overlay" onClick={onClose}>
      <div
        className={`modal-content item-details-modal ${isPositioned ? 'positioned' : 'positioning'}`}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: modalPosition.top,
          left: modalPosition.left,
          transform: 'none' // Override any CSS transform
        }}
      >
        <div className="modal-header">
          <div className="item-title">
            <h2 style={{ color: rarityColor }}>{item.displayName}</h2>
            <span className="item-type-badge">{item.type}</span>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="item-summary">
            <div className="summary-row">
              <span className="label">Level:</span>
              <span className="value">{item.requirements.level}</span>
            </div>
            {item.rarity && (
              <div className="summary-row">
                <span className="label">Rarity:</span>
                <span className="value" style={{ color: rarityColor }}>
                  {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                </span>
              </div>
            )}
            {item.averageDps && (
              <div className="summary-row">
                <span className="label">Average DPS:</span>
                <span className="value">{item.averageDps}</span>
              </div>
            )}
          </div>

          <div className="drop-information">
            <h2 className="main-section-title">Drop Locations</h2>
            {renderDropInformation()}
          </div>
        </div>
      </div>
    </div>
  );
};
