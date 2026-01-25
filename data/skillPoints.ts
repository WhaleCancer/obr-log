/**
 * Special Skill Points (Design Points) available per character grade
 */
export const skillPoints: Record<string, number> = {
    "Poor": 6,
    "Common": 12,
    "Uncommon": 18,
    "Rare": 24,
    "Epic": 32,
    "Legendary": 40,
    "Mythic": 56,
};

/**
 * Maximum Special Skill rank allowed per character grade
 */
export const maxSkillRanks: Record<string, number> = {
    "Poor": 1,
    "Common": 2,
    "Uncommon": 3,
    "Rare": 4,
    "Epic": 5,
    "Legendary": 6,
    "Mythic": 6,
};
