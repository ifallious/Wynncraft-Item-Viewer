import type { WynncraftItem, FilterState, IdentificationFilter } from '../types.js';

export const filterItems = (items: (WynncraftItem & { displayName: string })[], filters: FilterState): (WynncraftItem & { displayName: string })[] => {
  return items.filter(item => {
    // Search filter
    if (filters.search && !item.displayName.toLowerCase().includes(filters.search.toLowerCase()) && 
        !item.lore?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Type filter
    if (filters.type.length > 0 && !filters.type.includes(item.type)) {
      return false;
    }

    // Rarity filter
    if (filters.rarity.length > 0 && !filters.rarity.includes(item.rarity || 'unknown')) {
      return false;
    }

    // Attack speed filter
    if (filters.attackSpeed.length > 0 && (!item.attackSpeed || !filters.attackSpeed.includes(item.attackSpeed))) {
      return false;
    }

    // Level filter
    if (item.requirements.level < filters.levelMin || item.requirements.level > filters.levelMax) {
      return false;
    }

    // Class requirement filter
    if (filters.classRequirement.length > 0 && item.requirements.classRequirement && 
        !filters.classRequirement.includes(item.requirements.classRequirement)) {
      return false;
    }

    // Skill point filters
    const checkSkillRequirement = (itemReq: number | undefined, min: number, max: number) => {
      if (itemReq === undefined) return min === 0;
      return itemReq >= min && itemReq <= max;
    };

    if (!checkSkillRequirement(item.requirements.strength, filters.strengthMin, filters.strengthMax) ||
        !checkSkillRequirement(item.requirements.dexterity, filters.dexterityMin, filters.dexterityMax) ||
        !checkSkillRequirement(item.requirements.intelligence, filters.intelligenceMin, filters.intelligenceMax) ||
        !checkSkillRequirement(item.requirements.defence, filters.defenceMin, filters.defenceMax) ||
        !checkSkillRequirement(item.requirements.agility, filters.agilityMin, filters.agilityMax)) {
      return false;
    }

    // Identifications filter
    if (filters.hasIdentifications && (!item.identifications || Object.keys(item.identifications).length === 0)) {
      return false;
    }

    // Major IDs filter
    if (filters.hasMajorIds && (!item.majorIds || Object.keys(item.majorIds).length === 0)) {
      return false;
    }

    // Powder slots filter
    if (filters.powderSlots.length > 0 && !filters.powderSlots.includes((item.powderSlots || 0).toString())) {
      return false;
    }

    // DPS filter
    if (item.averageDps !== undefined) {
      if (item.averageDps < filters.dpsMin || item.averageDps > filters.dpsMax) {
        return false;
      }
    } else if (filters.dpsMin > 0 || filters.dpsMax < 10000) {
      // If item has no DPS but we're filtering for DPS, exclude it
      return false;
    }

    // Damage elements filter - exact match
    if (filters.damageElements.length > 0) {
      const itemElements = getItemDamageElements(item);

      // Check if the item has exactly the selected elements (no more, no less)
      const hasExactElements = filters.damageElements.length === itemElements.length &&
        filters.damageElements.every(element => itemElements.includes(element)) &&
        itemElements.every(element => filters.damageElements.includes(element));

      if (!hasExactElements) {
        return false;
      }
    }

    // Identification filters
    if (filters.identificationFilters.length > 0) {
      for (const filter of filters.identificationFilters) {
        if (!checkIdentificationFilter(item, filter)) {
          return false;
        }
      }
    }

    return true;
  });
};

export const getUniqueValues = (items: (WynncraftItem & { displayName: string })[], key: keyof WynncraftItem): string[] => {
  const values = new Set<string>();
  items.forEach(item => {
    const value = item[key];
    if (value && typeof value === 'string') {
      values.add(value);
    } else if (key === 'rarity' && !value) {
      values.add('unknown'); // Add 'unknown' for items without rarity
    }
  });
  return Array.from(values).sort();
};

export const getUniqueClassRequirements = (items: (WynncraftItem & { displayName: string })[]): string[] => {
  const values = new Set<string>();
  items.forEach(item => {
    if (item.requirements.classRequirement) {
      values.add(item.requirements.classRequirement);
    }
  });
  return Array.from(values).sort();
};

export const getRarityColor = (rarity: string | undefined): string => {
  if (!rarity) return '#ffffff'; // Default color for undefined rarity

  const colors: Record<string, string> = {
    'common': '#ffffff',
    'unique': '#ffff55',
    'rare': '#ff55ff',
    'legendary': '#55ffff',
    'fabled': '#ff5555',
    'mythic': '#aa00aa',
    'set': '#55ff55'
  };
  return colors[rarity.toLowerCase()] || '#ffffff';
};

export const formatDamage = (damage: { min: number; raw: number; max: number } | undefined): string => {
  if (!damage) return 'N/A';
  return `${damage.min}-${damage.max}`;
};

export const formatIdentificationName = (key: string): string => {
  // Handle special cases
  const specialCases: Record<string, string> = {
    'raw2ndSpellCost': '2nd Spell Cost',
    'raw4thSpellCost': '4th Spell Cost',
    'walkSpeed': 'Walk Speed',
    'xpBonus': 'XP Bonus',
    'earthDefence': 'Earth Defence',
    'waterDefence': 'Water Defence',
    'fireDefence': 'Fire Defence',
    'thunderDefence': 'Thunder Defence',
    'airDefence': 'Air Defence',
    'neutralDefence': 'Neutral Defence',
    'earthDamage': 'Earth Damage',
    'waterDamage': 'Water Damage',
    'fireDamage': 'Fire Damage',
    'thunderDamage': 'Thunder Damage',
    'airDamage': 'Air Damage',
    'neutralDamage': 'Neutral Damage',
    'healthRegen': 'Health Regen',
    'manaRegen': 'Mana Regen',
    'spellDamage': 'Spell Damage',
    'spellCost': 'Spell Cost',
    'rawSpellCost': 'Spell Cost',
    'rawSpellDamage': 'Spell Damage',
    'rawHealthRegen': 'Health Regen',
    'rawManaRegen': 'Mana Regen',
    'rawHealth': 'Health',
    'rawMana': 'Mana',
    'rawDefence': 'Defence',
    'rawStrength': 'Strength',
    'rawDexterity': 'Dexterity',
    'rawIntelligence': 'Intelligence',
    'rawAgility': 'Agility',
    'rawWalkSpeed': 'Walk Speed',
    'rawXpBonus': 'XP Bonus',
  };

  if (specialCases[key]) {
    return specialCases[key];
  }

  // For other cases, split by camelCase and capitalize
  return key
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .replace(/raw/i, '') // Remove "raw" prefix
    .trim();
};

export const formatIdentification = (key: string, value: number | { min: number; max: number } | { raw?: number; percent?: number } | null): string => {
  // Special cases that should not have %
  const noPercentCases = [
    'poison',
    'raw',
    'mana',
    'defence',
    'strength',
    'dexterity',
    'intelligence',
    'agility',
  ];

  // Check if the key contains any of the no-percent cases
  const shouldNotAddPercent = noPercentCases.some(case_ => key.toLowerCase().includes(case_));

  if (typeof value === 'object' && value !== null && 'min' in value && 'max' in value) {
    return `${value.min} to ${value.max}${shouldNotAddPercent ? '' : '%'}`;
  }
  if (typeof value === 'number') {
    return `${value}${shouldNotAddPercent ? '' : '%'}`;
  }
  return String(value);
};

export const getItemDamageElements = (item: WynncraftItem): string[] => {
  const elements: string[] = [];

  if (item.base) {
    if (item.base.baseDamage) elements.push('neutral');
    if (item.base.baseEarthDamage) elements.push('earth');
    if (item.base.baseThunderDamage) elements.push('thunder');
    if (item.base.baseWaterDamage) elements.push('water');
    if (item.base.baseFireDamage) elements.push('fire');
    if (item.base.baseAirDamage) elements.push('air');
  }

  return elements;
};

export const checkIdentificationFilter = (item: WynncraftItem, filter: IdentificationFilter): boolean => {
  if (!item.identifications) return false;

  const identification = item.identifications[filter.name];
  if (identification === undefined) return false;

  let value: number;

  // Handle different identification value formats
  if (typeof identification === 'number') {
    value = identification;
  } else if (typeof identification === 'object' && identification !== null) {
    if ('raw' in identification) {
      value = identification.raw;
    } else if ('min' in identification && 'max' in identification) {
      // For range values, use the average
      value = (identification.min + identification.max) / 2;
    } else {
      return false;
    }
  } else {
    return false;
  }

  // Apply the filter based on operator
  switch (filter.operator) {
    case 'greater':
      return value > filter.value;
    case 'less':
      return value < filter.value;
    case 'equal':
      return Math.abs(value - filter.value) < 0.01; // Allow for small floating point differences
    case 'range':
      return value >= filter.value && value <= (filter.maxValue || filter.value);
    default:
      return false;
  }
};

export const getAllIdentificationNames = (items: (WynncraftItem & { displayName: string })[]): string[] => {
  const identifications = new Set<string>();

  items.forEach(item => {
    if (item.identifications) {
      Object.keys(item.identifications).forEach(key => {
        identifications.add(key);
      });
    }
  });

  return Array.from(identifications).sort();
};

export const getDamageElements = (): string[] => {
  return ['neutral', 'earth', 'thunder', 'water', 'fire', 'air'];
};
