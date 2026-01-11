<script lang="ts">
    import { onMount } from 'svelte';
    import OBR from '@owlbear-rodeo/sdk';
    import { selectedTokenId, isGM, getInspectData, PartyStore } from '../services/OBRHelper';
    import type { InspectData, CreatureStats } from '../types/inspect.type';
    import type { AFFSheet } from '../types/sheet.type';
    import TokenLinkConfig from './TokenLinkConfig.svelte';
    import CreatureStatEditor from './CreatureStatEditor.svelte';

    let inspectData: InspectData | null = null;
    let showLinkConfig = false;
    let showCreatureEditor = false;
    let isLoading = false;
    let lastLoadedTokenId: string | null = null;
    let manualTokenId = '';
    let tokenImageUrl: string | null = null;

    // Reactive update when token selection changes (automatic or manual)
    $: {
        const currentTokenId = $selectedTokenId || manualTokenId || null;
        if (currentTokenId !== lastLoadedTokenId) {
            if (currentTokenId) {
                lastLoadedTokenId = currentTokenId;
                loadInspectData(currentTokenId);
            } else {
                lastLoadedTokenId = null;
                inspectData = null;
                tokenImageUrl = null;
                isLoading = false;
            }
        }
    }

    // Also clear manual token when automatic selection changes (but only if different)
    $: if ($selectedTokenId && manualTokenId && $selectedTokenId !== manualTokenId && !manualTokenId.includes($selectedTokenId)) {
        manualTokenId = '';
    }

    async function loadInspectData(tokenId: string) {
        // Prevent duplicate loads
        if (isLoading && lastLoadedTokenId === tokenId) {
            return;
        }
        
        isLoading = true;
        try {
            const data = await getInspectData(tokenId);
            // Only update if we're still loading the same token
            if (lastLoadedTokenId === tokenId) {
                inspectData = data;
            }
            
            // Load token image
            await loadTokenImage(tokenId);
        } catch (e) {
            console.warn('Failed to load inspect data:', e);
            if (lastLoadedTokenId === tokenId) {
                inspectData = null;
                tokenImageUrl = null;
            }
        } finally {
            if (lastLoadedTokenId === tokenId) {
                isLoading = false;
            }
        }
    }

    async function loadTokenImage(tokenId: string) {
        try {
            // Wait for OBR to be ready
            await new Promise<void>((resolve) => {
                OBR.onReady(() => {
                    resolve();
                });
            });

            // Check if scene API is available
            if (OBR.scene && typeof OBR.scene.items.getItems === 'function') {
                const items = await OBR.scene.items.getItems();
                const item = items.find(i => i.id === tokenId);
                if (item) {
                    // OBR items have an image property that may be an object with url, or a string
                    // Try different possible structures
                    if (item.image) {
                        if (typeof item.image === 'string') {
                            // Direct URL string
                            tokenImageUrl = item.image;
                        } else if (item.image.url) {
                            // Object with url property - convert using OBR.url if available
                            if (OBR.url && typeof OBR.url === 'function') {
                                tokenImageUrl = await OBR.url(item.image.url);
                            } else {
                                tokenImageUrl = item.image.url;
                            }
                        } else if (item.image.src) {
                            // Alternative property name
                            if (OBR.url && typeof OBR.url === 'function') {
                                tokenImageUrl = await OBR.url(item.image.src);
                            } else {
                                tokenImageUrl = item.image.src;
                            }
                        } else {
                            tokenImageUrl = null;
                        }
                    } else {
                        tokenImageUrl = null;
                    }
                } else {
                    tokenImageUrl = null;
                }
            } else {
                // Scene API not available (popover context) - set to null
                tokenImageUrl = null;
            }
        } catch (e) {
            console.warn('Failed to load token image:', e);
            tokenImageUrl = null;
        }
    }

    function handleLinkClick() {
        showLinkConfig = true;
    }

    function handleEditCreature() {
        showCreatureEditor = true;
    }

    function handleLinkConfigClose() {
        showLinkConfig = false;
        // Reload inspect data if token is still selected
        const currentTokenId = $selectedTokenId || manualTokenId;
        if (currentTokenId) {
            loadInspectData(currentTokenId);
        }
    }

    function handleCreatureEditorClose() {
        showCreatureEditor = false;
        // Reload inspect data if token is still selected
        const currentTokenId = $selectedTokenId || manualTokenId;
        if (currentTokenId) {
            loadInspectData(currentTokenId);
        }
    }

    function handleManualTokenSubmit() {
        if (manualTokenId.trim()) {
            // Manually set the selected token ID
            selectedTokenId.set(manualTokenId.trim());
            // The reactive statement will handle loading the data
        }
    }

    function handleClearManualToken() {
        manualTokenId = '';
        selectedTokenId.set(null);
        inspectData = null;
        lastLoadedTokenId = null;
    }

    // Helper function to parse initial/current from value
    function parseValue(value: string) {
        const parts = value.split('/');
        return {
            initial: parts[0]?.trim() || '0',
            current: parts[1]?.trim() || parts[0]?.trim() || '0'
        };
    }

    // Get characteristics from sheet
    function getCharacteristics(sheet: any): Array<{name: string, initial: string, current: string}> {
        if (!sheet || !sheet.sections) return [];
        const characteristicsSection = sheet.sections.find((s: any) => s.name === "Characteristics");
        if (!characteristicsSection) return [];
        
        return characteristicsSection.stats.map((stat: any) => {
            const parsed = parseValue(stat.value || '0/0');
            return {
                name: stat.name,
                initial: parsed.initial,
                current: parsed.current
            };
        });
    }

    // Get special skills with ranks > 0 from sheet
    function getSpecialSkillsWithRanks(sheet: any): Record<string, Array<{name: string, rank: number}>> {
        if (!sheet || !sheet.sections) return {};
        const skillCategories = [
            "Combat Special Skills",
            "Movement Special Skills",
            "Stealth Special Skills",
            "Knowledge Special Skills",
            "Science Special Skills",
            "Psionic Special Skills"
        ];
        
        const skillsByCategory: Record<string, Array<{name: string, rank: number}>> = {};
        
        skillCategories.forEach(categoryName => {
            const section = sheet.sections.find((s: any) => s.name === categoryName);
            if (section && section.stats) {
                const skills = section.stats
                    .map((stat: any) => {
                        const rank = parseInt(stat.value || '0', 10);
                        return { name: stat.name, rank };
                    })
                    .filter((skill: any) => skill.rank > 0);
                
                if (skills.length > 0) {
                    skillsByCategory[categoryName] = skills;
                }
            }
        });
        
        return skillsByCategory;
    }

    // Get talents from sheet
    function getTalents(sheet: any): Array<{name: string, type: string, description: string}> {
        if (!sheet || !sheet.sections) return [];
        const talentsSection = sheet.sections.find((s: any) => s.name && s.name.trim() === "Talents");
        if (!talentsSection || !talentsSection.stats) return [];
        
        return talentsSection.stats.map((stat: any) => {
            try {
                const data = JSON.parse(stat.value);
                return {
                    name: stat.name,
                    type: data.type || 'Unknown',
                    description: data.description || ''
                };
            } catch {
                return {
                    name: stat.name,
                    type: 'Unknown',
                    description: stat.value || ''
                };
            }
        });
    }
