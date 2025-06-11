import React from 'react';
import type { FilterState, WynncraftItem } from '../types.js';
import { getUniqueValues, getUniqueClassRequirements, getAllIdentificationNames, getDamageElements } from '../utils/filterUtils.js';
import { IdentificationFilterManager } from './IdentificationFilterManager.js';
import './FilterPanel.css';

interface FilterPanelProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  items: (WynncraftItem & { displayName: string })[];
  isOpen: boolean;
  onToggle: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ 
  filters, 
  setFilters, 
  items, 
  isOpen, 
  onToggle 
}) => {
  const types = getUniqueValues(items, 'type');
  const rarities = getUniqueValues(items, 'rarity');
  const classRequirements = getUniqueClassRequirements(items);

  const handleMultiSelectChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [key]: newArray };
    });
  };

  const handleRangeChange = (key: keyof FilterState, value: number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      type: [],
      rarity: [],
      levelMin: 1,
      levelMax: 110,
      classRequirement: [],
      strengthMin: 0,
      strengthMax: 150,
      dexterityMin: 0,
      dexterityMax: 150,
      intelligenceMin: 0,
      intelligenceMax: 150,
      defenceMin: 0,
      defenceMax: 150,
      agilityMin: 0,
      agilityMax: 150,
      hasIdentifications: false,
      hasMajorIds: false,
      powderSlots: [],
      dpsMin: 0,
      dpsMax: 10000,
      damageElements: [],
      identificationFilters: []
    });
  };

  return (
    <div className={`filter-panel ${isOpen ? 'open' : 'closed'}`}>
      <div className="filter-header">
        <h2>Filters</h2>
        <button className="toggle-button" onClick={onToggle}>
          {isOpen ? '←' : '→'}
        </button>
      </div>

      {isOpen && (
        <div className="filter-content">
          <button className="reset-button" onClick={resetFilters}>
            Reset All Filters
          </button>

          <div className="filter-section">
            <h3>Item Type</h3>
            <div className="checkbox-group">
              {types.map(type => (
                <label key={type} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.type.includes(type)}
                    onChange={() => handleMultiSelectChange('type', type)}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Rarity</h3>
            <div className="checkbox-group">
              {rarities.map(rarity => (
                <label key={rarity} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.rarity.includes(rarity)}
                    onChange={() => handleMultiSelectChange('rarity', rarity)}
                  />
                  {rarity}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Level Range</h3>
            <div className="range-group">
              <label>
                Min: {filters.levelMin}
                <input
                  type="range"
                  min="1"
                  max="110"
                  value={filters.levelMin}
                  onChange={(e) => handleRangeChange('levelMin', parseInt(e.target.value))}
                />
              </label>
              <label>
                Max: {filters.levelMax}
                <input
                  type="range"
                  min="1"
                  max="110"
                  value={filters.levelMax}
                  onChange={(e) => handleRangeChange('levelMax', parseInt(e.target.value))}
                />
              </label>
            </div>
          </div>

          <div className="filter-section">
            <h3>Class Requirement</h3>
            <div className="checkbox-group">
              {classRequirements.map(classReq => (
                <label key={classReq} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.classRequirement.includes(classReq)}
                    onChange={() => handleMultiSelectChange('classRequirement', classReq)}
                  />
                  {classReq}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Skill Points</h3>
            
            <div className="skill-range">
              <h4>Strength</h4>
              <div className="range-group">
                <label>
                  Min: {filters.strengthMin}
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={filters.strengthMin}
                    onChange={(e) => handleRangeChange('strengthMin', parseInt(e.target.value))}
                  />
                </label>
                <label>
                  Max: {filters.strengthMax}
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={filters.strengthMax}
                    onChange={(e) => handleRangeChange('strengthMax', parseInt(e.target.value))}
                  />
                </label>
              </div>
            </div>

            <div className="skill-range">
              <h4>Dexterity</h4>
              <div className="range-group">
                <label>
                  Min: {filters.dexterityMin}
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={filters.dexterityMin}
                    onChange={(e) => handleRangeChange('dexterityMin', parseInt(e.target.value))}
                  />
                </label>
                <label>
                  Max: {filters.dexterityMax}
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={filters.dexterityMax}
                    onChange={(e) => handleRangeChange('dexterityMax', parseInt(e.target.value))}
                  />
                </label>
              </div>
            </div>

            <div className="skill-range">
              <h4>Intelligence</h4>
              <div className="range-group">
                <label>
                  Min: {filters.intelligenceMin}
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={filters.intelligenceMin}
                    onChange={(e) => handleRangeChange('intelligenceMin', parseInt(e.target.value))}
                  />
                </label>
                <label>
                  Max: {filters.intelligenceMax}
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={filters.intelligenceMax}
                    onChange={(e) => handleRangeChange('intelligenceMax', parseInt(e.target.value))}
                  />
                </label>
              </div>
            </div>

            <div className="skill-range">
              <h4>Defence</h4>
              <div className="range-group">
                <label>
                  Min: {filters.defenceMin}
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={filters.defenceMin}
                    onChange={(e) => handleRangeChange('defenceMin', parseInt(e.target.value))}
                  />
                </label>
                <label>
                  Max: {filters.defenceMax}
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={filters.defenceMax}
                    onChange={(e) => handleRangeChange('defenceMax', parseInt(e.target.value))}
                  />
                </label>
              </div>
            </div>

            <div className="skill-range">
              <h4>Agility</h4>
              <div className="range-group">
                <label>
                  Min: {filters.agilityMin}
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={filters.agilityMin}
                    onChange={(e) => handleRangeChange('agilityMin', parseInt(e.target.value))}
                  />
                </label>
                <label>
                  Max: {filters.agilityMax}
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={filters.agilityMax}
                    onChange={(e) => handleRangeChange('agilityMax', parseInt(e.target.value))}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="filter-section">
            <h3>Special Filters</h3>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.hasIdentifications}
                onChange={(e) => setFilters(prev => ({ ...prev, hasIdentifications: e.target.checked }))}
              />
              Has Identifications
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.hasMajorIds}
                onChange={(e) => setFilters(prev => ({ ...prev, hasMajorIds: e.target.checked }))}
              />
              Has Major IDs
            </label>
          </div>

          <div className="filter-section">
            <h3>Powder Slots</h3>
            <div className="checkbox-group">
              {[0, 1, 2, 3, 4, 5].map(slots => (
                <label key={slots} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.powderSlots.includes(slots.toString())}
                    onChange={() => handleMultiSelectChange('powderSlots', slots.toString())}
                  />
                  {slots} slots
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>DPS Range</h3>
            <div className="range-group">
              <label>
                Min DPS: {filters.dpsMin}
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="10"
                  value={filters.dpsMin}
                  onChange={(e) => handleRangeChange('dpsMin', parseInt(e.target.value))}
                />
              </label>
              <label>
                Max DPS: {filters.dpsMax}
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="10"
                  value={filters.dpsMax}
                  onChange={(e) => handleRangeChange('dpsMax', parseInt(e.target.value))}
                />
              </label>
            </div>
          </div>

          <div className="filter-section">
            <h3>Damage Elements (Exact Match)</h3>
            <p className="filter-description">
              Shows items with exactly the selected elements only
            </p>
            <div className="checkbox-group">
              {getDamageElements().map(element => (
                <label key={element} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.damageElements.includes(element)}
                    onChange={() => handleMultiSelectChange('damageElements', element)}
                  />
                  {element.charAt(0).toUpperCase() + element.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <IdentificationFilterManager
              filters={filters.identificationFilters}
              availableIdentifications={getAllIdentificationNames(items)}
              onFiltersChange={(identificationFilters) =>
                setFilters(prev => ({ ...prev, identificationFilters }))
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
