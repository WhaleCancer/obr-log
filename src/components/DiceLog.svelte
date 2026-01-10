<script lang="ts">
    import { onMount } from 'svelte';
    import { diceRolls } from '../stores/diceRolls';
    import type { DiceRollLogEntry } from '../stores/diceRolls';

    let logContainer: HTMLDivElement;
    let autoScroll = true;

    onMount(() => {
        diceRolls.initialize();
        
        // Auto-scroll to bottom when new entries are added
        diceRolls.subscribe((rolls) => {
            if (autoScroll && logContainer) {
                setTimeout(() => {
                    logContainer.scrollTop = logContainer.scrollHeight;
                }, 100);
            }
        });
    });

    function handleClearLog() {
        if (confirm("Are you sure you want to clear all dice roll logs? This action cannot be undone.")) {
            diceRolls.clearRolls();
        }
    }

    function formatTimestamp(timestamp: string): string {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false 
        });
    }

    function formatDate(timestamp: string): string {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }

    function toggleAutoScroll() {
        autoScroll = !autoScroll;
        if (autoScroll && logContainer) {
            logContainer.scrollTop = logContainer.scrollHeight;
        }
    }

    function scrollToBottom() {
        if (logContainer) {
            logContainer.scrollTop = logContainer.scrollHeight;
        }
    }
</script>

