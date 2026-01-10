<script lang="ts">
    // Import stores
    import { editing } from "../stores";
    import { currentPlayerId, viewingPlayerId } from "../services/OBRHelper";
    import type { AFFSheetStats } from '../types/sheet.type';

    // Export
    export let stats;
    export let currentSkill: number = 0; // Current SKILL value from Characteristics

    $: editable = $currentPlayerId === $viewingPlayerId;
    
    // Helper function to parse number from string value
    function parseNumber(value: string): number {
        const num = parseInt(value.trim() || '0', 10);
        return isNaN(num) ? 0 : num;
    }
    
    // Helper function to calculate total (ranks + current skill)
    function calculateTotal(ranksValue: string): number {
        const ranks = parseNumber(ranksValue);
        return ranks + currentSkill;
    }
</script>

<div class="combat-skills-container">
    <table class="combat-skills-table">
        <thead>
            <tr>
                <th class="header-cell header-left">COMBAT SPECIAL SKILL</th>
                <th class="header-cell">Ranks</th>
                <th class="header-cell">CURRENT SKILL</th>
                <th class="header-cell">Total</th>
            </tr>
        </thead>
        <tbody>
            {#each stats as stat, index (stat.id)}
            {@const hasRanks = parseNumber(stat.value) > 0}
            {@const isEven = index % 2 === 0}
            <tr class:has-ranks={hasRanks} class:even-row={isEven} class:odd-row={!isEven}>
                {#if editable && $editing}
                <td class="skill-name" contenteditable="true" bind:innerText={stat.name}>{stat.name}</td>
                {:else}
                <td class="skill-name">{stat.name}</td>
                {/if}
                {#if editable}
                <td class="skill-value ranks" 
                    contenteditable="true" 
                    bind:innerText={stat.value}
                    on:blur={() => stats = [...stats]}>
                </td>
                {:else}
                <td class="skill-value ranks">{stat.value}</td>
                {/if}
                <td class="skill-value current-skill">{currentSkill}</td>
                <td class="skill-value total">{calculateTotal(stat.value)}</td>
            </tr>
            {/each}
        </tbody>
    </table>
</div>

<style lang="scss">
    .combat-skills-container {
        padding: 1rem 0.5rem 0.1rem 0.5rem;
    }

    .combat-skills-table {
        border-collapse: collapse;
        width: 100%;
        margin: 0 auto;
        table-layout: fixed;
    }

    .combat-skills-table thead {
        border-bottom: 2px solid rgba(var(--accent), 0.4);
    }

    .header-cell {
        text-shadow: var(--shadow);
        color: rgb(var(--accent));
        font-size: 0.9rem;
        font-weight: 600;
        padding: 0.5rem 0.75rem;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .header-cell.header-left {
        text-align: left;
        width: 55%;
    }

    .header-cell:not(.header-left) {
        width: 15%;
    }

    .combat-skills-table tbody tr {
        border-bottom: 1px solid rgba(var(--accent), 0.2);
        transition: background 0.2s ease;
    }

    .combat-skills-table tbody tr.even-row:not(.has-ranks) {
        background: rgba(var(--accent), 0.05);
    }

    .combat-skills-table tbody tr.odd-row:not(.has-ranks) {
        background: rgba(var(--accent), 0.1);
    }

    .combat-skills-table tbody tr.even-row.has-ranks {
        background: rgba(100, 200, 100, 0.15);
    }

    .combat-skills-table tbody tr.odd-row.has-ranks {
        background: rgba(100, 200, 100, 0.25);
    }

    .combat-skills-table tbody tr:hover:not(.has-ranks) {
        background: rgba(var(--accent), 0.2);
    }

    .combat-skills-table tbody tr:hover.has-ranks {
        background: rgba(100, 200, 100, 0.35);
    }

    .combat-skills-table td {
        white-space: pre-wrap;
        text-shadow: var(--shadow);
        padding: 0.5rem 0.75rem;
        color: rgba(var(--primary), 0.9);
        vertical-align: middle;
    }

    .skill-name {
        font-size: 1rem;
        font-weight: 500;
        color: rgba(var(--primary), 0.85);
        text-align: left;
        width: 55%;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .skill-value {
        font-size: 1rem;
        font-weight: 600;
        text-align: center;
        color: rgba(var(--primary), 1);
        width: 15%;
    }

    .skill-value.ranks {
        color: rgba(var(--primary), 1);
    }

    .skill-value.current-skill,
    .skill-value.total {
        color: rgba(var(--accent), 0.9);
        font-weight: 700;
    }

    .skill-value.ranks:hover {
        color: rgb(var(--accent));
        transition: color 0.2s ease;
    }

    /* Dark green text for rows with invested ranks */
    .combat-skills-table tbody tr.has-ranks .skill-name,
    .combat-skills-table tbody tr.has-ranks .skill-value {
        color: rgb(20, 80, 20);
    }

    .combat-skills-table tbody tr.has-ranks .skill-value.current-skill,
    .combat-skills-table tbody tr.has-ranks .skill-value.total {
        color: rgb(15, 60, 15);
        font-weight: 700;
    }

    .combat-skills-table tbody tr.has-ranks .skill-value.ranks:hover {
        color: rgb(25, 100, 25);
        transition: color 0.2s ease;
    }
</style>
