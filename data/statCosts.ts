/**
 * Cost in stat points per increase for each stat
 * Each point of BODY, MIND, or LUCK costs 1 stat point
 */
export const statCosts: Record<string, number> = {
    "BODY": 1,    // Each point costs 1 stat point
    "LUCK": 1,    // Each point costs 1 stat point
    "MIND": 1,    // Each point costs 1 stat point
    // HEALTH is derived from BODY (2×BODY) and not directly purchased
    // POWER is derived from MIND (2×MIND) and not directly purchased
    // ATTACKS is derived from BACKGROUND
    // MOVE is derived from BACKGROUND
};