<div class="dice-log-container">
    <div class="dice-log-header">
        <h2>Dice Roll Log</h2>
        <div class="header-actions">
            <button 
                class="action-button" 
                on:click={toggleAutoScroll}
                title={autoScroll ? "Disable auto-scroll" : "Enable auto-scroll"}
            >
                {autoScroll ? '🔒' : '🔓'}
            </button>
            <button 
                class="action-button" 
                on:click={scrollToBottom}
                title="Scroll to bottom"
            >
                ⬇️
            </button>
            <button 
                class="action-button clear-button" 
                on:click={handleClearLog}
                title="Clear all logs"
            >
                🗑️ Clear
            </button>
        </div>
    </div>

    <div class="dice-log-content" bind:this={logContainer}>
        {#if $diceRolls.length === 0}
            <div class="empty-log">
                <p>No dice rolls logged yet.</p>
                <p class="hint">Roll dice from any special skill to see results here.</p>
            </div>
        {:else}
            <div class="log-entries">
                {#each $diceRolls as entry (entry.id)}
                    <div class="log-entry" class:success={entry.isSuccess} class:failure={!entry.isSuccess}>
                        <div class="entry-header">
                            <div class="entry-player">
                                <strong>{entry.playerName}</strong>
                            </div>
                            <div class="entry-time">
                                <span class="date">{formatDate(entry.timestamp)}</span>
                                <span class="time">{formatTimestamp(entry.timestamp)}</span>
                            </div>
                        </div>
                        
                        <div class="entry-skill">
                            <strong>{entry.skillName}</strong>
                        </div>
                        
                        <div class="entry-roll">
                            <div class="dice-values">
                                <span class="die">Die 1: {entry.die1}</span>
                                <span class="die">Die 2: {entry.die2}</span>
                                <span class="equals">=</span>
                                <span class="dice-total">{entry.die1 + entry.die2}</span>
                                {#if entry.modifier !== 0}
                                    <span class="modifier">{entry.modifier > 0 ? '+' : ''}{entry.modifier}</span>
                                {/if}
                            </div>
                            <div class="roll-result">
                                <span class="total">Total: <strong>{entry.total}</strong></span>
                                <span class="vs">vs</span>
                                <span class="target">Target: <strong>{entry.targetNumber}</strong></span>
                            </div>
                            <div class="entry-outcome">
                                {#if entry.isSuccess}
                                    <span class="success-badge">✓ SUCCESS</span>
                                {:else}
                                    <span class="failure-badge">✗ FAILURE</span>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style lang="scss">
    .dice-log-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: rgb(var(--secondary));
        overflow: hidden;
    }

    .dice-log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 2px solid rgba(var(--accent), 0.3);
        background: rgba(var(--accent), 0.1);
        flex-shrink: 0;

        h2 {
            margin: 0;
            color: rgb(var(--accent));
            font-size: 1.25rem;
            font-weight: 600;
        }

        .header-actions {
            display: flex;
            gap: 0.5rem;
        }

        .action-button {
            padding: 0.5rem 0.75rem;
            border: 1px solid rgba(var(--accent), 0.5);
            border-radius: 0.25rem;
            background: rgba(var(--accent), 0.1);
            color: rgb(var(--accent));
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;

            &:hover {
                background: rgba(var(--accent), 0.2);
                border-color: rgb(var(--accent));
            }

            &:active {
                transform: scale(0.95);
            }

            &.clear-button {
                color: rgb(200, 100, 100);
                border-color: rgba(200, 100, 100, 0.5);
                background: rgba(200, 100, 100, 0.1);

                &:hover {
                    background: rgba(200, 100, 100, 0.2);
                    border-color: rgb(200, 100, 100);
                }
            }
        }
    }

    .dice-log-content {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;

        &::-webkit-scrollbar {
            width: 8px;
        }

        &::-webkit-scrollbar-track {
            background: rgba(var(--primary), 0.1);
        }

        &::-webkit-scrollbar-thumb {
            background: rgba(var(--accent), 0.5);
            border-radius: 4px;

            &:hover {
                background: rgba(var(--accent), 0.7);
            }
        }
    }

    .empty-log {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: rgba(var(--primary), 0.6);
        text-align: center;
        padding: 2rem;

        p {
            margin: 0.5rem 0;
            font-size: 1rem;
        }

        .hint {
            font-size: 0.85rem;
            font-style: italic;
            color: rgba(var(--primary), 0.5);
        }
    }

    .log-entries {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .log-entry {
        padding: 1rem;
        border-radius: 0.5rem;
        border: 2px solid;
        background: rgba(var(--primary), 0.05);
        transition: all 0.2s ease;

        &.success {
            border-color: rgba(100, 200, 100, 0.5);
            background: rgba(100, 200, 100, 0.1);

            &:hover {
                border-color: rgba(100, 200, 100, 0.8);
                background: rgba(100, 200, 100, 0.15);
            }
        }

        &.failure {
            border-color: rgba(200, 100, 100, 0.5);
            background: rgba(200, 100, 100, 0.1);

            &:hover {
                border-color: rgba(200, 100, 100, 0.8);
                background: rgba(200, 100, 100, 0.15);
            }
        }
    }

    .entry-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgba(var(--primary), 0.2);
    }

    .entry-player {
        color: rgb(var(--accent));
        font-size: 0.95rem;
    }

    .entry-time {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        font-size: 0.8rem;
        color: rgba(var(--primary), 0.6);

        .date {
            font-weight: 500;
        }

        .time {
            font-size: 0.75rem;
            opacity: 0.8;
        }
    }

    .entry-skill {
        margin-bottom: 0.75rem;
        color: rgb(var(--primary));
        font-size: 1rem;

        strong {
            color: rgb(var(--accent));
        }
    }

    .entry-roll {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .dice-values {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        font-size: 0.9rem;

        .die {
            padding: 0.25rem 0.5rem;
            background: rgba(var(--primary), 0.1);
            border-radius: 0.25rem;
            color: rgb(var(--primary));
            font-weight: 500;
        }

        .equals {
            color: rgba(var(--primary), 0.6);
            font-weight: 600;
        }

        .dice-total {
            padding: 0.25rem 0.5rem;
            background: rgba(var(--accent), 0.2);
            border-radius: 0.25rem;
            color: rgb(var(--accent));
            font-weight: 700;
            font-size: 1rem;
        }

        .modifier {
            padding: 0.25rem 0.5rem;
            background: rgba(var(--accent), 0.15);
            border-radius: 0.25rem;
            color: rgb(var(--accent));
            font-weight: 600;
        }
    }

    .roll-result {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: rgb(var(--primary));

        .total, .target {
            strong {
                color: rgb(var(--accent));
                font-size: 1.1rem;
            }
        }

        .vs {
            color: rgba(var(--primary), 0.5);
            font-style: italic;
        }
    }

    .entry-outcome {
        margin-top: 0.5rem;
        display: flex;
        justify-content: center;

        .success-badge {
            padding: 0.5rem 1rem;
            background: rgba(100, 200, 100, 0.2);
            border: 2px solid rgba(100, 200, 100, 0.8);
            border-radius: 0.5rem;
            color: rgb(100, 200, 100);
            font-weight: 700;
            font-size: 1rem;
            text-shadow: 0 0 10px rgba(100, 200, 100, 0.5);
        }

        .failure-badge {
            padding: 0.5rem 1rem;
            background: rgba(200, 100, 100, 0.2);
            border: 2px solid rgba(200, 100, 100, 0.8);
            border-radius: 0.5rem;
            color: rgb(200, 100, 100);
            font-weight: 700;
            font-size: 1rem;
            text-shadow: 0 0 10px rgba(200, 100, 100, 0.5);
        }
    }
</style>
