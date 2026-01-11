<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { linkTokenToCharacter, unlinkToken, PartyStore, isGM } from '../services/OBRHelper';
    import OBR from "@owlbear-rodeo/sdk";
    import type { Item } from "@owlbear-rodeo/sdk";
    import { get } from 'svelte/store';

    const dispatch = createEventDispatcher();

    export let tokenId: string;

    let allTokens: Item[] = [];
    let selectedCharacter: string = '';
    let isCreature: boolean = false;
    let isSaving = false;
    let isLoading = true;

    onMount(async () => {
        await loadTokens();
        await checkCurrentLink();
        isLoading = false;
    });

    async function loadTokens() {
        try {
            if (OBR.scene && typeof OBR.scene.items.getItems === 'function') {
                allTokens = await OBR.scene.items.getItems();
            }
        } catch (e) {
            console.warn('Failed to load tokens:', e);
        }
    }

    async function checkCurrentLink() {
        try {
            // Check room metadata for existing link
            if (OBR.room && typeof OBR.room.getMetadata === 'function') {
                const metadata = await OBR.room.getMetadata();
                const links = metadata['token-character-links'] as Record<string, string | 'creature'> | undefined;
                if (links && links[tokenId]) {
                    if (links[tokenId] === 'creature') {
                        isCreature = true;
                    } else {
                        selectedCharacter = links[tokenId];
                        isCreature = false;
                    }
                }
            }
        } catch (e) {
            console.warn('Failed to check current link:', e);
        }
    }

    async function handleSave() {
        if (!get(isGM)) {
            alert('Only GMs can link tokens to characters.');
            return;
        }

        isSaving = true;
        try {
            if (isCreature) {
                await linkTokenToCharacter(tokenId, 'creature');
            } else if (selectedCharacter) {
                await linkTokenToCharacter(tokenId, selectedCharacter);
            } else {
                // Unlink if nothing selected
                await unlinkToken(tokenId);
            }
            dispatch('close');
        } catch (e) {
            console.error('Failed to save token link:', e);
            alert('Failed to save token link. Please try again.');
        } finally {
            isSaving = false;
        }
    }

    async function handleUnlink() {
        if (!get(isGM)) {
            alert('Only GMs can unlink tokens.');
            return;
        }

        isSaving = true;
        try {
            await unlinkToken(tokenId);
            selectedCharacter = '';
            isCreature = false;
            dispatch('close');
        } catch (e) {
            console.error('Failed to unlink token:', e);
            alert('Failed to unlink token. Please try again.');
        } finally {
            isSaving = false;
        }
    }

    function handleCancel() {
        dispatch('close');
    }

    function handleCreatureChange() {
        if (isCreature) {
            selectedCharacter = '';
        }
    }

    function handleCharacterChange() {
        if (selectedCharacter) {
            isCreature = false;
        }
    }

    $: currentToken = allTokens.find(t => t.id === tokenId);
</script>

