import OBR from "@owlbear-rodeo/sdk";
import type { Player, Item } from "@owlbear-rodeo/sdk";
import { sheet } from '../stores'
import type { CreatureStats, InspectData } from '../types/inspect.type';

import { writable, get } from "svelte/store";

let initViewingSheet:any = {
  id: 0,
  name: "",
  notes: "",
  sections: [
    {
      id:0,
      name: "",
      stats: [
        {id: 0, name: "", value: ""}
      ]
    }
  ]
};

export const isGM = writable(false);
export const PartyStore = writable<Player[]>([]);
export const currentPlayerName = writable<string>("");
export const currentPlayerId = writable<string>("");
export const viewingPlayerId = writable<string>("");
export const ViewingSheet = writable(initViewingSheet);

// Token selection and inspection
export const selectedTokenId = writable<string | null>(null);
export const tokenToCharacterMapping = writable<Record<string, string | 'creature'>>({});


export async function init() {
  OBR.onReady(async () => {
    PartyStore.set(await OBR.party.getPlayers());
    currentPlayerName.set(await OBR.player.getName());
    currentPlayerId.set(await OBR.player.getId());
    viewingPlayerId.set(await OBR.player.getId());
    isGM.set((await OBR.player.getRole()) === "GM");
    if (get(isGM)) {
      initGM();
    } else {
      initPlayer();
    }
    // Initialize room metadata listener FIRST so it's ready when context menu sets metadata
    initRoomMetadataListener();
    initContextMenu();
    initTokenSelection();
    initTokenCharacterMapping();
  });
  OBR.player.onChange((player) => {
    currentPlayerName.set(player.name);
    currentPlayerId.set(player.id);
  });
}

// Initialize GM
async function initGM() {
  OBR.party.onChange((party) => {
    PartyStore.set(party);
  });

  PartyStore.subscribe((party) => {
    const vId = get(viewingPlayerId);
    for (const p of party){
      if (p.id === vId) {
        ViewingSheet.set(p.metadata.affsheet)
      }
    }
  });

  viewingPlayerId.subscribe((vId) => {
    const cId = get(currentPlayerId);
    const ps = get(PartyStore);
    const s = get(sheet);
    if (vId === cId){
      ViewingSheet.set(s);
    } else {
      const vs = ps.find(x => x.id === vId).metadata.affsheet;
      ViewingSheet.set(vs);
    }
  });
  
}

async function initPlayer() {
  sheet.subscribe(function(sheet){
    OBR.player.onChange((player) => {
      const vId = get(viewingPlayerId)
      player.metadata["affsheet"] = sheet;
    });
    OBR.player.setMetadata({affsheet: sheet});
  });
}

// Initialize token selection tracking
// NOTE: Scene API polling removed - it doesn't work in popovers and conflicts with context menu selections
// Token selection is now handled exclusively via:
// 1. Context menu action (primary method)
// 2. Manual token ID input (fallback)
// 3. Room metadata listener (reads context menu selections)
async function initTokenSelection() {
  // Scene API polling removed - not needed and causes issues in popovers
  // All token selection is handled via context menu + room metadata now
  console.log('Token selection uses context menu + room metadata (scene API polling disabled for popovers)');
}

// Initialize context menu action for inspecting tokens
async function initContextMenu() {
  try {
    await OBR.onReady(async () => {
      if (!OBR.contextMenu || typeof OBR.contextMenu.create !== 'function') {
        console.warn('Context menu API not available');
        return;
      }

      await OBR.contextMenu.create({
        id: 'star-trek-inspect-token',
        icons: [
          {
            icon: '/star-trek-character-sheet/icon.svg',
            label: 'Inspect Token',
            filter: {
              every: [{ key: 'type', value: 'IMAGE' }]
            }
          }
        ],
        onClick: async (context) => {
          try {
            if (context.items.length > 0) {
              const tokenId = context.items[0].id;
            // Store selected token ID in room metadata for popover to read
            // Use partial update pattern - API automatically merges
            if (OBR.room && typeof OBR.room.setMetadata === 'function') {
              await OBR.room.setMetadata({
                'selected-token-id': tokenId
              });
            }
              // Also set directly in store for immediate feedback
              selectedTokenId.set(tokenId);
            }
          } catch (e) {
            console.warn('Failed to set selected token in context menu:', e);
          }
        }
      });
    });
  } catch (e) {
    console.warn('Context menu initialization failed:', e);
  }
}

