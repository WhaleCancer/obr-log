<script lang="ts">
    // Import stores
    import { editing } from "../stores";
    import { currentPlayerId, viewingPlayerId } from "../services/OBRHelper";
    import type { AFFSheetStats } from '../types/sheet.type';

    // Export
    export let stats: AFFSheetStats[] = [];

    $: editable = $currentPlayerId === $viewingPlayerId;
    
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
        
        return {
            stat: stat,
            initial: initial,
            current: parsed.current
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
</script>

<div class="characteristics-container">
    <table class="characteristics-table">
        <thead>
            <tr>
                <th class="header-cell header-left">CHARACTERISTIC</th>
                <th class="header-cell">{#if editable}✏️ {/if}Current</th>
                <th class="header-cell">{#if editable && $editing}✏️ {/if}Initial</th>
            </tr>
        </thead>
        <tbody>
            {#each statValues as {stat, initial, current} (stat.id)}
            <tr>
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
                        <td class="stat-value" 
                            contenteditable="true" 
                            on:blur={(e) => handleInitialChange(stat, e)}
                            on:keydown={handleKeydown}>
                            {initial}
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
        width: 22.5%;
    }

    .characteristics-table tbody tr {
        background: rgba(var(--accent), 0.1);
        border-bottom: 1px solid rgba(var(--accent), 0.2);
        transition: background 0.2s ease;
    }

    .characteristics-table tbody tr:hover {
        background: rgba(var(--accent), 0.15);
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
        width: 55%;
        border-right: 1px solid rgba(var(--accent), 0.2);
    }

    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        text-align: center;
        color: rgba(var(--primary), 1);
        width: 22.5%;
        border-right: 1px solid rgba(var(--accent), 0.2);
    }

    .stat-value:last-child {
        border-right: none;
    }

    .stat-value:hover:not(.read-only) {
        color: rgb(var(--accent));
        transition: color 0.2s ease;
    }
    
    .stat-value.read-only {
        cursor: default;
        opacity: 0.9;
    }

    @media only screen and (min-width: 33.75em) {
        .stat-name {
            font-size: 1.3rem;
        }
        .stat-value {
            font-size: 1.6rem;
        }
        .header-cell {
            font-size: 1.1rem;
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
            font-size: 1.2rem;
        }
    }
</style>
