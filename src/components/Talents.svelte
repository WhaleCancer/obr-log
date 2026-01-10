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

    // Helper to format description - convert line breaks to flowing text
    function formatDescription(desc: string): string {
        if (!desc) return '';
        // Handle both escaped newlines (from JSON) and actual newlines (from TypeScript strings)
        let formatted = desc.replace(/\\n/g, '\n');
        // Replace double newlines (paragraph breaks) with a space
        formatted = formatted.replace(/\n\n+/g, ' ');
        // Replace single newlines with spaces (join lines into flowing text)
        formatted = formatted.replace(/\n/g, ' ');
        // Collapse multiple spaces into single space
        formatted = formatted.replace(/\s+/g, ' ');
        // Trim leading/trailing whitespace
        return formatted.trim();
    }

    // Tooltip functionality for edit mode
    let hoveredTalent: Talent | null = null;
    let tooltipPosition = { x: 0, y: 0 };

    function handleMouseEnter(event: MouseEvent, talent: Talent) {
        hoveredTalent = talent;
        updateTooltipPosition(event);
    }

    function handleMouseMove(event: MouseEvent) {
        if (hoveredTalent) {
            updateTooltipPosition(event);
        }
    }

    function updateTooltipPosition(event: MouseEvent) {
        tooltipPosition = { x: event.clientX, y: event.clientY };
    }

    function handleMouseLeave() {
        hoveredTalent = null;
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
                            <label 
                                class="checkbox-item tooltip-trigger"
                                on:mouseenter={(e) => handleMouseEnter(e, talent)}
                                on:mouseleave={handleMouseLeave}
                                on:mousemove={handleMouseMove}
                            >
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
                            <label 
                                class="checkbox-item tooltip-trigger"
                                on:mouseenter={(e) => handleMouseEnter(e, talent)}
                                on:mouseleave={handleMouseLeave}
                                on:mousemove={handleMouseMove}
                            >
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

            <!-- Tooltip for edit mode -->
            {#if hoveredTalent}
                <div 
                    class="tooltip"
                    style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px;"
                >
                    <div class="tooltip-title">{hoveredTalent.name.toUpperCase()}</div>
                    <div class="tooltip-content">{formatDescription(hoveredTalent.description)}</div>
                </div>
            {/if}
        {:else}
            <!-- View Mode: Table display of owned talents -->
            {#if ownedTalents && ownedTalents.length > 0}
                <table class="talents-table">
                    <colgroup>
                        <col class="col-name">
                        <col class="col-type">
                        <col class="col-description">
                    </colgroup>
                    <thead>
                        <tr>
                            <th class="header-cell">Name</th>
                            <th class="header-cell">Type</th>
                            <th class="header-cell">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each ownedTalents as talent, index (talent.name)}
                            {@const isEven = index % 2 === 0}
                            <tr class:even-row={isEven} class:odd-row={!isEven}>
                                <td class="talent-name">{talent.name}</td>
                                <td class="talent-type">{talent.type}</td>
                                <td class="talent-description">{formatDescription(talent.description)}</td>
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
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 0.5rem;
        column-gap: 1.5rem;
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

    .talents-table thead {
        border-bottom: 2px solid rgba(var(--accent), 0.4);
    }

    .col-name {
        width: 28%;
    }

    .col-type {
        width: 10%;
    }

    .col-description {
        width: 62%;
    }

    .header-cell {
        text-shadow: var(--shadow);
        color: rgb(var(--accent));
        font-size: 0.9rem;
        font-weight: 600;
        padding: 0.5rem 0.75rem;
        text-align: left;
        text-transform: uppercase;
        letter-spacing: 0.05em;
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
        text-shadow: var(--shadow);
        padding: 0.5rem 0.75rem;
        color: rgba(var(--primary), 0.9);
        vertical-align: top;
        word-wrap: break-word;
        line-height: 1.4;
    }

    .talent-name {
        font-size: 0.95rem;
        font-weight: 500;
        color: rgba(var(--primary), 0.85);
        text-align: left;
        width: 28%;
        padding-right: 0.5rem;
    }

    .talent-type {
        font-size: 0.8rem;
        color: rgba(var(--accent), 0.9);
        text-align: left;
        width: 10%;
        text-transform: uppercase;
        font-weight: 500;
        padding: 0.5rem 0.25rem;
    }

    .talent-description {
        font-size: 0.85rem;
        color: rgba(var(--primary), 0.8);
        text-align: left;
        width: 62%;
        line-height: 1.4;
        padding-left: 0.5rem;
    }

    .empty-state {
        text-align: center;
        color: rgba(var(--primary), 0.5);
        font-style: italic;
        padding: 1rem;
        font-size: 0.9rem;
    }

    .tooltip-trigger {
        cursor: help;
    }

    .tooltip {
        position: fixed;
        z-index: 10000;
        max-width: 300px;
        padding: 0.75rem 1rem;
        background: rgba(20, 20, 30, 0.98);
        border: 2px solid rgb(var(--accent));
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        pointer-events: none;
        transform: translate(-50%, calc(-100% - 10px));
        margin-left: 10px;
        margin-top: -10px;
    }

    .tooltip-title {
        font-weight: 700;
        font-size: 1rem;
        color: rgb(var(--accent));
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .tooltip-content {
        font-size: 0.875rem;
        color: rgba(var(--primary), 0.9);
        line-height: 1.5;
    }

    .tooltip::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        border: 8px solid transparent;
        border-top-color: rgb(var(--accent));
    }
</style>