// Initialize room metadata listener for selected token ID
async function initRoomMetadataListener() {
  try {
    await OBR.onReady(async () => {
      if (!OBR.room || typeof OBR.room.getMetadata !== 'function') {
        console.warn('Room metadata API not available');
        return;
      }

      // Read initial selected token ID
      try {
        const roomMetadata = await OBR.room.getMetadata();
        const selectedId = roomMetadata['selected-token-id'] as string | undefined;
        if (selectedId) {
          selectedTokenId.set(selectedId);
        }
      } catch (e) {
        console.debug('Could not read initial selected token ID:', e);
      }

      // Listen for changes to selected token ID
      if (OBR.room.onMetadataChange) {
        OBR.room.onMetadataChange((metadata) => {
          const selectedId = metadata['selected-token-id'] as string | undefined;
          if (selectedId) {
            const current = get(selectedTokenId);
            if (current !== selectedId) {
              selectedTokenId.set(selectedId);
            }
          }
          // IMPORTANT: We NEVER clear selectedTokenId when metadata is cleared/undefined
          // This preserves context menu selections even if room metadata is cleared by other operations
          // The selectedTokenId will only be cleared when:
          // 1. Scene API finds a different selection
          // 2. User explicitly clears it via handleClearManualToken
          // This ensures context menu selections persist
        });
      }
    });
  } catch (e) {
    console.warn('Room metadata listener initialization failed:', e);
  }
}

// Initialize token-to-character mapping from room metadata
async function initTokenCharacterMapping() {
  try {
    if (OBR.room && typeof OBR.room.getMetadata === 'function') {
      const roomMetadata = await OBR.room.getMetadata();
      const links = roomMetadata['token-character-links'] as Record<string, string | 'creature'> | undefined;
      if (links) {
        tokenToCharacterMapping.set(links);
      }
      
      // Subscribe to metadata changes
      if (OBR.room.onMetadataChange) {
        OBR.room.onMetadataChange((metadata) => {
          const newLinks = metadata['token-character-links'] as Record<string, string | 'creature'> | undefined;
          if (newLinks) {
            tokenToCharacterMapping.set(newLinks);
          } else {
            tokenToCharacterMapping.set({});
          }
        });
      }
    }
  } catch (e) {
    console.warn('Token character mapping initialization failed:', e);
  }
}

// Get inspect data for a token (player sheet or creature stats)
export async function getInspectData(tokenId: string): Promise<InspectData | null> {
  try {
    if (!OBR.isAvailable) {
      console.warn('OBR not available - cannot get inspect data');
      return null;
    }

    // First check mapping - this works even without scene API
    const mapping = get(tokenToCharacterMapping);
    const link = mapping[tokenId];
    
    // Check if token is linked to a player character (this doesn't require scene API)
    if (link && link !== 'creature') {
      const party = get(PartyStore);
      const player = party.find(p => p.id === link);
      if (player && player.metadata?.affsheet) {
        return {
          type: 'player',
          data: player.metadata.affsheet,
          tokenId,
          playerId: link
        };
      }
    }

    // For creatures and checking token existence, we need scene API
    // Ensure OBR is ready before accessing scene
    await OBR.onReady(async () => {
      // OBR is ready
    });

    if (!OBR.scene || typeof OBR.scene.items.getItems !== 'function') {
      console.warn('Scene API not available - checking room metadata for creature stats (popover context).');
      // If we have a link marked as 'creature', check room metadata
      if (link === 'creature' && OBR.room && typeof OBR.room.getMetadata === 'function') {
        try {
          const roomMetadata = await OBR.room.getMetadata();
          const creatureStatsMap = roomMetadata['creature-stats'] as Record<string, CreatureStats> | undefined;
          if (creatureStatsMap && creatureStatsMap[tokenId]) {
            return {
              type: 'creature',
              data: creatureStatsMap[tokenId],
              tokenId
            };
          }
        } catch (e) {
          console.debug('Could not check room metadata for creature stats:', e);
        }
      }
      // No creature stats found, return unlinked
      return {
        type: 'unlinked',
        tokenId
      };
    }

    const items = await OBR.scene.items.getItems();
    const item = items.find(i => i.id === tokenId);
    if (!item) {
      // Token doesn't exist on scene
      return {
        type: 'unlinked',
        tokenId
      };
    }
    
    // Check if token has creature stats in metadata (from scene API)
    const creatureStats = item.metadata?.['star-trek-creature-stats'] as CreatureStats | undefined;
    if (creatureStats) {
      return {
        type: 'creature',
        data: creatureStats,
        tokenId
      };
    }
    
    // Token exists but has no character link or creature stats in token metadata
    // Check room metadata for creature stats (popover fallback)
    if (OBR.room && typeof OBR.room.getMetadata === 'function') {
      try {
        const roomMetadata = await OBR.room.getMetadata();
        const creatureStatsMap = roomMetadata['creature-stats'] as Record<string, CreatureStats> | undefined;
        if (creatureStatsMap && creatureStatsMap[tokenId]) {
          return {
            type: 'creature',
            data: creatureStatsMap[tokenId],
            tokenId
          };
        }
      } catch (e) {
        console.debug('Could not check room metadata for creature stats:', e);
      }
    }
    
    // Token exists but has no character link or creature stats
    return {
      type: 'unlinked',
      tokenId
    };
  } catch (e) {
    console.warn('Failed to get inspect data:', e);
    return null;
  }
}

