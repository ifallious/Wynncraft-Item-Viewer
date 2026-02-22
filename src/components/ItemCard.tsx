import React from 'react';
import type { WynncraftItem } from '../types.js';
import { getRarityColor, formatDamage, formatIdentification, formatIdentificationName, getItemTypeInfo, isSpellCostAttribute, getIngredientTierColor, getIngredientTierStars } from '../utils/filterUtils.js';
import './ItemCard.css';
import ColoredIcon from './ColoredIcon';
interface ItemCardProps {
  item: WynncraftItem & { displayName: string };
  onClick?: (item: WynncraftItem & { displayName: string }) => void;
}

interface IdentificationValue {
  raw?: number;
  percent?: number;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  const isIngredient = item.type === 'ingredient';
  const rarityColor = isIngredient ? getIngredientTierColor(item.tier) : getRarityColor(item.rarity);

  const formatAttackSpeed = (speed: string) => {
    return speed.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Color maps for stats and requirements
  const colorMap: Record<string, string> = {
    health: '#ff5555',
    air: '#ffffff',
    earth: '#00ff00',
    thunder: '#ffff55',
    water: '#55ffff',
    fire: '#FF5555',
    neutral: '#FFAA00',
    positive: '#55ff55',
    negative: '#ff5555',
    requirement: '#ff5555',
    met: '#55ff55',
    percent: '#ffff55',
    xp: '#ffff55',
    powder: '#55ffff',
    major: '#ffb84d',
    fabled: '#ff5555',
    mythic: '#aa00aa',
    legendary: '#55ffff',
    rare: '#ff55ff',
    unique: '#ffff55',
    set: '#55ff55',
    default: '#aaaaaa',
  };

  // Helper for stat color - inverted for spell costs (negative is good, positive is bad)
  const statColor = (value: number, key?: string) => {
    if (key && isSpellCostAttribute(key)) {
      // For spell costs: negative values are beneficial (green), positive values are detrimental (red)
      return value <= 0 ? colorMap.positive : colorMap.negative;
    }
    // For all other stats: positive is good (green), negative is bad (red)
    return value >= 0 ? colorMap.positive : colorMap.negative;
  };

  const handleClick = () => {
    if (onClick) {
      onClick(item);
    }
  };

  // ========================
  // INGREDIENT RENDERING
  // ========================
  if (isIngredient) {
    const tierColor = getIngredientTierColor(item.tier);
    const tierStars = getIngredientTierStars(item.tier);

    // Render ingredient identifications with min-max ranges
    const renderIngredientIdentifications = () => {
      if (!item.identifications) return null;
      type IdValue = number | { min: number; raw: number; max: number };
      const entries = Object.entries(item.identifications) as [string, IdValue][];
      if (entries.length === 0) return null;

      return (
        <div style={{ marginTop: 6, marginBottom: 6 }}>
          {entries.map(([key, value]) => {
            let displayText: string;
            let numericValue: number;

            if (typeof value === 'object' && value !== null && 'min' in value && 'max' in value) {
              const min = value.min;
              const max = value.max;
              numericValue = value.raw ?? min;
              if (min === max) {
                displayText = `${min >= 0 ? '+' : ''}${min}`;
              } else {
                displayText = `${min >= 0 ? '+' : ''}${min} to ${max >= 0 ? '+' : ''}${max}`;
              }
            } else if (typeof value === 'number') {
              numericValue = value;
              displayText = `${value >= 0 ? '+' : ''}${value}`;
            } else {
              return null;
            }

            // Determine if it needs % or special suffix
            const lowerKey = key.toLowerCase();
            const noPercentCases = ['poison', 'raw', 'mana', 'defence', 'strength', 'dexterity', 'intelligence', 'agility', 'healthbonus', 'jumpheight'];
            const isRaw = lowerKey.startsWith('raw');
            const shouldNotAddPercent = isRaw || noPercentCases.some(c => lowerKey.includes(c));
            const suffix = shouldNotAddPercent ? '' : '%';
            const timeSuffix =
              (lowerKey.includes('lifesteal')) ? '/3s' :
                lowerKey.includes('manasteal') ? '/3s' :
                  lowerKey.includes('manaregen') ? '/5s' : '';

            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                <span style={{ color: statColor(numericValue, key) }}>
                  {displayText}{suffix}{timeSuffix}
                </span>
                <span style={{ color: '#aaaaaa' }}>{formatIdentificationName(key)}</span>
              </div>
            );
          })}
        </div>
      );
    };

    // Render durability
    const renderDurability = () => {
      if (!item.itemOnlyIDs || item.itemOnlyIDs.durabilityModifier === 0) return null;
      const durability = item.itemOnlyIDs.durabilityModifier / 1000;
      return (
        <div style={{ color: durability >= 0 ? colorMap.positive : colorMap.negative, marginTop: 4 }}>
          {durability >= 0 ? '+' : ''}{durability} Durability
        </div>
      );
    };

    // Render skill point requirements from itemOnlyIDs
    const renderItemSkillRequirements = () => {
      if (!item.itemOnlyIDs) return null;
      const reqs: React.ReactElement[] = [];
      const reqMap: [string, number][] = [
        ['Strength', item.itemOnlyIDs.strengthRequirement],
        ['Dexterity', item.itemOnlyIDs.dexterityRequirement],
        ['Intelligence', item.itemOnlyIDs.intelligenceRequirement],
        ['Defence', item.itemOnlyIDs.defenceRequirement],
        ['Agility', item.itemOnlyIDs.agilityRequirement],
      ];

      reqMap.forEach(([label, value]) => {
        if (value !== 0) {
          reqs.push(
            <div key={label} style={{ color: value > 0 ? colorMap.positive : colorMap.negative }}>
              {value > 0 ? '+' : ''}{value} {label} Min.
            </div>
          );
        }
      });
      return reqs.length > 0 ? <div style={{ marginTop: 4 }}>{reqs}</div> : null;
    };

    // Render crafting info
    const renderCraftingInfo = () => {
      const skills = item.requirements?.skills;
      return (
        <div style={{ marginTop: 6 }}>
          <div style={{ color: '#aaaaaa', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#ff5555' }}>✖</span>
            <span>Crafting Lv. Min: {item.requirements.level}</span>
          </div>
          {skills && skills.map(skill => (
            <div key={skill} style={{ color: '#aaaaaa', marginLeft: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#aaaaaa' }}>✔</span>
              <span>{skill.charAt(0).toUpperCase() + skill.slice(1)}</span>
            </div>
          ))}
        </div>
      );
    };

    // Render consumable only IDs
    const renderConsumableIDs = () => {
      if (!item.consumableOnlyIDs) return null;
      const { duration, charges } = item.consumableOnlyIDs;
      if (duration === 0 && charges === 0) return null;

      return (
        <div style={{ marginTop: 4, color: '#aaaaaa' }}>
          {duration !== 0 && (
            <div style={{ color: duration >= 0 ? colorMap.positive : colorMap.negative }}>
              {duration >= 0 ? '+' : ''}{duration}s Duration
            </div>
          )}
          {charges !== 0 && (
            <div style={{ color: charges >= 0 ? colorMap.positive : colorMap.negative }}>
              {charges >= 0 ? '+' : ''}{charges} Charges
            </div>
          )}
        </div>
      );
    };

    // Render effectiveness / position modifiers
    const renderPositionModifiers = () => {
      if (!item.ingredientPositionModifiers) return null;
      const mods = item.ingredientPositionModifiers;
      const entries: [string, number][] = [
        ['Left', mods.left],
        ['Right', mods.right],
        ['Above', mods.above],
        ['Under', mods.under],
        ['Touching', mods.touching],
        ['Not Touching', mods.not_touching],
      ];
      const nonZero = entries.filter(([, v]) => v !== 0);
      if (nonZero.length === 0) return null;

      return (
        <div style={{ marginTop: 6 }}>
          <div style={{ color: '#aaaaaa', fontSize: 11, marginBottom: 2 }}>Effectiveness:</div>
          {nonZero.map(([label, value]) => (
            <div key={label} style={{ color: value >= 0 ? colorMap.positive : colorMap.negative, marginLeft: 8 }}>
              {value >= 0 ? '+' : ''}{value} {label}
            </div>
          ))}
        </div>
      );
    };

    // Render mob drops
    const renderDroppedBy = () => {
      if (!item.droppedBy || item.droppedBy.length === 0) return null;
      return (
        <div style={{ marginTop: 6, color: '#aaaaaa', fontSize: 11 }}>
          <span style={{ color: '#bcbcbc' }}>Dropped by: </span>
          {item.droppedBy.map((mob, i) => (
            <span key={i}>
              <span style={{ color: '#ffaa00' }}>{mob.name}</span>
              {i < item.droppedBy!.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      );
    };

    return (
      <div
        className="item-card"
        style={{
          borderColor: tierColor,
          minWidth: 260,
          maxWidth: 340,
          fontSize: 13,
          fontFamily: 'Minecraftia, monospace',
          '--rarity-color': tierColor,
          cursor: onClick ? 'pointer' : 'default'
        } as React.CSSProperties}
        onClick={handleClick}
      >
        {/* Name with tier stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ color: tierColor, fontWeight: 'bold', fontSize: 16 }}>
            {item.displayName}
          </span>
          {tierStars && (
            <span style={{ color: tierColor, fontSize: 13 }}>{tierStars}</span>
          )}
        </div>
        {/* Subtitle */}
        <div style={{ color: '#aaaaaa', marginBottom: 6, fontSize: 12 }}>
          Crafting Ingredient
        </div>
        {/* Identifications */}
        {renderIngredientIdentifications()}
        {/* Consumable IDs */}
        {renderConsumableIDs()}
        {/* Durability */}
        {renderDurability()}
        {/* Skill point requirements */}
        {renderItemSkillRequirements()}
        {/* Crafting info */}
        {renderCraftingInfo()}
        {/* Position modifiers */}
        {renderPositionModifiers()}
        {/* Dropped by */}
        {renderDroppedBy()}
      </div>
    );
  }

  // ========================
  // REGULAR (NON-INGREDIENT) ITEMS BELOW
  // ========================

  // Render requirements in Wynncraft style
  const renderRequirements = () => {
    const reqs: React.ReactElement[] = [];
    const reqsData = [
      { label: 'Class Req', value: item.requirements.classRequirement },
      { label: 'Combat Lv. Min', value: item.requirements.level },
      { label: 'Strength Min', value: item.requirements.strength },
      { label: 'Dexterity Min', value: item.requirements.dexterity },
      { label: 'Intelligence Min', value: item.requirements.intelligence },
      { label: 'Defence Min', value: item.requirements.defence },
      { label: 'Agility Min', value: item.requirements.agility },
    ];
    reqsData.forEach((req) => {
      if (req.value) {
        reqs.push(
          <div key={req.label} style={{ color: '#aaaaaa', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>{req.label}: {req.value}</span>
          </div>
        );
      }
    });
    return reqs;
  };

  // Render base stats (health, defenses, damages)
  const renderBaseStats = () => {
    const stats = [];
    if (item.base?.baseHealth) {
      stats.push(
        <div key="health" style={{ color: '#aaaaaa', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ColoredIcon iconName="heart" color={colorMap.health} size={16} />
          <span>Health: +{item.base.baseHealth}</span>
        </div>
      );
    }
    if (item.base?.baseAirDefence) {
      stats.push(
        <div key="airdef" style={{ color: '#aaaaaa', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ColoredIcon iconName="air" color={colorMap.air} size={16} />
          <span><span style={{ color: colorMap.air }}>Air</span> Defence: +{item.base.baseAirDefence}</span>
        </div>
      );
    }
    if (item.base?.baseEarthDefence) {
      stats.push(
        <div key="earthdef" style={{ color: '#aaaaaa', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ColoredIcon iconName="earth" color={colorMap.earth} size={16} />
          <span><span style={{ color: colorMap.earth }}>Earth</span> Defence: +{item.base.baseEarthDefence}</span>
        </div>
      );
    }
    if (item.base?.baseThunderDefence) {
      stats.push(
        <div key="thunderdef" style={{ color: '#aaaaaa', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ColoredIcon iconName="thunder" color={colorMap.thunder} size={16} />
          <span><span style={{ color: colorMap.thunder }}>Thunder</span> Defence: +{item.base.baseThunderDefence}</span>
        </div>
      );
    }
    if (item.base?.baseWaterDefence) {
      stats.push(
        <div key="waterdef" style={{ color: '#aaaaaa', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ColoredIcon iconName="water" color={colorMap.water} size={16} />
          <span><span style={{ color: colorMap.water }}>Water</span> Defence: +{item.base.baseWaterDefence}</span>
        </div>
      );
    }
    if (item.base?.baseFireDefence) {
      stats.push(
        <div key="firedef" style={{ color: '#aaaaaa', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ColoredIcon iconName="fire" color={colorMap.fire} size={16} />
          <span><span style={{ color: colorMap.fire }}>Fire</span> Defence: +{item.base.baseFireDefence}</span>
        </div>
      );
    }
    return stats;
  };

  // Render identifications grouped by type with extra spacing between groups
  const renderIdentifications = () => {
    if (!item.identifications) return null;

    type RangeValue = { min: number; max: number };
    type IdValue = number | RangeValue | IdentificationValue;

    const entries = Object.entries(item.identifications) as [string, IdValue][];
    const consumed = new Set<string>();

    const take = (predicate: (k: string) => boolean) => {
      const group: [string, IdValue][] = [];
      for (const [k, v] of entries) {
        if (!consumed.has(k) && predicate(k.toLowerCase())) {
          consumed.add(k);
          group.push([k, v]);
        }
      }
      return group;
    };

    // Group definitions
    const elementPrefixes = ['earth', 'water', 'fire', 'air', 'thunder', 'neutral'];
    const skillGroup = take(k => {
      const isCoreSkill = k.includes('strength') || k.includes('dexterity') || k.includes('intelligence') || k.includes('agility');
      const isDefenceSkill = k.includes('defence') && !elementPrefixes.some(e => k.includes(e));
      return isCoreSkill || isDefenceSkill;
    });

    const damageGroup = take(k => k.includes('damage'));
    // Mana-related: regen, steal, and spell cost reductions (raw and %)
    const manaGroup = take(k => k.includes('manaregen') || k.includes('manasteal') || k.includes('spellcost'));
    // Movement: include sprint, walk speed, and jump height
    const movementGroup = take(k => k.includes('sprint') || k.includes('walkspeed') || k.includes('jumpheight'));
    // Health/Healing: raw and % health regen, healing efficiency, health bonus, flat health, and life steal
    const healthGroup = take(k => k.includes('healthregen') || k.includes('healingefficiency') || k.includes('healthbonus') || (k === 'health') || k.includes('lifesteal'));
    const lootXpGroup = take(k => k.includes('loot') || k.includes('xpbonus') || k.includes('lootquality'));
    const defenceGroup = take(k => k.includes('defence'));
    const otherGroup = take(() => true); // whatever remains

    type Group = [string, [string, IdValue][]];
    const groups: Group[] = [];
    if (skillGroup.length) groups.push(['skills', skillGroup]);
    if (damageGroup.length) groups.push(['damage', damageGroup]);
    if (defenceGroup.length) groups.push(['defence', defenceGroup]);
    if (healthGroup.length) groups.push(['health', healthGroup]);
    if (manaGroup.length) groups.push(['mana', manaGroup]);
    if (movementGroup.length) groups.push(['movement', movementGroup]);
    if (lootXpGroup.length) groups.push(['lootxp', lootXpGroup]);
    if (otherGroup.length) groups.push(['other', otherGroup]);

    const hasRaw = (val: IdValue): val is IdentificationValue & { raw: number } => {
      return typeof val === 'object' && val !== null && 'raw' in (val as Record<string, unknown>) && typeof (val as Record<string, unknown>).raw === 'number';
    };

    return groups.map(([groupName, group]) => (
      <div key={`group-${groupName}`} style={{ marginTop: 6 }}>
        {group.map(([key, value]) => {
          const displayValue = formatIdentification(key, value);
          const numericValue = typeof value === 'number' ? value : (hasRaw(value) ? value.raw : 0);
          return (
            <div key={key} style={{ color: '#aaaaaa', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
              <span><span style={{ color: statColor(numericValue, key) }}>{numericValue > 0 ? '+' : ''}{displayValue}</span> {formatIdentificationName(key)}</span>
            </div>
          );
        })}
      </div>
    ));
  };

  // Render major IDs
  const renderMajorIds = () => {
    if (!item.majorIds) return null;
    return Object.entries(item.majorIds).map(([key, value]: [string, string]) => (
      <div
        key={key}
        style={{ color: colorMap.major, fontWeight: 'bold' }}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    ));
  };

  // Render powder slots
  const renderPowderSlots = () => {
    if (!item.powderSlots) return null;
    return (
      <div style={{ color: colorMap.powder }}>
        [{Array(item.powderSlots).fill('●').join(' ')}] Powder Slots
      </div>
    );
  };

  // Render lore
  const renderLore = () => {
    if (!item.lore) return null;
    return (
      <div style={{ color: '#bcbcbc', fontStyle: 'italic', marginTop: 8 }}>
        {item.lore}
      </div>
    );
  };

  // Render item type
  const renderItemType = () => {
    const typeInfo = getItemTypeInfo(item);
    if (!typeInfo) return null;

    const formatTypeName = (type: string) => {
      return type.charAt(0).toUpperCase() + type.slice(1);
    };

    return (
      <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
        <ColoredIcon iconName={typeInfo.type} color="#94a3b8" size={16} />
        <span>{formatTypeName(typeInfo.type)}</span>
      </div>
    );
  };

  // Render rarity at the bottom
  const renderRarity = () => {
    if (!item.rarity) return null;
    return (
      <div style={{ color: colorMap[item.rarity.toLowerCase()] || colorMap.default, fontWeight: 'bold', marginTop: 8 }}>
        {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)} Item
      </div>
    );
  };

  return (
    <div
      className="item-card"
      style={{
        borderColor: rarityColor,
        minWidth: 260,
        maxWidth: 340,
        fontSize: 13,
        fontFamily: 'Minecraftia, monospace',
        '--rarity-color': rarityColor,
        cursor: onClick ? 'pointer' : 'default'
      } as React.CSSProperties}
      onClick={handleClick}
    >
      {/* Name (no percent) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ color: rarityColor, fontWeight: 'bold', fontSize: 16 }}>{item.displayName}</span>
      </div>
      {/* Item type */}
      {renderItemType()}
      {/* Attack speed */}
      {item.attackSpeed && (
        <div style={{ color: '#aaaaaa', marginBottom: 2 }}>{formatAttackSpeed(item.attackSpeed)} Attack Speed</div>
      )}
      {/* Damages with icons */}
      {item.base && (
        <div style={{ marginBottom: 2 }}>
          {item.base.baseDamage && (
            <div style={{ color: '#aaaaaa', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ColoredIcon iconName="neutral" color={colorMap.neutral} size={16} />
              <span><span style={{ color: colorMap.neutral }}>Neutral</span> Damage: {formatDamage(item.base.baseDamage)}</span>
            </div>
          )}
          {item.base.baseFireDamage && (
            <div style={{ color: '#aaaaaa', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ColoredIcon iconName="fire" color={colorMap.fire} size={16} />
              <span><span style={{ color: colorMap.fire }}>Fire</span> Damage: {formatDamage(item.base.baseFireDamage)}</span>
            </div>
          )}
          {item.base.baseWaterDamage && (
            <div style={{ color: '#aaaaaa', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ColoredIcon iconName="water" color={colorMap.water} size={16} />
              <span><span style={{ color: colorMap.water }}>Water</span> Damage: {formatDamage(item.base.baseWaterDamage)}</span>
            </div>
          )}
          {item.base.baseThunderDamage && (
            <div style={{ color: '#aaaaaa', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ColoredIcon iconName="thunder" color={colorMap.thunder} size={16} />
              <span><span style={{ color: colorMap.thunder }}>Thunder</span> Damage: {formatDamage(item.base.baseThunderDamage)}</span>
            </div>
          )}
          {item.base.baseAirDamage && (
            <div style={{ color: '#aaaaaa', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ColoredIcon iconName="air" color={colorMap.air} size={16} />
              <span><span style={{ color: colorMap.air }}>Air</span> Damage: {formatDamage(item.base.baseAirDamage)}</span>
            </div>
          )}
          {item.base.baseEarthDamage && (
            <div style={{ color: '#aaaaaa', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ColoredIcon iconName="earth" color={colorMap.earth} size={16} />
              <span><span style={{ color: colorMap.earth }}>Earth</span> Damage: {formatDamage(item.base.baseEarthDamage)}</span>
            </div>
          )}
        </div>
      )}
      {/* Average DPS */}
      {item.averageDps && (
        <div style={{ color: '#aaaaaa', marginBottom: 8 }}>
          Average DPS: {item.averageDps}
        </div>
      )}
      {/* Requirements */}
      <div style={{ marginBottom: 8 }}>
        {renderRequirements()}
      </div>
      {/* Base stats (health, defenses) */}
      <div style={{ marginBottom: 8 }}>
        {renderBaseStats()}
      </div>
      {/* Identifications (no percent) */}
      {item.identifications && Object.keys(item.identifications).length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {renderIdentifications()}
        </div>
      )}
      {/* Major IDs */}
      {renderMajorIds()}
      {/* Powder slots */}
      {renderPowderSlots()}
      {/* Rarity */}
      {renderRarity()}
      {/* Lore */}
      {renderLore()}
    </div>
  );
};

