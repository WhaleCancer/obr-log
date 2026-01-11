<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { updateCreatureStats } from '../services/OBRHelper';
    import type { CreatureStats } from '../types/inspect.type';
    import { specialSkills as allSpecialSkills, getAllSkillNames } from '../data/specialSkills';
    import { talents as allTalentsData } from '../data/talents';

    const dispatch = createEventDispatcher();

    export let tokenId: string;
    export let creatureStats: CreatureStats | null = null;

    let name: string = '';
    // Characteristics with separate initial/current values
    let skillInitial: string = '';
    let skillCurrent: string = '';
    let staminaInitial: string = '';
    let staminaCurrent: string = '';
    let luckInitial: string = '';
    let luckCurrent: string = '';
    let psionicsInitial: string = '';
    let psionicsCurrent: string = '';
    let psiPointsInitial: string = '';
    let psiPointsCurrent: string = '';
    let specialSkills: Array<{name: string, rank: number}> = [];
    let talents: Array<{name: string, description?: string}> = [];
    let notes: string = '';

    // Helper function to parse value from "initial/current" or single number
    function parseValue(value: string): { initial: string; current: string } {
        if (!value) return { initial: '0', current: '0' };
        const parts = value.split('/');
        if (parts.length === 2) {
            return {
                initial: parts[0]?.trim() || '0',
                current: parts[1]?.trim() || parts[0]?.trim() || '0'
            };
        } else {
            // Single number - treat as current/current (initial equals current)
            const num = parts[0]?.trim() || '0';
            return { initial: num, current: num };
        }
    }

    // Helper function to format value as "initial/current"
    function formatValue(initial: string, current: string): string {
        return `${initial}/${current}`;
    }

    // Initialize from creatureStats when it changes
    $: if (creatureStats) {
        name = creatureStats.name || '';
        const skillParsed = parseValue(creatureStats.characteristics?.SKILL || '');
        skillInitial = skillParsed.initial;
        skillCurrent = skillParsed.current;
        const staminaParsed = parseValue(creatureStats.characteristics?.STAMINA || '');
        staminaInitial = staminaParsed.initial;
        staminaCurrent = staminaParsed.current;
        const luckParsed = parseValue(creatureStats.characteristics?.LUCK || '');
        luckInitial = luckParsed.initial;
        luckCurrent = luckParsed.current;
        const psionicsParsed = parseValue(creatureStats.characteristics?.PSIONICS || '');
        psionicsInitial = psionicsParsed.initial;
        psionicsCurrent = psionicsParsed.current;
        const psiPointsParsed = parseValue(creatureStats.characteristics?.PSI_POINTS || '');
        psiPointsInitial = psiPointsParsed.initial;
        psiPointsCurrent = psiPointsParsed.current;
        specialSkills = creatureStats.specialSkills ? [...creatureStats.specialSkills] : [];
        talents = creatureStats.talents ? [...creatureStats.talents] : [];
        notes = creatureStats.notes || '';
    }

    // Available special skills for dropdown (filter out already selected)
    $: availableSkillNames = getAllSkillNames().filter(skillName => 
        !specialSkills.some(s => s.name === skillName)
    );
    let newSkillName = '';
    let newSkillRank = 1;

    // Available talents for dropdown (filter out already selected)
    const allTalentsList = [...allTalentsData.major, ...allTalentsData.minor];
    $: availableTalents = allTalentsList.filter(talent => 
        !talents.some(t => t.name === talent.name)
    );
    let newTalentName = '';
    let newTalentDescription = '';
    let isSaving = false;

    // Auto-populate talent description when talent is selected
    $: if (newTalentName) {
        const selectedTalent = allTalentsList.find(t => t.name === newTalentName);
        if (selectedTalent) {
            newTalentDescription = selectedTalent.description || '';
        }
    }

    // Hidden file input for loading JSON
    let fileInput: HTMLInputElement;

    function addSpecialSkill() {
        if (newSkillName && newSkillName.trim()) {
            // Verify skill exists in the list
            if (availableSkillNames.includes(newSkillName)) {
                specialSkills = [...specialSkills, { name: newSkillName.trim(), rank: newSkillRank }];
                newSkillName = '';
                newSkillRank = 1;
            }
        }
    }

    function removeSpecialSkill(index: number) {
        specialSkills = specialSkills.filter((_, i) => i !== index);
    }

    function addTalent() {
        if (newTalentName && newTalentName.trim()) {
            // Verify talent exists in the list
            const selectedTalent = allTalentsList.find(t => t.name === newTalentName);
            if (selectedTalent) {
                talents = [...talents, { 
                    name: selectedTalent.name, 
                    description: newTalentDescription.trim() || selectedTalent.description 
                }];
                newTalentName = '';
                newTalentDescription = '';
            }
        }
    }

    function removeTalent(index: number) {
        talents = talents.filter((_, i) => i !== index);
    }

    async function handleLoadJSON() {
        fileInput?.click();
    }

    async function handleFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const loaded: CreatureStats = JSON.parse(text);

            // Validate and load the JSON structure
            if (typeof loaded === 'object' && loaded !== null) {
                name = loaded.name || '';
                const skillParsed = parseValue(loaded.characteristics?.SKILL || '');
                skillInitial = skillParsed.initial;
                skillCurrent = skillParsed.current;
                const staminaParsed = parseValue(loaded.characteristics?.STAMINA || '');
                staminaInitial = staminaParsed.initial;
                staminaCurrent = staminaParsed.current;
                const luckParsed = parseValue(loaded.characteristics?.LUCK || '');
                luckInitial = luckParsed.initial;
                luckCurrent = luckParsed.current;
                const psionicsParsed = parseValue(loaded.characteristics?.PSIONICS || '');
                psionicsInitial = psionicsParsed.initial;
                psionicsCurrent = psionicsParsed.current;
                const psiPointsParsed = parseValue(loaded.characteristics?.PSI_POINTS || '');
                psiPointsInitial = psiPointsParsed.initial;
                psiPointsCurrent = psiPointsParsed.current;
                specialSkills = loaded.specialSkills ? [...loaded.specialSkills] : [];
                talents = loaded.talents ? [...loaded.talents] : [];
                notes = loaded.notes || '';
            } else {
                throw new Error('Invalid JSON structure');
            }

            // Reset file input so same file can be selected again
            if (fileInput) {
                fileInput.value = '';
            }
        } catch (e) {
            console.error('Failed to load creature stats from JSON:', e);
            alert('Failed to load creature stats from JSON file. Please check the file format.\n\nExpected format:\n{\n  "name": "...",\n  "characteristics": { "SKILL": "7/7", "STAMINA": "12/12", ... },\n  "specialSkills": [...],\n  "talents": [...],\n  "notes": "..."\n}\n\nCharacteristics can be "initial/current" format or single number.');
        }
    }

    async function handleSave() {
        isSaving = true;
        try {
            const stats: CreatureStats = {
                name: name.trim() || 'Unnamed Creature',
                characteristics: {},
                specialSkills: specialSkills.length > 0 ? specialSkills : undefined,
                talents: talents.length > 0 ? talents : undefined,
                notes: notes.trim() || undefined
            };

            // Format characteristics as "initial/current"
            if (skillInitial.trim() || skillCurrent.trim()) {
                stats.characteristics.SKILL = formatValue(skillInitial.trim() || '0', skillCurrent.trim() || skillInitial.trim() || '0');
            }
            if (staminaInitial.trim() || staminaCurrent.trim()) {
                stats.characteristics.STAMINA = formatValue(staminaInitial.trim() || '0', staminaCurrent.trim() || staminaInitial.trim() || '0');
            }
            if (luckInitial.trim() || luckCurrent.trim()) {
                stats.characteristics.LUCK = formatValue(luckInitial.trim() || '0', luckCurrent.trim() || luckInitial.trim() || '0');
            }
            if (psionicsInitial.trim() || psionicsCurrent.trim()) {
                stats.characteristics.PSIONICS = formatValue(psionicsInitial.trim() || '0', psionicsCurrent.trim() || psionicsInitial.trim() || '0');
            }
            if (psiPointsInitial.trim() || psiPointsCurrent.trim()) {
                stats.characteristics.PSI_POINTS = formatValue(psiPointsInitial.trim() || '0', psiPointsCurrent.trim() || psiPointsInitial.trim() || '0');
            }

            await updateCreatureStats(tokenId, stats);
            dispatch('close');
        } catch (e) {
            console.error('Failed to save creature stats:', e);
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.error('Error details:', {
                error: e,
                message: errorMessage,
                stack: e instanceof Error ? e.stack : undefined
            });
            alert(`Failed to save creature stats: ${errorMessage}\n\nCheck the browser console for more details.`);
        } finally {
            isSaving = false;
        }
    }

    function handleCancel() {
        dispatch('close');
    }

    function handleKeydown(event: KeyboardEvent, callback: () => void) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            callback();
        }
    }
