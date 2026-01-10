<script lang="ts">
    // Import stores
    import { editing } from "../stores";
    import { currentPlayerId, viewingPlayerId } from "../services/OBRHelper";

    // Export
    export let stats;

    $: editable = $currentPlayerId === $viewingPlayerId;
</script>

<div class="characteristics-container">
    <table class="characteristics-table">
        {#each stats as stat (stat.id)}
        <tr>
            {#if editable && $editing}
            <td class="stat-name" contenteditable="true" bind:innerText={stat.name}>{stat.name}</td>
            {:else}
            <td class="stat-name">{stat.name}</td>
            {/if}
            {#if editable}
            <td class="stat-value" contenteditable="true" bind:innerText={stat.value}>{stat.value}</td>
            {:else}
            <td class="stat-value">{stat.value}</td>
            {/if}
        </tr>
        {/each}
    </table>
</div>

<style lang="scss">
    .characteristics-container {
        padding: 2rem 0.5rem;
        border-width: 0.15rem;
        border-style: solid;
        border-image: 
            linear-gradient(to bottom, rgba(0, 0, 0, 0), rgb(var(--accent)), rgba(0, 0, 0, 0)) 1 100%;
        border-right: none;
        margin: 2rem 0;
        width: 100%;
    }

    .characteristics-table {
        border-collapse: collapse;
        width: 100%;
        margin: 0 auto;
    }

    .characteristics-table tr {
        background: rgba(var(--accent), 0.1);
        border-bottom: 2px solid rgba(var(--accent), 0.3);
        transition: background 0.2s ease;
    }

    .characteristics-table tr:hover {
        background: rgba(var(--accent), 0.15);
    }

    .characteristics-table td {
        white-space: pre-wrap;
        text-shadow: var(--shadow);
        padding: 1.5rem 1rem;
        color: rgba(var(--primary), 0.9);
        vertical-align: middle;
    }

    .stat-name {
        font-size: 1.8rem;
        font-weight: 700;
        color: rgb(var(--accent));
        text-transform: uppercase;
        letter-spacing: 0.1em;
        width: 50%;
        border-right: 2px solid rgba(var(--accent), 0.3);
    }

    .stat-value {
        font-size: 2.5rem;
        font-weight: 700;
        text-align: right;
        color: rgba(var(--primary), 1);
        width: 50%;
    }

    .stat-value:hover {
        color: rgb(var(--accent));
        transform: scale(1.05);
        transition: all 0.2s ease;
    }

    @media only screen and (min-width: 33.75em) {
        .stat-name {
            font-size: 2rem;
        }
        .stat-value {
            font-size: 3rem;
        }
    }

    @media only screen and (min-width: 60em) {
        .characteristics-container {
            padding: 3rem 1rem;
        }
        .stat-name {
            font-size: 2.2rem;
        }
        .stat-value {
            font-size: 3.5rem;
        }
    }
</style>
