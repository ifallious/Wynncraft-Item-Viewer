import React, { useState } from 'react';
import type { IdentificationFilter } from '../types.js';
import './IdentificationFilterManager.css';
import { IdentificationFilterModal } from './IdentificationFilterModal.js';

interface IdentificationFilterManagerProps {
  filters: IdentificationFilter[];
  availableIdentifications: string[];
  onFiltersChange: (filters: IdentificationFilter[]) => void;
}

export const IdentificationFilterManager: React.FC<IdentificationFilterManagerProps> = ({
  filters,
  availableIdentifications,
  onFiltersChange
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const removeFilter = (id: string) => {
    onFiltersChange(filters.filter(f => f.id !== id));
  };

  return (
    <div className="identification-filter-manager">
      <h4>Identification Filters</h4>

      {/* Active Filters */}
      <div className="active-filters">
        {filters.map(filter => (
          <div key={filter.id} className="filter-tag">
            <span className="filter-text">{`${filter.name} ${filter.operator === 'range' ? `${filter.value} ↔ ${filter.maxValue ?? ''}` : filter.operator === 'greater' ? '>' : filter.operator === 'less' ? '<' : '='} ${filter.operator === 'range' ? '' : filter.value}`}</span>
            <button
              className="remove-filter-btn"
              onClick={() => removeFilter(filter.id)}
              title="Remove filter"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Open Modal Button */}
      <button
        className="add-filter-btn"
        onClick={() => setIsModalOpen(true)}
      >
        Manage Identification Filters
      </button>

      {/* Modal */}
      <IdentificationFilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filters={filters}
        availableIdentifications={availableIdentifications}
        onFiltersChange={onFiltersChange}
      />
    </div>
  );
};