</script>

<input
    type="file"
    accept=".json,application/json"
    bind:this={fileInput}
    on:change={handleFileSelected}
    style="display: none;"
/>

<div class="modal-overlay" on:click={handleCancel}>
    <div class="modal-content" on:click|stopPropagation>
        <div class="modal-header">
            <h2>Edit Creature Stats</h2>
            <button class="close-button" on:click={handleCancel}>×</button>
        </div>

        <div class="modal-body">
            <div class="form-section">
                <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;">
                    <label for="creature-name" style="margin: 0; flex: 1;">Name</label>
                    <button class="load-button" on:click={handleLoadJSON} type="button">
                        Load Creature Stats
                    </button>
                </div>
                <input 
                    id="creature-name"
                    type="text" 
                    bind:value={name}
                    placeholder="Creature Name"
                    class="form-input"
                />
            </div>

            <div class="form-section">
                <h3>Characteristics</h3>
                <div class="characteristics-table-container">
                    <table class="characteristics-table">
                        <thead>
                            <tr>
                                <th class="header-cell header-left">CHARACTERISTIC</th>
                                <th class="header-cell">Initial</th>
                                <th class="header-cell">Current</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="stat-name">SKILL</td>
                                <td class="stat-value">
                                    <input id="skill-initial" type="number" bind:value={skillInitial} placeholder="0" min="0" class="form-input-small" />
                                </td>
                                <td class="stat-value">
                                    <input id="skill-current" type="number" bind:value={skillCurrent} placeholder="0" min="0" class="form-input-small" />
                                </td>
                            </tr>
                            <tr>
                                <td class="stat-name">STAMINA</td>
                                <td class="stat-value">
                                    <input id="stamina-initial" type="number" bind:value={staminaInitial} placeholder="0" min="0" class="form-input-small" />
                                </td>
                                <td class="stat-value">
                                    <input id="stamina-current" type="number" bind:value={staminaCurrent} placeholder="0" min="0" class="form-input-small" />
                                </td>
                            </tr>
                            <tr>
                                <td class="stat-name">LUCK</td>
                                <td class="stat-value">
                                    <input id="luck-initial" type="number" bind:value={luckInitial} placeholder="0" min="0" class="form-input-small" />
                                </td>
                                <td class="stat-value">
                                    <input id="luck-current" type="number" bind:value={luckCurrent} placeholder="0" min="0" class="form-input-small" />
                                </td>
                            </tr>
                            <tr>
                                <td class="stat-name">PSIONICS</td>
                                <td class="stat-value">
                                    <input id="psionics-initial" type="number" bind:value={psionicsInitial} placeholder="0" min="0" class="form-input-small" />
                                </td>
                                <td class="stat-value">
                                    <input id="psionics-current" type="number" bind:value={psionicsCurrent} placeholder="0" min="0" class="form-input-small" />
                                </td>
                            </tr>
                            <tr>
                                <td class="stat-name">PSI POINTS</td>
                                <td class="stat-value">
                                    <input id="psi-points-initial" type="number" bind:value={psiPointsInitial} placeholder="0" min="0" class="form-input-small" />
                                </td>
                                <td class="stat-value">
                                    <input id="psi-points-current" type="number" bind:value={psiPointsCurrent} placeholder="0" min="0" class="form-input-small" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="form-section">
                <h3>Special Skills</h3>
                {#if specialSkills.length > 0}
                    <div class="list-items">
                        {#each specialSkills as skill, index}
                            <div class="list-item">
                                <span class="item-name">{skill.name}</span>
                                <span class="item-rank">Rank: {skill.rank}</span>
                                <button class="remove-button" on:click={() => removeSpecialSkill(index)}>×</button>
                            </div>
                        {/each}
                    </div>
                {/if}
                <div class="add-item-form">
                    <select 
                        bind:value={newSkillName}
                        class="form-select"
                        disabled={availableSkillNames.length === 0}
                    >
                        <option value="">Select a skill...</option>
                        {#each availableSkillNames as skillName}
                            <option value={skillName}>{skillName}</option>
                        {/each}
                    </select>
                    <input 
                        type="number" 
                        bind:value={newSkillRank}
                        min="1"
                        placeholder="Rank"
                        class="form-input rank-input"
                    />
                    <button class="add-button" on:click={addSpecialSkill} disabled={!newSkillName || availableSkillNames.length === 0}>
                        Add
                    </button>
                </div>
            </div>

            <div class="form-section">
                <h3>Talents</h3>
                {#if talents.length > 0}
                    <div class="list-items">
                        {#each talents as talent, index}
                            <div class="list-item talent-item">
                                <div class="talent-item-content">
                                    <span class="item-name">{talent.name}</span>
                                    {#if talent.description}
                                        <span class="item-description">{talent.description}</span>
                                    {/if}
                                </div>
                                <button class="remove-button" on:click={() => removeTalent(index)}>×</button>
                            </div>
                        {/each}
                    </div>
                {/if}
                <div class="add-item-form">
                    <select 
                        bind:value={newTalentName}
                        class="form-select"
                        disabled={availableTalents.length === 0}
                    >
                        <option value="">Select a talent...</option>
                        {#each availableTalents as talent}
                            <option value={talent.name}>{talent.name} ({talent.type})</option>
                        {/each}
                    </select>
                    <textarea 
                        bind:value={newTalentDescription}
                        placeholder="Description (auto-filled from selected talent)"
                        class="form-textarea"
                        rows="2"
                        readonly={!!newTalentName}
                    ></textarea>
                    <button class="add-button" on:click={addTalent} disabled={!newTalentName || availableTalents.length === 0}>
                        Add
                    </button>
                </div>
            </div>

            <div class="form-section">
                <label for="notes">Notes</label>
                <textarea 
                    id="notes"
                    bind:value={notes}
                    placeholder="Additional notes or descriptions..."
                    class="form-textarea"
                    rows="4"
                ></textarea>
            </div>
        </div>

        <div class="modal-footer">
            <button class="cancel-button" on:click={handleCancel} disabled={isSaving}>
                Cancel
            </button>
            <button class="save-button" on:click={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
            </button>
        </div>
    </div>
</div>

<style lang="scss">
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }

    .modal-content {
        background: rgb(var(--secondary));
        border: 2px solid rgba(var(--accent), 0.5);
        border-radius: 0.5rem;
        max-width: 700px;
        width: 100%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-bottom: 2px solid rgba(var(--accent), 0.3);
        background: rgba(var(--accent), 0.1);

        h2 {
            margin: 0;
            color: rgb(var(--accent));
            font-size: 1.5rem;
            text-shadow: var(--shadow);
        }

        .close-button {
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
            transition: all 0.2s ease;

            &:hover {
                transform: scale(1.1);
                color: rgba(var(--accent), 0.8);
            }
        }
    }

    .modal-body {
        padding: 1.5rem;
        overflow-y: auto;
        flex: 1;
    }

    .form-section {
        margin-bottom: 2rem;

        label {
            display: block;
            color: rgb(var(--accent));
            font-weight: 600;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-size: 0.9rem;
        }

        h3 {
            color: rgb(var(--accent));
            font-size: 1.1rem;
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
    }

    .form-input,
    .form-textarea,
    .form-select {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: 1px solid rgba(var(--accent), 0.5);
        border-radius: 0.25rem;
        background: rgba(var(--accent), 0.1);
        color: rgb(var(--primary));
        font-size: 1rem;
        font-family: inherit;
        box-sizing: border-box;

        &:focus {
            outline: none;
            border-color: rgb(var(--accent));
            background: rgba(var(--accent), 0.15);
        }

        &::placeholder {
            color: rgba(var(--primary), 0.4);
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }

    .form-select {
        cursor: pointer;

        option {
            background: rgb(var(--secondary));
            color: rgb(var(--primary));
        }
    }

    .form-textarea {
        resize: vertical;
        min-height: 3rem;
    }

    .load-button {
        padding: 0.4rem 0.8rem;
        border: 1px solid rgba(var(--accent), 0.6);
        border-radius: 0.25rem;
        background: rgba(var(--accent), 0.15);
        color: rgb(var(--accent));
        font-weight: 600;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;

        &:hover {
            background: rgba(var(--accent), 0.25);
            border-color: rgb(var(--accent));
        }
    }

    .characteristics-table-container {
        width: 100%;
        overflow-x: auto;
    }

    .characteristics-table {
        width: 100%;
        border-collapse: collapse;
        margin: 0;
    }

    .characteristics-table thead {
        border-bottom: 2px solid rgba(var(--accent), 0.4);
    }

    .characteristics-table th {
        padding: 0.5rem;
        text-align: left;
        color: rgb(var(--accent));
        font-weight: 600;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .characteristics-table th.header-left {
        text-align: left;
    }

    .characteristics-table th.header-cell {
        text-align: center;
    }

    .characteristics-table tbody tr {
        border-bottom: 1px solid rgba(var(--accent), 0.2);
    }

    .characteristics-table tbody tr:last-child {
        border-bottom: none;
    }

    .characteristics-table .stat-name {
        padding: 0.5rem;
        font-weight: 600;
        color: rgba(var(--primary), 0.9);
    }

    .characteristics-table .stat-value {
        padding: 0.25rem;
        text-align: center;
    }

    .form-input-small {
        width: 100%;
        padding: 0.35rem 0.5rem;
        border: 1px solid rgba(var(--accent), 0.5);
        border-radius: 0.25rem;
        background: rgba(var(--accent), 0.1);
        color: rgb(var(--primary));
        font-size: 0.9rem;
        font-family: inherit;
        box-sizing: border-box;
        text-align: center;

        &:focus {
            outline: none;
            border-color: rgb(var(--accent));
            background: rgba(var(--accent), 0.15);
        }

        &::placeholder {
            color: rgba(var(--primary), 0.4);
        }
    }

    .list-items {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .list-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem;
        background: rgba(var(--accent), 0.1);
        border-radius: 0.25rem;
        border: 1px solid rgba(var(--accent), 0.2);

        &.talent-item {
            align-items: flex-start;
        }

        .talent-item-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }

        .item-name {
            color: rgba(var(--primary), 0.9);
            font-weight: 600;
        }

        .item-rank {
            color: rgba(var(--accent), 0.8);
            font-size: 0.9rem;
        }

        .item-description {
            color: rgba(var(--primary), 0.7);
            font-size: 0.85rem;
            font-style: italic;
        }

        .remove-button {
            background: rgba(220, 60, 60, 0.2);
            border: 1px solid rgba(220, 60, 60, 0.5);
            color: rgb(220, 60, 60);
            border-radius: 0.25rem;
            width: 2rem;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 1.2rem;
            line-height: 1;
            transition: all 0.2s ease;

            &:hover {
                background: rgba(220, 60, 60, 0.3);
                transform: scale(1.1);
            }
        }
    }

    .add-item-form {
        display: flex;
        gap: 0.5rem;
        align-items: flex-start;

        .form-input {
            flex: 1;
        }

        .rank-input {
            width: 80px;
            flex: 0 0 80px;
        }

        .form-textarea {
            flex: 1;
        }

        .add-button {
            padding: 0.5rem 1rem;
            border: 1px solid rgb(var(--accent));
            border-radius: 0.25rem;
            background: rgba(var(--accent), 0.2);
            color: rgb(var(--accent));
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;

            &:hover {
                background: rgba(var(--accent), 0.3);
            }
        }
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        padding: 1rem 1.5rem;
        border-top: 2px solid rgba(var(--accent), 0.3);
        background: rgba(var(--accent), 0.05);
    }

    .cancel-button,
    .save-button {
        padding: 0.5rem 1.5rem;
        border-radius: 0.25rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }

    .cancel-button {
        border: 1px solid rgba(var(--accent), 0.5);
        background: transparent;
        color: rgba(var(--primary), 0.7);

        &:hover:not(:disabled) {
            background: rgba(var(--accent), 0.1);
        }
    }

    .save-button {
        border: 1px solid rgb(var(--accent));
        background: rgb(var(--accent));
        color: rgb(var(--secondary));

        &:hover:not(:disabled) {
            background: rgba(var(--accent), 0.9);
            transform: translateY(-1px);
        }
    }
</style>
