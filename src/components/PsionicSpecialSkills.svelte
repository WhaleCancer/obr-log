<script lang="ts">
    // Import stores
    import { editing } from "../stores";
    import { currentPlayerId, viewingPlayerId } from "../services/OBRHelper";
    import type { AFFSheetStats } from '../types/sheet.type';
    import DiceRoller from './DiceRoller.svelte';

    // Export
    export let stats: AFFSheetStats[] = [];
    export let currentPsionics: number = 0; // Current PSIONICS value from Characteristics

    $: editable = $currentPlayerId === $viewingPlayerId;
    
    // Dice roller state
    let showDiceRoller: boolean = false;
    let selectedSkill: { name: string; total: number } | null = null;
    
    // Helper function to parse number from string value
    function parseNumber(value: string): number {
        const num = parseInt(value.trim() || '0', 10);
        return isNaN(num) ? 0 : num;
    }
    
    // Helper function to calculate total (ranks + current psionics)
    function calculateTotal(ranksValue: string): number {
        const ranks = parseNumber(ranksValue);
        return ranks + currentPsionics;
    }
    
    function handleDiceClick(skillName: string, skillTotal: number) {
        selectedSkill = { name: skillName, total: skillTotal };
        showDiceRoller = true;
    }
    
    function handleDiceRollerClose() {
        showDiceRoller = false;
        selectedSkill = null;
    }
</script>

<div class="psionic-skills-container">
    <table class="psionic-skills-table">
        <thead>
            <tr>
                <th class="header-cell dice-column">🎲</th>
                <th class="header-cell header-left">PSIONIC SPECIAL SKILL</th>
                <th class="header-cell">{#if editable && $editing}✏️ {/if}Ranks</th>
                <th class="header-cell">PSIONICS</th>
                <th class="header-cell">Total</th>
            </tr>
        </thead>
        <tbody>
            {#each stats as stat, index (stat.id)}
            {@const hasRanks = parseNumber(stat.value) > 0}
            {@const isEven = index % 2 === 0}
            {@const skillTotal = calculateTotal(stat.value)}
            <tr class:has-ranks={hasRanks} class:even-row={isEven} class:odd-row={!isEven}>
                <td class="dice-cell">
                    <button 
                        class="dice-button" 
                        on:click={() => handleDiceClick(stat.name, skillTotal)}
                        title="Roll dice for {stat.name}">
                        🎲
                    </button>
                </td>
                <td class="skill-name">{stat.name}</td>
                {#if editable && $editing}
                <td class="skill-value ranks" 
                    contenteditable="true" 
                    bind:innerText={stat.value}
                    on:blur={() => stats = [...stats]}>
                </td>
                {:else}
                <td class="skill-value ranks">{stat.value}</td>
                {/if}
                <td class="skill-value current-psionics">{currentPsionics}</td>
                <td class="skill-value total">{skillTotal}</td>
            </tr>
            {/each}
        </tbody>
    </table>
</div>

{#if showDiceRoller && selectedSkill}
    <DiceRoller 
        skillName={selectedSkill.name}
        skillTotal={selectedSkill.total}
        on:close={handleDiceRollerClose}
    />
{/if}

<style lang="scss">
    .psionic-skills-container {
        padding: 0 0.5rem;
        margin: 0;
        display: block;
        font-size: initial;
        width: 100%;
        box-sizing: border-box;
    }

    .psionic-skills-table {
        border-collapse: collapse;
        border-spacing: 0;
        width: 100%;
        margin: 0;
        padding: 0;
        table-layout: fixed;
        box-sizing: border-box;
    }

    .psionic-skills-table thead {
        border-bottom: 2px solid rgba(var(--accent), 0.4);
        margin: 0;
        padding: 0;
    }
    
    .psionic-skills-table tbody {
        margin: 0;
        padding: 0;
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

    .header-cell.dice-column {
        width: 3rem;
        padding: 0.5rem;
    }

    .header-cell.header-left {
        text-align: left;
        width: calc((100% - 3rem) * 0.55);
    }

    .header-cell:not(.header-left):not(.dice-column) {
        width: calc((100% - 3rem) * 0.15);
    }

    .psionic-skills-table tbody tr {
        border-bottom: 1px solid rgba(var(--accent), 0.2);
        transition: background 0.2s ease;
    }

    .psionic-skills-table tbody tr.even-row:not(.has-ranks) {
        background: rgba(var(--accent), 0.05);
    }

    .psionic-skills-table tbody tr.odd-row:not(.has-ranks) {
        background: rgba(var(--accent), 0.1);
    }

    .psionic-skills-table tbody tr.even-row.has-ranks {
        background: rgba(100, 200, 100, 0.15);
    }

    .psionic-skills-table tbody tr.odd-row.has-ranks {
        background: rgba(100, 200, 100, 0.25);
    }

    .psionic-skills-table tbody tr:hover:not(.has-ranks) {
        background: rgba(var(--accent), 0.2);
    }

    .psionic-skills-table tbody tr:hover.has-ranks {
        background: rgba(100, 200, 100, 0.35);
    }

    .psionic-skills-table td {
        white-space: pre-wrap;
        text-shadow: var(--shadow);
        padding: 0.5rem 0.75rem;
        color: rgba(var(--primary), 0.9);
        vertical-align: middle;
    }

    .dice-cell {
        width: 3rem;
        padding: 0.5rem;
        text-align: center;
    }
    
    .dice-button {
        background: transparent;
        border: 1px solid rgba(var(--accent), 0.5);
        border-radius: 0.25rem;
        color: rgb(var(--accent));
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        transition: all 0.2s ease;
        width: 100%;
        
        &:hover {
            background: rgba(var(--accent), 0.2);
            border-color: rgb(var(--accent));
            transform: scale(1.1);
        }
        
        &:active {
            transform: scale(0.95);
        }
    }

    .skill-name {
        font-size: 1rem;
        font-weight: 500;
        color: rgba(var(--primary), 0.85);
        text-align: left;
        width: calc((100% - 3rem) * 0.55);
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .skill-value {
        font-size: 1rem;
        font-weight: 600;
        text-align: center;
        color: rgba(var(--primary), 1);
        width: calc((100% - 3rem) * 0.15);
    }

    .skill-value.ranks {
        color: rgba(var(--primary), 1);
    }

    .skill-value.current-psionics,
    .skill-value.total {
        color: rgba(var(--accent), 0.9);
        font-weight: 700;
    }

    .skill-value.ranks:hover {
        color: rgb(var(--accent));
        transition: color 0.2s ease;
    }
</style>
