/**
 * Maximum stat bonuses allowed by Grade
 * These are added to base values: BODY 4, LUCK 8, MIND 4
 */
export type QualityMaxBonuses = {
    BODY: number;
    LUCK: number;
    MIND: number;
};

export const statsMaxValuesByQuality: Record<string, QualityMaxBonuses> = {
    "Poor": { BODY: 1, LUCK: 3, MIND: 1 },
    "Common": { BODY: 2, LUCK: 3, MIND: 2 },
    "Uncommon": { BODY: 3, LUCK: 3, MIND: 3 },
    "Rare": { BODY: 4, LUCK: 3, MIND: 4 },
    "Epic": { BODY: 5, LUCK: 3, MIND: 5 },
    "Legendary": { BODY: 6, LUCK: 3, MIND: 6 },
    "Mythic": { BODY: 7, LUCK: 3, MIND: 7 }
};

/**
 * Base characteristic values (before grade bonuses)
 */
export const baseCharacteristics = {
    BODY: 4,
    LUCK: 8,
    MIND: 4,
    POWER: 8 // Derived as 2×MIND; kept for compatibility
};

/**
 * Calculate maximum value for a characteristic based on grade
 */
export function getMaxValue(quality: string, statName: string): number {
    const qualityData = statsMaxValuesByQuality[quality] || statsMaxValuesByQuality["Rare"];
    const base = baseCharacteristics[statName as keyof typeof baseCharacteristics] || 0;
    const bonus = qualityData[statName as keyof QualityMaxBonuses] || 0;
    return base + bonus;
}
