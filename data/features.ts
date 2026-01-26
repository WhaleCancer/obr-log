/**
 * Unified Features Data
 * 
 * This module consolidates all feature-like systems into a single unified array:
 * - Talents
 * - Drawbacks
 * - Mutations
 * - Neutral Features
 * - Cyberware
 * - Racial Talents
 */

import type { SkillCategory } from './skills';

export type CostType = 'feature-points' | 'luck' | 'design-points' | 'none';

export type FeatureSpecialization = {
    value: string;
    label: string;
};

export type FeatureVariant = {
    id: string;
    name: string;
    description?: string;
    skinColor?: string;
    emoji?: string;
};

/**
 * Unified Feature type - superset of all feature properties
 */
export type Feature = {
    // Core identification
    id: string;
    name: string;
    type: string;
    description: string;
    
    // Optional common fields
    emoji?: string;
    icon?: string;
    category?: SkillCategory; // Must match skill categories: Combat, Psionic, Movement, Pilot, Stealth, Knowledge, Science, Speech, Language
    
    // Cost system
    costType?: CostType;
    cost?: number; // Can be positive, negative, or zero
    
    // Special fields for different feature types
    specializations?: FeatureSpecialization[];
    variants?: FeatureVariant[];
    skillBonuses?: Record<string, number>;
    statModifiers?: Record<string, number>;
    moveModifier?: number;
    
    // Stat modifiers
    mindValue?: number;
    grade?: string;
    bonus?: string;
    healthMultiplier?: number; // Multiplier for HEALTH calculation (default is 2)
    
    // Legacy/other fields
    games?: string[];
    
    // Special properties for specific features
    requiresSelection?: boolean; // If true, feature requires user to make a selection when purchased
    selectionType?: 'enemy-type' | 'language' | 'organization' | string; // Type of selection needed
};

/**
 * Unified features array - all features in one place
 * Built by converting all source data into the unified format
 * 
 * Feature categories match skill categories:
 * - Combat
 * - Psionic
 * - Movement
 * - Pilot
 * - Stealth
 * - Knowledge
 * - Science
 * - Language
 */
