import { writable, get } from 'svelte/store';
import OBR from "@owlbear-rodeo/sdk";
import { currentPlayerName, currentPlayerId } from '../services/OBRHelper';

export interface DiceRollLogEntry {
    id: string;
    timestamp: string;
    playerName: string;
    playerId: string;
    skillName: string;
    die1: number;
    die2: number;
    modifier: number;
    targetNumber: number;
    total: number;
    isSuccess: boolean;
}

const initialRolls: DiceRollLogEntry[] = [];

// Create store that syncs with scene metadata and localStorage
function createDiceRollsStore() {
    const { subscribe, set, update } = writable<DiceRollLogEntry[]>(initialRolls);
    let initialized = false;

    // Initialize from scene metadata or localStorage
    async function initialize() {
        if (initialized) return;
        
        try {
            if (OBR.isAvailable) {
                await OBR.onReady(async () => {
                    // Try to get from scene metadata first (shared across players)
                    let sceneRolls: DiceRollLogEntry[] | undefined;
                    try {
                        if (OBR.scene && typeof OBR.scene.getMetadata === 'function') {
                            const sceneMetadata = await OBR.scene.getMetadata();
                            sceneRolls = sceneMetadata['dice-rolls'] as DiceRollLogEntry[] | undefined;
                        }
                    } catch (e) {
                        console.warn('OBR.scene.getMetadata not available, using localStorage:', e);
                    }
                    
                    if (sceneRolls && Array.isArray(sceneRolls)) {
                        set(sceneRolls);
                        // Also sync to localStorage as backup
                        if (typeof window !== 'undefined' && window.localStorage) {
                            localStorage.setItem('star-trek-dice-rolls', JSON.stringify(sceneRolls));
                        }
                    } else {
                        // Fall back to localStorage
                        if (typeof window !== 'undefined' && window.localStorage) {
                            const stored = localStorage.getItem('star-trek-dice-rolls');
                            if (stored) {
                                try {
                                    const parsed = JSON.parse(stored);
                                    if (Array.isArray(parsed)) {
                                        set(parsed);
                                        // Sync to scene metadata if available
                                        try {
                                            if (OBR.scene && typeof OBR.scene.setMetadata === 'function') {
                                                await OBR.scene.setMetadata({ 'dice-rolls': parsed });
                                            }
                                        } catch (e) {
                                            console.warn('OBR.scene.setMetadata not available:', e);
                                        }
                                    }
                                } catch (e) {
                                    console.warn('Failed to parse localStorage dice rolls:', e);
                                }
                            }
                        }
                    }

                    // Subscribe to scene metadata changes to sync across players
                    try {
                        if (OBR.scene && typeof OBR.scene.onMetadataChange === 'function') {
                            OBR.scene.onMetadataChange((metadata) => {
                                const rolls = metadata['dice-rolls'] as DiceRollLogEntry[] | undefined;
                                if (rolls && Array.isArray(rolls)) {
                                    set(rolls);
                                    // Sync to localStorage
                                    if (typeof window !== 'undefined' && window.localStorage) {
                                        localStorage.setItem('star-trek-dice-rolls', JSON.stringify(rolls));
                                    }
                                }
                            });
                        }
                    } catch (e) {
                        console.warn('OBR.scene.onMetadataChange not available:', e);
                    }

                    initialized = true;
                });
            } else {
                // Not in Owlbear Rodeo, just use localStorage
                if (typeof window !== 'undefined' && window.localStorage) {
                    const stored = localStorage.getItem('star-trek-dice-rolls');
                    if (stored) {
                        try {
                            const parsed = JSON.parse(stored);
                            if (Array.isArray(parsed)) {
                                set(parsed);
                            }
                        } catch (e) {
                            console.warn('Failed to parse localStorage dice rolls:', e);
                        }
                    }
                }
                initialized = true;
            }
        } catch (e) {
            console.warn('Failed to initialize dice rolls store:', e);
            initialized = true;
        }
    }

    // Sync updates to both scene metadata and localStorage
    async function syncRolls(rolls: DiceRollLogEntry[]) {
        // Update localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('star-trek-dice-rolls', JSON.stringify(rolls));
        }

        // Update scene metadata if available
        if (OBR.isAvailable) {
            try {
                await OBR.onReady(async () => {
                    if (OBR.scene && typeof OBR.scene.setMetadata === 'function') {
                        await OBR.scene.setMetadata({ 'dice-rolls': rolls });
                    }
                });
            } catch (e) {
                console.warn('Failed to sync dice rolls to scene metadata:', e);
            }
        }
    }

    return {
        subscribe,
        set: async (value: DiceRollLogEntry[]) => {
            set(value);
            await syncRolls(value);
        },
        update: (fn: (value: DiceRollLogEntry[]) => DiceRollLogEntry[]) => {
            update((current) => {
                const updated = fn(current);
                syncRolls(updated).catch(e => console.warn('Failed to sync rolls:', e));
                return updated;
            });
        },
        addRoll: (entry: Omit<DiceRollLogEntry, 'id' | 'timestamp'>) => {
            const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const timestamp = new Date().toISOString();
            const newEntry: DiceRollLogEntry = {
                ...entry,
                id,
                timestamp
            };

            update((rolls) => {
                const updated = [...rolls, newEntry];
                syncRolls(updated).catch(e => console.warn('Failed to sync rolls:', e));
                return updated;
            });
        },
        clearRolls: async () => {
            set([]);
            await syncRolls([]);
        },
        initialize
    };
}

export const diceRolls = createDiceRollsStore();
