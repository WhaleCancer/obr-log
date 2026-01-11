<script lang="ts">
    // Import stores
    import { editing } from "../stores";
    import { currentPlayerId, viewingPlayerId } from "../services/OBRHelper";
    import type { AFFSheetStats } from '../types/sheet.type';
    import DiceRoller from './DiceRoller.svelte';

    // Export
    export let stats: AFFSheetStats[] = [];
    export let currentSkill: number = 0; // Current SKILL value from Characteristics
    export let currentLuck: number = 0; // Current LUCK value from Characteristics
    export let onLuckDecrease: () => void = () => {}; // Callback to decrease LUCK

    $: editable = $currentPlayerId === $viewingPlayerId;
    
    // Dice roller state
    let showDiceRoller: boolean = false;
    let selectedSkill: { name: string; total: number; ranks: number; baseSkill: number; baseStatType: 'SKILL' | 'PSIONICS' } | null = null;
    
    // Skill descriptions for tooltips
    const skillDescriptions: Record<string, string> = {
        "Awareness": "Heightened perception and intuition for detecting threats, hidden objects, and suspicious activities. Essential for spotting ambushes, noticing concealed enemies, and identifying anomalies. Covers all senses including visual, auditory, and instinctual detection.",
        "Disguise": "Proficiency in altering appearance, voice, and mannerisms to blend in with different cultures or impersonate others. Essential for undercover operations and infiltration missions. Covers makeup, prosthetics, holographic disguises, and cultural adaptation.",
        "Locks": "Skill in bypassing security systems including mechanical locks, electronic keypads, biometric scanners, and encrypted access panels. Essential for infiltration, rescue operations, and accessing restricted areas. Requires knowledge of various security technologies across different species and civilizations.",
        "Sleight of Hand": "Dexterity and precision for pickpocketing, palming objects, and performing covert manipulations. Useful for planting trackers, swapping items, accessing systems unnoticed, or acquiring information. Essential for intelligence operations and covert missions.",
        "Sneak": "Proficiency in moving silently, remaining concealed, and avoiding detection. Essential for infiltration, reconnaissance, and stealth operations. Covers moving quietly through ship corridors, hiding in shadows, and evading security sensors and patrols.",
        "Traps": "Understanding of security systems, traps, and hazard detection. Covers identifying pressure plates, proximity sensors, energy fields, and mechanical traps. Essential for safely navigating ancient ruins, enemy installations, and booby-trapped locations. Includes knowledge of disarming techniques and trap placement strategies across different cultures and technologies."
    };
    
    // Helper function to get description for a skill
    function getSkillDescription(skillName: string): string {
        return skillDescriptions[skillName] || "";
    }
    
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
    
    // Track which tooltip is shown
    let hoveredSkill: string | null = null;
    let tooltipElement: HTMLElement | null = null;
    let tooltipPosition = { x: 0, y: 0 };
    
    function handleMouseEnter(event: MouseEvent, skillName: string) {
        hoveredSkill = skillName;
        const target = event.currentTarget as HTMLElement;
        tooltipElement = target;
        updateTooltipPosition(event);
    }
    
    function handleMouseMove(event: MouseEvent) {
        if (hoveredSkill) {
            updateTooltipPosition(event);
        }
    }
    
    function updateTooltipPosition(event: MouseEvent) {
        tooltipPosition = { x: event.clientX, y: event.clientY };
    }
    
    function handleMouseLeave() {
        hoveredSkill = null;
        tooltipElement = null;
    }
    
    function handleDiceClick(skillName: string, skillTotal: number, ranksValue: string) {
        const ranks = parseNumber(ranksValue);
        selectedSkill = { 
            name: skillName, 
            total: skillTotal,
            ranks: ranks,
            baseSkill: currentSkill,
            baseStatType: 'SKILL' as const
        };
        showDiceRoller = true;
    }
    
    function handleDiceRollerClose() {
        showDiceRoller = false;
        selectedSkill = null;
    }
</script>

