// Wynncraft Item Types
interface WynncraftItem {
  internalName: string;
  type: string;
  weaponType?: string;
  armourType?: string;
  accessoryType?: string;
  attackSpeed?: string;
  averageDps?: number;
  dropRestriction?: string;
  requirements: {
    level: number;
    classRequirement?: string;
    strength?: number;
    dexterity?: number;
    intelligence?: number;
    defence?: number;
    agility?: number;
  };
  majorIds?: Record<string, string>;
  powderSlots?: number;
  lore?: string;
  dropMeta?: {
    name: string;
    type: string;
    coordinates: number[];
  };
  icon?: {
    format: string;
    value: any;
  };
  identifications?: Record<string, any>;
  base?: {
    baseDamage?: { min: number; raw: number; max: number };
    baseHealth?: number;
    baseThunderDamage?: { min: number; raw: number; max: number };
    baseWaterDamage?: { min: number; raw: number; max: number };
    baseFireDamage?: { min: number; raw: number; max: number };
    baseEarthDamage?: { min: number; raw: number; max: number };
    baseAirDamage?: { min: number; raw: number; max: number };
    baseThunderDefence?: number;
    baseWaterDefence?: number;
    baseFireDefence?: number;
    baseEarthDefence?: number;
    baseAirDefence?: number;
  };
  rarity?: string;
  restrictions?: string;
  identified?: boolean;
  tier?: number;
}

interface IdentificationFilter {
  id: string;
  name: string;
  operator: 'greater' | 'less' | 'equal' | 'range';
  value: number;
  maxValue?: number; // For range operator
}

interface FilterState {
  search: string;
  type: string[];
  rarity: string[];
  levelMin: number;
  levelMax: number;
  classRequirement: string[];
  strengthMin: number;
  strengthMax: number;
  dexterityMin: number;
  dexterityMax: number;
  intelligenceMin: number;
  intelligenceMax: number;
  defenceMin: number;
  defenceMax: number;
  agilityMin: number;
  agilityMax: number;
  hasIdentifications: boolean;
  hasMajorIds: boolean;
  powderSlots: string[];
  dpsMin: number;
  dpsMax: number;
  damageElements: string[];
  identificationFilters: IdentificationFilter[];
}

// Explicit exports for verbatimModuleSyntax
export type { WynncraftItem, FilterState, IdentificationFilter };