// Link a token to a character (GM only)
export async function linkTokenToCharacter(tokenId: string, playerId: string | 'creature'): Promise<void> {
  try {
    if (!get(isGM)) {
      throw new Error('Only GMs can link tokens to characters');
    }
    
    const currentMapping = get(tokenToCharacterMapping);
    const newMapping = {
      ...currentMapping,
      [tokenId]: playerId
    };
    
    tokenToCharacterMapping.set(newMapping);
    
    // Save to room metadata
    // IMPORTANT: Preserve 'selected-token-id' when updating metadata to prevent clearing context menu selections
    // Use partial update pattern - API automatically merges
    if (OBR.room && typeof OBR.room.setMetadata === 'function') {
      const currentMetadata = await OBR.room.getMetadata() || {};
      const preservedSelectedTokenId = currentMetadata?.['selected-token-id'];
      
      // Build partial update object - API will merge automatically
      const metadataUpdate: any = {
        'token-character-links': newMapping
      };
      
      // Only include selected-token-id if it exists (preserve it)
      if (preservedSelectedTokenId) {
        metadataUpdate['selected-token-id'] = preservedSelectedTokenId;
      }
      
      await OBR.room.setMetadata(metadataUpdate);
    }
  } catch (e) {
    console.warn('Failed to link token to character:', e);
    throw e;
  }
}

// Unlink a token from any character
export async function unlinkToken(tokenId: string): Promise<void> {
  try {
    if (!get(isGM)) {
      throw new Error('Only GMs can unlink tokens');
    }
    
    const currentMapping = get(tokenToCharacterMapping);
    const { [tokenId]: removed, ...newMapping } = currentMapping;
    
    tokenToCharacterMapping.set(newMapping);
    
    // Save to room metadata
    // IMPORTANT: Preserve 'selected-token-id' when updating metadata to prevent clearing context menu selections
    // Use partial update pattern - API automatically merges
    if (OBR.room && typeof OBR.room.setMetadata === 'function') {
      const currentMetadata = await OBR.room.getMetadata() || {};
      const preservedSelectedTokenId = currentMetadata?.['selected-token-id'];
      
      // Build partial update object - API will merge automatically
      const metadataUpdate: any = {
        'token-character-links': newMapping
      };
      
      // Only include selected-token-id if it exists (preserve it)
      if (preservedSelectedTokenId) {
        metadataUpdate['selected-token-id'] = preservedSelectedTokenId;
      }
      
      await OBR.room.setMetadata(metadataUpdate);
    }
  } catch (e) {
    console.warn('Failed to unlink token:', e);
    throw e;
  }
}

// Get token metadata
export async function getTokenMetadata(tokenId: string): Promise<CreatureStats | null> {
  try {
    if (!OBR.isAvailable) {
      return null;
    }

    // Wait for OBR to be ready (onReady takes a callback, not a promise)
    await new Promise<void>((resolve) => {
      OBR.onReady(() => {
        resolve();
      });
    });

    if (!OBR.scene || typeof OBR.scene.items.getItems !== 'function') {
      return null;
    }

    const items = await OBR.scene.items.getItems();
    const item = items.find(i => i.id === tokenId);
    if (!item) return null;
    
    const creatureStats = item.metadata?.['star-trek-creature-stats'] as CreatureStats | undefined;
    return creatureStats || null;
  } catch (e) {
    console.warn('Failed to get token metadata:', e);
    return null;
  }
}

