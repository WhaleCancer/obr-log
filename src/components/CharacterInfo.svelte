<script lang="ts">
    // Import stores
    import { editing, theme, getThemeForDivision } from "../stores";
    import { currentPlayerId, viewingPlayerId } from "../services/OBRHelper";
    import type { AFFSheet } from '../types/sheet.type';

    // Import components
    import RemoveStat from "./RemoveStat.svelte";
    import RemoveSection from './RemoveSection.svelte';
    import { gradeOptions } from '../data/grades';
    import { gradePoints } from '../data/gradePoints';
    import { baseCharacteristics } from '../data/gradeMaxValues';
    import { characteristicCosts } from '../data/characteristicCosts';
    import { specialSkillPoints } from '../data/specialSkillPoints';
    import { getCumulativeSpecialSkillCost } from '../data/specialSkillCosts';

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
    
    // Find the Grade stat
    $: gradeStat = section.stats.find(s => s.name === "Grade");
    $: currentGrade = gradeStat ? (gradeStat.value || "Veteran") : "Veteran";
    
    // Ensure Grade has a default value if empty
    $: if (gradeStat && !gradeStat.value) {
        gradeStat.value = "Veteran";
        section.stats = [...section.stats];
    }
    
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
    
    // Handle when Grade dropdown changes
    function handleGradeChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        if (gradeStat) {
            gradeStat.value = target.value;
            section.stats = [...section.stats]; // Trigger reactivity
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

    // Handle Experience value changes to ensure it's always an integer
    function handleExperienceChange(event: Event) {
        const element = event.target as HTMLElement;
        const rawValue = element.innerText.trim();
        // Parse the value and round to nearest integer
        const numValue = Math.round(parseFloat(rawValue) || 0);
        const intValue = Math.max(0, numValue).toString(); // Ensure non-negative
        
        // Update the stat value
        const expStat = section.stats.find(s => s.name === "Experience");
        if (expStat) {
            expStat.value = intValue;
            section.stats = [...section.stats]; // Trigger reactivity
        }
        
        // Update the display
        element.innerText = intValue;
    }

    // Format Experience value for display (ensure integer)
    function formatExperienceValue(value: string): string {
        const numValue = Math.round(parseFloat(value) || 0);
        return Math.max(0, numValue).toString();
    }
    
    // Helper function to parse initial/current from value
    function parseValue(value: string) {
        const parts = value.split('/');
        return {
            initial: parts[0]?.trim() || '0',
            current: parts[1]?.trim() || parts[0]?.trim() || '0'
        };
    }
    
    // Get characteristics section from sheet - reactive to sheet changes
    $: characteristicsSection = sheet?.sections?.find(s => s.name === "Characteristics");
    
    // Get available characteristic points based on grade
    $: availablePoints = gradePoints[currentGrade] || gradePoints["Veteran"];
    
    // Extract stat values to create explicit dependencies for reactivity
    // This ensures Svelte tracks changes to individual stat values
    $: skillStat = characteristicsSection?.stats?.find(s => s.name === "SKILL");
    $: staminaStat = characteristicsSection?.stats?.find(s => s.name === "STAMINA");
    $: luckStat = characteristicsSection?.stats?.find(s => s.name === "LUCK");
    $: psionicsStat = characteristicsSection?.stats?.find(s => s.name === "PSIONICS");
    
    $: skillValue = skillStat?.value || '4/4';
    $: staminaValue = staminaStat?.value || '8/8';
    $: luckValue = luckStat?.value || '9/9';
    $: psionicsValue = psionicsStat?.value || '0/0';
    
    // Create a reactive signature from all stat values to trigger recalculation
    $: statsSignature = `${skillValue}|${staminaValue}|${luckValue}|${psionicsValue}`;
    
    // Calculate characteristic points spent - reactive to stat values
    $: pointsSpent = statsSignature ? (() => {
        // statsSignature dependency ensures recalculation when any stat value changes
        if (!characteristicsSection || !characteristicsSection.stats || characteristicsSection.stats.length === 0) return 0;
        
        let points = 0;
        for (const stat of characteristicsSection.stats) {
            if (stat.name === "PSI POINTS") continue; // PSI POINTS is calculated, not spent
            
            const parsed = parseValue(stat.value || '0/0');
            const initial = parseInt(parsed.initial || '0', 10);
            const base = baseCharacteristics[stat.name as keyof typeof baseCharacteristics] || 0;
            const valueIncrease = Math.max(0, initial - base);
            
            // Each point of STAMINA costs 1 characteristic point
            // Other characteristics (SKILL, LUCK, PSIONICS) cost 2 points per point
            const cost = characteristicCosts[stat.name] || 2;
            points += valueIncrease * cost;
        }
        return points;
    })() : 0;
    
    $: pointsRemaining = availablePoints - pointsSpent;
    // Display format: remaining / total (starts full, decreases as spent)
    $: characteristicPointsDisplay = `${pointsRemaining} / ${availablePoints}`;
    
    // Get all special skills sections from sheet
    $: combatSpecialSkillsSection = sheet?.sections?.find(s => s.name === "Combat Special Skills");
    $: psionicSpecialSkillsSection = sheet?.sections?.find(s => s.name === "Psionic Special Skills");
    $: movementSpecialSkillsSection = sheet?.sections?.find(s => s.name === "Movement Special Skills");
    $: stealthSpecialSkillsSection = sheet?.sections?.find(s => s.name === "Stealth Special Skills");
    $: knowledgeSpecialSkillsSection = sheet?.sections?.find(s => s.name === "Knowledge Special Skills");
    $: scienceSpecialSkillsSection = sheet?.sections?.find(s => s.name === "Science Special Skills");
    
    // Helper function to parse number from string value
    function parseNumber(value: string): number {
        const num = parseInt(value.trim() || '0', 10);
        return isNaN(num) ? 0 : num;
    }
    
    // Create reactive signatures from all special skill stat values to ensure reactivity
    $: combatSkillsSignature = combatSpecialSkillsSection?.stats?.map(s => `${s.id}:${s.value}`).join('|') || '';
    $: psionicSkillsSignature = psionicSpecialSkillsSection?.stats?.map(s => `${s.id}:${s.value}`).join('|') || '';
    $: movementSkillsSignature = movementSpecialSkillsSection?.stats?.map(s => `${s.id}:${s.value}`).join('|') || '';
    $: stealthSkillsSignature = stealthSpecialSkillsSection?.stats?.map(s => `${s.id}:${s.value}`).join('|') || '';
    $: knowledgeSkillsSignature = knowledgeSpecialSkillsSection?.stats?.map(s => `${s.id}:${s.value}`).join('|') || '';
    $: scienceSkillsSignature = scienceSpecialSkillsSection?.stats?.map(s => `${s.id}:${s.value}`).join('|') || '';
    $: allSpecialSkillsSignature = `${combatSkillsSignature}|${psionicSkillsSignature}|${movementSkillsSignature}|${stealthSkillsSignature}|${knowledgeSkillsSignature}|${scienceSkillsSignature}`;
    
    // Calculate total special skill points spent across all special skills sections
    // Reactive to all special skills stat value changes
    $: specialSkillPointsSpent = allSpecialSkillsSignature ? (() => {
        let totalPoints = 0;
        
        // Combat Special Skills
        if (combatSpecialSkillsSection?.stats) {
            for (const stat of combatSpecialSkillsSection.stats) {
                const rank = parseNumber(stat.value || '0');
                if (rank > 0) {
                    totalPoints += getCumulativeSpecialSkillCost('combat', rank);
                }
            }
        }
        
        // Psionic Special Skills
        if (psionicSpecialSkillsSection?.stats) {
            for (const stat of psionicSpecialSkillsSection.stats) {
                const rank = parseNumber(stat.value || '0');
                if (rank > 0) {
                    totalPoints += getCumulativeSpecialSkillCost('psionic', rank);
                }
            }
        }
        
        // Movement Special Skills
        if (movementSpecialSkillsSection?.stats) {
            for (const stat of movementSpecialSkillsSection.stats) {
                const rank = parseNumber(stat.value || '0');
                if (rank > 0) {
                    totalPoints += getCumulativeSpecialSkillCost('movement', rank);
                }
            }
        }
        
        // Stealth Special Skills
        if (stealthSpecialSkillsSection?.stats) {
            for (const stat of stealthSpecialSkillsSection.stats) {
                const rank = parseNumber(stat.value || '0');
                if (rank > 0) {
                    totalPoints += getCumulativeSpecialSkillCost('stealth', rank);
                }
            }
        }
        
        // Knowledge Special Skills
        if (knowledgeSpecialSkillsSection?.stats) {
            for (const stat of knowledgeSpecialSkillsSection.stats) {
                const rank = parseNumber(stat.value || '0');
                if (rank > 0) {
                    totalPoints += getCumulativeSpecialSkillCost('knowledge', rank);
                }
            }
        }
        
        // Science Special Skills
        if (scienceSpecialSkillsSection?.stats) {
            for (const stat of scienceSpecialSkillsSection.stats) {
                const rank = parseNumber(stat.value || '0');
                if (rank > 0) {
                    totalPoints += getCumulativeSpecialSkillCost('science', rank);
                }
            }
        }
        
        return totalPoints;
    })() : 0;
    
    // Get available special skill points based on grade
    $: availableSpecialSkillPoints = specialSkillPoints[currentGrade] || specialSkillPoints["Veteran"];
    $: specialSkillPointsRemaining = availableSpecialSkillPoints - specialSkillPointsSpent;
    // Display format: remaining / total (starts full, decreases as spent)
    $: specialSkillPointsDisplay = `${specialSkillPointsRemaining} / ${availableSpecialSkillPoints}`;
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
                        {:else if stat.name === "Grade"}
                            <td>
                                <select 
                                    value={stat.value || "Veteran"} 
                                    on:change={handleGradeChange}
                                    class="division-select">
                                    {#each gradeOptions as gradeOption}
                                        <option value={gradeOption}>{gradeOption}</option>
                                    {/each}
                                </select>
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
                        {:else if stat.name === "Experience"}
                            <td 
                                contenteditable="true" 
                                data-initial-value={formatExperienceValue(stat.value)}
                                on:blur={handleExperienceChange}
                                on:keydown={(e) => e.key === 'Enter' && e.preventDefault()}>
                                {formatExperienceValue(stat.value)}
                            </td>
                        {:else if stat.name === "Assignment"}
                            <td 
                                contenteditable="true" 
                                bind:innerText={stat.value}
                                class="assignment-field">
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
                        {:else if stat.name === "Grade" || stat.name === "Species" || stat.name === "Division" || stat.name === "Rank" || stat.name === "Assignment"}
                            <td 
                                class:tooltip-trigger={stat.name === "Division" || stat.name === "Rank"}
                                class:assignment-field={stat.name === "Assignment"}
                                on:mouseenter={stat.name === "Division" || stat.name === "Rank" ? (e) => handleFieldMouseEnter(e, stat.name) : undefined}
                                on:mouseleave={stat.name === "Division" || stat.name === "Rank" ? handleFieldMouseLeave : undefined}
                                on:mousemove={stat.name === "Division" || stat.name === "Rank" ? handleFieldMouseMove : undefined}>
                                {stat.value}
                            </td>
                        {:else if stat.name === "Experience"}
                            <td 
                                contenteditable="true" 
                                data-initial-value={formatExperienceValue(stat.value)}
                                on:blur={handleExperienceChange}
                                on:keydown={(e) => e.key === 'Enter' && e.preventDefault()}>
                                {formatExperienceValue(stat.value)}
                            </td>
                        {:else}
                            <td contenteditable="true" bind:innerText={stat.value}></td>
                        {/if}
                        {:else}
                            <td 
                                class:tooltip-trigger={stat.name === "Division" || stat.name === "Rank"}
                                class:assignment-field={stat.name === "Assignment"}
                                on:mouseenter={stat.name === "Division" || stat.name === "Rank" ? (e) => handleFieldMouseEnter(e, stat.name) : undefined}
                                on:mouseleave={stat.name === "Division" || stat.name === "Rank" ? handleFieldMouseLeave : undefined}
                                on:mousemove={stat.name === "Division" || stat.name === "Rank" ? handleFieldMouseMove : undefined}>
                                {stat.name === "Name" ? nameDisplayValue : (stat.name === "Experience" ? formatExperienceValue(stat.value) : stat.value)}
                        </td>
                    {/if}
                    {#if editable && $editing}
                    <td style="width:0.5rem;"><RemoveStat bind:stat={stat} on:removeStat={e => removeStat(e.detail)}/></td>
                    {/if}
                </tr>
                {/each}
                {#if editable && $editing}
                <tr>
                    <td>Characteristic Points</td>
                    <td>{characteristicPointsDisplay}</td>
                    <td></td>
                </tr>
                <tr>
                    <td>Special Skill Points</td>
                    <td>{specialSkillPointsDisplay}</td>
                    <td></td>
                </tr>
                {/if}
            </table>
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

    .assignment-field {
        font-style: italic;
    }
</style>