<div class="stealth-skills-container">
    <table class="stealth-skills-table">
        <thead>
            <tr>
                {#if !($editing && editable)}
                <th class="header-cell dice-column">🎲</th>
                {/if}
                <th class="header-cell header-left">STEALTH</th>
                <th class="header-cell">{#if editable && $editing}✏️ {/if}Ranks</th>
                {#if !($editing && editable)}
                <th class="header-cell">SKILL</th>
                <th class="header-cell">Total</th>
                {/if}
            </tr>
        </thead>
        <tbody>
            {#each stats as stat, index (stat.id)}
            {@const hasRanks = parseNumber(stat.value) > 0}
            {@const isEven = index % 2 === 0}
            {@const skillTotal = calculateTotal(stat.value)}
            <tr class:has-ranks={hasRanks} class:even-row={isEven} class:odd-row={!isEven}>
                {#if !($editing && editable)}
                <td class="dice-cell">
                    <button 
                        class="dice-button" 
                        on:click={() => handleDiceClick(stat.name, skillTotal, stat.value)}
                        title="Roll dice for {stat.name}">
                        🎲
                    </button>
                </td>
                {/if}
                <td class="skill-name tooltip-trigger"
                    on:mouseenter={(e) => handleMouseEnter(e, stat.name)}
                    on:mouseleave={handleMouseLeave}
                    on:mousemove={handleMouseMove}>{stat.name}</td>
                {#if editable && $editing}
                <td class="skill-value ranks" 
                    contenteditable="true" 
                    bind:innerText={stat.value}
                    on:blur={() => stats = [...stats]}>
                </td>
                {:else}
                <td class="skill-value ranks">{stat.value}</td>
                {/if}
                {#if !($editing && editable)}
                <td class="skill-value current-skill">{currentSkill}</td>
                <td class="skill-value total">{skillTotal}</td>
                {/if}
            </tr>
            {/each}
        </tbody>
    </table>
</div>

{#if hoveredSkill && getSkillDescription(hoveredSkill)}
    <div class="tooltip" style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px">
        <div class="tooltip-title">{hoveredSkill}</div>
        <div class="tooltip-content">{getSkillDescription(hoveredSkill)}</div>
    </div>
{/if}

{#if showDiceRoller && selectedSkill}
    <DiceRoller 
        skillName={selectedSkill.name}
        skillTotal={selectedSkill.total}
        ranks={selectedSkill.ranks}
        baseSkill={selectedSkill.baseSkill}
        baseStatType={selectedSkill.baseStatType}
        currentLuck={currentLuck}
        onLuckDecrease={onLuckDecrease}
        on:close={handleDiceRollerClose}
    />
{/if}

<style lang="scss">
    .stealth-skills-container {
        padding: 0 0.5rem;
        margin: 0;
        display: block;
        font-size: initial;
        width: 100%;
        box-sizing: border-box;
    }

    .stealth-skills-table {
        border-collapse: collapse;
        border-spacing: 0;
        width: 100%;
        margin: 0;
        padding: 0;
        table-layout: fixed;
        box-sizing: border-box;
    }

    .stealth-skills-table thead {
        border-bottom: 2px solid rgba(var(--accent), 0.4);
        margin: 0;
        padding: 0;
    }
    
    .stealth-skills-table tbody {
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
        width: calc(55% - 3rem);
    }

    .header-cell:not(.header-left):not(.dice-column) {
        width: 15%;
    }

    .stealth-skills-table tbody tr {
        border-bottom: 1px solid rgba(var(--accent), 0.2);
        transition: background 0.2s ease;
    }

    .stealth-skills-table tbody tr.even-row:not(.has-ranks) {
        background: rgba(var(--accent), 0.05);
    }

    .stealth-skills-table tbody tr.odd-row:not(.has-ranks) {
        background: rgba(var(--accent), 0.1);
    }

    .stealth-skills-table tbody tr.even-row.has-ranks {
        background: rgba(100, 200, 100, 0.15);
    }

    .stealth-skills-table tbody tr.odd-row.has-ranks {
        background: rgba(100, 200, 100, 0.25);
    }

    .stealth-skills-table tbody tr:hover:not(.has-ranks) {
        background: rgba(var(--accent), 0.2);
    }

    .stealth-skills-table tbody tr:hover.has-ranks {
        background: rgba(100, 200, 100, 0.35);
    }

    .stealth-skills-table td {
        white-space: pre-wrap;
        text-shadow: var(--shadow);
        padding: 0.5rem 0.75rem;
        color: rgba(var(--primary), 0.9);
        vertical-align: middle;
    }

    .dice-cell {
        width: 3rem;
        padding: 0.5rem 0.5rem;
        text-align: center;
        vertical-align: middle;
    }
    
    .dice-button {
        background: transparent;
        border: 1px solid rgba(var(--accent), 0.5);
        border-radius: 0.2rem;
        color: rgb(var(--accent));
        font-size: 1rem;
        cursor: pointer;
        padding: 0.1rem 0.3rem;
        transition: all 0.2s ease;
        width: 100%;
        line-height: 1.2;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 0;
        
        &:hover {
            background: rgba(var(--accent), 0.2);
            border-color: rgb(var(--accent));
            transform: scale(1.05);
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
        width: calc(55% - 3rem);
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
