import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { IdentificationFilter } from '../types.js';
import { formatIdentificationNameForModal } from '../utils/filterUtils.js';
import './IdentificationFilterModal.css';

interface IdentificationFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: IdentificationFilter[];
  availableIdentifications: string[];
  onFiltersChange: (filters: IdentificationFilter[]) => void;
}

// Groups per requirements (final structure)
const GROUPS: { key: string; label: string }[] = [
  { key: 'skillpoints', label: 'Skillpoints' },
  { key: 'earth-damage', label: 'Earth Damage' },
  { key: 'thunder-damage', label: 'Thunder Damage' },
  { key: 'water-damage', label: 'Water Damage' },
  { key: 'fire-damage', label: 'Fire Damage' },
  { key: 'air-damage', label: 'Air Damage' },
  { key: 'elemental-damage', label: 'Elemental Damage (Universal)' },
  { key: 'regular-damage', label: 'Regular Damage' },
  { key: 'movement', label: 'Movement' },
  { key: 'mana', label: 'Mana' },
  { key: 'health', label: 'Health' },
  { key: 'xp-loot', label: 'XP + Loot' },
  { key: 'misc', label: 'Miscellaneous' },
];

const isOneOf = (key: string, parts: string[]) => parts.some(p => key.includes(p));

function categorizeIdentification(idKey: string): string {
  const k = idKey.toLowerCase();

  // 1) Elemental Defenses - check before skillpoints to avoid misclassification
  if (isOneOf(k, ['earthdefence', 'thunderdefence', 'waterdefence', 'firedefence', 'airdefence', 'neutraldefence'])) {
    return 'misc'; // Put elemental defenses in miscellaneous
  }

  // 2) Skillpoints - exclude elemental defenses
  if (isOneOf(k, ['strength', 'dexterity', 'intelligence', 'agility']) ||
      (k.includes('defence') && !isOneOf(k, ['earthdefence', 'thunderdefence', 'waterdefence', 'firedefence', 'airdefence', 'neutraldefence']))) {
    return 'skillpoints';
  }

  // 3) Elemental Damages split per element - improved pattern matching
  // Earth damage
  if (k.includes('earth') && (k.includes('damage') || k.includes('mainattack') || k.includes('spell'))) {
    return 'earth-damage';
  }
  // Thunder damage
  if (k.includes('thunder') && (k.includes('damage') || k.includes('mainattack') || k.includes('spell'))) {
    return 'thunder-damage';
  }
  // Water damage
  if (k.includes('water') && (k.includes('damage') || k.includes('mainattack') || k.includes('spell'))) {
    return 'water-damage';
  }
  // Fire damage
  if (k.includes('fire') && (k.includes('damage') || k.includes('mainattack') || k.includes('spell'))) {
    return 'fire-damage';
  }
  // Air damage
  if (k.includes('air') && (k.includes('damage') || k.includes('mainattack') || k.includes('spell'))) {
    return 'air-damage';
  }

  // 4) Elemental Damage universal boost (best-effort key guesses)
  if (isOneOf(k, ['elementaldamage', 'elemental_damage', 'elemental'])) return 'elemental-damage';

  // 5) Regular Damage - exclude elemental damage that was already categorized
  if (
    isOneOf(k, ['neutraldamage', 'melee', 'damagedealt', 'basemelee']) ||
    (k.includes('mainattack') && !isOneOf(k, ['earth', 'thunder', 'water', 'fire', 'air'])) ||
    (k.includes('spelldamage') && !isOneOf(k, ['earth', 'thunder', 'water', 'fire', 'air'])) ||
    (k.includes('damage') && !isOneOf(k, ['earth', 'thunder', 'water', 'fire', 'air', 'elemental']))
  ) return 'regular-damage';

  // 6) Movement
  if (isOneOf(k, ['walkspeed', 'sprint', 'jumpheight'])) return 'movement';

  // 7) Mana
  if (isOneOf(k, ['manaregen', 'manasteal', 'spellcost', 'maxmana'])) return 'mana';

  // 8) Health
  if (isOneOf(k, ['healthregen', 'healingefficiency', 'healthbonus', 'lifesteal']) || k === 'health') return 'health';

  // 9) XP + Loot
  if (isOneOf(k, ['xpbonus', 'lootbonus', 'stealing', 'lootquality'])) return 'xp-loot';

  // 10) Misc
  return 'misc';
}

