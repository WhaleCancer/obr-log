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
    import PsionicSpecialSkills from './PsionicSpecialSkills.svelte';
    import Talents from './Talents.svelte';
    import RemoveSection from './RemoveSection.svelte';
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
    
    // Split sections: Character Info first, then Special Skills, then Characteristics, then rest
    $: characteristicsSection = sheet.sections.find(s => s.name === "Characteristics");
    $: characterInfoSection = sheet.sections.find(s => s.name === "Character Info");
    $: combatSpecialSkillsSection = sheet.sections.find(s => s.name === "Combat Special Skills");
    $: psionicSpecialSkillsSection = sheet.sections.find(s => s.name === "Psionic Special Skills");
    $: movementSpecialSkillsSection = sheet.sections.find(s => s.name === "Movement Special Skills");
    $: stealthSpecialSkillsSection = sheet.sections.find(s => s.name === "Stealth Special Skills");
    $: knowledgeSpecialSkillsSection = sheet.sections.find(s => s.name === "Knowledge Special Skills");
    $: specialSkillsSections = sheet.sections.filter(s => 
        s.name !== "Characteristics" && 
        s.name !== "Character Info" && 
        s.name !== "Talents" && 
        s.name !== "Drawbacks" &&
        s.name !== "Combat Special Skills" &&
        s.name !== "Psionic Special Skills" &&
        s.name !== "Movement Special Skills" &&
        s.name !== "Stealth Special Skills" &&
        s.name !== "Knowledge Special Skills"
    );
    $: talentsSection = sheet.sections.find(s => s.name && s.name.trim() === "Talents");
    $: otherSections = sheet.sections.filter(s => 
        s.name === "Drawbacks"
    );
    
    // Ensure Talents section always exists in initial sheet structure
    $: if (!talentsSection && sheet.sections.length > 0) {
        console.warn("Talents section missing. Available sections:", sheet.sections.map(s => s.name));
    }
    // Reactive statement to update currentSkill whenever the SKILL stat value changes
    $: skillValue = characteristicsSection?.stats?.find(s => s.name === "SKILL")?.value || "0/0";
    $: currentSkill = (() => {
        const parts = skillValue.split('/');
        const current = parts[1]?.trim() || parts[0]?.trim() || '0';
        const num = parseInt(current, 10);
        return isNaN(num) ? 0 : num;
    })();
    
    // Reactive statement to update currentPsionics whenever the PSIONICS stat value changes
    $: psionicsValue = characteristicsSection?.stats?.find(s => s.name === "PSIONICS")?.value || "0/0";
    $: currentPsionics = (() => {
        const parts = psionicsValue.split('/');
        const current = parts[1]?.trim() || parts[0]?.trim() || '0';
        const num = parseInt(current, 10);
        return isNaN(num) ? 0 : num;
    })();
    
    // For Knowledge Skills, use whichever is higher: SKILL or PSIONICS
    $: currentKnowledgeSkill = Math.max(currentSkill, currentPsionics);
    
    function toggleEditing(){ 
      $editing = !$editing;
    }

    function removeSection(section){
        sheet.sections = sheet.sections.filter(t => t.id !== section.id)
    }

</script>

<div>
    {#if editable && $editing}
    <h1 bind:innerText={sheet.name} contenteditable="true"> </h1>
    {:else}
    <h1>{sheet.name}</h1>
    {/if}
    <h4>{player}</h4>
    <SheetActions/>
    
    <!-- Character Info Section -->
    {#if characterInfoSection}
        <CharacterInfo bind:section={characterInfoSection} portrait={sheet.portrait || ""} on:portraitChange={handlePortraitChange} on:removeSection={e => removeSection(e.detail)}/>
    {/if}
    
    <!-- Characteristics Section - Right after Character Info -->
    {#if characteristicsSection}
        <div class="characteristics-section-wrapper">
            <Characteristics bind:stats={characteristicsSection.stats}/>
            {#if editable && $editing}
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
            {#if editable && $editing}
                <div class="remove-section-container">
                    <RemoveSection bind:section={combatSpecialSkillsSection} on:removeSection={e => removeSection(e.detail)}/>
                </div>
            {/if}
        </div>
    {/if}
    
    <!-- Psionic Special Skills Section (Special handling) -->
    {#if psionicSpecialSkillsSection}
        <div class="psionic-skills-section-wrapper">
            <PsionicSpecialSkills bind:stats={psionicSpecialSkillsSection.stats} currentPsionics={currentPsionics}/>
            {#if editable && $editing}
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
            {#if editable && $editing}
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
            {#if editable && $editing}
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
            {#if editable && $editing}
                <div class="remove-section-container">
                    <RemoveSection bind:section={knowledgeSpecialSkillsSection} on:removeSection={e => removeSection(e.detail)}/>
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
            {#if editable && $editing}
                <div class="remove-section-container">
                    <RemoveSection bind:section={talentsSection} on:removeSection={e => removeSection(e.detail)}/>
                </div>
            {/if}
        </div>
    {/if}
    
    <!-- Other Sections (Drawbacks) -->
    <Sections bind:sections={otherSections}/>
    
    <Notes bind:notes={sheet.notes}/>
</div>

<style lang="scss">
    div {
        width: 90%;
        margin-left: auto;
        margin-right: auto;
        padding-top: 2rem;
        padding-bottom: 2rem;
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
    .characteristics-section-wrapper {
        margin: 1.5rem 0;
        width: 100%;
        clear: both;
    }
    .remove-section-container {
        margin-top: 1rem;
        text-align: center;
    }
    .combat-skills-section-wrapper {
        margin: 1rem 0 0 0;
        width: 100%;
    }
    .psionic-skills-section-wrapper {
        margin: 0 0 0 0;
        width: 100%;
    }
    .movement-skills-section-wrapper {
        margin: 0 0 0 0;
        width: 100%;
    }
    .stealth-skills-section-wrapper {
        margin: 0 0 0 0;
        width: 100%;
    }
    .knowledge-skills-section-wrapper {
        margin: 0 0 1rem 0;
        width: 100%;
    }
    .talents-section-wrapper {
        margin: 0 0 1rem 0;
        width: 100%;
    }
    @media only screen and (min-width: 33.75em) {
        div {
            width: 85%;
        }
    }
    @media only screen and (min-width: 60em) { /* 960px */
        div {
            width: 75%;
            max-width: 60rem;
        }
    }
</style>