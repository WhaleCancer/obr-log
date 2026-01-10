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
    
    // Skill descriptions for tooltips (note: skill names match what's on the sheet, which uses "Pilot - Air" format)
    const skillDescriptions: Record<string, string> = {
        "Acrobatics": "Gymnastic agility and coordination for navigating complex environments. Essential for zero-gravity work, shipboard maintenance, and evading obstacles. Enables tightrope work, swinging across gaps, and maintaining balance in unstable conditions.",
        "Climb": "Proficiency in scaling vertical surfaces including ship hulls, building exteriors, and natural rock faces. Essential for away team missions requiring access to difficult locations or emergency escape situations.",
        "Dodge": "Evasive maneuvering to avoid incoming phaser fire, explosions, and physical attacks. This skill allows characters to reduce or avoid damage by not being where the attack is aimed. Essential for combat survival.",
        "Jump": "Skill in leaping across gaps, obstacles, and hazards. Covers long jumps, high jumps, and precision landings. Useful in shipboard combat and planetary exploration where mobility can mean survival.",
        "Pilot - Air": "Proficiency in operating atmospheric flight vehicles including shuttlecraft in atmosphere, aircars, and various aircraft. Essential for planetary operations, aerial reconnaissance, and atmospheric transport missions. Includes evasive maneuvers and precision flying.",
        "Pilot - Ground": "Operating ground vehicles including hovercraft, wheeled transports, tracked vehicles, and walking mechs. Essential for planetary surface operations and base transportation. Covers various propulsion systems and vehicle types.",
        "Pilot - Space": "Operating spacecraft from small fighters to massive starships. Essential for navigation, maneuvering, and combat operations in space. Requires understanding of inertial dampeners, warp drive systems, and tactical maneuvering. The most prestigious piloting skill in Starfleet.",
        "Pilot - Water": "Operating watercraft including surface vessels, submarines, and aquatic transports. Essential for missions on water worlds and aquatic environments. Covers both surface and underwater navigation and vehicle operation.",
        "Ride": "Proficiency in riding alien mounts and domesticated creatures for transportation. Useful on primitive worlds or when vehicles are unavailable. Covers various mount types and riding techniques across different planetary environments.",
        "Run": "Sustained running ability for pursuit, evasion, and rapid movement across terrain. Essential for away team members who may need to escape danger or cover ground quickly during missions.",
        "Swim": "Aquatic mobility for navigating water environments. Essential for missions involving oceans, lakes, or flooded areas. Covers efficient swimming techniques, endurance, and underwater movement. Critical when aquatic vehicles fail or are unavailable."
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
    
    function handleDiceClick(skillName: string, skillTotal: number) {
        selectedSkill = { name: skillName, total: skillTotal };
        showDiceRoller = true;
    }
    
    function handleDiceRollerClose() {
        showDiceRoller = false;
        selectedSkill = null;
    }
</script>

<div class="movement-skills-container">
    <table class="movement-skills-table">
        <thead>
            <tr>
                <th class="header-cell dice-column">🎲</th>
                <th class="header-cell header-left">MOVEMENT SPECIAL SKILL</th>
                <th class="header-cell">{#if editable && $editing}✏️ {/if}Ranks</th>
                <th class="header-cell">SKILL</th>
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

{#if showDiceRoller && selectedSkill}
    <DiceRoller 
        skillName={selectedSkill.name}
        skillTotal={selectedSkill.total}
        on:close={handleDiceRollerClose}
    />
{/if}

<style lang="scss">
    .movement-skills-container {
        padding: 0 0.5rem;
        margin: 0;
        display: block;
        font-size: initial;
        width: 100%;
        box-sizing: border-box;
    }

    .movement-skills-table {
        border-collapse: collapse;
        border-spacing: 0;
        width: 100%;
        margin: 0;
        padding: 0;
        table-layout: fixed;
        box-sizing: border-box;
    }

    .movement-skills-table thead {
        border-bottom: 2px solid rgba(var(--accent), 0.4);
        margin: 0;
        padding: 0;
    }
    
    .movement-skills-table tbody {
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

    .movement-skills-table tbody tr {
        border-bottom: 1px solid rgba(var(--accent), 0.2);
        transition: background 0.2s ease;
    }

    .movement-skills-table tbody tr.even-row:not(.has-ranks) {
        background: rgba(var(--accent), 0.05);
    }

    .movement-skills-table tbody tr.odd-row:not(.has-ranks) {
        background: rgba(var(--accent), 0.1);
    }

    .movement-skills-table tbody tr.even-row.has-ranks {
        background: rgba(100, 200, 100, 0.15);
    }

    .movement-skills-table tbody tr.odd-row.has-ranks {
        background: rgba(100, 200, 100, 0.25);
    }

    .movement-skills-table tbody tr:hover:not(.has-ranks) {
        background: rgba(var(--accent), 0.2);
    }

    .movement-skills-table tbody tr:hover.has-ranks {
        background: rgba(100, 200, 100, 0.35);
    }

    .movement-skills-table td {
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