export const IdentificationFilterModal: React.FC<IdentificationFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  availableIdentifications,
  onFiltersChange,
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    GROUPS.forEach(g => { initial[g.key] = false; });
    return initial;
  });

  const grouped = useMemo(() => {
    const m: Record<string, string[]> = {
      'skillpoints': [],
      'earth-damage': [],
      'thunder-damage': [],
      'water-damage': [],
      'fire-damage': [],
      'air-damage': [],
      'elemental-damage': [],
      'regular-damage': [],
      'movement': [],
      'mana': [],
      'health': [],
      'xp-loot': [],
      'misc': [],
    };
    availableIdentifications.forEach(id => {
      const key = categorizeIdentification(id);
      if (!m[key]) m['misc'].push(id); else m[key].push(id);
    });
    // Sort within groups by formatted name for UX
    Object.values(m).forEach(list => list.sort((a,b) => formatIdentificationNameForModal(a).localeCompare(formatIdentificationNameForModal(b))));
    return m;
  }, [availableIdentifications]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const doc = (globalThis as unknown as { document?: Document }).document;
    if (!doc) return;
    doc.addEventListener('keydown', handleEscape);
    return () => doc.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSelected = (name: string) => filters.some(f => f.name === name);

  const toggleSelect = (name: string) => {
    if (isSelected(name)) {
      onFiltersChange(filters.filter(f => f.name !== name));
    } else {
      const newFilter: IdentificationFilter = {
        id: `${name}-${Date.now()}`,
        name,
        operator: 'greater',
        value: 0,
      };
      onFiltersChange([...filters, newFilter]);
    }
  };

  const updateFilter = (id: string, patch: Partial<IdentificationFilter>) => {
    onFiltersChange(filters.map(f => f.id === id ? { ...f, ...patch } : f));
  };

  const removeFilter = (id: string) => onFiltersChange(filters.filter(f => f.id !== id));

  const content = (
    <div className="id-modal-overlay" onClick={onClose}>
      <div className="id-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="title">Identification Filters</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {/* Selected summary with inline editing */}
          <div className="selected-ids">
            {filters.length === 0 && (
              <div className="empty-state">No identifications selected. Choose from the groups below.</div>
            )}
            {filters.map(filter => (
              <div key={filter.id} className="selected-id-row">
                <div className="selected-id-name">{formatIdentificationNameForModal(filter.name)}</div>
                <select
                  className="id-operator"
                  value={filter.operator}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilter(filter.id, { operator: e.target.value as IdentificationFilter['operator'] })}
                >
                  <option value="greater">&gt;</option>
                  <option value="less">&lt;</option>
                  <option value="equal">=</option>
                  <option value="range">range</option>
                </select>
                <input
                  type="number"
                  className="id-value"
                  value={Number.isFinite(filter.value) ? filter.value : 0}
                  onChange={(e) => updateFilter(filter.id, { value: parseFloat((e.target as HTMLInputElement).value || '0') })}
                />
                {filter.operator === 'range' && (
                  <input
                    type="number"
                    className="id-value"
                    placeholder="Max"
                    value={Number.isFinite(filter.maxValue ?? 0) ? (filter.maxValue ?? 0) : 0}
                    onChange={(e) => updateFilter(filter.id, { maxValue: parseFloat((e.target as HTMLInputElement).value || '0') })}
                  />
                )}
                <button className="remove-chip" title="Remove" onClick={() => removeFilter(filter.id)}>×</button>
              </div>
            ))}
          </div>

          {/* Groups */}
          <div className="id-groups">
            {GROUPS.map(group => {
              const list = grouped[group.key] || [];
              if (list.length === 0) return null;
              const isExp = expanded[group.key];
              return (
                <div key={group.key} className="id-group">
                  <button className="group-header" onClick={() => setExpanded(prev => ({ ...prev, [group.key]: !prev[group.key] }))}>
                    <span className="group-title">{group.label}</span>
                    <span className="group-toggle">{isExp ? '−' : '+'}</span>
                  </button>
                  {isExp && (
                    <div className="id-grid">
                      {list.map(name => (
                        <button
                          key={name}
                          className={`id-button ${isSelected(name) ? 'active' : ''}`}
                          onClick={() => toggleSelect(name)}
                          title={formatIdentificationNameForModal(name)}
                        >
                          {formatIdentificationNameForModal(name)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="modal-footer">
          <button className="done-button" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );

  // Guard against non-DOM environments
  const portalTarget = (globalThis as unknown as { document?: { body?: HTMLElement } }).document?.body ?? null;
  return portalTarget ? createPortal(content, portalTarget) : content;
};

