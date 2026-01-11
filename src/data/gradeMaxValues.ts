/**
 * Maximum characteristic bonuses allowed by Grade
 * These are added to base values: SKILL 4, STAMINA 8, LUCK 9
 */
export type GradeMaxBonuses = {
    SKILL: number;
    STAMINA: number;
    LUCK: number;
    MAGIC: number; // Note: This is PSIONICS in the sheet
};

export const gradeMaxBonuses: Record<string, GradeMaxBonuses> = {
    "Civilian": { SKILL: 0, STAMINA: 2, LUCK: 3, MAGIC: 4 },
    "Novice": { SKILL: 1, STAMINA: 4, LUCK: 3, MAGIC: 5 },
    "Competent": { SKILL: 2, STAMINA: 6, LUCK: 3, MAGIC: 6 },
    "Veteran": { SKILL: 3, STAMINA: 8, LUCK: 3, MAGIC: 7 },
    "Expert": { SKILL: 4, STAMINA: 10, LUCK: 3, MAGIC: 8 },
    "Master": { SKILL: 5, STAMINA: 12, LUCK: 3, MAGIC: 9 },
    "Champion": { SKILL: 6, STAMINA: 14, LUCK: 3, MAGIC: 10 }
};

/**
 * Base characteristic values (before grade bonuses)
 */
export const baseCharacteristics = {
    SKILL: 4,
    STAMINA: 8,
    LUCK: 9,
    PSIONICS: 0
};

/**
 * Calculate maximum value for a characteristic based on grade
 */
export function getMaxValue(grade: string, characteristicName: string): number {
    const gradeData = gradeMaxBonuses[grade] || gradeMaxBonuses["Veteran"];
    const base = baseCharacteristics[characteristicName as keyof typeof baseCharacteristics] || 0;
    
    // Map PSIONICS to MAGIC in the grade data
    const gradeKey = characteristicName === "PSIONICS" ? "MAGIC" : characteristicName;
    const bonus = gradeData[gradeKey as keyof GradeMaxBonuses] || gradeData.MAGIC;
    return base + bonus;
}
