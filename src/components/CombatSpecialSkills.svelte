<script lang="ts">
    // Import stores
    import { editing } from "../stores";
    import { currentPlayerId, viewingPlayerId } from "../services/OBRHelper";
    import type { AFFSheetStats } from '../types/sheet.type';
    import DiceRoller from './DiceRoller.svelte';
    import { specialSkillPoints, maxSpecialSkillRanks } from '../data/specialSkillPoints';
    import { getCumulativeSpecialSkillCost, getSpecialSkillCost } from '../data/specialSkillCosts';

    // Export
    export let stats: AFFSheetStats[] = [];
    export let currentSkill: number = 0; // Current SKILL value from Characteristics
    export let currentLuck: number = 0; // Current LUCK value from Characteristics
    export let onLuckDecrease: () => void = () => {}; // Callback to decrease LUCK
    export let grade: string = "Veteran"; // Character grade for max ranks and available points
    export let availableSpecialSkillPoints: number = 0; // Available points (calculated at Sheet level)
    export let pointsSpentOnOtherSections: number = 0; // Points spent in other special skills sections

    $: editable = $currentPlayerId === $viewingPlayerId;
    $: availablePoints = availableSpecialSkillPoints || (specialSkillPoints[grade] || specialSkillPoints["Veteran"]);
    $: maxRanks = maxSpecialSkillRanks[grade] || maxSpecialSkillRanks["Veteran"];
    
    // Dice roller state
    let showDiceRoller: boolean = false;
    let selectedSkill: { name: string; total: number; ranks: number; baseSkill: number; baseStatType: 'SKILL' | 'PSIONICS' } | null = null;
    
    // Skill descriptions for tooltips
    const skillDescriptions: Record<string, string> = {
        "Armor": "Training in wearing and using Starfleet combat armor, environmental suits, and personal protective equipment. This skill ensures armor provides maximum protection without hindering movement or combat effectiveness.",
        "Brawling": "Hand-to-hand combat using fists, kicks, and grappling techniques. Essential when phasers fail or close-quarters combat prevents ranged weapons. Covers Starfleet martial arts and improvised combat.",
        "Firearms - Heavy": "Operating the photon mortar, an extremely heavy energy weapon requiring significant strength and training. This massive weapon inflicts devastating damage but is difficult to transport and deploy.",
        "Firearms - Light": "Proficiency with hand-held energy weapons including type I and II phasers, phaser rifles, disruptor pistols, and compact beam weapons. Essential for Starfleet security and away team operations.",
        "Firearms - Vehicle": "Operating mounted weapons on shuttlecraft, ground vehicles, and defensive installations. Covers phaser emplacements, torpedo launchers, and automated defense systems.",
        "Melee Weapons": "Combat proficiency with bladed and impact weapons including bat'leths, mek'leths, lirpas, and Starfleet combat knives. Useful when phasers are unavailable or during ceremonial combat.",
        "Starship Gunnery": "Operating starship weapon systems including phaser banks and photon torpedo launchers. Requires understanding of targeting, weapon arcs, and coordination with tactical systems.",
        "Thrown": "Accurately throwing projectiles including grenades, knives, and improvised weapons. Useful for ranged attacks when energy weapons are unavailable or for creating tactical advantages."
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
    
    // Calculate points spent on Combat special skills
    function calculatePointsSpent(): number {
        let points = 0;
        for (const stat of stats) {
            const rank = parseNumber(stat.value);
            if (rank > 0) {
                points += getCumulativeSpecialSkillCost('combat', rank);
            }
        }
        return points;
    }
    
    $: pointsSpent = calculatePointsSpent();
    $: pointsRemaining = availablePoints - pointsSpentOnOtherSections - pointsSpent;
    
    // Handle increase rank
    function handleIncreaseRank(stat: AFFSheetStats) {
        const currentRank = parseNumber(stat.value);
        const newRank = currentRank + 1;
        
        // Check max rank
        if (newRank > maxRanks) {
            alert(`Cannot increase ${stat.name} above maximum rank (${maxRanks}) for grade ${grade}`);
            return;
        }
        
        // Check if we can afford the increase (cost is the cost of the new rank)
        const cost = getSpecialSkillCost('combat', currentRank, newRank);
        if (pointsRemaining < cost) {
            alert(`Not enough special skill points! You need ${cost} points but only have ${pointsRemaining} remaining.`);
            return;
        }
        
        // Update the stat
        const updatedStats = stats.map(s => 
            s.id === stat.id 
                ? { ...s, value: newRank.toString() }
                : s
        );
        stats = updatedStats;
    }
    
    // Handle decrease rank
    function handleDecreaseRank(stat: AFFSheetStats) {
        const currentRank = parseNumber(stat.value);
        if (currentRank <= 0) return;
        
        const newRank = currentRank - 1;
        const updatedStats = stats.map(s => 
            s.id === stat.id 
                ? { ...s, value: newRank.toString() }
                : s
        );
        stats = updatedStats;
    }
    
    // Check if can increase rank
    function canIncreaseRank(stat: AFFSheetStats): boolean {
        const currentRank = parseNumber(stat.value);
        if (currentRank >= maxRanks) return false;
        
        const newRank = currentRank + 1;
        const cost = getSpecialSkillCost('combat', currentRank, newRank);
        return pointsRemaining >= cost;
    }
    
    // Check if can decrease rank
    function canDecreaseRank(stat: AFFSheetStats): boolean {
        const currentRank = parseNumber(stat.value);
        return currentRank > 0;
    }
    
    // Get disabled reason for increase
    function getIncreaseDisabledReason(stat: AFFSheetStats): string {
        const currentRank = parseNumber(stat.value);
        if (currentRank >= maxRanks) {
            return `Cannot exceed maximum rank (${maxRanks}) for grade ${grade}`;
        }
        
        const newRank = currentRank + 1;
        const cost = getSpecialSkillCost('combat', currentRank, newRank);
        if (pointsRemaining < cost) {
            return `Not enough special skill points (need ${cost}, have ${pointsRemaining})`;
        }
        
        return "";
    }
    
    // Get disabled reason for decrease
    function getDecreaseDisabledReason(stat: AFFSheetStats): string {
        const currentRank = parseNumber(stat.value);
        if (currentRank <= 0) {
            return "Cannot decrease below 0";
        }
        return "";
    }
</script>

<div class="combat-skills-container">
    <table class="combat-skills-table">
        <thead>
            <tr>
                {#if !($editing && editable)}
                <th class="header-cell dice-column">🎲</th>
                {/if}
                <th class="header-cell header-left">COMBAT</th>
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
                <td class="skill-value ranks rank-editor">
                    <button 
                        class="adjust-button decrease-button"
                        on:click={() => handleDecreaseRank(stat)}
                        title={!canDecreaseRank(stat) 
                            ? getDecreaseDisabledReason(stat)
                            : "Decrease Rank"}
                        disabled={!canDecreaseRank(stat)}
                    >
                        −
                    </button>
                    <span class="rank-value-display">{stat.value}</span>
                    <button 
                        class="adjust-button increase-button"
                        on:click={() => handleIncreaseRank(stat)}
                        title={!canIncreaseRank(stat)
                            ? getIncreaseDisabledReason(stat)
                            : "Increase Rank"}
                        disabled={!canIncreaseRank(stat)}
                    >
                        +
                    </button>
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
    .combat-skills-container {
        padding: 0 0.5rem;
        margin: 0;
        display: block;
        font-size: initial;
        width: 100%;
        box-sizing: border-box;
    }

    .combat-skills-table {
        border-collapse: collapse;
        border-spacing: 0;
        width: 100%;
        margin: 0;
        padding: 0;
        table-layout: fixed;
        box-sizing: border-box;
    }

    .combat-skills-table thead {
        border-bottom: 2px solid rgba(var(--accent), 0.4);
        margin: 0;
        padding: 0;
    }
    
    .combat-skills-table tbody {
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
    
    .rank-editor {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        padding: 0.25rem;
    }
    
    .rank-value-display {
        min-width: 1.5rem;
        text-align: center;
        font-weight: 600;
        color: rgb(var(--accent));
    }
    
    .adjust-button {
        background: rgba(var(--accent), 0.1);
        border: 1px solid rgba(var(--accent), 0.5);
        border-radius: 0.2rem;
        color: rgb(var(--accent));
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        padding: 0.1rem 0.4rem;
        transition: all 0.2s ease;
        min-width: 1.8rem;
        line-height: 1.2;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        
        &:hover:not(:disabled) {
            background: rgba(var(--accent), 0.3);
            border-color: rgb(var(--accent));
        }
        
        &:disabled {
            opacity: 0.4;
            cursor: not-allowed;
            background: rgba(var(--accent), 0.05);
            border-color: rgba(var(--accent), 0.2);
        }
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
