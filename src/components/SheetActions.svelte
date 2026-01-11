<script lang="ts">
    // Import components
    import { currentPlayerId, viewingPlayerId } from "../services/OBRHelper";

    // Import stores and functions
    import { sheet, resetSheet, editing } from '../stores'
    import FileManager from "./FileManager.svelte";

    function handleNewCharacter() {
        if (confirm("Are you sure you want to reset all character data to default values? This action cannot be undone.")) {
            resetSheet();
        }
    }
    
    function handleRandomizeCharacter() {
        const confirmed = confirm(
            "Randomize Character?\n\n" +
            "This will randomize your character's core characteristics:\n" +
            "• SKILL: 3 + 1d6\n" +
            "• STAMINA: 3 + 2d6\n" +
            "• LUCK: 5 + 1d6\n\n" +
            "Both initial and current values will be set to the rolled result. " +
            "This action cannot be undone.\n\n" +
            "Do you want to proceed?"
        );
        
        if (!confirmed) return;
        
        // Roll dice: 1d6 returns 1-6
        const roll1d6 = () => Math.floor(Math.random() * 6) + 1;
        const roll2d6 = () => roll1d6() + roll1d6();
        
        // Calculate new values
        const skill = 3 + roll1d6();
        const stamina = 3 + roll2d6();
        const luck = 5 + roll1d6();
        
        // Find characteristics section
        const characteristicsSectionIndex = $sheet.sections.findIndex(s => s.name === "Characteristics");
        if (characteristicsSectionIndex === -1) {
            alert("Characteristics section not found. Cannot randomize.");
            return;
        }
        
        const characteristicsSection = $sheet.sections[characteristicsSectionIndex];
        
        // Update SKILL, STAMINA, and LUCK stats
        // Format is "initial/current", we set both to the same value
        const updatedStats = characteristicsSection.stats.map(stat => {
            if (stat.name === "SKILL") {
                return { ...stat, value: `${skill}/${skill}` };
            } else if (stat.name === "STAMINA") {
                return { ...stat, value: `${stamina}/${stamina}` };
            } else if (stat.name === "LUCK") {
                return { ...stat, value: `${luck}/${luck}` };
            }
            return stat;
        });
        
        // Create a new characteristics section with updated stats
        const updatedCharacteristicsSection = {
            ...characteristicsSection,
            stats: updatedStats
        };
        
        // Update the sheet to trigger reactivity
        const updatedSections = [...$sheet.sections];
        updatedSections[characteristicsSectionIndex] = updatedCharacteristicsSection;
        
        $sheet = {
            ...$sheet,
            sections: updatedSections
        };
    }
    
    function handleEditToggle() {
        if (!$editing) {
            // Entering edit mode - requires confirmation and Director approval
            const confirmed = confirm(
                "Enter Edit Mode?\n\n" +
                "Edit mode grants access to character creation-level modifications, including initial characteristics, skill ranks, and talents. " +
                "These changes should only be made with explicit Director approval for character adjustments or corrections.\n\n" +
                "Have you received Director approval to enter edit mode?"
            );
            if (confirmed) {
                $editing = true;
            }
        } else {
            // Exiting edit mode - no confirmation needed
            $editing = false;
        }
    }
</script>

{#if $currentPlayerId === $viewingPlayerId}
<div class="sheet-actions">
    <button class="action-button new-character-button" on:click={handleNewCharacter} title="Reset character to default values">
        📄 New
    </button>
    <button 
        class="action-button rand-button" 
        on:click={handleRandomizeCharacter} 
        title="Randomize character characteristics (SKILL, STAMINA, LUCK)"
    >
        🎲 RAND
    </button>
    <button 
        class="action-button edit-button"
        class:editing={$editing}
        on:click={handleEditToggle} 
        title={$editing ? "Exit edit mode" : "Enter edit mode (requires Director approval)"}
    >
        {#if $editing}
            ✏️ Editing…
        {:else}
            ✏️ Edit
        {/if}
    </button>
    <FileManager/>
</div>
{/if}

<style lang="scss">
    .sheet-actions {
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

    .new-character-button,
    .rand-button {
        background: rgba(255, 100, 100, 0.2);
        border-color: rgba(255, 100, 100, 0.8);
        color: rgba(255, 150, 150, 1);
        
        &:hover {
            background: rgba(255, 100, 100, 0.8);
            color: rgb(var(--secondary));
        }
    }
    
    .edit-button {
        background: rgba(255, 100, 100, 0.2);
        border-color: rgba(255, 100, 100, 0.8);
        color: rgba(255, 150, 150, 1);
        
        &:hover {
            background: rgba(255, 100, 100, 0.8);
            color: rgb(var(--secondary));
        }
        
        &.editing {
            font-style: italic;
        }
    }
</style>