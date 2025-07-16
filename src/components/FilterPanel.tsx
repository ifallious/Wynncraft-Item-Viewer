import React, { useState } from 'react';
import type { FilterState, WynncraftItem } from '../types.js';
import { getUniqueValues, getUniqueWeaponTypes, getUniqueArmourTypes, getUniqueAccessoryTypes, getAllIdentificationNames, getDamageElements, getAllMajorIds } from '../utils/filterUtils.js';
import { IdentificationFilterManager } from './IdentificationFilterManager.js';
import { MajorIdFilterModal } from './MajorIdFilterModal.js';
import ColoredIcon from './ColoredIcon.js';
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    itemType: false,
    rarity: false,
    itemTypes: false,
    levelRange: false,
    identifications: false,
    attackSpeed: false,
    powderSlots: false,
    dps: false,
    skillPoints: false,
    specialFilters: false,
    damageElements: false
  });
  const [showMajorIdModal, setShowMajorIdModal] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const types = getUniqueValues(items, 'type');
  const rarities = getUniqueValues(items, 'rarity');
  const weaponTypes = getUniqueWeaponTypes(items);
  const armourTypes = getUniqueArmourTypes(items);
  const accessoryTypes = getUniqueAccessoryTypes(items);
  const attackSpeeds = getUniqueValues(items, 'attackSpeed');

  const formatAttackSpeed = (speed: string) => {
    return speed.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

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

  const handleItemTypeToggle = (category: 'weaponTypes' | 'armourTypes' | 'accessoryTypes', value: string) => {
    setFilters(prev => {
      const currentArray = prev[category];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [category]: newArray };
    });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      type: [],
      rarity: [],
      levelMin: 1,
      levelMax: 110,
      weaponTypes: [],
      armourTypes: [],
      accessoryTypes: [],
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
      selectedMajorIds: [],
      powderSlots: [],
      dpsMin: 0,
      dpsMax: 1300,
      damageElements: [],
      identificationFilters: [],
      attackSpeed: []
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
            <div className="filter-section-header" onClick={() => toggleSection('itemType')}>
              <h3>Item Type</h3>
              <span className="toggle-icon">{expandedSections.itemType ? '▼' : '▶'}</span>
            </div>
            {expandedSections.itemType && (
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
            )}
          </div>

          <div className="filter-section">
            <div className="filter-section-header" onClick={() => toggleSection('rarity')}>
              <h3>Rarity</h3>
              <span className="toggle-icon">{expandedSections.rarity ? '▼' : '▶'}</span>
            </div>
            {expandedSections.rarity && (
              <div className="checkbox-group">
                {rarities.map(rarity => (
                  <label key={rarity} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.rarity.includes(rarity)}
                      onChange={() => handleMultiSelectChange('rarity', rarity)}
                    />
                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="filter-section">
            <div className="filter-section-header" onClick={() => toggleSection('itemTypes')}>
              <h3>Item Types</h3>
              <span className="toggle-icon">{expandedSections.itemTypes ? '▼' : '▶'}</span>
            </div>
            {expandedSections.itemTypes && (
              <div className="item-type-filters">
                {/* Weapons */}
                {weaponTypes.length > 0 && (
                  <div className="item-type-category">
                    <h4>Weapons</h4>
                    <div className="item-type-buttons">
                      {weaponTypes.map(weaponType => (
                        <button
                          key={weaponType}
                          className={`item-type-button ${filters.weaponTypes.includes(weaponType) ? 'active' : ''}`}
                          onClick={() => handleItemTypeToggle('weaponTypes', weaponType)}
                          title={weaponType.charAt(0).toUpperCase() + weaponType.slice(1)}
                        >
                          <ColoredIcon
                            iconName={weaponType}
                            color={filters.weaponTypes.includes(weaponType) ? '#8b5cf6' : '#64748b'}
                            size={24}
                          />
                          <span>{weaponType.charAt(0).toUpperCase() + weaponType.slice(1)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Armor */}
                {armourTypes.length > 0 && (
                  <div className="item-type-category">
                    <h4>Armor</h4>
                    <div className="item-type-buttons">
                      {armourTypes.map(armourType => (
                        <button
                          key={armourType}
                          className={`item-type-button ${filters.armourTypes.includes(armourType) ? 'active' : ''}`}
                          onClick={() => handleItemTypeToggle('armourTypes', armourType)}
                          title={armourType.charAt(0).toUpperCase() + armourType.slice(1)}
                        >
                          <ColoredIcon
                            iconName={armourType}
                            color={filters.armourTypes.includes(armourType) ? '#8b5cf6' : '#64748b'}
                            size={24}
                          />
                          <span>{armourType.charAt(0).toUpperCase() + armourType.slice(1)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accessories */}
                {accessoryTypes.length > 0 && (
                  <div className="item-type-category">
                    <h4>Accessories</h4>
                    <div className="item-type-buttons">
                      {accessoryTypes.map(accessoryType => (
                        <button
                          key={accessoryType}
                          className={`item-type-button ${filters.accessoryTypes.includes(accessoryType) ? 'active' : ''}`}
                          onClick={() => handleItemTypeToggle('accessoryTypes', accessoryType)}
                          title={accessoryType.charAt(0).toUpperCase() + accessoryType.slice(1)}
                        >
                          <ColoredIcon
                            iconName={accessoryType}
                            color={filters.accessoryTypes.includes(accessoryType) ? '#8b5cf6' : '#64748b'}
                            size={24}
                          />
                          <span>{accessoryType.charAt(0).toUpperCase() + accessoryType.slice(1)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="filter-section">
            <div className="filter-section-header" onClick={() => toggleSection('levelRange')}>
              <h3>Level Range</h3>
              <span className="toggle-icon">{expandedSections.levelRange ? '▼' : '▶'}</span>
            </div>
            {expandedSections.levelRange && (
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
            )}
          </div>

          <div className="filter-section">
            <div className="filter-section-header" onClick={() => toggleSection('identifications')}>
              <h3>Identifications</h3>
              <span className="toggle-icon">{expandedSections.identifications ? '▼' : '▶'}</span>
            </div>
            {expandedSections.identifications && (
              <IdentificationFilterManager
                filters={filters.identificationFilters}
                availableIdentifications={getAllIdentificationNames(items)}
                onFiltersChange={(identificationFilters) =>
                  setFilters(prev => ({ ...prev, identificationFilters }))
                }
              />
            )}
          </div>

          <div className="filter-section">
            <div className="filter-section-header" onClick={() => toggleSection('attackSpeed')}>
              <h3>Attack Speed</h3>
              <span className="toggle-icon">{expandedSections.attackSpeed ? '▼' : '▶'}</span>
            </div>
            {expandedSections.attackSpeed && (
              <div className="checkbox-group">
                {attackSpeeds.map(speed => (
                  <label key={speed} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.attackSpeed.includes(speed)}
                      onChange={() => handleMultiSelectChange('attackSpeed', speed)}
                    />
                    {formatAttackSpeed(speed)}
                  </label>
                ))}
              </div>
            )}
          </div>
          
          <div className="filter-section">
            <div className="filter-section-header" onClick={() => toggleSection('powderSlots')}>
              <h3>Powder Slots</h3>
              <span className="toggle-icon">{expandedSections.powderSlots ? '▼' : '▶'}</span>
            </div>
            {expandedSections.powderSlots && (
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
            )}
          </div>

          <div className="filter-section">
            <div className="filter-section-header" onClick={() => toggleSection('dps')}>
              <h3>Average DPS</h3>
              <span className="toggle-icon">{expandedSections.dps ? '▼' : '▶'}</span>
            </div>
            {expandedSections.dps && (
              <div className="range-group">
                <label>
                  Min DPS: {filters.dpsMin}
                  <input
                    type="range"
                    min="0"
                    max="1300"
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
                    max="1300"
                    step="10"
                    value={filters.dpsMax}
                    onChange={(e) => handleRangeChange('dpsMax', parseInt(e.target.value))}
                  />
                </label>
              </div>
            )}
          </div>
          
          <div className="filter-section">
            <div className="filter-section-header" onClick={() => toggleSection('skillPoints')}>
              <h3>Skill Points</h3>
              <span className="toggle-icon">{expandedSections.skillPoints ? '▼' : '▶'}</span>
            </div>
            {expandedSections.skillPoints && (
              <>
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
              </>
            )}
          </div>

          <div className="filter-section">
            <div className="filter-section-header" onClick={() => toggleSection('specialFilters')}>
              <h3>Special Filters</h3>
              <span className="toggle-icon">{expandedSections.specialFilters ? '▼' : '▶'}</span>
            </div>
            {expandedSections.specialFilters && (
              <>
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
                {filters.hasMajorIds && (
                  <button 
                    className="select-major-ids-button"
                    onClick={() => setShowMajorIdModal(true)}
                  >
                    Select Major IDs
                  </button>
                )}
              </>
            )}
          </div>

          <div className="filter-section">
            <div className="filter-section-header" onClick={() => toggleSection('damageElements')}>
              <h3>Damage Elements (Exact Match)</h3>
              <span className="toggle-icon">{expandedSections.damageElements ? '▼' : '▶'}</span>
            </div>
            {expandedSections.damageElements && (
              <>
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
              </>
            )}
          </div>
          <MajorIdFilterModal
            isOpen={showMajorIdModal}
            onClose={() => setShowMajorIdModal(false)}
            selectedMajorIds={filters.selectedMajorIds}
            availableMajorIds={getAllMajorIds(items)}
            onMajorIdsChange={(selectedMajorIds) => setFilters(prev => ({ ...prev, selectedMajorIds }))}
          />
        </div>
      )}
    </div>
  );
};
