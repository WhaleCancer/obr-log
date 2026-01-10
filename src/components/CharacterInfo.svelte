<script lang="ts">
    // Import stores
    import { editing, theme, getThemeForDivision } from "../stores";
    import { currentPlayerId, viewingPlayerId } from "../services/OBRHelper";
    import type { AFFSheet } from '../types/sheet.type';

    // Import components
    import RemoveStat from "./RemoveStat.svelte";
    import AddStat from "./AddStat.svelte";
    import RemoveSection from './RemoveSection.svelte';

    import { createEventDispatcher, onMount } from 'svelte';

    // Export
    export let section;
    export let sheet: AFFSheet; // Full sheet object to sync name
    export let portrait: string = ""; // Base64 image data (bound from parent)

    const dispatch = createEventDispatcher();
    
    // Default portrait image path - using Vite's base URL
    const baseUrl = import.meta.env.BASE_URL || '/star-trek-character-sheet/';
    const defaultPortrait = `${baseUrl}no-token.png`;

    $: editable = $currentPlayerId === $viewingPlayerId;
    $: newStatId = section.stats.length > 0 ? Math.max(...section.stats.map(t => t.id)) + 1 : 1;
    
    // Division options
    const divisionOptions = [
        { value: "Command", label: "Command Division (gold)" },
        { value: "Sciences", label: "Sciences Division (blue)" },
        { value: "Medical", label: "Medical Division (blue)" },
        { value: "Engineering", label: "Engineering Division (red)" },
        { value: "Security", label: "Security (red)" }
    ];
    
    // Rank options
    const rankOptions = [
        "Ensign",
        "Lieutenant",
        "Lieutenant Commander",
        "Commander",
        "Captain",
        "Fleet Captain",
        "Commodore",
        "Rear Admiral",
        "Vice Admiral",
        "Admiral"
    ];
    
    // Species options
    const speciesOptions = [
        "Human",
        "Vulcan",
        "Andorian"
    ];
    
    // Find the Name stat and sync with sheet.name
    $: nameStat = section.stats.find(s => s.name === "Name");
    
    // Find the Species stat
    $: speciesStat = section.stats.find(s => s.name === "Species");
    $: currentSpecies = speciesStat ? (speciesStat.value || "Human") : "Human";
    
    // Ensure Species has a default value if empty
    $: if (speciesStat && !speciesStat.value) {
        speciesStat.value = "Human";
        section.stats = [...section.stats];
    }
    
    // Find the Division stat
    $: divisionStat = section.stats.find(s => s.name === "Division");
    $: currentDivision = divisionStat ? (divisionStat.value || "Command") : "Command";
    
    // Ensure Division has a default value if empty
    $: if (divisionStat && !divisionStat.value) {
        divisionStat.value = "Command";
        section.stats = [...section.stats];
    }
    
    // Find the Rank stat
    $: rankStat = section.stats.find(s => s.name === "Rank");
    $: currentRank = rankStat ? (rankStat.value || "Lieutenant Commander") : "Lieutenant Commander";
    
    // Ensure Rank has a default value if empty
    $: if (rankStat && !rankStat.value) {
        rankStat.value = "Lieutenant Commander";
        section.stats = [...section.stats];
    }
    
    // Update theme when division changes - reactive statement
    $: if (currentDivision) {
        const newTheme = getThemeForDivision(currentDivision);
        // Only update if different to avoid infinite loops
        if ($theme.accent !== newTheme.accent) {
            $theme.accent = newTheme.accent;
        }
    }
    
    // Initialize theme on mount
    onMount(() => {
        if (currentDivision) {
            const newTheme = getThemeForDivision(currentDivision);
            if ($theme.accent !== newTheme.accent) {
                $theme.accent = newTheme.accent;
            }
        }
    });
    
    // Get display value for Name field (prefer stat value, fallback to sheet.name)
    $: nameDisplayValue = nameStat && nameStat.value ? nameStat.value : (sheet.name || "");
    
    // Handle when user edits the Name field directly
    function handleNameStatChange(event: Event) {
        const element = event.target as HTMLElement;
        const newValue = element.innerText.trim();
        if (nameStat) {
            nameStat.value = newValue;
            sheet.name = newValue; // Update sheet.name to match
            section.stats = [...section.stats]; // Trigger reactivity
        }
    }
    
    // Handle when Division dropdown changes
    function handleDivisionChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        if (divisionStat) {
            divisionStat.value = target.value;
            section.stats = [...section.stats]; // Trigger reactivity
            // Theme update will happen reactively
        }
    }
    
    // Handle when Species dropdown changes
    function handleSpeciesChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        if (speciesStat) {
            speciesStat.value = target.value;
            section.stats = [...section.stats]; // Trigger reactivity
        }
    }
    
    // Handle when Rank dropdown changes
    function handleRankChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        if (rankStat) {
            rankStat.value = target.value;
            section.stats = [...section.stats]; // Trigger reactivity
        }
    }
    
    // Tooltip functionality for Division and Rank (non-edit mode only)
    let hoveredField: string | null = null;
    let tooltipPosition = { x: 0, y: 0 };
    
    function getFieldDescription(fieldName: string): string {
        if (fieldName === "Division") {
            return "Starfleet is organized into several divisions, each with distinct roles and responsibilities. A character's division determines their primary area of expertise and often influences the color of their uniform (Command: gold, Sciences/Medical: blue, Engineering/Security: red).";
        } else if (fieldName === "Rank") {
            return "Starfleet uses a rank structure based on naval traditions. Ranks determine a character's authority, responsibilities, and position within the hierarchy of Starfleet, from Ensign (lowest commissioned officer) to Admiral (highest flag officer).";
        }
        return "";
    }
    
    function handleFieldMouseEnter(event: MouseEvent, fieldName: string) {
        hoveredField = fieldName;
        updateTooltipPosition(event);
    }
    
    function handleFieldMouseMove(event: MouseEvent) {
        if (hoveredField) {
            updateTooltipPosition(event);
        }
    }
    
    function updateTooltipPosition(event: MouseEvent) {
        tooltipPosition = { x: event.clientX, y: event.clientY };
    }
    
    function handleFieldMouseLeave() {
        hoveredField = null;
    }
    
    // Reactive update: sync sheet.name when nameStat.value changes (but only if they differ to avoid loops)
    $: if (nameStat && nameStat.value !== undefined && nameStat.value !== sheet.name) {
        sheet.name = nameStat.value || "";
    }

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
                    {#if editable && $editing}
                        {#if stat.name === "Name"}
                            <td 
                                contenteditable="true" 
                                bind:innerText={nameStat.value}
                                on:blur={handleNameStatChange} 
                                on:keydown={(e) => e.key === 'Enter' && e.preventDefault()}>
                            </td>
                        {:else if stat.name === "Species"}
                            <td>
                                <select 
                                    value={stat.value || "Human"} 
                                    on:change={handleSpeciesChange}
                                    class="division-select">
                                    {#each speciesOptions as speciesOption}
                                        <option value={speciesOption}>{speciesOption}</option>
                                    {/each}
                                </select>
                            </td>
                        {:else if stat.name === "Division"}
                            <td>
                                <select 
                                    value={stat.value || "Command"} 
                                    on:change={handleDivisionChange}
                                    class="division-select">
                                    {#each divisionOptions as option}
                                        <option value={option.value}>{option.label}</option>
                                    {/each}
                                </select>
                            </td>
                        {:else if stat.name === "Rank"}
                            <td>
                                <select 
                                    value={stat.value || "Lieutenant Commander"} 
                                    on:change={handleRankChange}
                                    class="division-select">
                                    {#each rankOptions as rankOption}
                                        <option value={rankOption}>{rankOption}</option>
                                    {/each}
                                </select>
                            </td>
                        {:else}
                            <td contenteditable="true" bind:innerText={stat.value}></td>
                        {/if}
                    {:else if editable}
                        {#if stat.name === "Name"}
                            <td 
                                contenteditable="true" 
                                bind:innerText={nameStat.value}
                                on:blur={handleNameStatChange} 
                                on:keydown={(e) => e.key === 'Enter' && e.preventDefault()}>
                            </td>
                        {:else if stat.name === "Species" || stat.name === "Division" || stat.name === "Rank" || stat.name === "Assignment"}
                            <td 
                                class:tooltip-trigger={stat.name === "Division" || stat.name === "Rank"}
                                on:mouseenter={stat.name === "Division" || stat.name === "Rank" ? (e) => handleFieldMouseEnter(e, stat.name) : undefined}
                                on:mouseleave={stat.name === "Division" || stat.name === "Rank" ? handleFieldMouseLeave : undefined}
                                on:mousemove={stat.name === "Division" || stat.name === "Rank" ? handleFieldMouseMove : undefined}>
                                {stat.value}
                            </td>
                        {:else}
                            <td contenteditable="true" bind:innerText={stat.value}></td>
                        {/if}
                    {:else}
                        <td 
                            class:tooltip-trigger={stat.name === "Division" || stat.name === "Rank"}
                            on:mouseenter={stat.name === "Division" || stat.name === "Rank" ? (e) => handleFieldMouseEnter(e, stat.name) : undefined}
                            on:mouseleave={stat.name === "Division" || stat.name === "Rank" ? handleFieldMouseLeave : undefined}
                            on:mousemove={stat.name === "Division" || stat.name === "Rank" ? handleFieldMouseMove : undefined}>
                            {stat.name === "Name" ? nameDisplayValue : stat.value}
                        </td>
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
        
        <!-- Tooltip for Division and Rank (non-edit mode only) -->
        {#if hoveredField && (hoveredField === "Division" || hoveredField === "Rank") && !$editing}
            <div class="tooltip" style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px">
                <div class="tooltip-title">{hoveredField}</div>
                <div class="tooltip-content">{getFieldDescription(hoveredField)}</div>
            </div>
        {/if}
        
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
    
    {#if editable && !$editing}
    <RemoveSection bind:section={section} on:removeSection/>
    {/if}
</div>

<style lang="scss">
    .character-info-container {
        padding: 1rem 0.5rem;
        margin: 0;
        width: 100%;
        box-sizing: border-box;
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

    .division-select {
        width: 100%;
        padding: 0.25rem 0.5rem;
        border: 1px solid rgba(var(--accent), 0.5);
        border-radius: 4px;
        background: rgba(var(--accent), 0.1);
        color: rgba(var(--primary), 0.9);
        font-size: 0.9rem;
        font-family: inherit;
        cursor: pointer;
        text-shadow: var(--shadow);
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.5rem center;
        padding-right: 2rem;

        &:hover {
            background-color: rgba(var(--accent), 0.2);
            border-color: rgba(var(--accent), 0.8);
        }

        &:focus {
            outline: none;
            border-color: rgba(var(--accent), 1);
            background-color: rgba(var(--accent), 0.15);
        }

        option {
            background: rgb(var(--secondary));
            color: rgba(var(--primary), 0.9);
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