export const features: Feature[] = [
    // Feature categories match skill categories: Combat, Psionic, Movement, Pilot, Stealth, Knowledge, Science, Language
    
    {
        id: "hotshot",
        name: "Hotshot",
        type: "talent",
        description: "The pilot Hero with this Talent is a natural behind the wheel/joystick and gains a +1 bonus to all piloting rolls.",
        category: "Pilot",
        emoji: "🏎️",
        costType: "feature-points",
        cost: 2,
        skillBonuses: {
            "Air": 1,
            "Ground": 1,
            "Space": 1,
            "Water": 1
        }
    },
    {
        id: "dogfighter",
        name: "Dogfighter",
        type: "talent",
        description: "The Hero with this Talent can normally see the weak spots in an enemy vehicle or starship in the same way that a hero archer can see the weak spot in a dragon's belly. The Hero gains a +1 bonus to vehicle/starship weapon damage rolls made by that character.",
        category: "Pilot",
        emoji: "🎯",
        costType: "feature-points",
        cost: 4
    },
    {
        id: "defensive-pilot",
        name: "Defensive Pilot",
        type: "talent",
        description: "This Hero naturally flies (or drives) in a defensive way, even if there are no enemies in sight! This translates to a +1 on all starship or vehicle armour rolls made whilst this Hero is the pilot.",
        category: "Pilot",
        emoji: "🛡️",
        costType: "feature-points",
        cost: 2
    },
    {
        id: "ambidextrous",
        name: "Ambidextrous",
        type: "talent",
        description: "This Hero may use both hands with equal acuity, and may use a melee weapon in both hands without any penalty. The character will make one normal attack roll vs an opponent with the attacks resolved normally. The Hero will then make a second attack roll for their second weapon. If this second combat total exceeds that of their opponent, this attack hits as well. If this Hero wishes to use two firearms, each of these attacks will need to be against the same opponent and will suffer a penalty of -2.",
        category: "Combat",
        emoji: "🤲",
        costType: "feature-points",
        cost: 4
    },
    {
        id: "armour-training",
        name: "Armour Training",
        type: "talent",
        description: "This Hero is able to make the most of any armour worn and receives a +1 to all Armour Rolls.",
        category: "Combat",
        emoji: "🛡️",
        costType: "feature-points",
        cost: 4
    },
    {
        id: "combat-reactions",
        name: "Combat Reactions",
        type: "talent",
        description: "This Hero is fast in combat and difficult to surprise. The Hero cannot be ambushed and reduces all penalties from being outnumbered by 1. If the Hero uses the Fast Shot option in combat, they will go first if the speeds are tied.",
        category: "Combat",
        emoji: "⚡",
        costType: "feature-points",
        cost: 4
    },
    {
        id: "crack-shot",
        name: "Crack Shot",
        type: "talent",
        description: "A Hero with this Talent has a particular ability with ranged weapons and can add +1 to all damage rolls made with firearms or other personal weapons. This Talent does not apply to vehicle or starship mounted weapons.",
        category: "Combat",
        emoji: "🎯",
        costType: "feature-points",
        cost: 4
    },
    {
        id: "light-footed",
        name: "Light Footed",
        type: "talent",
        description: "This Hero is slippery and fluid in combat and difficult to hit. All Dodge rolls are made with a bonus of +",
        category: "Movement",
        emoji: "💨",
        costType: "feature-points",
        cost: 2
    },
    {
        id: "silver-tongued",
        name: "Silver-Tongued",
        type: "talent",
        description: "This talent gives the Hero a natural way with words and gains a +2 bonus to any Con, Bargain, Etiquette or Leadership special skill tests.",
        category: "Speech",
        emoji: "🗣️",
        costType: "feature-points",
        cost: 2,
        skillBonuses: {
            "Con": 2,
            "Bargain": 2,
            "Etiquette": 2,
            "Leadership": 2
        }
    },
    {
        id: "carouser",
        name: "Carouser",
        type: "talent",
        description: "The Hero gains a +2 bonus on BODY checks involving drugs or alcohol, +2 bonus on LUCK checks in games of chance, and a +2 bonus on skill checks to seduce (usually Bargain).",
        category: "Speech",
        emoji: "🍻",
        costType: "feature-points",
        cost: 2
    },
    {
        id: "strongarm",
        name: "Strongarm",
        type: "talent",
        description: "This Hero is very strong and has a +1 bonus to all damage rolls made in hand to hand combat.",
        category: "Combat",
        emoji: "💪",
        costType: "feature-points",
        cost: 4
    },
    {
        id: "tough",
        name: "Tough",
        type: "talent",
        description: "This Hero has exceptional stamina and their HEALTH is calculated as 3x BODY instead of 2x BODY.",
        category: "Combat",
        emoji: "🛡️",
        costType: "feature-points",
        cost: 4,
        healthMultiplier: 3
    },
    {
        id: "dealer",
        name: "Dealer",
        type: "talent",
        description: "This Hero is a hard negotiator when the chips are down and their back is to the wall. If the character fails their Trading roll, the margin of failure cannot be more than -2 for the purposes of calculating the actual sale price.",
        category: "Speech",
        emoji: "💼",
        costType: "feature-points",
        cost: 2
    },
    {
        id: "natural-leader",
        name: "Natural Leader",
        type: "talent",
        description: "This talent makes the Hero an instinctive leader and if a successful leadership roll is made, NPC followers gain a bonus of +1 when carrying out the order. If the leadership roll is a critical success, the bonus is +3. The Director should rule on when this talent can be used on a case-by-case basis.",
        category: "Speech",
        emoji: "👑",
        costType: "feature-points",
        cost: 2
    },
    {
        id: "status",
        name: "Status",
        type: "talent",
        description: "This Hero is of greater standing in society and has rank and status above that of most normal folk. The Hero has a social rank of 7 (or more if the Director so desires) and may also have slightly more money at the start of the game. The Hero may be able to leverage this status during the game, but may also have obligations due to that rank.",
        category: "Speech",
        emoji: "⭐",
        costType: "feature-points",
        cost: 2
    },
    {
        id: "sidekick",
        name: "Sidekick",
        type: "talent",
        description: "A Hero with this talent has an apprentice, ally, family member, bodyguard, assistant, etc. This NPC (who will have characteristics and special skills lower than the Heroes) will generally be under the control of the player, but the Director can take over this character at any time. Although the sidekick is loyal, they may be mislead, controlled, bribed or threatened into acting against the party good.",
        category: "Speech",
        emoji: "🤝",
        costType: "feature-points",
        cost: 4
    },
    {
        id: "reputation",
        name: "Reputation",
        type: "talent",
        description: "The Hero is famous (or infamous) due to something in their background. They may, by revealing their history, test their LUCK in social situations to get a useful reaction – whether positive or negative.",
        category: "Speech",
        emoji: "📢",
        costType: "feature-points",
        cost: 2
    },
    {
        id: "affiliation",
        name: "Affiliation",
        type: "talent",
        description: "This Talent means that the Hero is affiliated with a particular organisation, and almost certainly has official status within it. The Hero may be an agent or other employee or could be an honoured member or associate. The Hero may, at appropriate times and with appropriate contact, Test their Luck to gain special assistance. The downside to this Talent is that sworn enemies of the organisation also see the Hero as an enemy!",
        category: "Speech",
        emoji: "🏛️",
        costType: "feature-points",
        cost: 4
    },
    {
        id: "charmed-life",
        name: "Charmed Life",
        type: "talent",
        description: "This Hero leads a charmed life and impossibly avoids injury when there is seemingly no way it could happen! This Hero can, when hit, reduce the damage dice result to a 1 (all normal modifiers apply). This ability can only be used once per attack, and each use requires the Hero to spend 1 LUCK point, although a LUCK roll is not required.",
        category: "Combat",
        emoji: "🍀",
        costType: "feature-points",
        cost: 4
    },
    {
        id: "directed-aggression",
        name: "Directed Aggression",
        type: "talent",
        description: "A Psionicist Hero with this Talent is aggressive and forceful when attacking and gains a +1 bonus on all Psionic direct damage rolls.",
        category: "Psionic",
        emoji: "⚡",
        costType: "feature-points",
        cost: 4
    },
    {
        id: "focused",
        name: "Focused",
        type: "talent",
        description: "Normally, a Psionicist can eventually learn all eight of the Psionic powers that are available to their tradition. This Hero is more specialised than that, able to learn only four of the available powers, but gaining a one off bonus of +2 to their PSIONICS score. It may be possible, in rare cases, to lose this Talent (the Director may allow you to choose another), losing the +2 bonus to PSIONICS but recovering the ability to use all eight powers.",
        category: "Psionic",
        emoji: "🎯",
        costType: "feature-points",
        cost: 4
    },
    {
        id: "power-leech",
        name: "Power Leech",
        type: "talent",
        description: "A Hero with this talent can drain 1 PSI point from another sentient being with a touch. Non-Psionicists should be considered to have 1 PSI point each. Use of this talent requires a full round of action and causes considerable (if brief) pain to the target. Some planets have outlawed the use of this talent.",
        category: "Psionic",
        emoji: "🧛",
        costType: "feature-points",
        cost: 4
    },
    {
        id: "linguist",
        name: "Linguist",
        type: "talent",
        description: "This talent grants a basic understanding of almost all \"standard\" languages, and the Hero may grasp the basic concepts of any spoken communication. The Hero may also buy the language special skill at half normal XP cost. This talent does not apply to truly alien languages that communicate via smell, flashing lights or facial expressions!",
        category: "Language",
        emoji: "🗣️",
        costType: "feature-points",
        cost: 2
    },
    {
        id: "hawkeye",
        name: "Hawkeye",
        type: "talent",
        description: "This Hero has fantastic eyes and their brain is incredibly perceptive. They gain a +3 bonus to all sight-based Awareness tests, even if at some later point their eyes are replaced with cybernetic replacements or regenerated.",
        category: "Stealth",
        emoji: "👁️",
        costType: "feature-points",
        cost: 2,
        skillBonuses: {
            "Awareness": 3
        }
    },
    {
        id: "entrepreneur",
        name: "Entrepreneur",
        type: "talent",
        description: "A Hero with this talent is an astute businessman, recognising the potential for profit before most ordinary folk. Whether running a shop or organising a band of mercenaries, this Hero is organised and efficient and may add +2 to the result of any Profit rolls made when in direct control of a business (see Chapter 4 for full details).",
        category: "Speech",
        emoji: "💼",
        costType: "feature-points",
        cost: 2
    },
    {
        id: "packhorse",
        name: "Packhorse",
        type: "talent",
        description: "This Talent sets the Hero apart in a seemingly mundane and boring way. They can carry an awful lot, for an awful long time. This Hero can now carry 20 normal items, with an extra two items per point in the Strength Special Skill. Heroes with the Packhorse Talent are often very popular with comrades on long treks through difficult terrain!",
        category: "Movement",
        emoji: "🐴",
        costType: "feature-points",
        cost: 2
    },
    {
        id: "jury-rigger",
        name: "Jury Rigger",
        type: "talent",
        description: "A Hero with this talent is able to make just about any tool or basic mechanism given a few parts and basic tools, and can also force a damaged system to work, even if at minimum capacity. This talent is not a replacement for the engineering special skill for proper repairs or maintenance, although this talent does allow the creation of some outrageous (and short lived) inventions. Any mechanism made or repaired by this talent will work just long enough to fulfil its purpose before failing completely.",
        category: "Knowledge",
        emoji: "🛠️",
        costType: "feature-points",
        cost: 2
    },
    {
        id: "learned",
        name: "Learned",
        type: "talent",
        description: "A Hero with this talent has had an extensive education, and spends most of their spare time reading and learning. They know a huge amount of...stuff, and gain a +2 bonus to all knowledge tests made against special skills.",
        category: "Knowledge",
        emoji: "📚",
        costType: "feature-points",
        cost: 2
    },
    {
        id: "survivor",
        name: "Survivor",
        type: "talent",
        description: "This Hero seems to have an almost supernatural ability to stay alive in difficult environments. As long as it is possible to live (breathable atmosphere, source of food and water) the character will cling on and find whatever is needed. If the Hero also has the Survival special skill, they can support an extra person per point in the special skill without needing to roll.",
        category: "Knowledge",
        emoji: "🧭",
        costType: "feature-points",
        cost: 2
    },
    {
        id: "technical-genius",
        name: "Technical Genius",
        type: "talent",
        description: "This Hero may sacrifice a point of LUCK to gain a +4 bonus to one technical skill roll (Science, Engineering, Medical).",
        category: "Science",
        emoji: "🧠",
        costType: "feature-points",
        cost: 2
    },
    {
        id: "inspiring-leader",
        name: "Inspiring Leader",
        type: "talent",
        description: "This Hero is a shining beacon for their allies and comrades, inspiring them to great things. All allies of the Leader deduct 1 from the dice total of any Test for LUCK made whilst the leader is in sight. The demoralising effect of this Leader on their enemies also causes them to add +1 to the dice for any LUCK (or equivalent) tests.",
        category: "Speech",
        emoji: "🌟",
        costType: "feature-points",
        cost: 4
    },
    {
        id: "hunter",
        name: "Hunter",
        type: "talent",
        description: "A Hero with this Talent must choose an enemy for which they have both a loathing and a special knowledge. Against this enemy, the character has a bonus of +1 to both the Attack Total and the subsequent damage roll. The chosen enemy type may not be changed once selected and must be specific (Goblin, Hill Giant etc). However, the Director may allow the bonuses to be applied to sufficiently similar enemy types (Marsh Goblin, Mountain Giant etc).",
        category: "Combat",
        emoji: "🎯",
        costType: "feature-points",
        cost: 2,
        requiresSelection: true,
        selectionType: "enemy-type"
    },
    {
        id: "sniper",
        name: "Sniper",
        type: "talent",
        description: "This Talent allows the Hero to aim at an enemy with a bow, crossbow, blowpipe etc (but not a sling or thrown weapon) for up to three rounds before shooting. Each consecutive round adds a +1 bonus to both the Attack Total and the damage roll. The target cannot leave the sight of the Sniper for more than a moment and an attack on the Sniper will break the concentration and lose all of the accumulated bonus.",
        category: "Combat",
        emoji: "🎯",
        costType: "feature-points",
        cost: 2
    }
];

/**
 * Helper functions to query features
 */
export function getFeatureById(id: string): Feature | undefined {
    return features.find(f => f.id === id);
}

export function getFeaturesByType(type: string): Feature[] {
    return features.filter(f => f.type === type);
}

export function getFeaturesByCategory(category: SkillCategory): Feature[] {
    return features.filter(f => f.category === category);
}

/**
 * Add racial talent features (called when racial talents are loaded from JSON)
 */
export function addRacialTalentFeatures(racialTalents: Array<{
    name: string;
    description: string;
    type?: 'Major' | 'Minor';
    cost?: number;
}>): void {
    const typeToCost: Record<string, number> = {
        'Major': 4,
        'Minor': 2
    };
    
    for (const rt of racialTalents) {
        const cost = rt.cost ?? typeToCost[rt.type || 'Minor'] ?? 2;
        features.push({
            id: `feature-${rt.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}`,
            name: rt.name,
            type: 'feature',
            description: rt.description,
            costType: 'feature-points',
            cost: cost
        });
    }
}
