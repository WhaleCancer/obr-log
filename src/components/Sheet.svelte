<script lang="ts">
    // Import components
    import Sections from './Sections.svelte'
    import SheetActions from './SheetActions.svelte';
    import Notes from './Notes.svelte';
    import Characteristics from './Characteristics.svelte';
    import Section from './Section.svelte';
    import RemoveSection from './RemoveSection.svelte';
    import { currentPlayerId, viewingPlayerId } from "../services/OBRHelper";
    import type { AFFSheet } from '../types/sheet.type';

    // Import stores
    import { editing } from '../stores'
    
    $: editable = $currentPlayerId === $viewingPlayerId; 
    let player = "";

    // Exports
    export let sheet:AFFSheet;
    
    // Split sections: Character Info first, then Special Skills, then Characteristics, then rest
    $: characteristicsSection = sheet.sections.find(s => s.name === "Characteristics");
    $: characterInfoSection = sheet.sections.find(s => s.name === "Character Info");
    $: specialSkillsSections = sheet.sections.filter(s => 
        s.name !== "Characteristics" && 
        s.name !== "Character Info" && 
        s.name !== "Talents" && 
        s.name !== "Drawbacks"
    );
    $: otherSections = sheet.sections.filter(s => 
        s.name === "Talents" || s.name === "Drawbacks"
    );
    
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
        <Section bind:section={characterInfoSection} on:removeSection={e => removeSection(e.detail)}/>
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
    
    <!-- Special Skills Sections -->
    <Sections bind:sections={specialSkillsSections}/>
    
    <!-- Other Sections (Talents, Drawbacks) -->
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