<script lang="ts">
    // Import components
    import AddSection from "./AddSection.svelte";
    import EditToggle from "./EditToggle.svelte";
    import ThemeEditor from "./ThemeEditor.svelte";
    import { currentPlayerId, viewingPlayerId } from "../services/OBRHelper";

    // Import stores and functions
    import { sheet, resetSheet } from '../stores'
    import FileManager from "./FileManager.svelte";

    function handleNewCharacter() {
        if (confirm("Are you sure you want to reset all character data to default values? This action cannot be undone.")) {
            resetSheet();
        }
    }
</script>

{#if $currentPlayerId === $viewingPlayerId}
<div>
    <button class="action-button new-character-button" on:click={handleNewCharacter} title="Reset character to default values">
        New Character
    </button>
    <FileManager/>
    <ThemeEditor/>
    <AddSection bind:sections={$sheet.sections}/>
    <EditToggle/>
</div>
{/if}

<style lang="scss">
    div {
        margin-top: 1rem;
        margin-bottom: 1rem;
        display: flex;
        flex-wrap: wrap;
        grid-gap: 0.5rem;
        grid-auto-flow: column;
        width: 100%;
        justify-content: end;
    }

    .action-button {
        background: rgba(var(--accent),0);
        border: 1px solid rgb(var(--accent));
        border-radius: 0.15rem;
        color: rgb(var(--accent));
        font-size: 1rem;
        font-weight: 300;
        text-transform: uppercase;
        cursor: pointer;
        padding: 0.5rem 1rem;
        transition: background ease-in-out 150ms;
        transition: color ease-in-out 150ms;
        
        &:hover {
            background: rgba(var(--accent),1);
            color: rgb(var(--secondary));
        }
    }

    .new-character-button {
        background: rgba(255, 100, 100, 0.2);
        border-color: rgba(255, 100, 100, 0.8);
        color: rgba(255, 150, 150, 1);
        
        &:hover {
            background: rgba(255, 100, 100, 0.8);
            color: rgb(var(--secondary));
        }
    }
</style>