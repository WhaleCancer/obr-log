<script lang="ts">
    // Import stores
    import { editing } from "../stores";
    import { currentPlayerId, viewingPlayerId } from "../services/OBRHelper";

    // Export
    export let stats;

    $: editable = $currentPlayerId === $viewingPlayerId;
    
    // Helper function to parse initial/current from value
    function parseValue(value: string) {
        const parts = value.split('/');
        return {
            initial: parts[0]?.trim() || '0',
            current: parts[1]?.trim() || parts[0]?.trim() || '0'
        };
    }
    
    // Create derived stats with initial and current values
    $: statValues = stats.map(stat => {
        const parsed = parseValue(stat.value);
        return {
            stat: stat,
            initial: parsed.initial,
            current: parsed.current
        };
    });
    
    // Helper function to update value when initial or current changes
    function handleInitialChange(stat, newValue: string) {
        const parsed = parseValue(stat.value);
        stat.value = `${newValue.trim()}/${parsed.current}`;
        // Force reactivity update
        stats = stats;
    }
    
    function handleCurrentChange(stat, newValue: string) {
        const parsed = parseValue(stat.value);
        stat.value = `${parsed.initial}/${newValue.trim()}`;
        // Force reactivity update
        stats = stats;
    }
</script>

<div class="characteristics-container">
    <table class="characteristics-table">
        <thead>
            <tr>
                <th></th>
                <th class="header-cell">Initial</th>
                <th class="header-cell">Current</th>
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
                    on:blur={(e) => handleInitialChange(stat, e.target.innerText)}
                    on:keydown={(e) => e.key === 'Enter' && e.preventDefault()}>
                    {initial}
                </td>
                {:else}
                <td class="stat-value">{initial}</td>
                {/if}
                {#if editable}
                <td class="stat-value" 
                    contenteditable="true" 
                    on:blur={(e) => handleCurrentChange(stat, e.target.innerText)}
                    on:keydown={(e) => e.key === 'Enter' && e.preventDefault()}>
                    {current}
                </td>
                {:else}
                <td class="stat-value">{current}</td>
                {/if}
            </tr>
            {/each}
        </tbody>
    </table>
</div>

<style lang="scss">
    .characteristics-container {
        padding: 1rem 0.5rem;
        border-width: 0.15rem;
        border-style: solid;
        border-image: 
            linear-gradient(to bottom, rgba(0, 0, 0, 0), rgb(var(--accent)), rgba(0, 0, 0, 0)) 1 100%;
        border-right: none;
        margin: 1rem 0;
        width: 100%;
    }

    .characteristics-table {
        border-collapse: collapse;
        width: 100%;
        margin: 0 auto;
    }

    .characteristics-table thead {
        border-bottom: 2px solid rgba(var(--accent), 0.4);
    }

    .header-cell {
        text-shadow: var(--shadow);
        color: rgb(var(--accent));
        font-size: 1rem;
        font-weight: 600;
        padding: 0.5rem 1rem;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 0.05em;
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
        padding: 0.75rem 1rem;
        color: rgba(var(--primary), 0.9);
        vertical-align: middle;
    }

    .stat-name {
        font-size: 1.2rem;
        font-weight: 700;
        color: rgb(var(--accent));
        text-transform: uppercase;
        letter-spacing: 0.08em;
        width: 40%;
        border-right: 1px solid rgba(var(--accent), 0.2);
    }

    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        text-align: center;
        color: rgba(var(--primary), 1);
        width: 30%;
        border-right: 1px solid rgba(var(--accent), 0.2);
    }

    .stat-value:last-child {
        border-right: none;
    }

    .stat-value:hover {
        color: rgb(var(--accent));
        transition: color 0.2s ease;
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
        .characteristics-container {
            padding: 1.5rem 1rem;
        }
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
