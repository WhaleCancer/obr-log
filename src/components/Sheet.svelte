<script lang="ts">
    // Import components
    import Sections from './Sections.svelte'
    import SheetActions from './SheetActions.svelte';
    import Notes from './Notes.svelte';
    import Characteristics from './Characteristics.svelte';
    import Section from './Section.svelte';
    import CharacterInfo from './CharacterInfo.svelte';
    import CombatSpecialSkills from './CombatSpecialSkills.svelte';
    import MovementSpecialSkills from './MovementSpecialSkills.svelte';
    import StealthSpecialSkills from './StealthSpecialSkills.svelte';
    import KnowledgeSpecialSkills from './KnowledgeSpecialSkills.svelte';
    import ScienceSpecialSkills from './ScienceSpecialSkills.svelte';
    import PsionicSpecialSkills from './PsionicSpecialSkills.svelte';
    import Talents from './Talents.svelte';
    import RemoveSection from './RemoveSection.svelte';
    import DiceLog from './DiceLog.svelte';
    import { currentPlayerId, viewingPlayerId } from "../services/OBRHelper";
    import type { AFFSheet } from '../types/sheet.type';

    // Import stores
    import { editing } from '../stores'
    
    $: editable = $currentPlayerId === $viewingPlayerId; 
    let player = "";

    // Handle portrait changes
    function handlePortraitChange(event: CustomEvent<string>) {
        sheet.portrait = event.detail;
        sheet = sheet; // Trigger reactivity
    }

    // Exports
    export let sheet:AFFSheet;
    
    // Tab state
    let activeTab: 'character' | 'dice-log' = 'character';
    
    // Split sections: Character Info first, then Special Skills, then Characteristics, then rest
    $: characteristicsSection = sheet?.sections?.find(s => s.name === "Characteristics");
    $: characterInfoSection = sheet?.sections?.find(s => s.name === "Character Info");
    $: combatSpecialSkillsSection = sheet?.sections?.find(s => s.name === "Combat Special Skills");
    $: psionicSpecialSkillsSection = sheet?.sections?.find(s => s.name === "Psionic Special Skills");
    $: movementSpecialSkillsSection = sheet?.sections?.find(s => s.name === "Movement Special Skills");
    $: stealthSpecialSkillsSection = sheet?.sections?.find(s => s.name === "Stealth Special Skills");
    $: knowledgeSpecialSkillsSection = sheet?.sections?.find(s => s.name === "Knowledge Special Skills");
    $: scienceSpecialSkillsSection = sheet?.sections?.find(s => s.name === "Science Special Skills");
    $: specialSkillsSections = (sheet?.sections || []).filter(s => 
        s.name !== "Characteristics" && 
        s.name !== "Character Info" && 
        s.name !== "Talents" && 
        s.name !== "Drawbacks" &&
        s.name !== "Combat Special Skills" &&
        s.name !== "Psionic Special Skills" &&
        s.name !== "Movement Special Skills" &&
        s.name !== "Stealth Special Skills" &&
        s.name !== "Knowledge Special Skills" &&
        s.name !== "Science Special Skills"
    );
    $: talentsSection = sheet?.sections?.find(s => s.name && s.name.trim() === "Talents");
    $: otherSections = (sheet?.sections || []).filter(s => 
        s.name === "Drawbacks"
    );
    
    // Ensure Talents section always exists in initial sheet structure
    $: if (!talentsSection && sheet.sections.length > 0) {
        console.warn("Talents section missing. Available sections:", sheet.sections.map(s => s.name));
    }
    // Reactive statement to update currentSkill whenever the SKILL stat value changes
    $: skillValue = characteristicsSection?.stats?.find(s => s.name === "SKILL")?.value || "0/0";
    $: currentSkill = (() => {
        if (!skillValue) return 0;
        const parts = skillValue.split('/');
        const current = parts[1]?.trim() || parts[0]?.trim() || '0';
        const num = parseInt(current, 10);
        return isNaN(num) ? 0 : num;
    })();
    
    // Reactive statement to update currentPsionics whenever the PSIONICS stat value changes
    $: psionicsValue = characteristicsSection?.stats?.find(s => s.name === "PSIONICS")?.value || "0/0";
    $: currentPsionics = (() => {
        if (!psionicsValue) return 0;
        const parts = psionicsValue.split('/');
        const current = parts[1]?.trim() || parts[0]?.trim() || '0';
        const num = parseInt(current, 10);
        return isNaN(num) ? 0 : num;
    })();
    
    // Get PSIONICS initial value (for hiding PSIONICS-related content when 0)
    $: psionicsInitial = (() => {
        if (!psionicsValue) return 0;
        const parts = psionicsValue.split('/');
        const initial = parts[0]?.trim() || '0';
        const num = parseInt(initial, 10);
        return isNaN(num) ? 0 : num;
    })();
    
    // For Knowledge Skills, use whichever is higher: SKILL or PSIONICS
    $: currentKnowledgeSkill = Math.max(currentSkill || 0, currentPsionics || 0);
    
    // For Science Skills, use whichever is higher: SKILL or PSIONICS (same as Knowledge)
    $: currentScienceSkill = Math.max(currentSkill || 0, currentPsionics || 0);
    
    function toggleEditing(){ 
      $editing = !$editing;
    }

    function removeSection(section){
        sheet.sections = sheet.sections.filter(t => t.id !== section.id)
    }

