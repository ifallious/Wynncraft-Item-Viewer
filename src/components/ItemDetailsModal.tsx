import React, { useEffect, useState, useRef } from 'react';
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
  const [modalPosition, setModalPosition] = useState({ top: 0});
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

  // Calculate modal position based on actual content and viewport
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const calculatePosition = () => {
        const viewportHeight = window.innerHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Get actual modal dimensions
        const modalElement = modalRef.current;
        if (!modalElement) return;

        // Force a layout to get accurate measurements
        void modalElement.offsetHeight;

        const modalRect = modalElement.getBoundingClientRect();
        const modalHeight = modalRect.height;

        // Center within the main content area (relative to the viewport)
        // The main content starts at sidebarOffset and has width mainContentWidth
        const centerY = viewportHeight / 2;

        // Position modal in center of main content area, accounting for scroll
        const top = scrollTop + centerY - (modalHeight / 2);
       
        setModalPosition({top});
        setIsPositioned(true);
      };

      // Reset positioning state when modal opens
      setIsPositioned(false);

      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        calculatePosition();
      });

      // Recalculate position if window is resized or scrolled
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);

      return () => {
        window.removeEventListener('resize', calculatePosition);
        window.removeEventListener('scroll', calculatePosition);
      };
    }
  }, [isOpen, sidebarOpen, item]); // Add item to dependencies to recalculate when content changes

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className={`modal-content item-details-modal ${isPositioned ? 'positioned' : 'positioning'}`}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: modalPosition.top,
          left: "25%",
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
