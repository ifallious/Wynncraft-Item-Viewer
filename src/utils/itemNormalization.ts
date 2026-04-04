import type { WynncraftItem } from '../types.js';

type RawRequirements = Partial<WynncraftItem['requirements']> & {
  class_requirement?: string;
};

type RawWynncraftItem = Partial<Omit<WynncraftItem, 'displayName' | 'requirements' | 'rarity' | 'tier' | 'restrictions'>> & {
  requirements?: RawRequirements;
  subType?: string;
  rarity?: string;
  tier?: string | number;
  restriction?: string;
  restrictions?: string;
  averageDPS?: number;
};

const ATTACK_SPEED_SEPARATOR = /([a-z])([A-Z])/g;
const HTML_LINE_BREAK = /<br\s*\/?>/gi;
const HTML_TAG = /<[^>]+>/g;
const HTML_ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

const normalizeString = (value: string | undefined): string | undefined => {
  return value ? value.trim() : undefined;
};

const normalizeAttackSpeed = (value: string | undefined): string | undefined => {
  if (!value) return undefined;

  return value
    .replace(ATTACK_SPEED_SEPARATOR, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
};

const normalizeClassRequirement = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

const stripHtml = (value: string | undefined): string | undefined => {
  if (!value) return undefined;

  let normalized = value.replace(HTML_LINE_BREAK, '\n').replace(HTML_TAG, '');
  for (const [entity, replacement] of Object.entries(HTML_ENTITY_MAP)) {
    normalized = normalized.split(entity).join(replacement);
  }

  return normalized.trim();
};

const normalizeSubtype = (
  itemType: string,
  rawItem: RawWynncraftItem
): Pick<WynncraftItem, 'weaponType' | 'armourType' | 'accessoryType'> => {
  const rawSubtype = normalizeString(rawItem.subType);

  if (itemType === 'weapon') {
    return {
      weaponType: normalizeString(rawItem.weaponType ?? rawSubtype),
      armourType: undefined,
      accessoryType: undefined,
    };
  }

  if (itemType === 'armour') {
    return {
      weaponType: undefined,
      armourType: normalizeString(rawItem.armourType ?? rawSubtype),
      accessoryType: undefined,
    };
  }

  if (itemType === 'accessory') {
    return {
      weaponType: undefined,
      armourType: undefined,
      accessoryType: normalizeString(rawItem.accessoryType ?? rawSubtype),
    };
  }

  return {
    weaponType: normalizeString(rawItem.weaponType),
    armourType: normalizeString(rawItem.armourType),
    accessoryType: normalizeString(rawItem.accessoryType),
  };
};

const normalizeRarity = (rawItem: RawWynncraftItem): string | undefined => {
  const raritySource = typeof rawItem.tier === 'string' ? rawItem.tier : rawItem.rarity;
  return normalizeString(raritySource)?.toLowerCase();
};

const normalizeRequirements = (requirements: RawRequirements | undefined): WynncraftItem['requirements'] => ({
  level: requirements?.level ?? 0,
  classRequirement: normalizeClassRequirement(requirements?.classRequirement ?? requirements?.class_requirement),
  strength: requirements?.strength,
  dexterity: requirements?.dexterity,
  intelligence: requirements?.intelligence,
  defence: requirements?.defence,
  agility: requirements?.agility,
  skills: requirements?.skills,
});

export const normalizeWynncraftItem = (
  displayName: string,
  rawItem: RawWynncraftItem
): WynncraftItem & { displayName: string } => {
  const itemType = normalizeString(rawItem.type)?.toLowerCase() ?? 'unknown';
  const subtypeFields = normalizeSubtype(itemType, rawItem);

  return {
    displayName,
    internalName: rawItem.internalName ?? displayName,
    type: itemType,
    weaponType: subtypeFields.weaponType,
    armourType: subtypeFields.armourType,
    accessoryType: subtypeFields.accessoryType,
    attackSpeed: normalizeAttackSpeed(rawItem.attackSpeed),
    averageDps: rawItem.averageDps ?? rawItem.averageDPS,
    dropRestriction: normalizeString(rawItem.dropRestriction),
    requirements: normalizeRequirements(rawItem.requirements),
    majorIds: rawItem.majorIds,
    powderSlots: rawItem.powderSlots,
    lore: stripHtml(rawItem.lore),
    droppedBy: rawItem.droppedBy,
    dropMeta: rawItem.dropMeta,
    icon: rawItem.icon,
    identifications: rawItem.identifications,
    base: rawItem.base,
    rarity: normalizeRarity(rawItem),
    restrictions: normalizeString(rawItem.restrictions ?? rawItem.restriction),
    identified: rawItem.identified,
    tier: typeof rawItem.tier === 'number' ? rawItem.tier : undefined,
    consumableOnlyIDs: rawItem.consumableOnlyIDs,
    ingredientPositionModifiers: rawItem.ingredientPositionModifiers,
    itemOnlyIDs: rawItem.itemOnlyIDs,
  };
};

export const normalizeWynncraftItems = (
  items: Record<string, RawWynncraftItem>
): Record<string, WynncraftItem> => {
  return Object.fromEntries(
    Object.entries(items).map(([displayName, rawItem]) => [
      displayName,
      normalizeWynncraftItem(displayName, rawItem),
    ])
  );
};
