<script lang="ts">
    // Import stores
    import { editing } from "../stores";
    import { currentPlayerId, viewingPlayerId } from "../services/OBRHelper";
    import type { AFFSheetStats } from '../types/sheet.type';
    import DiceRoller from './DiceRoller.svelte';

    // Export
    export let stats: AFFSheetStats[] = [];
    export let currentSkill: number = 0; // Current SKILL value from Characteristics

    $: editable = $currentPlayerId === $viewingPlayerId;
    
    // Dice roller state
    let showDiceRoller: boolean = false;
    let selectedSkill: { name: string; total: number } | null = null;
    
    // Skill descriptions for tooltips (Knowledge skills only - Science skills moved to ScienceSpecialSkills)
    const skillDescriptions: Record<string, string> = {
        "Animal Skills": "Knowledge of caring for and managing alien animals and domesticated creatures. Essential for transporting livestock, encountering wild alien species, and tending to mounts. Covers animal behavior, biology, and handling techniques across different planetary environments.",
        "Astronavigation": "Skill in plotting courses through space using star charts, navigational beacons, and stellar references. Essential for interstellar travel and avoiding hazards like black holes, nebulae, and gravitational anomalies. Critical for long-range missions across star systems and sectors.",
        "Bargain": "Negotiation and persuasion skills for trading, diplomacy, and conflict resolution. Essential for commerce, bartering with alien species, and achieving peaceful outcomes. Covers cultural understanding, value assessment, and verbal persuasion techniques.",
        "Bureaucracy": "Understanding of administrative procedures, regulations, and official protocols. Essential for navigating Starfleet paperwork, securing permits, accessing restricted facilities, and dealing with government institutions across different cultures and jurisdictions.",
        "Communications": "Proficiency in operating communication systems including subspace transmitters, hailing frequencies, and long-range comms. Essential for establishing contact with alien vessels, tracking distress signals, and coordinating fleet operations. Covers various communication protocols and technologies.",
        "Computers": "Proficiency in programming, operating, and repairing computer systems. Covers ship computers, handheld devices, and AI systems. Essential for data analysis, system repairs, and when necessary, bypassing security protocols. Includes knowledge of various operating systems and programming languages.",
        "Engineering": "Technical knowledge for maintaining and repairing starships, vehicles, and systems. Essential for fixing energy converters, hull plating, plasma systems, and jury-rigging solutions. Covers all vehicle types and critical for keeping vessels operational during missions.",
        "Etiquette": "Understanding of cultural customs, social protocols, and proper behavior across different species and civilizations. Essential for diplomatic missions, avoiding cultural offenses, and building positive relationships. Critical for Starfleet officers interacting with alien cultures.",
        "Evaluate": "Skill in appraising the value of items, technology, and resources on the market. Essential for salvage operations, trading, and determining worth of artifacts or equipment. Covers various markets and economies across different worlds and civilizations.",
        "Languages": "Proficiency in speaking and reading additional languages beyond the common tongue. Essential for direct communication with alien species, understanding ancient texts, and cultural immersion. Each rank allows mastery of one additional language of choice.",
        "Law": "Knowledge of legal systems, regulations, and jurisdictional laws across different governments and cultures. Essential for staying within legal boundaries, understanding rights and obligations, and navigating complex legal situations. Covers Federation law and various alien legal systems.",
        "Leadership": "Ability to inspire, command, and coordinate team members. Essential for tactical operations, crew management, and achieving mission objectives. Covers delegation, morale maintenance, and crisis leadership. Critical for officers and away team leaders.",
        "Medicine": "Medical knowledge for treating injuries and illnesses. Essential for battlefield medicine, alien physiology, and emergency care. Covers diagnosis, treatment, and surgery for various species. Critical for away team medics and shipboard medical officers.",
        "Planetary Navigation": "Ability to determine position and navigate on planetary surfaces using star charts, coordinates, and landmarks. Essential for exploration of unmapped worlds, finding bearings without satellite assistance, and surface operations. Critical for away team missions on new planets.",
        "Sensors": "Proficiency in operating sensor arrays and scanners for detection and analysis. Covers handheld tricorders, starship sensors, and specialized scanning equipment. Essential for identifying life forms, detecting energy signatures, analyzing materials, and surveying planetary environments.",
        "Survival": "Ability to survive in hostile environments with minimal resources. Essential when technology fails or during emergency situations. Covers finding food and water, building shelter, avoiding hazards, and basic survival techniques. Critical for crash landings and extended away missions. Can aid in emergency space survival situations.",
        "Trade Knowledge": "Understanding of commerce, markets, and economic systems across different worlds and civilizations. Essential for identifying profitable trade routes, understanding supply and demand, and conducting business with alien species. Covers commodities, currencies, and trade regulations."
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

<div class="knowledge-skills-container">
    <table class="knowledge-skills-table">
        <thead>
            <tr>
                <th class="header-cell dice-column">🎲</th>
                <th class="header-cell header-left">KNOWLEDGE SPECIAL SKILL</th>
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
        <div class="tooltip-content">The higher value between SKILL and PSIONICS is automatically used for Knowledge Special Skills calculations.</div>
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
    .knowledge-skills-container {
        padding: 0 0.5rem;
        margin: 0;
        display: block;
        font-size: initial;
        width: 100%;
        box-sizing: border-box;
    }

    .knowledge-skills-table {
        border-collapse: collapse;
        border-spacing: 0;
        width: 100%;
        margin: 0;
        padding: 0;
        table-layout: fixed;
        box-sizing: border-box;
    }

    .knowledge-skills-table thead {
        border-bottom: 2px solid rgba(var(--accent), 0.4);
        margin: 0;
        padding: 0;
    }
    
    .knowledge-skills-table tbody {
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

    .knowledge-skills-table tbody tr {
        border-bottom: 1px solid rgba(var(--accent), 0.2);
        transition: background 0.2s ease;
    }

    .knowledge-skills-table tbody tr.even-row:not(.has-ranks) {
        background: rgba(var(--accent), 0.05);
    }

    .knowledge-skills-table tbody tr.odd-row:not(.has-ranks) {
        background: rgba(var(--accent), 0.1);
    }

    .knowledge-skills-table tbody tr.even-row.has-ranks {
        background: rgba(100, 200, 100, 0.15);
    }

    .knowledge-skills-table tbody tr.odd-row.has-ranks {
        background: rgba(100, 200, 100, 0.25);
    }

    .knowledge-skills-table tbody tr:hover:not(.has-ranks) {
        background: rgba(var(--accent), 0.2);
    }

    .knowledge-skills-table tbody tr:hover.has-ranks {
        background: rgba(100, 200, 100, 0.35);
    }

    .knowledge-skills-table td {
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
