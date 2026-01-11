<script lang="ts">
    // Import stores
    import { editing } from "../stores";
    import { currentPlayerId, viewingPlayerId } from "../services/OBRHelper";
    import { diceRolls } from "../stores/diceRolls";
    import type { AFFSheetStats } from '../types/sheet.type';
    import DiceRoller from './DiceRoller.svelte';
    import { gradePoints } from '../data/gradePoints';
    import { getMaxValue, baseCharacteristics } from '../data/gradeMaxValues';
    import { characteristicCosts } from '../data/characteristicCosts';

    // Export
    export let stats: AFFSheetStats[] = [];
    export let onLuckDecrease: () => void = () => {}; // Callback to decrease LUCK
    export let grade: string = "Veteran"; // Grade from Character Info section

    $: editable = $currentPlayerId === $viewingPlayerId;
    
    // Get current SKILL and LUCK values from stats
    $: skillStat = stats.find(s => s.name === "SKILL");
    $: luckStat = stats.find(s => s.name === "LUCK");
    $: currentSkillValue = skillStat ? parseInt(parseValue(skillStat.value || '0/0').current || '0', 10) || 0 : 0;
    $: currentLuckValue = luckStat ? parseInt(parseValue(luckStat.value || '0/0').current || '0', 10) || 0 : 0;
    
    // Dice roller state
    let showDiceRoller: boolean = false;
    let diceRollerMode: 'skill' | 'luck' | null = null;
    
    // Helper function to parse initial/current from value
    function parseValue(value: string) {
        const parts = value.split('/');
        return {
            initial: parts[0]?.trim() || '0',
            current: parts[1]?.trim() || parts[0]?.trim() || '0'
        };
    }
    
    // Find PSIONICS and PSI POINTS stats
    $: psionicsStat = stats.find(s => s.name === "PSIONICS");
    $: psiPointsStat = stats.find(s => s.name === "PSI POINTS");
    
    // Get PSIONICS initial value
    $: psionicsInitial = psionicsStat ? parseValue(psionicsStat.value || '0/0').initial : '0';
    $: psionicsInitialNum = parseInt(psionicsInitial || '0', 10);
    
    // Calculate PSI POINTS initial value (3x PSIONICS initial) - always calculated for display
    $: psiPointsInitialCalculated = (psionicsInitialNum * 3).toString();
    
    // Create derived stats with initial and current values
    $: statValues = (stats || []).map(stat => {
        const parsed = parseValue(stat.value || '0/0');
        
        // For PSI POINTS, always use calculated initial (3x PSIONICS initial) for display
        let initial = parsed.initial;
        if (stat.name === "PSI POINTS") {
            initial = psiPointsInitialCalculated;
        }
        
        const warnings = validateCharacteristic(stat.name, parseInt(initial || '0', 10), parseInt(parsed.current || '0', 10));
        
        return {
            stat: stat,
            initial: initial,
            current: parsed.current,
            warnings: warnings
        };
    }).filter(item => {
        // In non-edit mode, hide PSIONICS and PSI POINTS if PSIONICS initial is 0
        if (!$editing && psionicsInitialNum === 0) {
            return item.stat.name !== "PSIONICS" && item.stat.name !== "PSI POINTS";
        }
        return true;
    });
    
    // Helper function to update value when initial or current changes
    function handleInitialChange(stat: AFFSheetStats, event: Event) {
        // Don't allow editing PSI POINTS initial value - it's calculated
        if (stat.name === "PSI POINTS") {
            const element = event.target as HTMLElement;
            element.innerText = psiPointsInitialCalculated; // Reset to calculated value
            return;
        }
        
        const element = event.target as HTMLElement;
        const newValue = element.innerText.trim();
        const parsed = parseValue(stat.value);
        const newStatValue = `${newValue}/${parsed.current}`;
        
        // Update the stat object immutably
        let updatedStats = stats.map(s => 
            s.id === stat.id 
                ? { ...s, value: newStatValue }
                : s
        );
        
        // If PSIONICS initial was changed, update PSI POINTS stored value (to keep current intact)
        if (stat.name === "PSIONICS" && psiPointsStat) {
            const psiPointsParsed = parseValue(psiPointsStat.value || '0/0');
            // Calculate new PSI POINTS initial (3x new PSIONICS initial)
            const newPsionicsInitialNum = parseInt(newValue || '0', 10);
            const newPsiPointsInitial = (newPsionicsInitialNum * 3).toString();
            const newPsiPointsValue = `${newPsiPointsInitial}/${psiPointsParsed.current}`;
            updatedStats = updatedStats.map(s => 
                s.id === psiPointsStat.id 
                    ? { ...s, value: newPsiPointsValue }
                    : s
            );
        }
        
        stats = updatedStats;
    }
    
    function handleCurrentChange(stat: AFFSheetStats, event: Event) {
        const element = event.target as HTMLElement;
        const newValue = element.innerText.trim();
        const parsed = parseValue(stat.value);
        const oldValue = parsed.current;
        
        // Only log if the value actually changed
        if (oldValue !== newValue) {
            // Log the characteristic change
            diceRolls.addCharacteristicChange(stat.name, oldValue, newValue);
        }
        
        const newStatValue = `${parsed.initial}/${newValue}`;
        
        // Update the stat object immutably to trigger reactivity
        const updatedStats = stats.map(s => 
            s.id === stat.id 
                ? { ...s, value: newStatValue }
                : s
        );
        // Update stats array immutably to ensure reactivity is triggered
        stats = updatedStats;
    }
    
    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    }
    
    function handleSkillDiceClick() {
        diceRollerMode = 'skill';
        showDiceRoller = true;
    }
    
    function handleLuckDiceClick() {
        diceRollerMode = 'luck';
        showDiceRoller = true;
    }
    
    function handleDiceRollerClose() {
        showDiceRoller = false;
        diceRollerMode = null;
    }
    
    // Get current value as number
    function getCurrentValue(statName: string): number {
        const stat = stats.find(s => s.name === statName);
        if (!stat) return 0;
        const parsed = parseValue(stat.value || '0/0');
        const current = parsed.current || parsed.initial || '0';
        return parseInt(current, 10) || 0;
    }
    
    // Get initial value as number
    function getInitialValue(statName: string): number {
        const stat = stats.find(s => s.name === statName);
        if (!stat) return 0;
        const parsed = parseValue(stat.value || '0/0');
        const initial = parsed.initial || '0';
        return parseInt(initial, 10) || 0;
    }
    
    // Calculate characteristic points spent
    function calculatePointsSpent(): number {
        let points = 0;
        for (const stat of stats) {
            if (stat.name === "PSI POINTS") continue; // PSI POINTS is calculated, not spent
            
            const initial = getInitialValue(stat.name);
            const base = baseCharacteristics[stat.name as keyof typeof baseCharacteristics] || 0;
            const valueIncrease = Math.max(0, initial - base);
            
            // Each point of STAMINA costs 1 characteristic point
            // Other characteristics (SKILL, LUCK, PSIONICS) cost 2 points per point
            const cost = characteristicCosts[stat.name] || 2;
            points += valueIncrease * cost;
        }
        return points;
    }
    
    // Get available characteristic points based on grade
    $: availablePoints = gradePoints[grade] || gradePoints["Veteran"];
    $: pointsSpent = calculatePointsSpent();
    $: pointsRemaining = availablePoints - pointsSpent;
    
    // Validate characteristics and return warning messages
    function validateCharacteristic(statName: string, initial: number, current: number): string[] {
        const warnings: string[] = [];
        
        // Check if current is higher than initial
        if (current > initial) {
            warnings.push(`Current value (${current}) cannot exceed Initial value (${initial})`);
        }
        
        // Check if initial exceeds max for grade (only for SKILL, STAMINA, LUCK, PSIONICS)
        if (["SKILL", "STAMINA", "LUCK", "PSIONICS"].includes(statName)) {
            const maxValue = getMaxValue(grade, statName);
            if (initial > maxValue) {
                warnings.push(`Initial value (${initial}) exceeds maximum (${maxValue}) for grade ${grade}`);
            }
        }
        
        return warnings;
    }
    
    
    // Handle + button for initial value
    function handleIncreaseInitial(stat: AFFSheetStats) {
        if (stat.name === "PSI POINTS") return; // PSI POINTS is calculated
        
        const parsed = parseValue(stat.value || '0/0');
        const currentInitial = parseInt(parsed.initial || '0', 10);
        const maxValue = getMaxValue(grade, stat.name);
        
        // Early validation - don't allow if button should be disabled
        // Pass the initial value as a string to match canIncreaseInitial signature
        if (!canIncreaseInitial(stat.name, parsed.initial || '0')) {
            return; // Button should be disabled, so don't process
        }
        
        // Cost and increase amount based on characteristic
        // SKILL, LUCK, PSIONICS: +1 per click, costs 2 points
        // STAMINA: +1 per click, costs 1 point
        let increaseAmount: number;
        let cost: number;
        
        if (stat.name === "STAMINA") {
            increaseAmount = 1;
            cost = 1;
        } else if (stat.name === "PSI POINTS") {
            // Should not reach here, but handle just in case
            return;
        } else {
            // SKILL, LUCK, PSIONICS
            increaseAmount = 1;
            cost = 2;
        }
        
        const newInitial = currentInitial + increaseAmount;
        
        // Double-check points remaining (safeguard)
        if (pointsRemaining < cost) {
            alert(`Not enough characteristic points! You need ${cost} points but only have ${pointsRemaining} remaining.`);
            return;
        }
        
        // Double-check max value (safeguard)
        if (newInitial > maxValue) {
            alert(`Cannot increase ${stat.name} above maximum value (${maxValue}) for grade ${grade}`);
            return;
        }
        
        // Update current if it's lower than new initial
        const currentNum = parseInt(parsed.current || '0', 10);
        const newCurrent = Math.max(currentNum, newInitial);
        const newStatValue = `${newInitial}/${newCurrent}`;
        
        let updatedStats = stats.map(s => 
            s.id === stat.id 
                ? { ...s, value: newStatValue }
                : s
        );
        
        // If PSIONICS initial was changed, update PSI POINTS
        if (stat.name === "PSIONICS" && psiPointsStat) {
            const psiPointsParsed = parseValue(psiPointsStat.value || '0/0');
            const newPsiPointsInitial = (newInitial * 3).toString();
            const newPsiPointsValue = `${newPsiPointsInitial}/${psiPointsParsed.current}`;
            updatedStats = updatedStats.map(s => 
                s.id === psiPointsStat.id 
                    ? { ...s, value: newPsiPointsValue }
                    : s
            );
        }
        
        stats = updatedStats;
    }
    
    // Handle - button for initial value
    function handleDecreaseInitial(stat: AFFSheetStats) {
        if (stat.name === "PSI POINTS") return; // PSI POINTS is calculated
        
        const parsed = parseValue(stat.value || '0/0');
        const currentInitial = parseInt(parsed.initial || '0', 10);
        const base = baseCharacteristics[stat.name as keyof typeof baseCharacteristics] || 0;
        
        // Decrease amount based on characteristic
        // All characteristics decrease by 1 per click
        const decreaseAmount = 1;
        const newInitial = currentInitial - decreaseAmount;
        
        // Don't allow going below base value
        if (newInitial < base) {
            return;
        }
        
        // Update current if it's higher than new initial
        const currentNum = parseInt(parsed.current || '0', 10);
        const newCurrent = Math.min(currentNum, newInitial);
        const newStatValue = `${newInitial}/${newCurrent}`;
        
        let updatedStats = stats.map(s => 
            s.id === stat.id 
                ? { ...s, value: newStatValue }
                : s
        );
        
        // If PSIONICS initial was changed, update PSI POINTS
        if (stat.name === "PSIONICS" && psiPointsStat) {
            const psiPointsParsed = parseValue(psiPointsStat.value || '0/0');
            const newPsiPointsInitial = (newInitial * 3).toString();
            const newPsiPointsValue = `${newPsiPointsInitial}/${psiPointsParsed.current}`;
            updatedStats = updatedStats.map(s => 
                s.id === psiPointsStat.id 
                    ? { ...s, value: newPsiPointsValue }
                    : s
            );
        }
        
        stats = updatedStats;
    }
    
    
    // Helper functions for button disabled states
    function canDecreaseInitial(statName: string, initial: string): boolean {
        if (statName === "PSI POINTS") return false;
        const initialNum = parseInt(initial || '0', 10);
        const base = baseCharacteristics[statName as keyof typeof baseCharacteristics] || 0;
        // All characteristics decrease by 1 per click
        const decreaseAmount = 1;
        return initialNum - decreaseAmount >= base;
    }
    
    function getDecreaseDisabledReason(statName: string, initial: string): string {
        if (statName === "PSI POINTS") return "PSI POINTS is calculated from PSIONICS and cannot be manually adjusted";
        const initialNum = parseInt(initial || '0', 10);
        const base = baseCharacteristics[statName as keyof typeof baseCharacteristics] || 0;
        if (initialNum <= base) {
            return `Cannot decrease below base value of ${base}`;
        }
        return "";
    }
    
    function canIncreaseInitial(statName: string, initial: string): boolean {
        if (statName === "PSI POINTS") return false;
        const initialNum = parseInt(initial || '0', 10);
        const maxValue = getMaxValue(grade, statName);
        
        // Cost based on characteristic
        // SKILL, LUCK, PSIONICS: +1 per click, costs 2 points
        // STAMINA: +1 per click, costs 1 point
        let increaseAmount: number;
        let cost: number;
        
        if (statName === "STAMINA") {
            increaseAmount = 1;
            cost = 1;
        } else {
            increaseAmount = 1;
            cost = 2;
        }
        
        return initialNum + increaseAmount <= maxValue && pointsRemaining >= cost;
    }
    
    function getIncreaseDisabledReason(statName: string, initial: string): string {
        if (statName === "PSI POINTS") return "PSI POINTS is calculated from PSIONICS and cannot be manually adjusted";
        const initialNum = parseInt(initial || '0', 10);
        const maxValue = getMaxValue(grade, statName);
        
        // Cost based on characteristic
        let increaseAmount: number;
        let cost: number;
        
        if (statName === "STAMINA") {
            increaseAmount = 1;
            cost = 1;
        } else {
            increaseAmount = 1;
            cost = 2;
        }
        
        const reasons: string[] = [];
        
        if (initialNum + increaseAmount > maxValue) {
            reasons.push(`Cannot exceed maximum value of ${maxValue} for grade ${grade}`);
        }
        
        if (pointsRemaining < cost) {
            reasons.push(`Not enough characteristic points (need ${cost}, have ${pointsRemaining})`);
        }
        
        return reasons.join(". ");
    }
