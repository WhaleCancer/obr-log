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
            {#if portrait}
                <div class="portrait-container">
                    <img src={portrait} alt="Character portrait" class="portrait-image" />
                    {#if editable && $editing}
                        <button class="remove-portrait-btn" on:click={removePortrait} title="Remove portrait">×</button>
                    {/if}
                </div>
            {:else}
                {#if editable && $editing}
                    <label class="portrait-upload-label">
                        <input type="file" accept="image/*" on:change={handleImageUpload} class="portrait-input" />
                        <div class="portrait-placeholder">
                            <span>+</span>
                            <span class="portrait-hint">Click to upload portrait</span>
                        </div>
                    </label>
                {:else}
                    <div class="portrait-placeholder">
                        <span>No portrait</span>
                    </div>
                {/if}
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

    .remove-portrait-btn {
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
        background: rgba(var(--secondary), 0.9);
        color: rgb(var(--primary));
        border: 1px solid rgba(var(--accent), 0.5);
        border-radius: 50%;
        width: 1.5rem;
        height: 1.5rem;
        cursor: pointer;
        font-size: 1.2rem;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;

        &:hover {
            background: rgba(var(--accent), 0.8);
            color: rgb(var(--secondary));
        }
    }

    .portrait-upload-label {
        width: 100%;
        max-width: 200px;
        aspect-ratio: 1;
        display: block;
        cursor: pointer;
    }

    .portrait-input {
        display: none;
    }

    .portrait-placeholder {
        width: 100%;
        height: 100%;
        border: 2px dashed rgba(var(--accent), 0.5);
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        background: rgba(var(--accent), 0.05);
        color: rgba(var(--primary), 0.6);
        transition: all 0.2s ease;

        &:hover {
            border-color: rgba(var(--accent), 0.8);
            background: rgba(var(--accent), 0.1);
            color: rgba(var(--primary), 0.9);
        }

        > span:first-child {
            font-size: 2rem;
            font-weight: 300;
        }

        .portrait-hint {
            font-size: 0.85rem;
            text-align: center;
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
