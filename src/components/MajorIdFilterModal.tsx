import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './MajorIdFilterModal.css';

interface MajorIdFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMajorIds: string[];
  availableMajorIds: string[];
  onMajorIdsChange: (majorIds: string[]) => void;
}

export const MajorIdFilterModal: React.FC<MajorIdFilterModalProps> = ({
  isOpen,
  onClose,
  selectedMajorIds,
  availableMajorIds,
  onMajorIdsChange
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    const win = globalThis as unknown as { addEventListener?: any; removeEventListener?: any };
    if (!win.addEventListener) return;
    win.addEventListener('keydown', handleEscape);
    return () => win.removeEventListener?.('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCheckboxChange = (majorId: string) => {
    const newSelectedMajorIds = selectedMajorIds.includes(majorId)
      ? selectedMajorIds.filter(id => id !== majorId)
      : [...selectedMajorIds, majorId];
    onMajorIdsChange(newSelectedMajorIds);
  };

  const formatMajorIdName = (name: string) => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const content = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Major ID Filters</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="checkbox-group">
            {availableMajorIds.map(majorId => (
              <label key={majorId} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedMajorIds.includes(majorId)}
                  onChange={() => handleCheckboxChange(majorId)}
                />
                {formatMajorIdName(majorId)}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const portalTarget = (globalThis as unknown as { document?: { body?: HTMLElement } }).document?.body ?? null;
  return portalTarget ? createPortal(content, portalTarget) : content;
}; 