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

export interface ChatMessage {
    id: string;
    timestamp: string;
    playerName: string;
    playerId: string;
    message: string;
}

export type LogEntry = DiceRollLogEntry | ChatMessage;

export function isDiceRoll(entry: LogEntry): entry is DiceRollLogEntry {
    return 'skillName' in entry;
}

export function isChatMessage(entry: LogEntry): entry is ChatMessage {
    return 'message' in entry;
}

const initialLog: LogEntry[] = [];

// Create store that syncs with room metadata and localStorage
function createDiceRollsStore() {
    const { subscribe, set, update } = writable<LogEntry[]>(initialLog);
    let initialized = false;

    // Initialize from room metadata or localStorage
    async function initialize() {
        if (initialized) return;
        
        try {
            if (OBR.isAvailable) {
                await OBR.onReady(async () => {
                    // Try to get from room metadata first (shared across players)
                    let roomLog: LogEntry[] | undefined;
                    try {
                        if (OBR.room && typeof OBR.room.getMetadata === 'function') {
                            const roomMetadata = await OBR.room.getMetadata();
                            // Try new key first, then fall back to old key for backward compatibility
                            roomLog = (roomMetadata['dice-roll-log'] || roomMetadata['dice-rolls']) as LogEntry[] | undefined;
                        }
                    } catch (e) {
                        console.warn('OBR.room.getMetadata not available, using localStorage:', e);
                    }
                    
                    if (roomLog && Array.isArray(roomLog)) {
                        set(roomLog);
                        // Also sync to localStorage as backup
                        if (typeof window !== 'undefined' && window.localStorage) {
                            localStorage.setItem('star-trek-dice-roll-log', JSON.stringify(roomLog));
                        }
                        // Clean up old key if it exists
                        try {
                            if (OBR.room && typeof OBR.room.setMetadata === 'function') {
                                const roomMetadata = await OBR.room.getMetadata();
                                if (roomMetadata['dice-rolls'] && !roomMetadata['dice-roll-log']) {
                                    await OBR.room.setMetadata({ 'dice-rolls': undefined });
                                }
                            }
                        } catch (e) {
                            // Ignore cleanup errors
                        }
                    } else {
                        // Fall back to localStorage - check both old and new keys
                        if (typeof window !== 'undefined' && window.localStorage) {
                            let stored = localStorage.getItem('star-trek-dice-roll-log');
                            if (!stored) {
                                // Try old key for backward compatibility
                                stored = localStorage.getItem('star-trek-dice-rolls');
                                if (stored) {
                                    // Migrate to new key
                                    localStorage.setItem('star-trek-dice-roll-log', stored);
                                    localStorage.removeItem('star-trek-dice-rolls');
                                }
                            }
                            
                            if (stored) {
                                try {
                                    const parsed = JSON.parse(stored);
                                    if (Array.isArray(parsed)) {
                                        set(parsed);
                                        // Sync to room metadata if available
                                        try {
                                            if (OBR.room && typeof OBR.room.setMetadata === 'function') {
                                                await OBR.room.setMetadata({ 'dice-roll-log': parsed });
                                            }
                                        } catch (e) {
                                            console.warn('OBR.room.setMetadata not available:', e);
                                        }
                                    }
                                } catch (e) {
                                    console.warn('Failed to parse localStorage dice roll log:', e);
                                }
                            }
                        }
                    }

                    // Subscribe to room metadata changes to sync across players
                    try {
                        if (OBR.room && typeof OBR.room.onMetadataChange === 'function') {
                            OBR.room.onMetadataChange((metadata) => {
                                // Check for new key first, then old key for backward compatibility
                                const log = (metadata['dice-roll-log'] || metadata['dice-rolls']) as LogEntry[] | undefined;
                                if (log && Array.isArray(log)) {
                                    set(log);
                                    // Sync to localStorage
                                    if (typeof window !== 'undefined' && window.localStorage) {
                                        localStorage.setItem('star-trek-dice-roll-log', JSON.stringify(log));
                                        // Remove old key if it exists
                                        if (localStorage.getItem('star-trek-dice-rolls')) {
                                            localStorage.removeItem('star-trek-dice-rolls');
                                        }
                                    }
                                }
                            });
                        }
                    } catch (e) {
                        console.warn('OBR.room.onMetadataChange not available:', e);
                    }

                    initialized = true;
                });
            } else {
                // Not in Owlbear Rodeo, just use localStorage
                if (typeof window !== 'undefined' && window.localStorage) {
                    let stored = localStorage.getItem('star-trek-dice-roll-log');
                    if (!stored) {
                        // Try old key for backward compatibility
                        stored = localStorage.getItem('star-trek-dice-rolls');
                        if (stored) {
                            // Migrate to new key
                            localStorage.setItem('star-trek-dice-roll-log', stored);
                            localStorage.removeItem('star-trek-dice-rolls');
                        }
                    }
                    if (stored) {
                        try {
                            const parsed = JSON.parse(stored);
                            if (Array.isArray(parsed)) {
                                set(parsed);
                            }
                        } catch (e) {
                            console.warn('Failed to parse localStorage dice roll log:', e);
                        }
                    }
                }
                initialized = true;
            }
        } catch (e) {
            console.warn('Failed to initialize dice roll log store:', e);
            initialized = true;
        }
    }

    // Sync updates to both room metadata and localStorage
    async function syncLog(log: LogEntry[]) {
        // Update localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('star-trek-dice-roll-log', JSON.stringify(log));
            // Remove old key if it exists
            if (localStorage.getItem('star-trek-dice-rolls')) {
                localStorage.removeItem('star-trek-dice-rolls');
            }
        }

        // Update room metadata if available
        if (OBR.isAvailable) {
            try {
                await OBR.onReady(async () => {
                    if (OBR.room && typeof OBR.room.setMetadata === 'function') {
                        // Get current metadata to clean up old key
                        try {
                            const currentMetadata = await OBR.room.getMetadata();
                            const metadataUpdate: any = { 'dice-roll-log': log };
                            // Remove old key if it exists
                            if (currentMetadata && 'dice-rolls' in currentMetadata) {
                                metadataUpdate['dice-rolls'] = undefined;
                            }
                            await OBR.room.setMetadata(metadataUpdate);
                        } catch (e) {
                            // If getMetadata fails, just set the new key
                            await OBR.room.setMetadata({ 'dice-roll-log': log });
                        }
                    }
                });
            } catch (e) {
                console.warn('Failed to sync dice roll log to room metadata:', e);
            }
        }
    }

    return {
        subscribe,
        set: async (value: LogEntry[]) => {
            set(value);
            await syncLog(value);
        },
        update: (fn: (value: LogEntry[]) => LogEntry[]) => {
            update((current) => {
                const updated = fn(current);
                syncLog(updated).catch(e => console.warn('Failed to sync log:', e));
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

            update((log) => {
                const updated = [...log, newEntry];
                syncLog(updated).catch(e => console.warn('Failed to sync log:', e));
                return updated;
            });
        },
        addChatMessage: (message: string) => {
            const playerName = get(currentPlayerName) || 'Unknown Player';
            const playerId = get(currentPlayerId) || 'unknown';
            const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const timestamp = new Date().toISOString();
            const newMessage: ChatMessage = {
                id,
                timestamp,
                playerName,
                playerId,
                message
            };

            update((log) => {
                const updated = [...log, newMessage];
                syncLog(updated).catch(e => console.warn('Failed to sync log:', e));
                return updated;
            });
        },
        clearLog: async () => {
            set([]);
            await syncLog([]);
        },
        initialize
    };
}

export const diceRolls = createDiceRollsStore();