</script>

<div class="inspect-view">
    {#if isLoading}
        <div class="loading-state">
            <p>Loading...</p>
        </div>
    {:else if !$selectedTokenId && !manualTokenId}
        <div class="empty-state">
            <p>No token selected.</p>
            <p class="help-text">
                To inspect a token:
            </p>
            <ul class="instructions-list">
                <li>Right-click on a token and select "Inspect Token" from the context menu (recommended)</li>
                <li>Or enter a token ID manually below</li>
            </ul>
            <div class="manual-token-input">
                <label for="token-id-input">Token ID (manual):</label>
                <input 
                    id="token-id-input"
                    type="text" 
                    bind:value={manualTokenId}
                    placeholder="Enter token ID..."
                    on:keydown={(e) => {
                        if (e.key === 'Enter') {
                            handleManualTokenSubmit();
                        }
                    }}
                />
                <button class="inspect-button" on:click={handleManualTokenSubmit}>
                    Inspect
                </button>
            </div>
        </div>
    {:else if !inspectData || inspectData.type === 'unlinked'}
        <div class="empty-state">
            {#if tokenImageUrl}
                <div class="token-image-container">
                    <img src={tokenImageUrl} alt="Token" class="token-image" />
                </div>
            {/if}
            <p>Token selected, but no character data found.</p>
            <div class="token-id-display">
                <span class="token-id-label">Token ID:</span>
                <span class="token-id-value">{$selectedTokenId || manualTokenId}</span>
                {#if manualTokenId}
                    <button class="clear-button" on:click={handleClearManualToken} title="Clear manual token">
                        ×
                    </button>
                {/if}
            </div>
            <p class="help-text">
                This token is not linked to a character. {#if $isGM}You can link it to a player character or create creature stats.{:else}Ask your GM to link this token to a character.{/if}
            </p>
            {#if $isGM}
                <div class="empty-state-actions">
                    <button class="link-button" on:click={handleLinkClick}>
                        Link to Character
                    </button>
                    <button class="edit-button" on:click={handleEditCreature}>
                        Create Creature Stats
                    </button>
                </div>
            {/if}
        </div>
    {:else if inspectData.type === 'player' && inspectData.data}
        {#if inspectData.data}
            {@const sheet = inspectData.data}
            {@const characteristics = getCharacteristics(sheet)}
            {@const specialSkills = getSpecialSkillsWithRanks(sheet)}
            {@const talents = getTalents(sheet)}
            
            <div class="inspect-content">
            {#if tokenImageUrl}
                <div class="token-image-container">
                    <img src={tokenImageUrl} alt="Token" class="token-image" />
                </div>
            {/if}
            <div class="inspect-header">
                <div>
                    <h2>Player Character</h2>
                    {#if manualTokenId || $selectedTokenId}
                        <div class="token-id-display">
                            <span class="token-id-label">Token ID:</span>
                            <span class="token-id-value">{$selectedTokenId || manualTokenId}</span>
                            {#if manualTokenId}
                                <button class="clear-button" on:click={handleClearManualToken} title="Clear manual token">
                                    ×
                                </button>
                            {/if}
                        </div>
                    {/if}
                </div>
                {#if $isGM}
                    <div class="header-actions">
                        <button class="link-button" on:click={handleLinkClick}>
                            Link Token
                        </button>
                    </div>
                {/if}
            </div>

            {#if characteristics.length > 0}
                <div class="section">
                    <h3>Characteristics</h3>
                    <table class="characteristics-table">
                        <thead>
                            <tr>
                                <th class="header-cell header-left">CHARACTERISTIC</th>
                                <th class="header-cell">Current</th>
                                <th class="header-cell">Initial</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each characteristics as char}
                                <tr>
                                    <td class="stat-name">{char.name}</td>
                                    <td class="stat-value">{char.current}</td>
                                    <td class="stat-value">{char.initial}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}

            {#if Object.keys(specialSkills).length > 0}
                <div class="section">
                    <h3>Special Skills</h3>
                    {#each Object.entries(specialSkills) as [category, skills]}
                        <div class="skill-category">
                            <h4>{category}</h4>
                            <div class="skills-list">
                                {#each skills as skill}
                                    <div class="skill-item">
                                        <span class="skill-name">{skill.name}</span>
                                        <span class="skill-rank">{skill.rank}</span>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}

            {#if talents.length > 0}
                <div class="section">
                    <h3>Talents</h3>
                    <div class="talents-list">
                        {#each talents as talent}
                            <div class="talent-item">
                                <div class="talent-header">
                                    <span class="talent-name">{talent.name}</span>
                                    <span class="talent-type">{talent.type}</span>
                                </div>
                                {#if talent.description}
                                    <p class="talent-description">{talent.description}</p>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
            </div>
        {/if}
    {:else if inspectData.type === 'creature' && inspectData.data}
        {@const creatureStats = inspectData.data}
        
        <div class="inspect-content">
            {#if tokenImageUrl}
                <div class="token-image-container">
                    <img src={tokenImageUrl} alt="Token" class="token-image" />
                </div>
            {/if}
            <div class="inspect-header">
                <div>
                    <h2>{creatureStats.name || 'Creature'}</h2>
                    {#if manualTokenId || $selectedTokenId}
                        <div class="token-id-display">
                            <span class="token-id-label">Token ID:</span>
                            <span class="token-id-value">{$selectedTokenId || manualTokenId}</span>
                            {#if manualTokenId}
                                <button class="clear-button" on:click={handleClearManualToken} title="Clear manual token">
                                    ×
                                </button>
                            {/if}
                        </div>
                    {/if}
                </div>
                {#if $isGM}
                    <div class="header-actions">
                        <button class="link-button" on:click={handleLinkClick}>
                            Link Token
                        </button>
                        <button class="edit-button" on:click={handleEditCreature}>
                            Edit Stats
                        </button>
                    </div>
                {/if}
            </div>

            {#if creatureStats.characteristics}
                <div class="section">
                    <h3>Characteristics</h3>
                    <table class="characteristics-table">
                        <thead>
                            <tr>
                                <th class="header-cell header-left">CHARACTERISTIC</th>
                                <th class="header-cell">Initial</th>
                                <th class="header-cell">Current</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#if creatureStats.characteristics.SKILL}
                                {@const skillParsed = creatureStats.characteristics.SKILL.split('/')}
                                <tr>
                                    <td class="stat-name">SKILL</td>
                                    <td class="stat-value">{skillParsed[0]?.trim() || skillParsed[0] || '0'}</td>
                                    <td class="stat-value">{skillParsed[1]?.trim() || skillParsed[0]?.trim() || '0'}</td>
                                </tr>
                            {/if}
                            {#if creatureStats.characteristics.STAMINA}
                                {@const staminaParsed = creatureStats.characteristics.STAMINA.split('/')}
                                <tr>
                                    <td class="stat-name">STAMINA</td>
                                    <td class="stat-value">{staminaParsed[0]?.trim() || staminaParsed[0] || '0'}</td>
                                    <td class="stat-value">{staminaParsed[1]?.trim() || staminaParsed[0]?.trim() || '0'}</td>
                                </tr>
                            {/if}
                            {#if creatureStats.characteristics.LUCK}
                                {@const luckParsed = creatureStats.characteristics.LUCK.split('/')}
                                <tr>
                                    <td class="stat-name">LUCK</td>
                                    <td class="stat-value">{luckParsed[0]?.trim() || luckParsed[0] || '0'}</td>
                                    <td class="stat-value">{luckParsed[1]?.trim() || luckParsed[0]?.trim() || '0'}</td>
                                </tr>
                            {/if}
                            {#if creatureStats.characteristics.PSIONICS}
                                {@const psionicsParsed = creatureStats.characteristics.PSIONICS.split('/')}
                                <tr>
                                    <td class="stat-name">PSIONICS</td>
                                    <td class="stat-value">{psionicsParsed[0]?.trim() || psionicsParsed[0] || '0'}</td>
                                    <td class="stat-value">{psionicsParsed[1]?.trim() || psionicsParsed[0]?.trim() || '0'}</td>
                                </tr>
                            {/if}
                            {#if creatureStats.characteristics.PSI_POINTS}
                                {@const psiPointsParsed = creatureStats.characteristics.PSI_POINTS.split('/')}
                                <tr>
                                    <td class="stat-name">PSI POINTS</td>
                                    <td class="stat-value">{psiPointsParsed[0]?.trim() || psiPointsParsed[0] || '0'}</td>
                                    <td class="stat-value">{psiPointsParsed[1]?.trim() || psiPointsParsed[0]?.trim() || '0'}</td>
                                </tr>
                            {/if}
                        </tbody>
                    </table>
                </div>
            {/if}

            {#if creatureStats.specialSkills && creatureStats.specialSkills.length > 0}
                <div class="section">
                    <h3>Special Skills</h3>
                    <div class="skills-list">
                        {#each creatureStats.specialSkills as skill}
                            <div class="skill-item">
                                <span class="skill-name">{skill.name}</span>
                                <span class="skill-rank">{skill.rank}</span>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}

            {#if creatureStats.talents && creatureStats.talents.length > 0}
                <div class="section">
                    <h3>Talents</h3>
                    <div class="talents-list">
                        {#each creatureStats.talents as talent}
                            <div class="talent-item">
                                <div class="talent-header">
                                    <span class="talent-name">{talent.name}</span>
                                </div>
                                {#if talent.description}
                                    <p class="talent-description">{talent.description}</p>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}

            {#if creatureStats.notes}
                <div class="section">
                    <h3>Notes</h3>
                    <p class="notes-text">{creatureStats.notes}</p>
                </div>
            {/if}
        </div>
    {/if}

    {#if showLinkConfig && ($selectedTokenId || manualTokenId)}
        <TokenLinkConfig 
            tokenId={$selectedTokenId || manualTokenId} 
            on:close={handleLinkConfigClose}
        />
    {/if}

    {#if showCreatureEditor && ($selectedTokenId || manualTokenId)}
        <CreatureStatEditor 
            tokenId={$selectedTokenId || manualTokenId}
            creatureStats={inspectData?.type === 'creature' && inspectData.data ? inspectData.data : null}
            on:close={handleCreatureEditorClose}
        />
    {/if}
</div>

<style lang="scss">
    .inspect-view {
        padding: 1rem;
        max-width: 700px;
        margin: 0 auto;
        min-height: 200px;
    }

    .token-image-container {
        display: flex;
        justify-content: center;
        margin-bottom: 1rem;
        padding: 0.5rem;
        background: rgba(var(--accent), 0.1);
        border-radius: 0.5rem;
        border: 1px solid rgba(var(--accent), 0.2);
    }

    .token-image {
        max-width: 200px;
        max-height: 200px;
        width: auto;
        height: auto;
        object-fit: contain;
        border-radius: 0.25rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .loading-state,
    .empty-state {
        text-align: center;
        padding: 2rem;
        color: rgba(var(--primary), 0.7);
        
        p {
            margin-bottom: 1rem;
        }

        .help-text {
            font-size: 0.85rem;
            color: rgba(var(--primary), 0.5);
            font-style: italic;
            margin-top: 0.5rem;
        }

        .instructions-list {
            text-align: left;
            margin: 1rem auto;
            padding-left: 1.5rem;
            color: rgba(var(--primary), 0.7);
            font-size: 0.9rem;
            max-width: 500px;

            li {
                margin-bottom: 0.5rem;
                line-height: 1.4;
            }
        }

        .manual-token-input {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            margin-top: 1.5rem;
            padding: 1rem;
            background: rgba(var(--accent), 0.1);
            border-radius: 0.5rem;
            border: 1px solid rgba(var(--accent), 0.2);

            label {
                font-size: 0.9rem;
                color: rgba(var(--primary), 0.8);
                font-weight: 600;
                white-space: nowrap;
            }

            input {
                flex: 1;
                padding: 0.5rem 0.75rem;
                background: rgba(var(--background), 0.8);
                border: 1px solid rgba(var(--accent), 0.3);
                border-radius: 0.25rem;
                color: rgb(var(--primary));
                font-size: 0.9rem;

                &:focus {
                    outline: none;
                    border-color: rgb(var(--accent));
                    box-shadow: 0 0 0 2px rgba(var(--accent), 0.2);
                }

                &::placeholder {
                    color: rgba(var(--primary), 0.4);
                }
            }

            .inspect-button {
                padding: 0.5rem 1rem;
                background: rgb(var(--accent));
                color: white;
                border: none;
                border-radius: 0.25rem;
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;

                &:hover {
                    background: rgba(var(--accent), 0.9);
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }

                &:active {
                    transform: translateY(0);
                }
            }
        }

        .token-id-display {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 0.5rem;
            padding: 0.25rem 0.5rem;
            background: rgba(var(--accent), 0.1);
            border-radius: 0.25rem;
            font-size: 0.85rem;

            .token-id-label {
                color: rgba(var(--primary), 0.6);
                font-weight: 600;
            }

            .token-id-value {
                color: rgb(var(--accent));
                font-family: monospace;
                font-weight: 600;
            }

        .clear-button {
            margin-left: 0.25rem;
            padding: 0 0.25rem;
            background: rgba(var(--primary), 0.2);
            border: none;
            border-radius: 0.15rem;
            color: rgba(var(--primary), 0.7);
            cursor: pointer;
            font-size: 1.2rem;
            line-height: 1;
            width: 1.25rem;
            height: 1.25rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;

            &:hover {
                background: rgba(var(--primary), 0.3);
                color: rgb(var(--primary));
            }
        }

        .empty-state-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 1rem;
        }
    }

    .token-id-display {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
        padding: 0.25rem 0.5rem;
        background: rgba(var(--accent), 0.1);
        border-radius: 0.25rem;
        font-size: 0.85rem;

        .token-id-label {
            color: rgba(var(--primary), 0.6);
            font-weight: 600;
        }

        .token-id-value {
            color: rgb(var(--accent));
            font-family: monospace;
            font-weight: 600;
        }

        .clear-button {
            margin-left: 0.25rem;
            padding: 0 0.25rem;
            background: rgba(var(--primary), 0.2);
            border: none;
            border-radius: 0.15rem;
            color: rgba(var(--primary), 0.7);
            cursor: pointer;
            font-size: 1.2rem;
            line-height: 1;
            width: 1.25rem;
            height: 1.25rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;

            &:hover {
                background: rgba(var(--primary), 0.3);
                color: rgb(var(--primary));
            }
        }

            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            white-space: nowrap;

            &:hover {
                background: rgba(var(--accent), 0.3);
                border-color: rgb(var(--accent));
                transform: scale(1.05);
            }

            &:active {
                transform: scale(0.95);
            }
        }
    }

    .inspect-content {
        .inspect-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid rgba(var(--accent), 0.3);

            > div:first-child {
                flex: 1;
            }

            h2 {
                margin: 0 0 0.5rem 0;
                color: rgb(var(--accent));
                font-size: 1.5rem;
                text-shadow: var(--shadow);
            }

            .header-actions {
                display: flex;
                gap: 0.5rem;
                align-items: center;
            }
        }

        .section {
            margin-bottom: 2rem;

            h3 {
                color: rgb(var(--accent));
                font-size: 1.2rem;
                margin-bottom: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                text-shadow: var(--shadow);
            }

            h4 {
                color: rgba(var(--accent), 0.8);
                font-size: 1rem;
                margin: 1rem 0 0.5rem 0;
                text-transform: uppercase;
                letter-spacing: 0.03em;
            }
        }

        .characteristics-table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 1rem;

            thead {
                border-bottom: 2px solid rgba(var(--accent), 0.4);
            }

            .header-cell {
                text-shadow: var(--shadow);
                color: rgb(var(--accent));
                font-size: 0.8rem;
                font-weight: 600;
                padding: 0.5rem 0.75rem;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: 0.05em;

                &.header-left {
                    text-align: left;
                    width: 55%;
                }
            }

            tbody tr {
                border-bottom: 1px solid rgba(var(--accent), 0.2);

                &:nth-child(even) {
                    background: rgba(var(--accent), 0.1);
                }

                &:nth-child(odd) {
                    background: rgba(var(--accent), 0.05);
                }
            }

            .stat-name {
                font-size: 1.1rem;
                font-weight: 700;
                color: rgb(var(--accent));
                text-transform: uppercase;
                letter-spacing: 0.08em;
                text-align: left;
                padding: 0.5rem 0.75rem;
                border-right: 1px solid rgba(var(--accent), 0.2);
            }

            .stat-value {
                font-size: 1.3rem;
                font-weight: 700;
                text-align: center;
                color: rgba(var(--primary), 1);
                padding: 0.5rem 0.75rem;
                border-right: 1px solid rgba(var(--accent), 0.2);

                &:last-child {
                    border-right: none;
                }
            }
        }

        .skill-category {
            margin-bottom: 1.5rem;
        }

        .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .skill-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem 0.75rem;
            background: rgba(var(--accent), 0.1);
            border-radius: 0.25rem;
            border: 1px solid rgba(var(--accent), 0.2);

            .skill-name {
                color: rgba(var(--primary), 0.9);
                font-weight: 600;
            }

            .skill-rank {
                background: rgba(var(--accent), 0.3);
                color: rgb(var(--accent));
                padding: 0.1rem 0.4rem;
                border-radius: 0.15rem;
                font-weight: 700;
                font-size: 0.9rem;
            }
        }

        .talents-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .talent-item {
            padding: 1rem;
            background: rgba(var(--accent), 0.1);
            border-radius: 0.25rem;
            border: 1px solid rgba(var(--accent), 0.2);

            .talent-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }

            .talent-name {
                color: rgb(var(--accent));
                font-weight: 700;
                font-size: 1.1rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .talent-type {
                color: rgba(var(--accent), 0.7);
                font-size: 0.85rem;
                font-weight: 600;
                padding: 0.2rem 0.5rem;
                background: rgba(var(--accent), 0.2);
                border-radius: 0.15rem;
            }

            .talent-description {
                color: rgba(var(--primary), 0.8);
                margin: 0;
                line-height: 1.5;
                font-size: 0.9rem;
            }
        }

        .notes-text {
            color: rgba(var(--primary), 0.8);
            line-height: 1.6;
            white-space: pre-wrap;
            padding: 1rem;
            background: rgba(var(--accent), 0.05);
            border-radius: 0.25rem;
            border: 1px solid rgba(var(--accent), 0.2);
        }
    }

    .link-button,
    .edit-button {
        padding: 0.5rem 1rem;
        border: 1px solid rgb(var(--accent));
        border-radius: 0.25rem;
        background: rgba(var(--accent), 0.2);
        color: rgb(var(--accent));
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
            background: rgba(var(--accent), 0.3);
            transform: translateY(-1px);
        }
    }
</style>