</script>

<div class="characteristics-container">
    <table class="characteristics-table">
        <thead>
            <tr>
                {#if !($editing && editable)}
                <th class="header-cell dice-column">🎲</th>
                {/if}
                <th class="header-cell header-left">CHARACTERISTIC</th>
                <th class="header-cell">{#if editable}✏️ {/if}Current</th>
                <th class="header-cell">{#if editable && $editing}✏️ {/if}Initial</th>
            </tr>
        </thead>
        <tbody>
            {#each statValues as {stat, initial, current, warnings} (stat.id)}
            <tr class={stat.name === "SKILL" || stat.name === "LUCK" ? "has-dice" : ""}>
                {#if !($editing && editable)}
                    {#if stat.name === "SKILL" || stat.name === "LUCK"}
                        <td class="dice-cell">
                            <button 
                                class="dice-button"
                                on:click={stat.name === "SKILL" ? handleSkillDiceClick : handleLuckDiceClick}
                                title={stat.name === "SKILL" ? "Test your SKILL" : "Test your LUCK (loses 1 LUCK)"}
                            >
                                🎲
                            </button>
                        </td>
                    {:else}
                        <td class="dice-cell"></td>
                    {/if}
                {/if}
                {#if editable && $editing}
                <td class="stat-name" contenteditable="true" bind:innerText={stat.name}>{stat.name}</td>
                {:else}
                <td class="stat-name">{stat.name}</td>
                {/if}
                {#if editable}
                <td class="stat-value" 
                    contenteditable="true" 
                    on:blur={(e) => handleCurrentChange(stat, e)}
                    on:keydown={handleKeydown}>
                    {current}
                </td>
                {:else}
                <td class="stat-value">{current}</td>
                {/if}
                {#if editable && $editing}
                    {#if stat.name === "PSI POINTS"}
                        <td class="stat-value read-only">{initial}</td>
                    {:else}
                        <td class="stat-value initial-editor">
                            <button 
                                class="adjust-button decrease-button"
                                on:click={() => handleDecreaseInitial(stat)}
                                title={!canDecreaseInitial(stat.name, initial) 
                                    ? getDecreaseDisabledReason(stat.name, initial)
                                    : "Decrease Initial"}
                                disabled={!canDecreaseInitial(stat.name, initial)}
                            >
                                −
                            </button>
                            <span class="initial-value-display">{initial}</span>
                            <button 
                                class="adjust-button increase-button"
                                on:click={() => handleIncreaseInitial(stat)}
                                title={!canIncreaseInitial(stat.name, initial)
                                    ? getIncreaseDisabledReason(stat.name, initial)
                                    : "Increase Initial"}
                                disabled={!canIncreaseInitial(stat.name, initial)}
                            >
                                +
                            </button>
                        </td>
                    {/if}
                {:else}
                    <td class="stat-value" class:read-only={stat.name === "PSI POINTS"}>{initial}</td>
                {/if}
            </tr>
            {/each}
        </tbody>
    </table>
</div>

{#if showDiceRoller && diceRollerMode}
    {#if diceRollerMode === 'skill'}
        <DiceRoller 
            skillName="SKILL"
            skillTotal={currentSkillValue}
            ranks={0}
            baseSkill={currentSkillValue}
            baseStatType="SKILL"
            currentLuck={currentLuckValue}
            onLuckDecrease={onLuckDecrease}
            isStandaloneLuckTest={false}
            on:close={handleDiceRollerClose}
        />
    {:else if diceRollerMode === 'luck'}
        <DiceRoller 
            skillName="LUCK"
            skillTotal={currentLuckValue}
            ranks={0}
            baseSkill={currentLuckValue}
            baseStatType="SKILL"
            currentLuck={currentLuckValue}
            onLuckDecrease={onLuckDecrease}
            isStandaloneLuckTest={true}
            on:close={handleDiceRollerClose}
        />
    {/if}
{/if}


<style lang="scss">
    .characteristics-container {
        padding: 0 0.5rem;
        margin: 0;
        width: 100%;
        display: block;
        font-size: initial;
        box-sizing: border-box;
    }

    .characteristics-table {
        border-collapse: collapse;
        border-spacing: 0;
        width: 100%;
        margin: 0;
        padding: 0;
        table-layout: fixed;
        box-sizing: border-box;
    }

    .characteristics-table thead {
        border-bottom: 2px solid rgba(var(--accent), 0.4);
        margin: 0;
        padding: 0;
    }
    
    .characteristics-table tbody {
        margin: 0;
        padding: 0;
    }

    .header-cell {
        text-shadow: var(--shadow);
        color: rgb(var(--accent));
        font-size: 0.8rem;
        font-weight: 600;
        padding: 0.5rem 0.75rem;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    .header-cell.dice-column {
        width: 8%;
        padding: 0.5rem 0.25rem;
    }
    
    .header-cell.header-left {
        text-align: left;
        width: 40%;
    }
    
    .header-cell:not(.header-left):not(.dice-column) {
        width: 22%;
    }

    .characteristics-table tbody tr {
        border-bottom: 1px solid rgba(var(--accent), 0.2);
        transition: background 0.2s ease;
    }

    .characteristics-table tbody tr:nth-child(even) {
        background: rgba(var(--accent), 0.1);
    }

    .characteristics-table tbody tr:nth-child(odd) {
        background: rgba(var(--accent), 0.05);
    }

    .characteristics-table tbody tr:hover {
        background: rgba(var(--accent), 0.2) !important;
    }

    .characteristics-table td {
        white-space: pre-wrap;
        text-shadow: var(--shadow);
        padding: 0.5rem 0.75rem;
        color: rgba(var(--primary), 0.9);
        vertical-align: middle;
    }

    .stat-name {
        font-size: 1.2rem;
        font-weight: 700;
        color: rgb(var(--accent));
        text-transform: uppercase;
        letter-spacing: 0.08em;
        text-align: left;
        width: 45%;
        border-right: 1px solid rgba(var(--accent), 0.2);
    }

    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        text-align: center;
        color: rgba(var(--primary), 1);
        width: 20%;
        border-right: 1px solid rgba(var(--accent), 0.2);
    }
    
    .stat-value:hover:not(.read-only) {
        color: rgb(var(--accent));
        transition: color 0.2s ease;
    }
    
    .stat-value.read-only {
        cursor: default;
        opacity: 0.9;
    }
    
    .stat-value.initial-editor {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.3rem;
        padding: 0.25rem;
        width: 100%;
    }
    
    .initial-value-display {
        flex: 1;
        text-align: center;
        font-weight: 700;
        font-size: 1.5rem;
        min-width: 0;
    }
    
    .adjust-button {
        background: rgba(var(--accent), 0.1);
        border: 1px solid rgba(var(--accent), 0.3);
        border-radius: 0.2rem;
        color: rgb(var(--accent));
        font-size: 1.1rem;
        font-weight: 700;
        width: 1.5rem;
        height: 1.5rem;
        padding: 0;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        flex-shrink: 0;
        
        &:hover:not(:disabled) {
            background: rgba(var(--accent), 0.2);
            border-color: rgb(var(--accent));
            transform: scale(1.1);
        }
        
        &:active:not(:disabled) {
            transform: scale(0.95);
        }
        
        &:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }
    }
    
    .dice-cell {
        width: 8%;
        text-align: center;
        padding: 0.25rem;
        vertical-align: middle;
    }
    
    .dice-button {
        background: rgba(var(--accent), 0.1);
        border: 1px solid rgba(var(--accent), 0.3);
        border-radius: 0.2rem;
        color: rgb(var(--accent));
        font-size: 1rem;
        padding: 0.25rem 0.4rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 0;
        line-height: 1.2;
        
        &:hover {
            background: rgba(var(--accent), 0.2);
            border-color: rgb(var(--accent));
            transform: scale(1.05);
        }
        
        &:active {
            transform: scale(0.95);
        }
    }

    @media only screen and (min-width: 33.75em) {
        .stat-name {
            font-size: 1.3rem;
        }
        .stat-value {
            font-size: 1.6rem;
        }
        .header-cell {
            font-size: 1.0rem;
        }
    }

    @media only screen and (min-width: 60em) {
        .stat-name {
            font-size: 1.4rem;
        }
        .stat-value {
            font-size: 1.8rem;
        }
        .header-cell {
            font-size: 1.1rem;
        }
    }
</style>
