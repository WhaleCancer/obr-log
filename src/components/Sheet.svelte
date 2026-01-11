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
    import InspectView from './InspectView.svelte';
    import { currentPlayerId, viewingPlayerId, selectedTokenId } from "../services/OBRHelper";
    import type { AFFSheet } from '../types/sheet.type';

    // Import stores
    import { editing } from '../stores'
    
    $: editable = $currentPlayerId === $viewingPlayerId; 
    let player = "";

    // Equipment type definition
    interface EquipmentItem {
        name: string;
        specialSkill?: string;
        icon?: string;
        stats?: Record<string, string>;
        description?: string;
        damageTrack?: Record<string, number>;
        range?: string;
        type?: string;
        manufacturer?: string;
        price?: string;
        hands?: number; // 1 for one-handed, 2 for two-handed
        allowedSlots?: string[]; // Array of allowed slot names
        isLinked?: boolean; // True if this is a linked slot (e.g., left hand for two-handed weapon)
        linkedTo?: string; // Slot name this equipment is linked to (e.g., "Right Hand")
    }

    // Equipment state - stores equipment in each slot
    let equipment: Record<string, EquipmentItem | null> = {
        "Right Hand": null,
        "Left Hand": null,
        "Body": null,
        "Head": null
    };

    // Equipment tooltip state
    let tooltipElement: string | null = null;
    let tooltipPosition = { x: 0, y: 0 };
    let tooltipEquipment: EquipmentItem | null = null;

    // Equipment selection modal state
    let showEquipmentModal = false;
    let equipmentModalSlot: string | null = null;
    let availableEquipmentList: EquipmentItem[] = [];
    let isLoadingEquipment = false;

    // Handle portrait changes
    function handlePortraitChange(event: CustomEvent<string>) {
        sheet.portrait = event.detail;
        sheet = sheet; // Trigger reactivity
    }
    
    // Handle clearing equipment slot
    function handleClearEquipment(slotName: string) {
        const item = equipment[slotName];
        const isTwoHanded = item?.hands === 2;
        const isLinked = item?.isLinked;
        
        let confirmMessage = `Clear ${slotName}?\n\n`;
        if (isTwoHanded) {
            confirmMessage += `This is a two-handed weapon and will be removed from both hands. `;
        } else if (isLinked) {
            confirmMessage += `This is linked to another slot. `;
        } else {
            confirmMessage += `This will remove all equipment from the ${slotName} slot. `;
        }
        confirmMessage += `This action cannot be undone.\n\nAre you sure you want to proceed?`;
        
        const confirmed = confirm(confirmMessage);
        
        if (confirmed) {
            if (isTwoHanded && slotName === "Right Hand") {
                // Clear both slots for two-handed weapon
                equipment["Right Hand"] = null;
                equipment["Left Hand"] = null;
            } else if (isLinked && item?.linkedTo) {
                // Clear both slots if clearing linked equipment
                equipment[slotName] = null;
                equipment[item.linkedTo] = null;
            } else {
                equipment[slotName] = null;
                // Also clear linked equipment if this was the main slot
                if (slotName === "Right Hand" && equipment["Left Hand"]?.linkedTo === "Right Hand") {
                    equipment["Left Hand"] = null;
                }
            }
            equipment = equipment; // Trigger reactivity
        }
    }
    
    // Check if slot has equipment
    function hasEquipment(slotName: string): boolean {
        return equipment[slotName] !== null;
    }
    
    // Check if equipment in slot has a special skill association
    function hasSpecialSkill(slotName: string): boolean {
        const item = equipment[slotName];
        return item !== null && item.specialSkill !== undefined && item.specialSkill !== "";
    }
    
    // Check if equipment in slot is linked (e.g., left hand for two-handed weapon)
    function isLinkedEquipment(slotName: string): boolean {
        const item = equipment[slotName];
        return item !== null && item.isLinked === true;
    }
    
    // Handle dice roll for equipment (uses associated special skill)
    function handleEquipmentDice(slotName: string) {
        const item = equipment[slotName];
        if (!item || !item.specialSkill) return;
        
        // TODO: Implement dice roll using the special skill
        // This will open a dice roller with the appropriate special skill
        console.log(`Rolling dice for ${item.name} using special skill: ${item.specialSkill}`);
    }

    // Base URL for fetching assets (handles GitHub Pages base path)
    const baseUrl = import.meta.env.BASE_URL || '/star-trek-character-sheet/';

    // Available equipment files (defined statically for now, can be extended to load dynamically)
    const equipmentFiles = [
        "phaser-type-1.json",
        "phaser-type-2.json",
        "phaser-rifle.json"
    ];

    // Open equipment selection modal
    async function handleLoadEquipment(slotName: string) {
        equipmentModalSlot = slotName;
        showEquipmentModal = true;
        isLoadingEquipment = true;
        availableEquipmentList = [];

        try {
            // Load all equipment files
            const equipmentPromises = equipmentFiles.map(async (file) => {
                try {
                    const response = await fetch(`${baseUrl}equipment/${file}`);
                    if (!response.ok) {
                        console.warn(`Failed to load ${file}: ${response.statusText}`);
                        return null;
                    }
                    return await response.json() as EquipmentItem;
                } catch (error) {
                    console.warn(`Error loading ${file}:`, error);
                    return null;
                }
            });

            const loadedEquipment = (await Promise.all(equipmentPromises)).filter((eq): eq is EquipmentItem => eq !== null);
            
            // Filter equipment that can be equipped in this slot
            availableEquipmentList = loadedEquipment.filter(eq => {
                if (eq.allowedSlots && eq.allowedSlots.length > 0) {
                    return eq.allowedSlots.includes(slotName);
                }
                // If no allowedSlots specified, allow all equipment
                return true;
            });
        } catch (error) {
            console.error('Failed to load equipment list:', error);
            alert(`Failed to load equipment list: ${error instanceof Error ? error.message : 'Unknown error'}`);
            showEquipmentModal = false;
        } finally {
            isLoadingEquipment = false;
        }
    }

    // Close equipment modal
    function closeEquipmentModal() {
        showEquipmentModal = false;
        equipmentModalSlot = null;
        availableEquipmentList = [];
    }

    // Handle equipment selection from modal
    function handleSelectEquipment(equipmentData: EquipmentItem) {
        if (!equipmentModalSlot) return;

        const slotName = equipmentModalSlot;

        // Check if slot is allowed (should already be filtered, but double-check)
        if (equipmentData.allowedSlots && !equipmentData.allowedSlots.includes(slotName)) {
            alert(
                `This equipment cannot be equipped in the "${slotName}" slot.\n\n` +
                `Allowed slots: ${equipmentData.allowedSlots.join(', ')}`
            );
            return;
        }
        
        // For two-handed weapons, must be equipped in Right Hand
        if (equipmentData.hands === 2 && slotName !== "Right Hand") {
            alert(
                `This is a two-handed weapon and must be equipped in the Right Hand slot.`
            );
            return;
        }
        
        // Clear existing equipment if needed
        if (equipmentData.hands === 2) {
            // Two-handed weapon: must be equipped in Right Hand, clears both slots
            if (equipment["Right Hand"] || equipment["Left Hand"]) {
                const confirmed = confirm(
                    `This two-handed weapon will replace equipment in both hands.\n\n` +
                    `Continue?`
                );
                if (!confirmed) return;
            }
            
            // Equip in right hand
            equipment["Right Hand"] = equipmentData;
            
            // Create linked equipment for left hand
            const linkedEquipment: EquipmentItem = {
                ...equipmentData,
                isLinked: true,
                linkedTo: "Right Hand"
            };
            equipment["Left Hand"] = linkedEquipment;
        } else {
            // One-handed weapon: check if slot is occupied
            if (equipment[slotName]) {
                const confirmed = confirm(
                    `This will replace the equipment currently in ${slotName}.\n\n` +
                    `Continue?`
                );
                if (!confirmed) return;
            }
            
            // If equipping in left hand and right hand has a two-handed weapon, clear it
            if (slotName === "Left Hand" && equipment["Right Hand"]?.hands === 2) {
                equipment["Right Hand"] = null;
                equipment["Left Hand"] = null;
            } else if (slotName === "Right Hand" && equipment["Left Hand"]?.linkedTo === "Right Hand") {
                // If equipping one-handed in right hand and left hand is linked, clear left hand
                equipment["Left Hand"] = null;
            }
            
            equipment[slotName] = equipmentData;
        }
        
        equipment = equipment; // Trigger reactivity
        closeEquipmentModal();
    }

    // Tooltip functions for equipment stats
    function showEquipmentTooltip(event: MouseEvent, item: EquipmentItem) {
        tooltipEquipment = item;
        tooltipPosition = { x: event.clientX, y: event.clientY };
    }

    function hideEquipmentTooltip() {
        tooltipEquipment = null;
    }

    function updateTooltipPosition(event: MouseEvent) {
        // Adjust position to keep tooltip on screen
        const padding = 10;
        const tooltipWidth = 300; // Max width from CSS
        let x = event.clientX;
        let y = event.clientY;
        
        // Check if tooltip would go off right edge
        if (x + tooltipWidth / 2 > window.innerWidth - padding) {
            x = window.innerWidth - tooltipWidth / 2 - padding;
        }
        // Check if tooltip would go off left edge
        if (x - tooltipWidth / 2 < padding) {
            x = tooltipWidth / 2 + padding;
        }
        
        tooltipPosition = { x, y };
    }

    // Format equipment stats for tooltip display
    function formatEquipmentTooltip(item: EquipmentItem): string {
        let tooltip = `<strong>${item.name}</strong>`;
        if (item.isLinked) {
            tooltip += ` <em>(Linked to ${item.linkedTo})</em>`;
        }
        tooltip += `<br><br>`;
        
        if (item.type) tooltip += `<strong>Type:</strong> ${item.type}<br>`;
        if (item.manufacturer) tooltip += `<strong>Manufacturer:</strong> ${item.manufacturer}<br>`;
        if (item.price) tooltip += `<strong>Price:</strong> ${item.price}<br>`;
        if (item.range) tooltip += `<strong>Range:</strong> ${item.range}<br>`;
        if (item.specialSkill) tooltip += `<strong>Special Skill:</strong> ${item.specialSkill}<br>`;
        
        if (item.damageTrack) {
            const damageEntries = Object.entries(item.damageTrack)
                .sort((a, b) => {
                    const aNum = parseInt(a[0]);
                    const bNum = parseInt(b[0]);
                    if (isNaN(aNum) || isNaN(bNum)) return a[0].localeCompare(b[0]);
                    return aNum - bNum;
                })
                .map(([roll, damage]) => `Roll ${roll}: ${damage} STAMINA`)
                .join('<br>');
            tooltip += `<br><strong>Damage Track:</strong><br>${damageEntries}<br>`;
        }
        
        if (item.stats) {
            tooltip += '<br>';
            Object.entries(item.stats).forEach(([key, value]) => {
                tooltip += `<strong>${key}:</strong> ${value}<br>`;
            });
        }

        if (item.special && item.special !== '-') {
            tooltip += `<br><strong>Special:</strong> ${item.special}<br>`;
        }
        
        return tooltip;
    }

    // Exports
    export let sheet:AFFSheet;
    
    // Tab state
    let activeTab: 'character' | 'dice-log' | 'inspect' = 'character';
    let lastSelectedTokenId: string | null = null;
    
    // Automatically switch to inspect tab whenever a token is selected (has stats or not)
    // Switch when: 1) A token is selected, 2) It's a different token from the last one we saw
    $: {
        const currentTokenId = $selectedTokenId;
        if (currentTokenId && currentTokenId !== lastSelectedTokenId) {
            // Switch to inspect tab whenever a new token is selected
            activeTab = 'inspect';
            lastSelectedTokenId = currentTokenId;
        } else if (!currentTokenId) {
            // Reset tracking when token is cleared
            lastSelectedTokenId = null;
        }
    }
    
    // Split sections: Character Info first, then Special Skills, then Characteristics, then rest
    $: characteristicsSection = sheet?.sections?.find(s => s.name === "Characteristics");
    $: characterInfoSection = sheet?.sections?.find(s => s.name === "Character Info");
    
    // Get Grade from Character Info section
    $: gradeStat = characterInfoSection?.stats?.find(s => s.name === "Grade");
    $: currentGrade = gradeStat?.value || "Veteran";
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
    
    // Reactive statement to update currentLuck whenever the LUCK stat value changes
    $: luckValue = characteristicsSection?.stats?.find(s => s.name === "LUCK")?.value || "0/0";
    $: currentLuck = (() => {
        if (!luckValue) return 0;
        const parts = luckValue.split('/');
        const current = parts[1]?.trim() || parts[0]?.trim() || '0';
        const num = parseInt(current, 10);
        return isNaN(num) ? 0 : num;
    })();
    
    // Function to decrease LUCK by 1
    function decreaseLuck() {
        if (!characteristicsSection) return;
        const luckStat = characteristicsSection.stats.find(s => s.name === "LUCK");
        if (!luckStat) return;
        
        const parsed = luckValue.split('/');
        const initial = parsed[0]?.trim() || '0';
        const current = parsed[1]?.trim() || parsed[0]?.trim() || '0';
        const currentNum = parseInt(current, 10);
        const newCurrent = Math.max(0, currentNum - 1).toString();
        
        luckStat.value = `${initial}/${newCurrent}`;
        // Trigger reactivity
        characteristicsSection = { ...characteristicsSection };
        sheet.sections = sheet.sections.map(s => 
            s.id === characteristicsSection.id ? characteristicsSection : s
        );
    }
    
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
            Log
        </button>
        <button 
            class="tab-button" 
            class:active={activeTab === 'inspect'}
            on:click={() => activeTab = 'inspect'}
        >
            Inspect
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
                    <Characteristics 
                        bind:stats={characteristicsSection.stats}
                        onLuckDecrease={decreaseLuck}
                        grade={currentGrade}
                    />
                    {#if editable && !$editing}
                        <div class="remove-section-container">
                            <RemoveSection bind:section={characteristicsSection} on:removeSection={e => removeSection(e.detail)}/>
                        </div>
                    {/if}
                </div>
            {/if}
            
            <!-- Equipment Section -->
            <div class="equipment-section-wrapper">
                <div class="equipment-container">
                    <h2 class="section-header">Equipment</h2>
                    <div class="equipment-slots">
                        <div class="equipment-slot">
                            <div class="slot-label">Right Hand</div>
                            <div 
                                class="slot-content tooltip-trigger"
                                on:mouseenter={(e) => { const item = equipment["Right Hand"]; if (item) showEquipmentTooltip(e, item); }}
                                on:mouseleave={hideEquipmentTooltip}
                                on:mousemove={updateTooltipPosition}
                            >
                                {#if equipment["Right Hand"]}
                                    {#if equipment["Right Hand"]?.icon}
                                        <img src={equipment["Right Hand"].icon} alt={equipment["Right Hand"].name} class="equipment-icon" />
                                    {/if}
                                    <span class="equipment-name">{equipment["Right Hand"].name}</span>
                                {/if}
                            </div>
                            <div class="slot-controls">
                                <button 
                                    class="slot-control-btn" 
                                    title={hasSpecialSkill("Right Hand") ? "Roll dice using equipment's special skill" : "Equipment must have a special skill to roll dice"}
                                    disabled={!hasSpecialSkill("Right Hand")}
                                    on:click={() => handleEquipmentDice("Right Hand")}
                                >
                                    🎲
                                </button>
                                <button 
                                    class="slot-control-btn" 
                                    title="Load equipment from JSON file"
                                    on:click={() => handleLoadEquipment("Right Hand")}
                                >
                                    📂
                                </button>
                                <button 
                                    class="slot-control-btn slot-control-btn-clear" 
                                    title="Clear"
                                    disabled={!hasEquipment("Right Hand")}
                                    on:click={() => handleClearEquipment("Right Hand")}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <div class="equipment-slot">
                            <div class="slot-label">Left Hand</div>
                            <div 
                                class="slot-content tooltip-trigger"
                                class:linked-equipment={isLinkedEquipment("Left Hand")}
                                on:mouseenter={(e) => { const item = equipment["Left Hand"]; if (item) showEquipmentTooltip(e, item); }}
                                on:mouseleave={hideEquipmentTooltip}
                                on:mousemove={updateTooltipPosition}
                            >
                                {#if equipment["Left Hand"]}
                                    {#if equipment["Left Hand"]?.icon}
                                        <img 
                                            src={equipment["Left Hand"].icon} 
                                            alt={equipment["Left Hand"].name} 
                                            class="equipment-icon"
                                            class:linked-icon={isLinkedEquipment("Left Hand")}
                                        />
                                    {/if}
                                    <span class="equipment-name">{equipment["Left Hand"].name}</span>
                                {/if}
                            </div>
                            <div class="slot-controls">
                                <button 
                                    class="slot-control-btn" 
                                    title={isLinkedEquipment("Left Hand") ? "This slot is linked to Right Hand (two-handed weapon)" : (hasSpecialSkill("Left Hand") ? "Roll dice using equipment's special skill" : "Equipment must have a special skill to roll dice")}
                                    disabled={!hasSpecialSkill("Left Hand") || isLinkedEquipment("Left Hand")}
                                    on:click={() => handleEquipmentDice("Left Hand")}
                                >
                                    🎲
                                </button>
                                <button 
                                    class="slot-control-btn" 
                                    title={isLinkedEquipment("Left Hand") ? "This slot is linked to Right Hand (two-handed weapon)" : "Load equipment from JSON file"}
                                    disabled={isLinkedEquipment("Left Hand")}
                                    on:click={() => handleLoadEquipment("Left Hand")}
                                >
                                    📂
                                </button>
                                <button 
                                    class="slot-control-btn slot-control-btn-clear" 
                                    title="Clear"
                                    disabled={!hasEquipment("Left Hand")}
                                    on:click={() => handleClearEquipment("Left Hand")}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <div class="equipment-slot">
                            <div class="slot-label">Body</div>
                            <div 
                                class="slot-content tooltip-trigger"
                                on:mouseenter={(e) => { const item = equipment["Body"]; if (item) showEquipmentTooltip(e, item); }}
                                on:mouseleave={hideEquipmentTooltip}
                                on:mousemove={updateTooltipPosition}
                            >
                                {#if equipment["Body"]}
                                    {#if equipment["Body"]?.icon}
                                        <img src={equipment["Body"].icon} alt={equipment["Body"].name} class="equipment-icon" />
                                    {/if}
                                    <span class="equipment-name">{equipment["Body"].name}</span>
                                {/if}
                            </div>
                            <div class="slot-controls">
                                <button 
                                    class="slot-control-btn" 
                                    title={hasSpecialSkill("Body") ? "Roll dice using equipment's special skill" : "Equipment must have a special skill to roll dice"}
                                    disabled={!hasSpecialSkill("Body")}
                                    on:click={() => handleEquipmentDice("Body")}
                                >
                                    🎲
                                </button>
                                <button 
                                    class="slot-control-btn" 
                                    title="Load equipment from JSON file"
                                    on:click={() => handleLoadEquipment("Body")}
                                >
                                    📂
                                </button>
                                <button 
                                    class="slot-control-btn slot-control-btn-clear" 
                                    title="Clear"
                                    disabled={!hasEquipment("Body")}
                                    on:click={() => handleClearEquipment("Body")}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <div class="equipment-slot">
                            <div class="slot-label">Head</div>
                            <div 
                                class="slot-content tooltip-trigger"
                                on:mouseenter={(e) => { const item = equipment["Head"]; if (item) showEquipmentTooltip(e, item); }}
                                on:mouseleave={hideEquipmentTooltip}
                                on:mousemove={updateTooltipPosition}
                            >
                                {#if equipment["Head"]}
                                    {#if equipment["Head"]?.icon}
                                        <img src={equipment["Head"].icon} alt={equipment["Head"].name} class="equipment-icon" />
                                    {/if}
                                    <span class="equipment-name">{equipment["Head"].name}</span>
                                {/if}
                            </div>
                            <div class="slot-controls">
                                <button 
                                    class="slot-control-btn" 
                                    title={hasSpecialSkill("Head") ? "Roll dice using equipment's special skill" : "Equipment must have a special skill to roll dice"}
                                    disabled={!hasSpecialSkill("Head")}
                                    on:click={() => handleEquipmentDice("Head")}
                                >
                                    🎲
                                </button>
                                <button 
                                    class="slot-control-btn" 
                                    title="Load equipment from JSON file"
                                    on:click={() => handleLoadEquipment("Head")}
                                >
                                    📂
                                </button>
                                <button 
                                    class="slot-control-btn slot-control-btn-clear" 
                                    title="Clear"
                                    disabled={!hasEquipment("Head")}
                                    on:click={() => handleClearEquipment("Head")}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Special Skills Header (only show if at least one special skills section exists) -->
            {#if combatSpecialSkillsSection || psionicSpecialSkillsSection || movementSpecialSkillsSection || stealthSpecialSkillsSection || knowledgeSpecialSkillsSection || scienceSpecialSkillsSection}
                <div class="special-skills-header-wrapper">
                    <div class="section-header-container">
                        <h2 class="section-header">Special Skills</h2>
                    </div>
                </div>
            {/if}
            
            <!-- Combat Special Skills Section (Special handling) -->
            {#if combatSpecialSkillsSection}
                <div class="combat-skills-section-wrapper">
                    <CombatSpecialSkills 
                        bind:stats={combatSpecialSkillsSection.stats} 
                        currentSkill={currentSkill} 
                        currentLuck={currentLuck} 
                        onLuckDecrease={decreaseLuck}
                        grade={currentGrade}
                        availableSpecialSkillPoints={0}
                        pointsSpentOnOtherSections={0}
                    />
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
                    <PsionicSpecialSkills bind:stats={psionicSpecialSkillsSection.stats} currentPsionics={currentPsionics} currentLuck={currentLuck} onLuckDecrease={decreaseLuck}/>
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
                    <MovementSpecialSkills bind:stats={movementSpecialSkillsSection.stats} currentSkill={currentSkill} currentLuck={currentLuck} onLuckDecrease={decreaseLuck}/>
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
                    <StealthSpecialSkills bind:stats={stealthSpecialSkillsSection.stats} currentSkill={currentSkill} currentLuck={currentLuck} onLuckDecrease={decreaseLuck}/>
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
                    <KnowledgeSpecialSkills bind:stats={knowledgeSpecialSkillsSection.stats} currentSkill={currentKnowledgeSkill} baseSkill={currentSkill} basePsionics={currentPsionics} currentLuck={currentLuck} onLuckDecrease={decreaseLuck}/>
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
                    <ScienceSpecialSkills bind:stats={scienceSpecialSkillsSection.stats} currentSkill={currentScienceSkill} baseSkill={currentSkill} basePsionics={currentPsionics} currentLuck={currentLuck} onLuckDecrease={decreaseLuck}/>
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
        {:else if activeTab === 'inspect'}
            <InspectView/>
        {/if}
    </div>
</div>

<!-- Equipment Tooltip -->
{#if tooltipEquipment}
    <div class="equipment-tooltip" style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px">
        <div class="tooltip-content">{@html formatEquipmentTooltip(tooltipEquipment)}</div>
    </div>
{/if}

<!-- Equipment Selection Modal -->
{#if showEquipmentModal}
<div class="equipment-modal-overlay" on:click={closeEquipmentModal}>
    <div class="equipment-modal-content" on:click|stopPropagation>
        <div class="equipment-modal-header">
            <h2>Select Equipment for {equipmentModalSlot || ''}</h2>
            <button class="equipment-modal-close" on:click={closeEquipmentModal}>×</button>
        </div>
        
        <div class="equipment-modal-body">
            {#if isLoadingEquipment}
                <div class="equipment-loading">
                    <p>Loading equipment...</p>
                </div>
            {:else if availableEquipmentList.length === 0}
                <div class="equipment-empty">
                    <p>No equipment available for this slot.</p>
                </div>
            {:else}
                <div class="equipment-list">
                    {#each availableEquipmentList as item}
                        <div 
                            class="equipment-item"
                            on:click={() => handleSelectEquipment(item)}
                            role="button"
                            tabindex="0"
                            on:keydown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleSelectEquipment(item);
                                }
                            }}
                        >
                            {#if item.icon}
                                <img src={item.icon} alt={item.name} class="equipment-item-icon" />
                            {/if}
                            <div class="equipment-item-info">
                                <div class="equipment-item-name">{item.name}</div>
                                {#if item.type}
                                    <div class="equipment-item-type">{item.type}</div>
                                {/if}
                                {#if item.range}
                                    <div class="equipment-item-range">Range: {item.range}</div>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
        
        <div class="equipment-modal-footer">
            <button class="equipment-modal-cancel" on:click={closeEquipmentModal}>
                Cancel
            </button>
        </div>
    </div>
</div>
{/if}

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
    .tab-content > :global(.equipment-section-wrapper),
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
    
    .tab-content > :global(.special-skills-header-wrapper) {
        width: 90%;
        margin-left: auto;
        margin-right: auto;
        padding-top: 2rem;
        padding-bottom: 0.5rem;
        padding-left: 0;
        padding-right: 0;
    }

    /* Dice log in tab should fill full height with max width of 700px */
    .tab-content > :global(.dice-log-container) {
        width: 100%;
        max-width: 700px;
        margin: 0 auto;
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
        
        /* Dice log should fill full height with max width of 700px */
        > :global(.dice-log-container) {
            width: 100%;
            max-width: 700px;
            height: 100%;
            margin: 0 auto;
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
    
    .special-skills-header-wrapper {
        margin: 0;
        padding: 0;
        width: 100%;
        display: block;
        font-size: 0;
        box-sizing: border-box;
    }
    
    .special-skills-header-wrapper > * {
        margin: 0;
        padding: 0;
        font-size: initial;
        box-sizing: border-box;
    }
    
    .section-header-container {
        padding: 0 0.5rem;
        margin: 0;
        box-sizing: border-box;
    }
    
    .section-header {
        text-shadow: var(--shadow);
        color: rgb(var(--accent));
        font-size: 1.1rem;
        font-weight: 700;
        padding: 0.5rem 0;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        border-bottom: 2px solid rgba(var(--accent), 0.3);
        box-sizing: border-box;
    }
    
    .equipment-section-wrapper {
        margin: 0;
        padding: 0;
        width: 100%;
        display: block;
        font-size: 0;
        box-sizing: border-box;
    }
    
    .equipment-section-wrapper > * {
        margin: 0;
        padding: 0;
        font-size: initial;
        box-sizing: border-box;
    }
    
    .equipment-container {
        padding: 0 0.5rem;
        margin: 0;
        box-sizing: border-box;
    }
    
    .equipment-slots {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        margin-top: 1rem;
        padding-bottom: 1rem;
    }
    
    .equipment-slot {
        display: flex;
        flex-direction: column;
        border: 2px solid rgba(var(--accent), 0.5);
        border-radius: 0.25rem;
        background: rgba(var(--accent), 0.05);
        box-sizing: border-box;
    }
    
    .slot-label {
        padding: 0.5rem;
        text-align: center;
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: rgb(var(--accent));
        text-shadow: var(--shadow);
        border-bottom: 1px solid rgba(var(--accent), 0.3);
        box-sizing: border-box;
        flex-shrink: 0;
    }
    
    .slot-content {
        flex: 1;
        padding: 0.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        min-height: 0;
        aspect-ratio: 1;
        box-sizing: border-box;
        font-size: 0.9rem;
        font-weight: 500;
        color: rgba(var(--primary), 0.9);
        text-align: center;
        word-wrap: break-word;
        overflow-wrap: break-word;
        position: relative;
        cursor: help;
    }

    .equipment-icon {
        max-width: 60%;
        max-height: 60%;
        object-fit: contain;
        flex-shrink: 0;
    }

    .equipment-name {
        font-size: 0.85rem;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .linked-equipment {
        opacity: 0.5;
        pointer-events: auto;
    }

    .linked-icon {
        opacity: 0.4;
        filter: grayscale(100%);
    }

    .tooltip-trigger {
        position: relative;
    }
    
    .slot-controls {
        display: flex;
        gap: 0.25rem;
        padding: 0.5rem;
        border-top: 1px solid rgba(var(--accent), 0.3);
        justify-content: center;
        align-items: center;
        flex-shrink: 0;
        box-sizing: border-box;
    }
    
    .slot-control-btn {
        background: rgba(var(--accent), 0.1);
        border: 1px solid rgba(var(--accent), 0.3);
        border-radius: 0.2rem;
        color: rgb(var(--accent));
        font-size: 1rem;
        padding: 0.25rem 0.4rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 0;
        line-height: 1.2;
        flex: 1;
        box-sizing: border-box;
        
        &:hover:not(:disabled) {
            background: rgba(var(--accent), 0.2);
            border-color: rgb(var(--accent));
            transform: scale(1.05);
        }
        
        &:active:not(:disabled) {
            transform: scale(0.95);
        }
        
        &:disabled {
            opacity: 0.3;
            cursor: not-allowed;
            transform: none;
        }
    }
    
    .slot-control-btn-clear {
        background: rgba(255, 100, 100, 0.2);
        border-color: rgba(255, 100, 100, 0.8);
        color: rgba(255, 150, 150, 1);
        
        &:hover:not(:disabled) {
            background: rgba(255, 100, 100, 0.8);
            border-color: rgba(255, 100, 100, 1);
            color: rgb(var(--secondary));
        }
        
        &:disabled {
            opacity: 0.3;
            cursor: not-allowed;
            transform: none;
        }
    }
    @media only screen and (min-width: 33.75em) {
        .sheet-container > div:not(.tabs):not(.tab-content) {
            width: 90%;
            margin-left: auto;
            margin-right: auto;
        }
        .tab-content > :global(.sheet-actions) {
            width: 90%;
            margin-left: auto;
            margin-right: auto;
        }
        .tab-content > :global(.character-info-container),
        .tab-content > :global(.characteristics-section-wrapper),
        .tab-content > :global(.equipment-section-wrapper),
        .tab-content > :global(.special-skills-header-wrapper),
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
        }
    }
    @media only screen and (min-width: 60em) { /* 960px */
        .sheet-container > div:not(.tabs):not(.tab-content) {
            width: 90%;
            margin-left: auto;
            margin-right: auto;
        }
        .tab-content > :global(.sheet-actions) {
            width: 90%;
            margin-left: auto;
            margin-right: auto;
        }
        .tab-content > :global(.character-info-container),
        .tab-content > :global(.characteristics-section-wrapper),
        .tab-content > :global(.equipment-section-wrapper),
        .tab-content > :global(.special-skills-header-wrapper),
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
        }
    }

    /* Equipment Tooltip Styles */
    .equipment-tooltip {
        position: fixed;
        z-index: 10000;
        pointer-events: none;
        transform: translate(-50%, -100%);
        margin-top: -10px;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .equipment-tooltip .tooltip-content {
        background: rgba(20, 20, 30, 0.98);
        border: 2px solid rgba(var(--accent), 0.8);
        border-radius: 0.5rem;
        padding: 0.75rem;
        font-size: 0.85rem;
        line-height: 1.5;
        color: rgba(var(--primary), 0.95);
        box-sizing: border-box;
        text-align: left;
    }

    .equipment-tooltip .tooltip-content strong {
        color: rgb(var(--accent));
        font-weight: 600;
    }

    .equipment-tooltip .tooltip-content::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid rgba(var(--accent), 0.8);
    }

    /* Equipment Selection Modal Styles */
    .equipment-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 1rem;
        box-sizing: border-box;
    }

    .equipment-modal-content {
        background: rgba(var(--background), 0.98);
        border: 2px solid rgba(var(--accent), 0.8);
        border-radius: 0.5rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        max-width: 600px;
        width: 100%;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
    }

    .equipment-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 2px solid rgba(var(--accent), 0.3);
        box-sizing: border-box;
    }

    .equipment-modal-header h2 {
        margin: 0;
        padding: 0;
        font-size: 1.2rem;
        font-weight: 700;
        color: rgb(var(--accent));
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .equipment-modal-close {
        background: transparent;
        border: none;
        color: rgb(var(--accent));
        font-size: 2rem;
        line-height: 1;
        cursor: pointer;
        padding: 0;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.25rem;
        transition: all 0.2s ease;
        box-sizing: border-box;

        &:hover {
            background: rgba(var(--accent), 0.1);
        }

        &:active {
            transform: scale(0.9);
        }
    }

    .equipment-modal-body {
        padding: 1rem;
        overflow-y: auto;
        flex: 1;
        box-sizing: border-box;
    }

    .equipment-loading,
    .equipment-empty {
        text-align: center;
        padding: 2rem;
        color: rgba(var(--primary), 0.7);
    }

    .equipment-list {
        display: grid;
        gap: 0.75rem;
        box-sizing: border-box;
    }

    .equipment-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem;
        border: 2px solid rgba(var(--accent), 0.3);
        border-radius: 0.5rem;
        background: rgba(var(--accent), 0.05);
        cursor: pointer;
        transition: all 0.2s ease;
        box-sizing: border-box;

        &:hover {
            background: rgba(var(--accent), 0.15);
            border-color: rgba(var(--accent), 0.6);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        &:active {
            transform: translateY(0);
        }

        &:focus {
            outline: 2px solid rgb(var(--accent));
            outline-offset: 2px;
        }
    }

    .equipment-item-icon {
        width: 64px;
        height: 64px;
        object-fit: contain;
        flex-shrink: 0;
    }

    .equipment-item-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        min-width: 0;
    }

    .equipment-item-name {
        font-size: 1rem;
        font-weight: 600;
        color: rgb(var(--accent));
    }

    .equipment-item-type {
        font-size: 0.85rem;
        color: rgba(var(--primary), 0.8);
    }

    .equipment-item-range {
        font-size: 0.8rem;
        color: rgba(var(--primary), 0.6);
    }

    .equipment-modal-footer {
        padding: 1rem;
        border-top: 2px solid rgba(var(--accent), 0.3);
        display: flex;
        justify-content: flex-end;
        box-sizing: border-box;
    }

    .equipment-modal-cancel {
        background: rgba(var(--accent), 0.1);
        border: 1px solid rgba(var(--accent), 0.3);
        border-radius: 0.25rem;
        color: rgb(var(--accent));
        font-size: 0.9rem;
        font-weight: 600;
        padding: 0.5rem 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
        box-sizing: border-box;

        &:hover {
            background: rgba(var(--accent), 0.2);
            border-color: rgba(var(--accent), 0.5);
        }

        &:active {
            transform: scale(0.95);
        }
    }
</style>