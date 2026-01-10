<script lang="ts">
    // Import stores
    import { editing } from "../stores";
    import { currentPlayerId, viewingPlayerId } from "../services/OBRHelper";
    import type { AFFSheetStats } from '../types/sheet.type';
    import DiceRoller from './DiceRoller.svelte';

    // Export
    export let stats: AFFSheetStats[] = [];
    export let currentSkill: number = 0; // Current SKILL or PSIONICS value (whichever is higher) from Characteristics

    $: editable = $currentPlayerId === $viewingPlayerId;
    
    // Dice roller state
    let showDiceRoller: boolean = false;
    let selectedSkill: { name: string; total: number } | null = null;
    
    // Skill descriptions for tooltips (Science skills only)
    const skillDescriptions: Record<string, string> = {
        "Archaeology": "Study of ancient civilizations through artifacts, ruins, and historical evidence. Essential for understanding lost cultures, deciphering ancient technologies, and preserving historical knowledge. Covers excavation techniques, artifact analysis, and cultural interpretation.",
        "Biology": "Study of living organisms including anatomy, physiology, and evolution. Covers both familiar and alien life forms, making the Hero a xenobiologist. Essential for medical diagnosis, understanding alien species, and biological research across different worlds.",
        "Botany": "Study of plant life across different worlds and environments. Covers identification, cultivation, and properties of alien flora. Essential for agriculture, identifying edible or dangerous plants, and understanding planetary ecosystems.",
        "Chemistry": "Study of matter, molecular structure, and chemical reactions. Essential for synthesizing compounds, analyzing substances, creating medicines, and understanding material properties. Useful for forensic analysis and scientific research.",
        "Ecology": "Study of ecosystems and the relationships between organisms and their environments. Essential for understanding planetary biospheres, environmental hazards, and ecosystem stability. Useful for terraforming assessment and environmental protection missions.",
        "Geology": "Study of planetary structure, formation, and geological processes. Essential for assessing planetary stability, identifying mineral resources, and understanding geological hazards. Useful for mining operations and planetary survey missions.",
        "Meteorology": "Study of atmospheric conditions, weather patterns, and climate systems. Essential for predicting weather hazards, understanding atmospheric composition, and planning operations based on environmental conditions. Useful for planetary exploration and colonization.",
        "Oceanography": "Study of oceanic systems including currents, tides, and marine ecosystems. Essential for missions involving water worlds, underwater exploration, and understanding marine environments. Covers both familiar and alien aquatic systems.",
        "Physics": "Study of fundamental physical laws including matter, spacetime, energy, and forces. Essential for understanding warp drive, subspace theory, and advanced technologies. Critical for theoretical research and engineering applications.",
        "Zoology": "Study of animal life including behavior, ecology, evolution, and anatomy. Covers both familiar and alien species. Essential for understanding animal behavior, identifying dangerous creatures, and xenozoological research. Useful for exploration and wildlife encounters."
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
    
    // Helper function to calculate total (ranks + current skill/psionics)
    function calculateTotal(ranksValue: string): number {
        const ranks = parseNumber(ranksValue);
        return ranks + currentSkill;
    }
    
    // Track which tooltip is shown
    let hoveredSkill: string | null = null;
    let showHeaderTooltip: boolean = false;
    let tooltipElement: HTMLElement | null = null;
    let tooltipPosition = { x: 0, y: 0 };
    
    function handleMouseEnter(event: MouseEvent, skillName: string) {
        hoveredSkill = skillName;
        showHeaderTooltip = false;
        const target = event.currentTarget as HTMLElement;
        tooltipElement = target;
        updateTooltipPosition(event);
    }
    
    function handleHeaderMouseEnter(event: MouseEvent) {
        showHeaderTooltip = true;
        hoveredSkill = null;
        updateTooltipPosition(event);
    }
    
    function handleMouseMove(event: MouseEvent) {
        if (hoveredSkill || showHeaderTooltip) {
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
    
    function handleHeaderMouseLeave() {
        showHeaderTooltip = false;
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

<div class="science-skills-container">
    <table class="science-skills-table">
        <thead>
            <tr>
                <th class="header-cell dice-column">🎲</th>
                <th class="header-cell header-left">SCIENCE SPECIAL SKILL</th>
                <th class="header-cell">{#if editable && $editing}✏️ {/if}Ranks</th>
                <th class="header-cell tooltip-trigger header-skill-psionics"
                    on:mouseenter={handleHeaderMouseEnter}
                    on:mouseleave={handleHeaderMouseLeave}
                    on:mousemove={handleMouseMove}>SKILL/PSIONICS</th>
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
                <td class="skill-value current-skill">{currentSkill}</td>
                <td class="skill-value total">{skillTotal}</td>
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

{#if showHeaderTooltip}
    <div class="tooltip" style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px">
        <div class="tooltip-title">SKILL/PSIONICS</div>
        <div class="tooltip-content">The higher value between SKILL and PSIONICS is automatically used for Science Special Skills calculations.</div>
    </div>
{/if}

{#if showDiceRoller && selectedSkill}
    <DiceRoller 
        skillName={selectedSkill.name}
        skillTotal={selectedSkill.total}
        on:close={handleDiceRollerClose}
    />
{/if}

<style lang="scss">
    .science-skills-container {
        padding: 0 0.5rem;
        margin: 0;
        display: block;
        font-size: initial;
        width: 100%;
        box-sizing: border-box;
    }

    .science-skills-table {
        border-collapse: collapse;
        border-spacing: 0;
        width: 100%;
        margin: 0;
        padding: 0;
        table-layout: fixed;
        box-sizing: border-box;
    }

    .science-skills-table thead {
        border-bottom: 2px solid rgba(var(--accent), 0.4);
        margin: 0;
        padding: 0;
    }
    
    .science-skills-table tbody {
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

    .header-cell.header-skill-psionics {
        cursor: help;
    }

    .science-skills-table tbody tr {
        border-bottom: 1px solid rgba(var(--accent), 0.2);
        transition: background 0.2s ease;
    }

    .science-skills-table tbody tr.even-row:not(.has-ranks) {
        background: rgba(var(--accent), 0.05);
    }

    .science-skills-table tbody tr.odd-row:not(.has-ranks) {
        background: rgba(var(--accent), 0.1);
    }

    .science-skills-table tbody tr.even-row.has-ranks {
        background: rgba(100, 200, 100, 0.15);
    }

    .science-skills-table tbody tr.odd-row.has-ranks {
        background: rgba(100, 200, 100, 0.25);
    }

    .science-skills-table tbody tr:hover:not(.has-ranks) {
        background: rgba(var(--accent), 0.2);
    }

    .science-skills-table tbody tr:hover.has-ranks {
        background: rgba(100, 200, 100, 0.35);
    }

    .science-skills-table td {
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
