<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { diceRolls } from '../stores/diceRolls';
    import { currentPlayerName, currentPlayerId } from '../services/OBRHelper';
    import { get } from 'svelte/store';
    import { playDiceRollSound, playSuccessSound, playFailureSound } from '../utils/sound';
    
    const dispatch = createEventDispatcher();
    
    export let skillTotal: number = 0; // The total skill value (ranks + base skill/psionics)
    export let skillName: string = "";
    export let ranks: number = 0; // Ranks in the skill
    export let baseSkill: number = 0; // Base SKILL or PSIONICS value used
    export let baseStatType: 'SKILL' | 'PSIONICS' = 'SKILL'; // Which base stat was used
    export let currentLuck: number = 0; // Current LUCK value
    export let onLuckDecrease: () => void = () => {}; // Callback to decrease LUCK
    export let isStandaloneLuckTest: boolean = false; // If true, this is a standalone LUCK test (not a reroll)
    
    let localTargetNumber: number = 15;
    let localModifier: number = 0;
    let showModal: boolean = true;
    
    let rollResult: number | null = null;
    let die1: number | null = null;
    let die2: number | null = null;
    let isSuccess: boolean | null = null;
    let isRolling: boolean = false;
    let animationDie1: number = 1;
    let animationDie2: number = 1;
    let animationInterval: ReturnType<typeof setInterval> | null = null;
    
    // Track if this is a LUCK test (reroll after failure)
    let isLuckTest: boolean = false;
    // Track if we've done the original skill roll
    let hasDoneOriginalRoll: boolean = false;
    // Store original roll values for reroll after successful LUCK test
    let originalRollValues: { targetNumber: number; modifier: number } | null = null;
    // Track if LUCK test has been used (one-time use per skill test)
    let hasUsedLuckTest: boolean = false;
    // Store original LUCK value for standalone LUCK tests (to keep display stable)
    let originalLuckValue: number = 0;
    
    async function rollDice() {
        // Don't allow rolling while already rolling
        if (isRolling) return;
        
        isRolling = true;
        
        // Clear any previous animation
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
        
        // If this is the first skill roll (not a LUCK test, and haven't done original roll yet), store original values
        if (!isLuckTest && !hasDoneOriginalRoll) {
            originalRollValues = {
                targetNumber: localTargetNumber,
                modifier: localModifier
            };
            hasDoneOriginalRoll = true;
        }
        
        // Generate final values (but don't show them yet)
        const finalDie1 = Math.floor(Math.random() * 6) + 1;
        const finalDie2 = Math.floor(Math.random() * 6) + 1;
        const diceTotal = finalDie1 + finalDie2;
        const finalResult = diceTotal + localModifier;
        const finalSuccess = finalResult >= localTargetNumber;
        
        // Reset display values
        rollResult = null;
        isSuccess = null;
        die1 = null;
        die2 = null;
        animationDie1 = Math.floor(Math.random() * 6) + 1;
        animationDie2 = Math.floor(Math.random() * 6) + 1;
        
        // Start playing sound and get its duration
        // The function now resolves immediately, so animation can start right away
        const soundDuration = await playDiceRollSound();
        
        // Start the animation immediately
        const startTime = Date.now();
        
        // Animation phases: fast -> medium -> slow
        // Adjust for shorter sound duration (~2 seconds)
        let currentSpeed = 20; // Start very fast (20ms between changes)
        const minSpeed = 300; // End slow (300ms between changes)
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / soundDuration);
            
            // Randomize dice during animation
            animationDie1 = Math.floor(Math.random() * 6) + 1;
            animationDie2 = Math.floor(Math.random() * 6) + 1;
            
            // Gradually slow down based on progress
            // Use exponential easing for smoother slowdown - faster slowdown for shorter duration
            const speedProgress = progress * progress; // Quadratic easing
            currentSpeed = 20 + (minSpeed - 20) * speedProgress;
            
            // Check if animation should stop
            if (progress >= 1.0 || elapsed >= soundDuration) {
                // Animation complete - set final values
                die1 = finalDie1;
                die2 = finalDie2;
                rollResult = finalResult;
                isSuccess = finalSuccess;
                isRolling = false;
                
                if (animationInterval) {
                    clearInterval(animationInterval);
                    animationInterval = null;
                }
                
                // Play success or failure sound based on result
                if (finalSuccess) {
                    playSuccessSound();
                } else {
                    playFailureSound();
                }
                
                // Log the roll
                const playerName = get(currentPlayerName) || 'Unknown Player';
                const playerId = get(currentPlayerId) || 'unknown';
                
                // If this is a LUCK test, log it as such
                const logSkillName = isStandaloneLuckTest ? 'LUCK Test' : (isLuckTest ? `LUCK Test (for ${skillName} reroll)` : skillName);
                const logRanks = (isLuckTest || isStandaloneLuckTest) ? 0 : ranks;
                // Use original LUCK value for logging if this was a standalone LUCK test
                const luckUsedForTest = (isStandaloneLuckTest && originalLuckValue > 0) ? originalLuckValue : currentLuck;
                const logBaseSkill = (isLuckTest || isStandaloneLuckTest) ? luckUsedForTest : baseSkill;
                const logBaseStatType = (isLuckTest || isStandaloneLuckTest) ? 'SKILL' as const : baseStatType;
                
                diceRolls.addRoll({
                    playerName,
                    playerId,
                    skillName: logSkillName,
                    ranks: logRanks,
                    baseSkill: logBaseSkill,
                    baseStatType: logBaseStatType,
                    die1: finalDie1,
                    die2: finalDie2,
                    modifier: localModifier,
                    targetNumber: localTargetNumber,
                    total: finalResult,
                    isSuccess: finalSuccess
                });
                
                // If this is a standalone LUCK test (from characteristics table), decrease LUCK after completion
                if (isStandaloneLuckTest) {
                    // Use original LUCK value if available, otherwise current LUCK
                    const luckUsedForTest = originalLuckValue > 0 ? originalLuckValue : currentLuck;
                    onLuckDecrease();
                    // Note: originalLuckValue stays stable, so display remains correct
                }
                
                // After LUCK test completes (reroll context), show result and wait for user to click "Return to Skill Test"
                // Don't auto-reset - let the result linger until user clicks the button
            } else {
                // Continue animation
                animationInterval = setTimeout(animate, Math.max(20, Math.floor(currentSpeed)));
            }
        };
        
        // Start animation immediately
        animate();
    }
    
    // Initialize standalone LUCK test on mount - store original LUCK value once
    onMount(() => {
        if (isStandaloneLuckTest) {
            // Store original LUCK value to keep display stable throughout the test (only set once)
            if (originalLuckValue === 0) {
                originalLuckValue = currentLuck;
                // Set up for standalone LUCK test: target 15, modifier = original LUCK value
                localTargetNumber = 15;
                localModifier = originalLuckValue;
            }
        }
    });
    
    // Reactive statement to capture original LUCK value once when modal opens for standalone LUCK test
    // Only runs if originalLuckValue hasn't been set yet (guards against modal opening before onMount)
    $: if (isStandaloneLuckTest && showModal && originalLuckValue === 0 && currentLuck > 0) {
        originalLuckValue = currentLuck;
        localTargetNumber = 15;
        localModifier = originalLuckValue;
    }
    
    function closeModal() {
        // Stop any ongoing animation
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
        isRolling = false;
        showModal = false;
        // Reset LUCK test state
        if (!isStandaloneLuckTest) {
            isLuckTest = false;
            hasDoneOriginalRoll = false;
            hasUsedLuckTest = false;
            originalRollValues = null;
        } else {
            // Reset original LUCK value for next standalone LUCK test
            originalLuckValue = 0;
        }
        dispatch('close');
    }
    
    function handleRoll() {
        // If LUCK test succeeded, button says "Return to Skill Test" - reset for reroll
        if (isLuckTest && isSuccess === true && originalRollValues) {
            resetForReroll();
            return;
        }
        
        // If we're in a failure state and button says "Test your LUCK to Reroll", do LUCK test
        if (rollResult !== null && isSuccess === false && !isRolling && !isLuckTest) {
            testLuck();
        } else {
            rollDice();
        }
    }
    
    async function testLuck() {
        // LUCK test: roll 2d6 + LUCK vs target 15
        // After test (success or fail), decrease LUCK by 1
        if (isRolling) return;
        
        // Store original values if not already stored (should already be stored from first roll)
        if (!originalRollValues) {
            originalRollValues = {
                targetNumber: localTargetNumber,
                modifier: localModifier
            };
        }
        
        // Set up for LUCK test
        isLuckTest = true;
        const originalTarget = localTargetNumber;
        const originalModifier = localModifier;
        
        localTargetNumber = 15; // Fixed target for LUCK test
        localModifier = currentLuck; // LUCK test: 2d6 + LUCK
        
        // Perform the LUCK test roll
        await rollDice();
        
        // After LUCK test completes, decrease LUCK regardless of result
        onLuckDecrease();
        
        // If LUCK test succeeded, allow reroll of original skill test
        // If failed, keep showing failure (don't restore original values)
    }
    
    // Reset state when rerolling after successful LUCK test
    function resetForReroll() {
        if (isLuckTest && isSuccess === true && originalRollValues) {
            // Successful LUCK test - reset to reroll original skill test
            isLuckTest = false;
            hasUsedLuckTest = true; // Mark LUCK test as used (one-time only)
            localTargetNumber = originalRollValues.targetNumber;
            localModifier = originalRollValues.modifier;
            rollResult = null;
            isSuccess = null;
            die1 = null;
            die2 = null;
            // Keep originalRollValues so we don't overwrite them on reroll
            // Reset hasDoneOriginalRoll so we treat the reroll as a new skill test
            hasDoneOriginalRoll = false;
            // Allow user to click "Roll 2d6" again for original skill test
            // Close button will be disabled in this state
        }
    }
    
    function handleTargetChange(event: Event) {
        const target = (event.target as HTMLInputElement).value;
        localTargetNumber = parseInt(target) || 15;
    }
    
    function handleModifierChange(event: Event) {
        const mod = (event.target as HTMLInputElement).value;
        localModifier = parseInt(mod) || 0;
    }

    // Get which pips should be visible for a dice value (1-6)
    // Using a 3x3 grid: positions 0-8 (top-left to bottom-right)
    // Grid layout: 0 1 2
    //              3 4 5
    //              6 7 8
    function getPipVisible(value: number | null, pipIndex: number): boolean {
        if (!value || value < 1 || value > 6) return false;
        
        // Standard dice pip patterns
        const patterns: Record<number, number[]> = {
            1: [4], // Center only
            2: [0, 8], // Diagonal: top-left, bottom-right
            3: [0, 4, 8], // Diagonal: top-left, center, bottom-right
            4: [0, 2, 6, 8], // Four corners
            5: [0, 2, 4, 6, 8], // Four corners + center
            6: [0, 3, 6, 2, 5, 8] // Two vertical columns: left (0,3,6) and right (2,5,8)
        };
        
        return patterns[value]?.includes(pipIndex) ?? false;
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
            {#if isStandaloneLuckTest}
                <div class="skill-total-info">
                    <strong>LUCK Test:</strong> Roll 2d6 + {originalLuckValue > 0 ? originalLuckValue : currentLuck} (Current LUCK) vs Target 15
                    <br>
                    <small>You will lose 1 LUCK after this test, regardless of success or failure.</small>
                </div>
            {:else}
                <div class="skill-total-info">
                    <strong>Skill Total:</strong> {skillTotal} (Ranks: {ranks} + {baseStatType}: {baseSkill})
                </div>
            {/if}
            
            <div class="input-group">
                <label for="target-number">Target Number</label>
                <input 
                    id="target-number"
                    type="number" 
                    value={localTargetNumber} 
                    on:input={handleTargetChange}
                    min="1"
                    max="99"
                    disabled={isRolling || (rollResult !== null && isSuccess !== null) || isStandaloneLuckTest}
                />
                <div class="help-text">
                    {#if isStandaloneLuckTest}
                        LUCK tests always use a target number of <strong>15</strong>.
                    {:else}
                        The Director will give you this number. It is often <strong>15</strong> for a standard special skill test.
                    {/if}
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
                    disabled={isRolling || (rollResult !== null && isSuccess !== null) || isStandaloneLuckTest}
                />
                <div class="help-text">
                    {#if isStandaloneLuckTest}
                        LUCK tests use your current LUCK value as the modifier ({originalLuckValue > 0 ? originalLuckValue : currentLuck}).
                    {:else}
                        Any bonuses or penalties to your roll (calculated by the player).
                    {/if}
                </div>
            </div>
            
            {#if isRolling || rollResult !== null}
            <div class="roll-result" class:success={isSuccess} class:failure={!isSuccess && !isRolling} class:rolling={isRolling}>
                <div class="dice-rolls">
                    <div class="die-face" data-value={isRolling ? animationDie1 : (die1 ?? 1)}>
                        <div class="dice-container">
                            {#each Array(9) as _, i}
                                <div class="pip" class:visible={getPipVisible(isRolling ? animationDie1 : (die1 ?? 1), i)}></div>
                            {/each}
                        </div>
                        <span class="die-label">{isRolling ? animationDie1 : (die1 ?? 1)}</span>
                    </div>
                    <div class="die-face" data-value={isRolling ? animationDie2 : (die2 ?? 1)}>
                        <div class="dice-container">
                            {#each Array(9) as _, i}
                                <div class="pip" class:visible={getPipVisible(isRolling ? animationDie2 : (die2 ?? 1), i)}></div>
                            {/each}
                        </div>
                        <span class="die-label">{isRolling ? animationDie2 : (die2 ?? 1)}</span>
                    </div>
                    {#if !isRolling && die1 !== null && die2 !== null}
                        <span class="dice-total">= {die1 + die2}</span>
                        {#if localModifier !== 0}
                        <span class="modifier">{localModifier > 0 ? '+' : ''}{localModifier}</span>
                        {/if}
                    {/if}
                </div>
                {#if !isRolling && rollResult !== null}
                <div class="final-result">
                    <strong>Total: {rollResult}</strong> vs Target: {localTargetNumber}
                </div>
                <div class="outcome">
                    {#if isSuccess}
                        {#if isStandaloneLuckTest}
                            <span class="success-text">✓ LUCK TEST SUCCESSFUL</span>
                            <div class="luck-loss-message">
                                You lose 1 LUCK regardless of whether the test succeeds or fails. New LUCK total: <strong>{Math.max(0, (originalLuckValue > 0 ? originalLuckValue : currentLuck) - 1)}</strong>
                            </div>
                        {:else}
                            <span class="success-text">✓ SUCCESS</span>
                        {/if}
                    {:else}
                        {#if isStandaloneLuckTest}
                            <span class="failure-text">✗ LUCK TEST FAILED</span>
                            <div class="luck-loss-message">
                                You lose 1 LUCK regardless of whether the test succeeds or fails. New LUCK total: <strong>{Math.max(0, (originalLuckValue > 0 ? originalLuckValue : currentLuck) - 1)}</strong>
                            </div>
                        {:else}
                            <span class="failure-text">✗ FAILURE</span>
                        {/if}
                    {/if}
                </div>
                {/if}
            </div>
            {/if}
            
            <div class="button-group">
                <button 
                    class="roll-button" 
                    on:click={handleRoll} 
                    disabled={isRolling || (rollResult !== null && isSuccess === true && !isLuckTest) || (isStandaloneLuckTest && rollResult !== null) || (isLuckTest && isSuccess === false && !isStandaloneLuckTest) || (rollResult !== null && isSuccess === false && !isLuckTest && hasUsedLuckTest)}>
                    {#if isRolling}
                        {isLuckTest ? 'Testing LUCK...' : 'Rolling...'}
                    {:else if rollResult !== null && isSuccess === false && !isLuckTest && !hasUsedLuckTest && !isStandaloneLuckTest}
                        Test your LUCK to Reroll
                    {:else if rollResult !== null && isSuccess === false && !isLuckTest && hasUsedLuckTest}
                        LUCK Test Already Used
                    {:else if isLuckTest && isSuccess === true && !isStandaloneLuckTest}
                        Return to Skill Test
                    {:else if isLuckTest && isSuccess === false && !isStandaloneLuckTest}
                        LUCK Test Failed
                    {:else if isStandaloneLuckTest && rollResult !== null}
                        {isSuccess ? 'LUCK Test Successful' : 'LUCK Test Failed'}
                    {:else}
                        Roll 2d6
                    {/if}
                </button>
                <button 
                    class="close-button-secondary" 
                    on:click={closeModal} 
                    disabled={isRolling || (hasUsedLuckTest && rollResult === null && !isLuckTest && !isStandaloneLuckTest)}>
                    Close
                </button>
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
            transition: all 0.2s ease;
            
            &:focus:not(:disabled) {
                outline: none;
                border-color: rgb(var(--accent));
                background: rgba(var(--accent), 0.15);
            }
            
            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                background: rgba(var(--accent), 0.05);
                border-color: rgba(var(--accent), 0.3);
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
        transition: all 0.3s ease;
        
        &.rolling {
            background: rgba(var(--accent), 0.1);
            border-color: rgba(var(--accent), 0.5);
        }
        
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
        gap: 0.75rem;
        margin-bottom: 0.75rem;
        flex-wrap: wrap;
        
        .die-face {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
        }
        
        .dice-container {
            width: 3rem;
            height: 3rem;
            background: rgb(var(--secondary));
            border: 2px solid rgb(var(--primary));
            border-radius: 0.5rem;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, 1fr);
            gap: 0.15rem;
            padding: 0.25rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            position: relative;
        }
        
        .pip {
            border-radius: 50%;
            background: rgb(var(--primary));
            width: 0.45rem;
            height: 0.45rem;
            min-width: 0.4rem;
            min-height: 0.4rem;
            opacity: 0;
            transition: opacity 0.2s ease;
            justify-self: center;
            align-self: center;
            
            &.visible {
                opacity: 1;
            }
        }
        
        .die-label {
            font-size: 0.85rem;
            font-weight: 600;
            color: rgb(var(--accent));
            text-align: center;
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
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        
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
        
        .luck-loss-message {
            margin-top: 0.5rem;
            padding: 0.5rem 0.75rem;
            background: rgba(var(--accent), 0.1);
            border: 1px solid rgba(var(--accent), 0.3);
            border-radius: 0.25rem;
            color: rgb(var(--primary));
            font-size: 0.9rem;
            text-align: center;
            line-height: 1.4;
            
            strong {
                color: rgb(var(--accent));
                font-weight: 700;
            }
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
            
            &:hover:not(:disabled) {
                background: rgba(var(--accent), 0.8);
                transform: scale(1.05);
            }
            
            &:active:not(:disabled) {
                transform: scale(0.95);
            }
            
            &:disabled {
                opacity: 0.6;
                cursor: not-allowed;
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