// Update creature stats on a token
// Since popovers don't have scene API access, we store stats in room metadata
// This allows creature stats to work from the popover context
export async function updateCreatureStats(tokenId: string, creatureStats: CreatureStats): Promise<void> {
  try {
    if (!tokenId || typeof tokenId !== 'string' || tokenId.trim() === '') {
      throw new Error('Invalid token ID provided');
    }

    if (!get(isGM)) {
      throw new Error('Only GMs can update creature stats');
    }

    if (!OBR.isAvailable) {
      throw new Error('OBR not available');
    }

    // Wait for OBR to be ready (onReady takes a callback, not a promise)
    await new Promise<void>((resolve) => {
      OBR.onReady(() => {
        resolve();
      });
    });

    // Always store in room metadata (accessible from popovers)
    if (OBR.room && typeof OBR.room.setMetadata === 'function') {
      try {
        const currentMetadata = await OBR.room.getMetadata() || {};
        const creatureStatsMap = (currentMetadata['creature-stats'] as Record<string, CreatureStats> | undefined) ?? {};
        
        // Update the creature stats map
        const newCreatureStatsMap = {
          ...creatureStatsMap,
          [tokenId]: creatureStats
        };
        
        // Validate that the data is JSON-serializable (room metadata must be serializable)
        try {
          JSON.stringify(newCreatureStatsMap);
        } catch (serializeError) {
          throw new Error(`Creature stats not serializable: ${serializeError instanceof Error ? serializeError.message : String(serializeError)}`);
        }
        
        // Preserve selected-token-id when updating metadata
        const preservedSelectedTokenId = currentMetadata?.['selected-token-id'];
        
        // Build partial update object - API will merge automatically
        // According to docs: "A partial update to this room's metadata. The included values 
        // will be spread among the current metadata to avoid overriding other values."
        const metadataUpdate: any = {
          'creature-stats': newCreatureStatsMap
        };
        
        // Only include selected-token-id if it exists (preserve it)
        if (preservedSelectedTokenId) {
          metadataUpdate['selected-token-id'] = preservedSelectedTokenId;
        }
        
        // Check size (room metadata must be under 16KB total)
        const updateSize = JSON.stringify(metadataUpdate).length;
        if (updateSize > 15000) { // Leave some margin
          throw new Error(`Room metadata update too large: ${updateSize} bytes (limit: 16KB)`);
        }
        
        // setMetadata automatically merges with existing metadata
        await OBR.room.setMetadata(metadataUpdate);
      } catch (metadataError) {
        console.error('Error saving creature stats to room metadata:', metadataError);
        throw new Error(`Failed to save to room metadata: ${metadataError instanceof Error ? metadataError.message : String(metadataError)}`);
      }
    } else {
      throw new Error('Room API not available - cannot save creature stats');
    }

    // Try to also update token metadata if scene API is available (better for persistence)
    // This is a best-effort - if it fails, we still have it in room metadata
    if (OBR.scene && typeof OBR.scene.items.updateItems === 'function') {
      try {
        await OBR.scene.items.updateItems([tokenId], (items) => {
          items.forEach((item) => {
            item.metadata = {
              ...item.metadata,
              'star-trek-creature-stats': creatureStats
            };
          });
        });
      } catch (sceneError) {
        // Scene API failed, but we already saved to room metadata, so just log
        console.debug('Scene API update failed (using room metadata instead):', sceneError);
      }
    }
    
    // Also update the mapping to mark this as a creature if not already
    // Do this separately so if it fails, we still have the creature stats saved
    try {
      const mapping = get(tokenToCharacterMapping);
      if (mapping[tokenId] !== 'creature') {
        await linkTokenToCharacter(tokenId, 'creature');
      }
    } catch (linkError) {
      // Link failed but stats are already saved, so just log
      console.warn('Failed to link token as creature (stats already saved):', linkError);
    }
  } catch (e) {
    console.error('Failed to update creature stats:', e);
    if (e instanceof Error) {
      console.error('Error message:', e.message);
      console.error('Error stack:', e.stack);
    }
    throw e;
  }
}