<div class="modal-overlay" on:click={handleCancel}>
    <div class="modal-content" on:click|stopPropagation>
        <div class="modal-header">
            <h2>Link Token to Character</h2>
            <button class="close-button" on:click={handleCancel}>×</button>
        </div>

        {#if isLoading}
            <div class="modal-body">
                <p class="loading-text">Loading...</p>
            </div>
        {:else}
            <div class="modal-body">
                {#if currentToken}
                    <div class="token-info">
                        <p><strong>Token:</strong> {currentToken.name || 'Unnamed Token'}</p>
                        <p class="token-id">ID: {tokenId}</p>
                    </div>
                {/if}

                <div class="form-section">
                    <label>
                        <input 
                            type="radio" 
                            bind:group={isCreature} 
                            value={true}
                            on:change={handleCreatureChange}
                        />
                        <span>Creature</span>
                    </label>
                    <p class="help-text">Mark this token as a creature. Creature stats are stored in token metadata.</p>
                </div>

                <div class="form-section">
                    <label>
                        <input 
                            type="radio" 
                            bind:group={isCreature} 
                            value={false}
                            on:change={handleCharacterChange}
                        />
                        <span>Link to Player Character</span>
                    </label>
                    
                    {#if !isCreature}
                        <select 
                            bind:value={selectedCharacter}
                            class="form-select"
                        >
                            <option value="">Select a character...</option>
                            {#each $PartyStore as player}
                                <option value={player.id}>{player.name}</option>
                            {/each}
                        </select>
                        <p class="help-text">Select a player whose character sheet should be shown when this token is inspected.</p>
                    {/if}
                </div>
            </div>

            <div class="modal-footer">
                <button class="unlink-button" on:click={handleUnlink} disabled={isSaving}>
                    Unlink
                </button>
                <div class="footer-actions">
                    <button class="cancel-button" on:click={handleCancel} disabled={isSaving}>
                        Cancel
                    </button>
                    <button class="save-button" on:click={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        {/if}
    </div>
</div>

<style lang="scss">
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }

    .modal-content {
        background: rgb(var(--secondary));
        border: 2px solid rgba(var(--accent), 0.5);
        border-radius: 0.5rem;
        max-width: 500px;
        width: 100%;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-bottom: 2px solid rgba(var(--accent), 0.3);
        background: rgba(var(--accent), 0.1);

        h2 {
            margin: 0;
            color: rgb(var(--accent));
            font-size: 1.5rem;
            text-shadow: var(--shadow);
        }

        .close-button {
            background: transparent;
            border: none;
            color: rgb(var(--accent));
            font-size: 2rem;
            line-height: 1;
            cursor: pointer;
            padding: 0;
            width: 2rem;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;

            &:hover {
                transform: scale(1.1);
                color: rgba(var(--accent), 0.8);
            }
        }
    }

    .modal-body {
        padding: 1.5rem;
    }

    .loading-text {
        text-align: center;
        color: rgba(var(--primary), 0.7);
        padding: 2rem;
    }

    .token-info {
        padding: 1rem;
        background: rgba(var(--accent), 0.1);
        border-radius: 0.25rem;
        margin-bottom: 1.5rem;
        border: 1px solid rgba(var(--accent), 0.2);

        p {
            margin: 0.25rem 0;
            color: rgba(var(--primary), 0.9);
        }

        .token-id {
            font-size: 0.85rem;
            color: rgba(var(--primary), 0.6);
            font-family: monospace;
        }
    }

    .form-section {
        margin-bottom: 1.5rem;

        label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: rgb(var(--accent));
            font-weight: 600;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-size: 0.9rem;
            cursor: pointer;

            input[type="radio"] {
                cursor: pointer;
                width: 1.2rem;
                height: 1.2rem;
            }
        }

        .form-select {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid rgba(var(--accent), 0.5);
            border-radius: 0.25rem;
            background: rgba(var(--accent), 0.1);
            color: rgb(var(--primary));
            font-size: 1rem;
            font-family: inherit;
            margin-top: 0.5rem;
            cursor: pointer;

            &:focus {
                outline: none;
                border-color: rgb(var(--accent));
                background: rgba(var(--accent), 0.15);
            }

            option {
                background: rgb(var(--secondary));
                color: rgb(var(--primary));
            }
        }

        .help-text {
            font-size: 0.85rem;
            color: rgba(var(--primary), 0.6);
            margin-top: 0.5rem;
            margin-bottom: 0;
            font-style: italic;
        }
    }

    .modal-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-top: 2px solid rgba(var(--accent), 0.3);
        background: rgba(var(--accent), 0.05);
    }

    .footer-actions {
        display: flex;
        gap: 1rem;
    }

    .unlink-button,
    .cancel-button,
    .save-button {
        padding: 0.5rem 1.5rem;
        border-radius: 0.25rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }

    .unlink-button {
        border: 1px solid rgba(220, 60, 60, 0.5);
        background: rgba(220, 60, 60, 0.2);
        color: rgb(220, 60, 60);

        &:hover:not(:disabled) {
            background: rgba(220, 60, 60, 0.3);
        }
    }

    .cancel-button {
        border: 1px solid rgba(var(--accent), 0.5);
        background: transparent;
        color: rgba(var(--primary), 0.7);

        &:hover:not(:disabled) {
            background: rgba(var(--accent), 0.1);
        }
    }

    .save-button {
        border: 1px solid rgb(var(--accent));
        background: rgb(var(--accent));
        color: rgb(var(--secondary));

        &:hover:not(:disabled) {
            background: rgba(var(--accent), 0.9);
            transform: translateY(-1px);
        }
    }
</style>
