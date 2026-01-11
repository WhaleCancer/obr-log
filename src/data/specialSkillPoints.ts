/**
 * Special Skill Points (Design Points) available per character grade
 */
export const specialSkillPoints: Record<string, number> = {
    "Civilian": 6,
    "Novice": 12,
    "Competent": 18,
    "Veteran": 24,
    "Expert": 32,
    "Master": 40,
    "Champion": 56,
};

/**
 * Maximum Special Skill rank allowed per character grade
 */
export const maxSpecialSkillRanks: Record<string, number> = {
    "Civilian": 1,
    "Novice": 2,
    "Competent": 3,
    "Veteran": 4,
    "Expert": 5,
    "Master": 6,
    "Champion": 6,
};
