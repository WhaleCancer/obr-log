<script lang="ts">
    // Import stores
    import { editing } from "../stores";
    import { currentPlayerId, viewingPlayerId } from "../services/OBRHelper";
    import type { AFFSheetSection, AFFSheetStats } from '../types/sheet.type';
    import { talents, type Talent } from '../data/talents';

    // Export
    export let section: AFFSheetSection;

    $: editable = $currentPlayerId === $viewingPlayerId;

    // Combine all talents for checkbox display
    $: allTalents = talents ? [...talents.major, ...talents.minor] : [];

    // Helper function to parse talent data from stats
    function parseTalentData(stat: AFFSheetStats): { name: string; type: 'Major' | 'Minor'; description: string } | null {
        try {
            const data = JSON.parse(stat.value);
            // Validate the data structure
            if (data && data.type && data.description && (data.type === 'Major' || data.type === 'Minor')) {
                return {
                    name: stat.name,
                    type: data.type,
                    description: data.description
                };
            }
            return null;
        } catch {
            // If parsing fails, try to find matching talent by name and use its data
            const foundTalent = allTalents.find(t => t.name === stat.name);
            if (foundTalent) {
                // Return talent data (but don't modify the stat - let it be filtered/recreated)
                return {
                    name: stat.name,
                    type: foundTalent.type,
                    description: foundTalent.description
                };
            }
            return null;
        }
    }

    // Get owned talents
    $: ownedTalents = section && section.stats
        ? section.stats
            .map(parseTalentData)
            .filter(t => t !== null) as Array<{ name: string; type: 'Major' | 'Minor'; description: string }>
        : [];

    // Check if a talent is owned
    function isOwned(talentName: string): boolean {
        return ownedTalents.some(t => t.name === talentName);
    }

    // Handle talent checkbox change
    function handleTalentToggle(talent: Talent, checked: boolean) {
        if (checked) {
            // Calculate next ID
            const nextId = section.stats.length > 0 
                ? Math.max(...section.stats.map(s => s.id)) + 1 
                : 1;
            
            // Add talent
            const newStat: AFFSheetStats = {
                id: nextId,
                name: talent.name,
                value: JSON.stringify({
                    type: talent.type,
                    description: talent.description
                })
            };
            section.stats = [...section.stats, newStat];
        } else {
            // Remove talent
            section.stats = section.stats.filter(s => s.name !== talent.name);
        }
    }

    // Group talents by type for checkbox display
    $: majorTalents = allTalents.filter(t => t.type === 'Major');
    $: minorTalents = allTalents.filter(t => t.type === 'Minor');

    // Helper to format description (replace \n with actual newlines)
    function formatDescription(desc: string): string {
        return desc.replace(/\\n/g, '\n');
    }
</script>

{#if section}
<div class="talents-section">
    {#if editable && $editing}
        <h2 bind:innerText={section.name} contenteditable="true">{section.name}</h2>
    {:else}
        <h2>{section.name}</h2>
    {/if}
    
    <div class="talents-container">
        {#if editable && $editing}
            <!-- Edit Mode: Checkbox list -->
            <div class="talents-edit">
                <div class="talent-group">
                    <h3 class="group-header">Major Talents</h3>
                    <div class="checkbox-list">
                        {#each majorTalents as talent (talent.name)}
                            <label class="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={isOwned(talent.name)}
                                    on:change={(e) => handleTalentToggle(talent, e.currentTarget.checked)}
                                />
                                <span class="checkbox-label">{talent.name}</span>
                            </label>
                        {/each}
                    </div>
                </div>
                
                <div class="talent-group">
                    <h3 class="group-header">Minor Talents</h3>
                    <div class="checkbox-list">
                        {#each minorTalents as talent (talent.name)}
                            <label class="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={isOwned(talent.name)}
                                    on:change={(e) => handleTalentToggle(talent, e.currentTarget.checked)}
                                />
                                <span class="checkbox-label">{talent.name}</span>
                            </label>
                        {/each}
                    </div>
                </div>
            </div>
        {:else}
            <!-- View Mode: Table display of owned talents -->
            {#if ownedTalents && ownedTalents.length > 0}
                <table class="talents-table">
                    <tbody>
                        {#each ownedTalents as talent, index (talent.name)}
                            {@const isEven = index % 2 === 0}
                            <tr class:even-row={isEven} class:odd-row={!isEven}>
                                <td class="talent-name">{talent.name}</td>
                                <td class="talent-description">{formatDescription(talent.description)}</td>
                                <td class="talent-type">{talent.type}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {:else}
                <!-- Show empty state in view mode when no talents -->
                <div class="empty-state">No talents selected</div>
            {/if}
        {/if}
    </div>
</div>
{/if}

<style lang="scss">
    .talents-section {
        padding: 1rem 0.5rem;
        border-width: 0.15rem;
        border-style: solid;
        border-image: 
            linear-gradient(to bottom, rgba(0, 0, 0, 0), rgb(var(--accent)), rgba(0, 0, 0, 0)) 1 100%;
        border-right: none;
    }

    h2 {
        text-shadow: var(--shadow);
        color: rgb(var(--accent));
        font-size: 1.2rem;
        margin-top: 0;
        margin-bottom: 0.5rem;
    }

    .talents-container {
        padding: 0;
    }

    .talents-edit {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .talent-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .group-header {
        text-shadow: var(--shadow);
        color: rgb(var(--accent));
        font-size: 1rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgba(var(--accent), 0.3);
    }

    .checkbox-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .checkbox-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        padding: 0.25rem 0;
        user-select: none;

        &:hover {
            background: rgba(var(--accent), 0.05);
        }

        input[type="checkbox"] {
            cursor: pointer;
            width: 1rem;
            height: 1rem;
            accent-color: rgb(var(--accent));
        }

        .checkbox-label {
            text-shadow: var(--shadow);
            color: rgba(var(--primary), 0.9);
            font-size: 0.95rem;
        }
    }

    .talents-table {
        border-collapse: collapse;
        width: 100%;
        margin: 0 auto;
        table-layout: fixed;
    }

    .talents-table tbody tr {
        border-bottom: 1px solid rgba(var(--accent), 0.2);
        transition: background 0.2s ease;
    }

    .talents-table tbody tr.even-row {
        background: rgba(var(--accent), 0.05);
    }

    .talents-table tbody tr.odd-row {
        background: rgba(var(--accent), 0.1);
    }

    .talents-table tbody tr:hover {
        background: rgba(var(--accent), 0.2);
    }

    .talents-table td {
        white-space: pre-wrap;
        text-shadow: var(--shadow);
        padding: 0.5rem 0.75rem;
        color: rgba(var(--primary), 0.9);
        vertical-align: top;
        word-wrap: break-word;
    }

    .talent-name {
        font-size: 1rem;
        font-weight: 500;
        color: rgba(var(--primary), 0.85);
        text-align: left;
        width: 30%;
    }

    .talent-description {
        font-size: 0.9rem;
        color: rgba(var(--primary), 0.8);
        text-align: left;
        width: 55%;
        line-height: 1.4;
    }

    .talent-type {
        font-size: 0.85rem;
        color: rgba(var(--accent), 0.9);
        text-align: center;
        width: 15%;
        text-transform: uppercase;
        font-weight: 500;
    }

    .empty-state {
        text-align: center;
        color: rgba(var(--primary), 0.5);
        font-style: italic;
        padding: 1rem;
        font-size: 0.9rem;
    }
</style>
