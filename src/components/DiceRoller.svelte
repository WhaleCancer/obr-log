<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();
    
    export let skillTotal: number = 0; // The total skill value (ranks + base skill/psionics)
    export let skillName: string = "";
    
    let localTargetNumber: number = 15;
    let localModifier: number = 0;
    let showModal: boolean = true;
    
    let rollResult: number | null = null;
    let die1: number | null = null;
    let die2: number | null = null;
    let isSuccess: boolean | null = null;
    
    function rollDice() {
        // Roll 2d6
        die1 = Math.floor(Math.random() * 6) + 1;
        die2 = Math.floor(Math.random() * 6) + 1;
        const diceTotal = die1 + die2;
        
        // Add modifier
        rollResult = diceTotal + localModifier;
        
        // Compare against target number
        isSuccess = rollResult >= localTargetNumber;
    }
    
    function closeModal() {
        showModal = false;
        dispatch('close');
    }
    
    function handleRoll() {
        rollDice();
    }
    
    function handleTargetChange(event: Event) {
        const target = (event.target as HTMLInputElement).value;
        localTargetNumber = parseInt(target) || 15;
    }
    
    function handleModifierChange(event: Event) {
        const mod = (event.target as HTMLInputElement).value;
        localModifier = parseInt(mod) || 0;
    }
</script>

{#if showModal}
<div class="dice-roller-overlay" on:click={closeModal}>
    <div class="dice-roller-modal" on:click|stopPropagation>
        <div class="dice-roller-header">
            <h3>Roll Dice for {skillName}</h3>
            <button class="close-button" on:click={closeModal}>×</button>
        </div>
        
        <div class="dice-roller-content">
            <div class="skill-total-info">
                <strong>Skill Total:</strong> {skillTotal} (base + ranks)
            </div>
            
            <div class="input-group">
                <label for="target-number">Target Number</label>
                <input 
                    id="target-number"
                    type="number" 
                    value={localTargetNumber} 
                    on:input={handleTargetChange}
                    min="1"
                    max="99"
                />
                <div class="help-text">
                    The Director will give you this number. It is often <strong>15</strong> for a standard special skill test.
                </div>
            </div>
            
            <div class="input-group">
                <label for="modifier">Modifier</label>
                <input 
                    id="modifier"
                    type="number" 
                    value={localModifier} 
                    on:input={handleModifierChange}
                    min="-99"
                    max="99"
                />
                <div class="help-text">
                    Any bonuses or penalties to your roll (calculated by the player).
                </div>
            </div>
            
            {#if rollResult !== null}
            <div class="roll-result" class:success={isSuccess} class:failure={!isSuccess}>
                <div class="dice-rolls">
                    <span class="die">Die 1: {die1}</span>
                    <span class="die">Die 2: {die2}</span>
                    <span class="dice-total">= {die1 + die2}</span>
                    {#if localModifier !== 0}
                    <span class="modifier">{localModifier > 0 ? '+' : ''}{localModifier}</span>
                    {/if}
                </div>
                <div class="final-result">
                    <strong>Total: {rollResult}</strong> vs Target: {localTargetNumber}
                </div>
                <div class="outcome">
                    {#if isSuccess}
                    <span class="success-text">✓ SUCCESS</span>
                    {:else}
                    <span class="failure-text">✗ FAILURE</span>
                    {/if}
                </div>
            </div>
            {/if}
            
            <div class="button-group">
                <button class="roll-button" on:click={handleRoll}>Roll 2d6</button>
                <button class="close-button-secondary" on:click={closeModal}>Close</button>
            </div>
        </div>
    </div>
</div>
{/if}

<style lang="scss">
    .dice-roller-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
    }
    
    .dice-roller-modal {
        background: rgb(var(--secondary));
        border: 2px solid rgb(var(--accent));
        border-radius: 0.5rem;
        padding: 1.5rem;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }
    
    .dice-roller-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid rgba(var(--accent), 0.3);
        padding-bottom: 0.75rem;
        
        h3 {
            margin: 0;
            color: rgb(var(--accent));
            font-size: 1.25rem;
            font-weight: 600;
        }
    }
    
    .close-button {
        background: transparent;
        border: none;
        color: rgb(var(--accent));
        font-size: 2rem;
        cursor: pointer;
        padding: 0;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        
        &:hover {
            color: rgba(var(--accent), 0.8);
        }
    }
    
    .dice-roller-content {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .skill-total-info {
        padding: 0.75rem;
        background: rgba(var(--accent), 0.1);
        border-radius: 0.25rem;
        color: rgb(var(--primary));
        text-align: center;
        font-size: 1rem;
    }
    
    .input-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        
        label {
            color: rgb(var(--accent));
            font-weight: 600;
            font-size: 0.9rem;
        }
        
        input {
            padding: 0.75rem;
            background: rgba(var(--accent), 0.1);
            border: 1px solid rgba(var(--accent), 0.5);
            border-radius: 0.25rem;
            color: rgb(var(--primary));
            font-size: 1.1rem;
            text-align: center;
            
            &:focus {
                outline: none;
                border-color: rgb(var(--accent));
                background: rgba(var(--accent), 0.15);
            }
        }
        
        .help-text {
            font-size: 0.85rem;
            color: rgba(var(--primary), 0.7);
            font-style: italic;
            
            strong {
                color: rgb(var(--accent));
            }
        }
    }
    
    .roll-result {
        padding: 1rem;
        border-radius: 0.5rem;
        border: 2px solid;
        text-align: center;
        
        &.success {
            background: rgba(100, 200, 100, 0.2);
            border-color: rgba(100, 200, 100, 0.8);
        }
        
        &.failure {
            background: rgba(200, 100, 100, 0.2);
            border-color: rgba(200, 100, 100, 0.8);
        }
    }
    
    .dice-rolls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
        flex-wrap: wrap;
        
        .die {
            padding: 0.5rem 0.75rem;
            background: rgba(var(--primary), 0.1);
            border-radius: 0.25rem;
            font-weight: 600;
            color: rgb(var(--primary));
        }
        
        .dice-total {
            font-size: 1.2rem;
            font-weight: 700;
            color: rgb(var(--accent));
        }
        
        .modifier {
            font-size: 1.2rem;
            font-weight: 700;
            color: rgb(var(--accent));
        }
    }
    
    .final-result {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
        color: rgb(var(--primary));
    }
    
    .outcome {
        margin-top: 0.75rem;
        
        .success-text {
            color: rgb(100, 200, 100);
            font-size: 1.5rem;
            font-weight: 700;
            text-shadow: 0 0 10px rgba(100, 200, 100, 0.5);
        }
        
        .failure-text {
            color: rgb(200, 100, 100);
            font-size: 1.5rem;
            font-weight: 700;
            text-shadow: 0 0 10px rgba(200, 100, 100, 0.5);
        }
    }
    
    .button-group {
        display: flex;
        gap: 1rem;
        justify-content: center;
        
        button {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 0.25rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .roll-button {
            background: rgb(var(--accent));
            color: rgb(var(--secondary));
            flex: 1;
            
            &:hover {
                background: rgba(var(--accent), 0.8);
                transform: scale(1.05);
            }
            
            &:active {
                transform: scale(0.95);
            }
        }
        
        .close-button-secondary {
            background: rgba(var(--primary), 0.2);
            color: rgb(var(--primary));
            border: 1px solid rgba(var(--primary), 0.5);
            
            &:hover {
                background: rgba(var(--primary), 0.3);
            }
        }
    }
</style>
