<script lang="ts">
    // Import stores
    import { editing } from "../stores";
    import { currentPlayerId, viewingPlayerId } from "../services/OBRHelper";

    // Import components
    import RemoveStat from "./RemoveStat.svelte";
    import AddStat from "./AddStat.svelte";
    import RemoveSection from './RemoveSection.svelte';

    import { createEventDispatcher } from 'svelte';

    // Export
    export let section;
    export let portrait: string = ""; // Base64 image data (bound from parent)

    const dispatch = createEventDispatcher();
    
    // Default portrait image path - using Vite's base URL
    const baseUrl = import.meta.env.BASE_URL || '/star-trek-character-sheet/';
    const defaultPortrait = `${baseUrl}no-token.png`;

    $: editable = $currentPlayerId === $viewingPlayerId;
    $: newStatId = section.stats.length > 0 ? Math.max(...section.stats.map(t => t.id)) + 1 : 1;

    function addStat() {
        section.stats = [...section.stats, {
            id: newStatId,
            name: "New Field",
            value: "-"
        }];
    }

    function removeStat(stat) {
        section.stats = section.stats.filter(t => t.id !== stat.id);
    }

    function handleImageUpload(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        // Validate image file
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Check file size (max 5MB for base64 encoding)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image file size must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
                dispatch('portraitChange', result);
            }
        };
        reader.readAsDataURL(file);
        
        // Reset input so same file can be selected again
        target.value = '';
    }

    function removePortrait() {
        dispatch('portraitChange', "");
    }
</script>

<div class="character-info-container">
    {#if editable && $editing}
        <h2 bind:innerText={section.name} contenteditable="true">{section.name}</h2>
    {:else}
        <h2>{section.name}</h2>
    {/if}
    
    <div class="character-info-content">
        <div class="character-info-stats">
            <table>
                {#each section.stats as stat (stat.id)}
                <tr>
                    {#if editable && $editing}
                    <td contenteditable="true" bind:innerText={stat.name}></td>
                    {:else}
                    <td>{stat.name}</td>
                    {/if}
                    {#if editable}
                    <td contenteditable="true" bind:innerText={stat.value}></td>
                    {:else}
                    <td>{stat.value}</td>
                    {/if}
                    {#if editable && $editing}
                    <td style="width:0.5rem;"><RemoveStat bind:stat={stat} on:removeStat={e => removeStat(e.detail)}/></td>
                    {/if}
                </tr>
                {/each}
            </table>
            {#if $editing}
            <AddStat on:addStat={addStat}/>
            {/if}
        </div>
        
        <div class="character-info-portrait">
            <div class="portrait-container">
                {#if portrait}
                    <img src={portrait} alt="Character portrait" class="portrait-image" />
                {:else}
                    <img src={defaultPortrait} alt="Default portrait" class="portrait-image" />
                {/if}
            </div>
            {#if editable && $editing}
                <div class="portrait-buttons">
                    <label class="portrait-upload-button">
                        <input type="file" accept="image/*" on:change={handleImageUpload} class="portrait-input" />
                        {#if portrait}
                            Change Image
                        {:else}
                            Upload Image
                        {/if}
                    </label>
                    {#if portrait}
                        <button class="portrait-reset-button" on:click={removePortrait} title="Reset to default">
                            Reset to Default
                        </button>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
    
    {#if editable && $editing}
    <RemoveSection bind:section={section} on:removeSection/>
    {/if}
</div>

<style lang="scss">
    .character-info-container {
        padding: 1rem 0.5rem;
        border-width: 0.15rem;
        border-style: solid;
        border-image: 
        linear-gradient(to bottom, rgba(0, 0, 0, 0), rgb(var(--accent)), rgba(0, 0, 0, 0)) 1 100%;
        border-right: none;
    }

    h2 {
        text-shadow: var(--shadow);
        color: rgb(var(--accent));
        font-size: 1.2rem;
        margin-top: 0;
        margin-bottom: 0.5rem;
    }

    .character-info-content {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
    }

    .character-info-stats {
        flex: 2;
        min-width: 0;
    }

    .character-info-portrait {
        flex: 1;
        min-width: 0;
        display: flex;
        justify-content: center;
        align-items: flex-start;
    }

    table {
        border-collapse: collapse;
        width: 100%;
    }

    tr:nth-last-child(2n+1) {
        background: rgba(var(--accent), 0.05);
    }

    td {
        white-space: pre-wrap;
        text-shadow: var(--shadow);
        padding: 0 0.5rem;
        color: rgba(var(--primary), 0.85);
        vertical-align: top;
        width: auto;
        &:not(:first-child) {
            text-align: right;
        }
        &:hover {
            color: rgba(var(--primary), 1);
        }
    }

    .portrait-container {
        position: relative;
        width: 100%;
        max-width: 200px;
        aspect-ratio: 1;
        border: 2px solid rgba(var(--accent), 0.3);
        border-radius: 4px;
        overflow: hidden;
        background: rgba(var(--accent), 0.05);
    }

    .portrait-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }


    .portrait-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 0.75rem;
        width: 100%;
        max-width: 200px;
    }

    .portrait-input {
        display: none;
    }

    .portrait-upload-button,
    .portrait-reset-button {
        padding: 0.5rem 1rem;
        border: 1px solid rgba(var(--accent), 0.5);
        border-radius: 4px;
        background: rgba(var(--accent), 0.1);
        color: rgb(var(--accent));
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        text-align: center;
        transition: all 0.2s ease;
        text-transform: uppercase;
        letter-spacing: 0.05em;

        &:hover {
            background: rgba(var(--accent), 0.2);
            border-color: rgba(var(--accent), 0.8);
            color: rgb(var(--accent));
        }

        &:active {
            transform: scale(0.98);
        }
    }

    .portrait-upload-button {
        display: block;
    }

    .portrait-reset-button {
        background: rgba(255, 100, 100, 0.1);
        border-color: rgba(255, 100, 100, 0.5);
        color: rgba(255, 200, 200, 0.9);

        &:hover {
            background: rgba(255, 100, 100, 0.2);
            border-color: rgba(255, 100, 100, 0.8);
            color: rgba(255, 220, 220, 1);
        }
    }

    @media only screen and (max-width: 33.75em) {
        .character-info-content {
            flex-direction: column;
        }

        .character-info-stats {
            flex: 1;
        }

        .character-info-portrait {
            flex: 1;
            width: 100%;
            max-width: 200px;
        }
    }
</style>
