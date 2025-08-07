import type { WynncraftItem } from '../types.js';

// Minimal representative mock dataset used when the live API is unavailable
// Keys are display names, values are item objects without displayName (added in hook)
export const mockItems: Record<string, WynncraftItem> = {
  "Emerald Staff": {
    displayName: "Emerald Staff",
    internalName: "emerald_staff",
    type: "weapon",
    weaponType: "wand",
    attackSpeed: "very_fast",
    averageDps: 320,
    requirements: {
      level: 20,
      classRequirement: "Mage"
    },
    base: {
      baseDamage: { min: 35, raw: 0, max: 55 },
      baseWaterDamage: { min: 10, raw: 0, max: 20 }
    },
    rarity: "rare",
    powderSlots: 2,
    identifications: {
      spellDamage: { min: 8, max: 16 },
      manaRegen: 2
    },
    lore: "A staff imbued with the essence of the ocean."
  },
  "Thunder Pike": {
    displayName: "Thunder Pike",
    internalName: "thunder_pike",
    type: "weapon",
    weaponType: "spear",
    attackSpeed: "normal",
    averageDps: 500,
    requirements: {
      level: 35,
      classRequirement: "Warrior",
      strength: 10
    },
    base: {
      baseDamage: { min: 45, raw: 0, max: 70 },
      baseThunderDamage: { min: 20, raw: 0, max: 40 }
    },
    rarity: "legendary",
    powderSlots: 3,
    identifications: {
      walkSpeed: 10,
      rawSpellDamage: 25
    },
    majorIds: {
      ArcherKnight: "Increases melee range and adds chain lightning."
    },
    lore: "Forged during a storm, it crackles with latent power."
  },
  "Aegis Chestplate": {
    displayName: "Aegis Chestplate",
    internalName: "aegis_chestplate",
    type: "armour",
    armourType: "chestplate",
    requirements: {
      level: 28,
      defence: 10
    },
    base: {
      baseHealth: 350,
      baseFireDefence: 25,
      baseEarthDefence: 10
    },
    rarity: "unique",
    identifications: {
      healthRegen: { min: 15, max: 30 },
      raw1stSpellCost: -2
    },
    powderSlots: 1,
    lore: "A sturdy piece favored by knights of old."
  },
  "Moonstone Ring": {
    displayName: "Moonstone Ring",
    internalName: "moonstone_ring",
    type: "accessory",
    accessoryType: "ring",
    requirements: {
      level: 15
    },
    rarity: "set",
    identifications: {
      xpBonus: 7,
      manaRegen: 1
    },
    lore: "Its glow intensifies under the night sky."
  }
};