</script>

<div class="sheet-container">
    <h4>{player}</h4>
    
    <!-- Tab Navigation -->
    <div class="tabs">
        <button 
            class="tab-button" 
            class:active={activeTab === 'character'}
            on:click={() => activeTab = 'character'}
        >
            Character Sheet
        </button>
        <button 
            class="tab-button" 
            class:active={activeTab === 'dice-log'}
            on:click={() => activeTab = 'dice-log'}
        >
            Dice Log
        </button>
    </div>
    
    <!-- Tab Content -->
    <div class="tab-content">
        {#if activeTab === 'character'}
            <!-- Character Sheet Actions (New, Load, Save, Edit) -->
            <SheetActions/>
            
            <!-- Character Info Section -->
            {#if characterInfoSection}
                <CharacterInfo bind:section={characterInfoSection} bind:sheet={sheet} portrait={sheet.portrait || ""} on:portraitChange={handlePortraitChange} on:removeSection={e => removeSection(e.detail)}/>
            {/if}
            
            <!-- Characteristics Section - Right after Character Info -->
            {#if characteristicsSection}
                <div class="characteristics-section-wrapper">
                    <Characteristics bind:stats={characteristicsSection.stats}/>
                    {#if editable && !$editing}
                        <div class="remove-section-container">
                            <RemoveSection bind:section={characteristicsSection} on:removeSection={e => removeSection(e.detail)}/>
                        </div>
                    {/if}
                </div>
            {/if}
            
            <!-- Combat Special Skills Section (Special handling) -->
            {#if combatSpecialSkillsSection}
                <div class="combat-skills-section-wrapper">
                    <CombatSpecialSkills bind:stats={combatSpecialSkillsSection.stats} currentSkill={currentSkill}/>
                    {#if editable && !$editing}
                        <div class="remove-section-container">
                            <RemoveSection bind:section={combatSpecialSkillsSection} on:removeSection={e => removeSection(e.detail)}/>
                        </div>
                    {/if}
                </div>
            {/if}
            
            <!-- Psionic Special Skills Section (Special handling) -->
            {#if psionicSpecialSkillsSection && ($editing || psionicsInitial > 0)}
                <div class="psionic-skills-section-wrapper">
                    <PsionicSpecialSkills bind:stats={psionicSpecialSkillsSection.stats} currentPsionics={currentPsionics}/>
                    {#if editable && !$editing}
                        <div class="remove-section-container">
                            <RemoveSection bind:section={psionicSpecialSkillsSection} on:removeSection={e => removeSection(e.detail)}/>
                        </div>
                    {/if}
                </div>
            {/if}
            
            <!-- Movement Special Skills Section (Special handling) -->
            {#if movementSpecialSkillsSection}
                <div class="movement-skills-section-wrapper">
                    <MovementSpecialSkills bind:stats={movementSpecialSkillsSection.stats} currentSkill={currentSkill}/>
                    {#if editable && !$editing}
                        <div class="remove-section-container">
                            <RemoveSection bind:section={movementSpecialSkillsSection} on:removeSection={e => removeSection(e.detail)}/>
                        </div>
                    {/if}
                </div>
            {/if}
            
            <!-- Stealth Special Skills Section (Special handling) -->
            {#if stealthSpecialSkillsSection}
                <div class="stealth-skills-section-wrapper">
                    <StealthSpecialSkills bind:stats={stealthSpecialSkillsSection.stats} currentSkill={currentSkill}/>
                    {#if editable && !$editing}
                        <div class="remove-section-container">
                            <RemoveSection bind:section={stealthSpecialSkillsSection} on:removeSection={e => removeSection(e.detail)}/>
                        </div>
                    {/if}
                </div>
            {/if}
            
            <!-- Knowledge Special Skills Section (Special handling) -->
            {#if knowledgeSpecialSkillsSection}
                <div class="knowledge-skills-section-wrapper">
                    <KnowledgeSpecialSkills bind:stats={knowledgeSpecialSkillsSection.stats} currentSkill={currentKnowledgeSkill}/>
                    {#if editable && !$editing}
                        <div class="remove-section-container">
                            <RemoveSection bind:section={knowledgeSpecialSkillsSection} on:removeSection={e => removeSection(e.detail)}/>
                        </div>
                    {/if}
                </div>
            {/if}
            
            <!-- Science Special Skills Section (Special handling) -->
            {#if scienceSpecialSkillsSection}
                <div class="science-skills-section-wrapper">
                    <ScienceSpecialSkills bind:stats={scienceSpecialSkillsSection.stats} currentSkill={currentScienceSkill}/>
                    {#if editable && !$editing}
                        <div class="remove-section-container">
                            <RemoveSection bind:section={scienceSpecialSkillsSection} on:removeSection={e => removeSection(e.detail)}/>
                        </div>
                    {/if}
                </div>
            {/if}
            
            <!-- Special Skills Sections -->
            <Sections bind:sections={specialSkillsSections}/>
            
            <!-- Talents Section -->
            {#if talentsSection}
                <div class="talents-section-wrapper">
                    <Talents bind:section={talentsSection}/>
                    {#if editable && !$editing}
                        <div class="remove-section-container">
                            <RemoveSection bind:section={talentsSection} on:removeSection={e => removeSection(e.detail)}/>
                        </div>
                    {/if}
                </div>
            {/if}
            
            <!-- Other Sections (Drawbacks) -->
            <Sections bind:sections={otherSections}/>
            
            <Notes bind:notes={sheet.notes}/>
        {:else if activeTab === 'dice-log'}
            <DiceLog/>
        {/if}
    </div>
</div>

<style lang="scss">
    .sheet-container {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .sheet-container > div:not(.tabs):not(.tab-content) {
        width: 90%;
        margin-left: auto;
        margin-right: auto;
        padding-top: 2rem;
        padding-bottom: 2rem;
    }

    /* SheetActions should appear right after tabs */
    .tab-content > :global(.sheet-actions) {
        width: 90%;
        margin-left: auto;
        margin-right: auto;
        padding: 1rem 0;
        margin-top: 0;
        margin-bottom: 0.5rem;
        flex-shrink: 0;
    }

    /* Character sheet content in tab should have padding */
    .tab-content > :global(.character-info-container),
    .tab-content > :global(.characteristics-section-wrapper),
    .tab-content > :global(.combat-skills-section-wrapper),
    .tab-content > :global(.psionic-skills-section-wrapper),
    .tab-content > :global(.movement-skills-section-wrapper),
    .tab-content > :global(.stealth-skills-section-wrapper),
    .tab-content > :global(.knowledge-skills-section-wrapper),
    .tab-content > :global(.science-skills-section-wrapper),
    .tab-content > :global(.talents-section-wrapper),
    .tab-content > :global(.section-wrapper),
    .tab-content > :global(.notes-container) {
        width: 90%;
        margin-left: auto;
        margin-right: auto;
        padding-top: 2rem;
        padding-bottom: 2rem;
    }

    /* Dice log in tab should fill full height without padding */
    .tab-content > :global(.dice-log-container) {
        width: 100%;
        margin: 0;
        padding: 0;
        height: 100%;
    }

    h1 {
        margin: 1rem 0 0 1rem;
        color:rgb(var(--accent));
        text-align: right;
    }
    h4 {
        font-weight:300;
        margin:0;
        color:rgb(var(--accent));
        text-align: right;
    }

    .tabs {
        display: flex;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-bottom: 2px solid rgba(var(--accent), 0.3);
        background: rgba(var(--accent), 0.05);
        margin-bottom: 1rem;
        flex-shrink: 0;
    }

    .tab-button {
        padding: 0.5rem 1rem;
        border: none;
        border-bottom: 2px solid transparent;
        background: transparent;
        color: rgba(var(--primary), 0.7);
        font-size: 0.95rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        text-transform: uppercase;

        &:hover {
            color: rgb(var(--accent));
            background: rgba(var(--accent), 0.1);
        }

        &.active {
            color: rgb(var(--accent));
            border-bottom-color: rgb(var(--accent));
            background: rgba(var(--accent), 0.1);
            font-weight: 600;
        }
    }

    .tab-content {
        flex: 1;
        overflow: hidden;
        min-height: 0;
        display: flex;
        flex-direction: column;
        position: relative;
        
        /* Dice log should fill full height and width without padding */
        > :global(.dice-log-container) {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }
    }
    .characteristics-section-wrapper,
    .combat-skills-section-wrapper,
    .psionic-skills-section-wrapper,
    .movement-skills-section-wrapper,
    .stealth-skills-section-wrapper,
    .knowledge-skills-section-wrapper,
    .science-skills-section-wrapper {
        margin: 0;
        padding: 0;
        width: 100%;
        display: block;
        font-size: 0;
        box-sizing: border-box;
    }
    .characteristics-section-wrapper {
        clear: both;
    }
    .characteristics-section-wrapper > *,
    .combat-skills-section-wrapper > *,
    .psionic-skills-section-wrapper > *,
    .movement-skills-section-wrapper > *,
    .stealth-skills-section-wrapper > *,
    .knowledge-skills-section-wrapper > *,
    .science-skills-section-wrapper > * {
        margin: 0;
        padding: 0;
        font-size: initial;
        box-sizing: border-box;
    }
    .remove-section-container {
        margin: 0;
        padding: 0;
        text-align: center;
    }
    .talents-section-wrapper {
        margin: 0 0 1rem 0;
        width: 100%;
    }
    @media only screen and (min-width: 33.75em) {
        .sheet-container > div:not(.tabs):not(.tab-content) {
            width: 85%;
        }
        .tab-content > :global(.sheet-actions) {
            width: 85%;
        }
        .tab-content > :global(.character-info-container),
        .tab-content > :global(.characteristics-section-wrapper),
        .tab-content > :global(.combat-skills-section-wrapper),
        .tab-content > :global(.psionic-skills-section-wrapper),
        .tab-content > :global(.movement-skills-section-wrapper),
        .tab-content > :global(.stealth-skills-section-wrapper),
        .tab-content > :global(.knowledge-skills-section-wrapper),
        .tab-content > :global(.science-skills-section-wrapper),
        .tab-content > :global(.talents-section-wrapper),
        .tab-content > :global(.section-wrapper),
        .tab-content > :global(.notes-container) {
            width: 85%;
        }
    }
    @media only screen and (min-width: 60em) { /* 960px */
        .sheet-container > div:not(.tabs):not(.tab-content) {
            width: 75%;
            max-width: 60rem;
        }
        .tab-content > :global(.sheet-actions) {
            width: 75%;
            max-width: 60rem;
        }
        .tab-content > :global(.character-info-container),
        .tab-content > :global(.characteristics-section-wrapper),
        .tab-content > :global(.combat-skills-section-wrapper),
        .tab-content > :global(.psionic-skills-section-wrapper),
        .tab-content > :global(.movement-skills-section-wrapper),
        .tab-content > :global(.stealth-skills-section-wrapper),
        .tab-content > :global(.knowledge-skills-section-wrapper),
        .tab-content > :global(.science-skills-section-wrapper),
        .tab-content > :global(.talents-section-wrapper),
        .tab-content > :global(.section-wrapper),
        .tab-content > :global(.notes-container) {
            width: 75%;
            max-width: 60rem;
        }
    }
</style>