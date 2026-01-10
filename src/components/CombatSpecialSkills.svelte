<script lang="ts">
    // Import stores
    import { editing } from "../stores";
    import { currentPlayerId, viewingPlayerId } from "../services/OBRHelper";
    import type { AFFSheetStats } from '../types/sheet.type';

    // Export
    export let stats;
    export let currentSkill: number = 0; // Current SKILL value from Characteristics

    $: editable = $currentPlayerId === $viewingPlayerId;
    
    // Skill descriptions for tooltips
    const skillDescriptions: Record<string, string> = {
        "Armor": "The introduction of more and more powerful weapons has in turn driven the development of better and better armor to protect the soldiers and mercenaries of the galaxy. This armor ranges from a simple armored vest to full powered body armor weighing a ton or more. This special skill represents training in wearing and using this armor effectively.",
        "Brawling": "It can be a nightmare when you've lost your gun or dropped your laserblade, and when that happens it's down to good 'ol fists and kicks. Use the Brawling special skill when involved in any type of hand-to-hand combat, whether unarmed or wielding a makeshift weapon.",
        "Firearms - Heavy": "Conflict is inevitable, and sometimes it gets big, so this special skill covers the use of large weapons, such as rocket launchers, heavy machine guns, heavy lasers and anything else that inflicts a lot of damage and needs to be hefted by the user due to it's size and weight. Basically, if the weapon is bigger than you are, it's a heavy weapon.",
        "Firearms - Light": "Covering pistols, rifles and launchers of all kinds, the Firearms - Light special skill gives the Hero a much better chance of bulls-eyeing that target. If it shoots needles, bullets, balls of yellow light or beams of explosive energy, and you can hold it in one hand or put it to your shoulder, then this skill improves your chances of hitting.",
        "Firearms - Vehicle": "Not all weapons can be hefted, some have to be mounted to a vehicle, and this skill allows a Hero to use them. Whether it's a cannon mounted to a truck in a post-apocalyptic wasteland, a weapon under the wings of a scramjet fighter or a turret on a base, this skill gives you a much better chance.",
        "Melee Weapons": "Fists and blasters are fine, but sometimes you just want to save your ammo or the skin of your knuckles and just bash someone over the head. The Melee special skill gives Heroes a better chance of landing a landing a blow with an iron pipe, a sword or a laserblade.",
        "Starship Gunnery": "Firing a weapon in the vastness of space at a small craft as it traveling very very fast takes some skill and training to be successful. And this special skill is it. Launching missiles or firing a ship's laser both use this special skill.",
        "Thrown": "If it's not too heavy, and you can get some range, you can throw it. The Thrown skill is for throwing rocks, chairs, knives, grenades, and anything that comes to hand with an increased degree of accuracy."
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
</script>

<div class="combat-skills-container">
    <table class="combat-skills-table">
        <thead>
            <tr>
                <th class="header-cell header-left">COMBAT SPECIAL SKILL</th>
                <th class="header-cell">Ranks</th>
                <th class="header-cell">SKILL</th>
                <th class="header-cell">Total</th>
            </tr>
        </thead>
        <tbody>
            {#each stats as stat, index (stat.id)}
            {@const hasRanks = parseNumber(stat.value) > 0}
            {@const isEven = index % 2 === 0}
            <tr class:has-ranks={hasRanks} class:even-row={isEven} class:odd-row={!isEven}>
                {#if editable && $editing}
                <td class="skill-name" 
                    contenteditable="true" 
                    bind:innerText={stat.name}
                    on:mouseenter={(e) => handleMouseEnter(e, stat.name)}
                    on:mouseleave={handleMouseLeave}
                    on:mousemove={handleMouseMove}>{stat.name}</td>
                {:else}
                <td class="skill-name tooltip-trigger"
                    on:mouseenter={(e) => handleMouseEnter(e, stat.name)}
                    on:mouseleave={handleMouseLeave}
                    on:mousemove={handleMouseMove}>{stat.name}</td>
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

{#if hoveredSkill && getSkillDescription(hoveredSkill)}
    <div class="tooltip" style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px">
        <div class="tooltip-title">{hoveredSkill}</div>
        <div class="tooltip-content">{getSkillDescription(hoveredSkill)}</div>
    </div>
{/if}

<style lang="scss">
    .combat-skills-container {
        padding: 1rem 0.5rem 0 0.5rem;
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
