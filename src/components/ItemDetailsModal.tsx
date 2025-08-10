import React, { useEffect, useState, useRef, type JSX } from 'react';
import { createPortal } from 'react-dom';
import type { WynncraftItem } from '../types.js';
import { getRarityColor } from '../utils/filterUtils.js';
import './ItemDetailsModal.css';

interface ItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: (WynncraftItem & { displayName: string }) | null;
  sidebarOpen?: boolean;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  isOpen,
  onClose,
  item,
  sidebarOpen: _sidebarOpen = true
}) => {
  const [isPositioned, setIsPositioned] = useState(false);
  const [expandedCoordinates, setExpandedCoordinates] = useState<Record<string, boolean>>({});
  const modalRef = useRef<HTMLDivElement>(null);

  // Toggle coordinate expansion for a specific mob/source
  const toggleCoordinateExpansion = (sourceKey: string) => {
    setExpandedCoordinates(prev => ({
      ...prev,
      [sourceKey]: !prev[sourceKey]
    }));
  };

  // No custom positioning needed; overlay handles centering
  useEffect(() => {
    if (isOpen) {
      setIsPositioned(true);
    } else {
      setIsPositioned(false);
    }
  }, [isOpen]);

  // Handle escape key to close modal and prevent main-content scroll
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const doc = (globalThis as unknown as { document?: Document }).document;
    if (isOpen && doc) {
      doc.addEventListener('keydown', handleEscape);
      const mainContent = doc.querySelector('.main-content') as HTMLElement | null;
      if (mainContent) mainContent.style.overflow = 'hidden';
      return () => {
        doc.removeEventListener('keydown', handleEscape);
        const mainContent2 = doc.querySelector('.main-content') as HTMLElement | null;
        if (mainContent2) mainContent2.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const rarityColor = getRarityColor(item.rarity);

  const formatSingleCoordinate = (coord: number[]): string => {
    if (coord.length >= 4) {
      return `X: ${coord[0]}, Y: ${coord[1]}, Z: ${coord[2]} (Radius: ${coord[3]})`;
    } else {
      return `X: ${coord[0]}, Y: ${coord[1]}, Z: ${coord[2]}`;
    }
  };

  const renderCoordinates = (coords: number[] | number[][] | null, sourceKey: string): JSX.Element => {
    if (!coords) {
      return (
        <div className="coordinates">
          <span className="coord-label">Location:</span>
          <span className="coord-values">Unknown location</span>
        </div>
      );
    }

    if (Array.isArray(coords[0])) {
      // Multiple coordinate arrays
      const coordArrays = coords as number[][];
      const isExpanded = expandedCoordinates[sourceKey];
      const hasMultipleCoords = coordArrays.length > 1;

      return (
        <div className="coordinates">
          <div className="coord-header">
            <span className="coord-label">Location:</span>
            {hasMultipleCoords && (
              <button
                className="coord-toggle-button"
                onClick={() => toggleCoordinateExpansion(sourceKey)}
                aria-label={isExpanded ? 'Show less coordinates' : 'Show more coordinates'}
              >
                <span className="coord-toggle-icon">
                  {isExpanded ? '▼' : '▶'}
                </span>
                <span className="coord-toggle-text">
                  {isExpanded ? 'Show less' : `Show all (${coordArrays.length})`}
                </span>
              </button>
            )}
          </div>
          <div className="coord-values-container">
            {hasMultipleCoords && !isExpanded ? (
              <span className="coord-values">{formatSingleCoordinate(coordArrays[0])}</span>
            ) : (
              coordArrays.map((coord, index) => (
                <span key={index} className="coord-values">
                  {formatSingleCoordinate(coord)}
                </span>
              ))
            )}
          </div>
        </div>
      );
    } else {
      // Single coordinate array
      const coord = coords as number[];
      return (
        <div className="coordinates">
          <span className="coord-label">Location:</span>
          <span className="coord-values">{formatSingleCoordinate(coord)}</span>
        </div>
      );
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
                  {renderCoordinates(mob.coords, `mob-${index}-${mob.name}`)}
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
                {renderCoordinates(item.dropMeta.coordinates, `dropMeta-${item.dropMeta.name}`)}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const content = (
    <div className="item-details-modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className={`item-details-modal ${isPositioned ? 'positioned' : 'positioning'}`}
        onClick={e => e.stopPropagation()}
        style={{position: 'relative'}}
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

  const portalTarget = (globalThis as unknown as { document?: { body?: HTMLElement } }).document?.body ?? null;
  return portalTarget ? createPortal(content, portalTarget) : content;
};
