import React, { useEffect } from 'react';
import type { WynncraftItem } from '../types.js';
import { getRarityColor } from '../utils/filterUtils.js';
import './ItemDetailsModal.css';

interface ItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: (WynncraftItem & { displayName: string }) | null;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  isOpen,
  onClose,
  item
}) => {
  if (!isOpen || !item) return null;

  const rarityColor = getRarityColor(item.rarity);

  // Handle escape key to close modal and prevent body scroll
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content item-details-modal" onClick={e => e.stopPropagation()}>
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
