/**
 * Cost in design points per rank for special skills
 * 
 * Combat/Psionic skills: 2, 4, 6, 8, 10, 12 for ranks 1-6
 * Movement/Stealth/Knowledge/Science skills: 1, 2, 3, 4, 5, 6 for ranks 1-6
 */

export type SpecialSkillType = 'combat' | 'psionic' | 'movement' | 'stealth' | 'knowledge' | 'science';

/**
 * Cost per rank for Combat and Psionic special skills
 */
export const combatPsionicSkillCosts: Record<number, number> = {
    1: 2,
    2: 4,
    3: 6,
    4: 8,
    5: 10,
    6: 12,
};

/**
 * Cost per rank for Movement, Stealth, Knowledge, and Science special skills
 */
export const movementStealthKnowledgeScienceSkillCosts: Record<number, number> = {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
};

/**
 * Get the cost to increase a special skill from current rank to new rank
 * Based on the table, each rank has a cost, and you pay that cost when buying that rank.
 * So going from rank 0 to rank 1 costs the rank 1 cost, rank 1 to rank 2 costs the rank 2 cost, etc.
 * 
 * @param skillType The type of special skill
 * @param currentRank Current rank (0 if no ranks)
 * @param newRank New rank to reach
 * @returns Cost to go from currentRank to newRank (cost of newRank)
 */
export function getSpecialSkillCost(skillType: SpecialSkillType, currentRank: number, newRank: number): number {
    const isCombatOrPsionic = skillType === 'combat' || skillType === 'psionic';
    const costs = isCombatOrPsionic ? combatPsionicSkillCosts : movementStealthKnowledgeScienceSkillCosts;
    
    // The cost to reach a rank is the cost listed for that rank in the table
    // So going from rank X to rank X+1 costs the cost for rank X+1
    return costs[newRank] || 0;
}

/**
 * Get the cumulative cost for a skill at a given rank (total cost spent to reach this rank)
 * @param skillType The type of special skill
 * @param rank The rank to calculate total cost for
 * @returns Total cost spent to reach this rank (sum of all rank costs up to this rank)
 */
export function getCumulativeSpecialSkillCost(skillType: SpecialSkillType, rank: number): number {
    if (rank <= 0) return 0;
    
    const isCombatOrPsionic = skillType === 'combat' || skillType === 'psionic';
    const costs = isCombatOrPsionic ? combatPsionicSkillCosts : movementStealthKnowledgeScienceSkillCosts;
    
    let totalCost = 0;
    for (let r = 1; r <= rank; r++) {
        totalCost += costs[r] || 0;
    }
    
    return totalCost;
}
