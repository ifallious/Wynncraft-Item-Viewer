import React, { useState } from 'react';
import type { IdentificationFilter } from '../types.js';
import './IdentificationFilterManager.css';

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFilter, setNewFilter] = useState<Partial<IdentificationFilter>>({
    name: '',
    operator: 'greater',
    value: 0
  });

  const addFilter = () => {
    if (newFilter.name && newFilter.operator !== undefined && newFilter.value !== undefined) {
      const filter: IdentificationFilter = {
        id: Date.now().toString(),
        name: newFilter.name,
        operator: newFilter.operator,
        value: newFilter.value,
        maxValue: newFilter.maxValue
      };
      
      onFiltersChange([...filters, filter]);
      setNewFilter({ name: '', operator: 'greater', value: 0 });
      setShowAddForm(false);
    }
  };

  const removeFilter = (id: string) => {
    onFiltersChange(filters.filter(f => f.id !== id));
  };

  const getOperatorSymbol = (operator: string) => {
    switch (operator) {
      case 'greater': return '>';
      case 'less': return '<';
      case 'equal': return '=';
      case 'range': return '↔';
      default: return operator;
    }
  };

  const formatFilterDisplay = (filter: IdentificationFilter) => {
    const symbol = getOperatorSymbol(filter.operator);
    if (filter.operator === 'range' && filter.maxValue !== undefined) {
      return `${filter.name} ${filter.value} ${symbol} ${filter.maxValue}`;
    }
    return `${filter.name} ${symbol} ${filter.value}`;
  };

  return (
    <div className="identification-filter-manager">
      <h4>Identification Filters</h4>
      
      {/* Active Filters */}
      <div className="active-filters">
        {filters.map(filter => (
          <div key={filter.id} className="filter-tag">
            <span className="filter-text">{formatFilterDisplay(filter)}</span>
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

      {/* Add Filter Button */}
      {!showAddForm && (
        <button 
          className="add-filter-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add Identification Filter
        </button>
      )}

      {/* Add Filter Form */}
      {showAddForm && (
        <div className="add-filter-form">
          <div className="form-row">
            <select
              value={newFilter.name || ''}
              onChange={(e) => setNewFilter({ ...newFilter, name: e.target.value })}
              className="identification-select"
            >
              <option value="">Select Identification</option>
              {availableIdentifications.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <select
              value={newFilter.operator || 'greater'}
              onChange={(e) => setNewFilter({ ...newFilter, operator: e.target.value as any })}
              className="operator-select"
            >
              <option value="greater">Greater than (&gt;)</option>
              <option value="less">Less than (&lt;)</option>
              <option value="equal">Equal to (=)</option>
              <option value="range">Range (↔)</option>
            </select>
          </div>

          <div className="form-row">
            <input
              type="number"
              placeholder="Value"
              value={newFilter.value || ''}
              onChange={(e) => setNewFilter({ ...newFilter, value: parseFloat(e.target.value) || 0 })}
              className="value-input"
            />
            
            {newFilter.operator === 'range' && (
              <input
                type="number"
                placeholder="Max Value"
                value={newFilter.maxValue || ''}
                onChange={(e) => setNewFilter({ ...newFilter, maxValue: parseFloat(e.target.value) || 0 })}
                className="value-input"
              />
            )}
          </div>

          <div className="form-actions">
            <button 
              onClick={addFilter}
              className="confirm-btn"
              disabled={!newFilter.name || newFilter.value === undefined}
            >
              Add Filter
            </button>
            <button 
              onClick={() => {
                setShowAddForm(false);
                setNewFilter({ name: '', operator: 'greater', value: 0 });
              }}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
