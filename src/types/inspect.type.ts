export interface CreatureStats {
    name: string;
    characteristics: {
        SKILL?: string; // Format: "initial/current" or just number (treated as current/current)
        STAMINA?: string; // Format: "initial/current" or just number (treated as current/current)
        LUCK?: string; // Format: "initial/current" or just number (treated as current/current)
        PSIONICS?: string; // Format: "initial/current" or just number (treated as current/current)
        PSI_POINTS?: string; // Format: "initial/current" or just number (treated as current/current)
    };
    specialSkills?: Array<{name: string, rank: number}>;
    talents?: Array<{name: string, description?: string}>;
    notes?: string;
}

export interface InspectData {
    type: 'player' | 'creature' | 'unlinked';
    data?: any; // AFFSheet for players, CreatureStats for creatures
    tokenId?: string;
    playerId?: string; // For player characters
}
