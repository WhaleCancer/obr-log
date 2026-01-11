<script lang="ts">
    import { onMount } from 'svelte';
    import { saveAs } from 'file-saver';
    import { diceRolls } from '../stores/diceRolls';
    import type { LogEntry, DiceRollLogEntry, ChatMessage } from '../stores/diceRolls';
    import { isDiceRoll, isChatMessage } from '../stores/diceRolls';
    import { get } from 'svelte/store';

    let logContainer: HTMLDivElement;
    let autoScroll = true;
    let chatInput: HTMLInputElement;
    let chatMessage = "";
    let tooltipElement: string | null = null;
    let tooltipPosition = { x: 0, y: 0 };
    let previousLogLength = 0;
    
    function showTooltip(event: MouseEvent, text: string) {
        tooltipElement = text;
        tooltipPosition = { x: event.clientX, y: event.clientY };
    }
    
    function hideTooltip() {
        tooltipElement = null;
    }

    onMount(() => {
        diceRolls.initialize();
        previousLogLength = $diceRolls.length;
    });
    
    // Reactive statement to auto-scroll only when new entries are added (length increases)
    $: {
        const currentLength = $diceRolls.length;
        // Only autoscroll if: autoscroll is enabled, container exists, and length increased (new entry added)
        if (autoScroll && logContainer && currentLength > previousLogLength) {
            setTimeout(() => {
                if (logContainer) {
                    logContainer.scrollTop = logContainer.scrollHeight;
                }
            }, 50);
        }
        // Update previous length for next comparison
        previousLogLength = currentLength;
    }

    function handleClearLog() {
        if (confirm("Are you sure you want to clear all logs? This action cannot be undone.")) {
            diceRolls.clearLog();
        }
    }

    function handleDeleteEntry(event: Event, entryId: string, entryType: 'dice roll' | 'message') {
        event.stopPropagation();
        if (confirm(`Are you sure you want to delete this ${entryType}? This action cannot be undone.`)) {
            diceRolls.removeEntry(entryId);
        }
    }

    function exportLog() {
        const logData = get(diceRolls);
        const json = JSON.stringify(logData, null, 2);
        const filename = `Star-Trek-Log-${new Date().toISOString().split('T')[0]}.json`;
        const blob = new Blob([json], { type: "application/json" });
        saveAs(blob, filename);
    }

    function importLog() {
        // Create a temporary file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.style.display = 'none';
        input.onchange = (event: Event) => {
            handleLogImport(event);
            document.body.removeChild(input);
        };
        document.body.appendChild(input);
        input.click();
    }

    function handleSendChat() {
        if (chatMessage.trim()) {
            diceRolls.addChatMessage(chatMessage.trim());
            chatMessage = "";
            if (chatInput) {
                chatInput.focus();
            }
        }
    }

    function handleChatKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendChat();
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

    function handleLogImport(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const imported = JSON.parse(e.target?.result as string);
                if (Array.isArray(imported)) {
                    if (confirm("This will replace the current log. Do you want to continue?")) {
                        diceRolls.set(imported);
                    }
                } else {
                    alert('Invalid log file format. Expected an array of log entries.');
                }
            } catch (error) {
                alert('Failed to import log file. Please check the file format.');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
        
        // Reset the input so the same file can be imported again
        (event.target as HTMLInputElement).value = '';
    }
</script>

<div class="dice-log-container">
    <div class="dice-log-header">
        <h2>Log</h2>
        <div class="header-actions">
            <button 
                class="action-button" 
                on:click={exportLog}
                title="Save log to JSON file"
            >
                💾 Save
            </button>
            <button 
                class="action-button" 
                on:click={importLog}
                title="Load log from JSON file"
            >
                📂 Load
            </button>
            <button 
                class="action-button" 
                on:click={toggleAutoScroll}
                title={autoScroll ? "Disable auto-scroll" : "Enable auto-scroll"}
            >
                {autoScroll ? '🔒' : '🔓'}
            </button>
            <button 
                class="action-button" 
                on:click={() => { if (logContainer) logContainer.scrollTop = logContainer.scrollHeight; }}
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

    <!-- Log entries in scrollable iframe-like container -->
    <div class="log-iframe-container">
        <div class="log-content" bind:this={logContainer}>
            {#if $diceRolls.length === 0}
                <div class="empty-log">
                    <p>No entries yet.</p>
                    <p class="hint">Roll dice from any special skill or send a message below.</p>
                </div>
            {:else}
                <div class="log-entries">
                    {#each $diceRolls as entry (entry.id)}
                        {#if isDiceRoll(entry)}
                            <div class="log-entry dice-roll-entry" class:success={entry.isSuccess} class:failure={!entry.isSuccess}>
                                <div class="entry-header">
                                    <div class="entry-player">
                                        <strong>{entry.playerName}</strong>
                                        <span class="entry-skill-inline">• {entry.skillName}</span>
                                    </div>
                                    <div class="entry-header-right">
                                        <div class="entry-time">
                                            <span class="time-compact">{formatTimestamp(entry.timestamp)}</span>
                                        </div>
                                        <button 
                                            class="delete-button" 
                                            on:click={(e) => handleDeleteEntry(e, entry.id, 'dice roll')}
                                            title="Delete this dice roll"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="entry-roll-compact">
                                    <div class="dice-values-compact">
                                        <span 
                                            class="base-skill-compact tooltip-trigger"
                                            on:mouseenter={(e) => showTooltip(e, `Base ${entry.baseStatType ?? 'SKILL'} value used for this skill - from your Characteristics`)}
                                            on:mouseleave={hideTooltip}
                                            on:mousemove={(e) => tooltipPosition = { x: e.clientX, y: e.clientY }}>
                                            {entry.baseSkill ?? 0}
                                        </span>
                                        <span class="plus-sign">+</span>
                                        <span 
                                            class="ranks-compact tooltip-trigger"
                                            on:mouseenter={(e) => showTooltip(e, "Ranks in this skill - points invested in this skill")}
                                            on:mouseleave={hideTooltip}
                                            on:mousemove={(e) => tooltipPosition = { x: e.clientX, y: e.clientY }}>
                                            {entry.ranks ?? 0}
                                        </span>
                                        <span class="plus-sign">+</span>
                                        <span 
                                            class="die-compact tooltip-trigger"
                                            on:mouseenter={(e) => showTooltip(e, "First die roll (1d6)")}
                                            on:mouseleave={hideTooltip}
                                            on:mousemove={(e) => tooltipPosition = { x: e.clientX, y: e.clientY }}>
                                            {entry.die1}
                                        </span>
                                        <span class="plus-sign">+</span>
                                        <span 
                                            class="die-compact tooltip-trigger"
                                            on:mouseenter={(e) => showTooltip(e, "Second die roll (1d6)")}
                                            on:mouseleave={hideTooltip}
                                            on:mousemove={(e) => tooltipPosition = { x: e.clientX, y: e.clientY }}>
                                            {entry.die2}
                                        </span>
                                        {#if entry.modifier < 0}
                                            <span class="minus-sign">-</span>
                                        {:else}
                                            <span class="plus-sign">+</span>
                                        {/if}
                                        <span 
                                            class="modifier-compact tooltip-trigger {entry.modifier === 0 ? 'modifier-zero' : entry.modifier > 0 ? 'modifier-positive' : 'modifier-negative'}"
                                            on:mouseenter={(e) => showTooltip(e, entry.modifier === 0 ? "Modifier: no bonuses or penalties applied" : (entry.modifier > 0 ? `Modifier: +${entry.modifier} bonus from equipment, circumstances, or other effects` : `Modifier: ${entry.modifier} penalty from equipment, circumstances, or other effects`))}
                                            on:mouseleave={hideTooltip}
                                            on:mousemove={(e) => tooltipPosition = { x: e.clientX, y: e.clientY }}>
                                            {Math.abs(entry.modifier)}
                                        </span>
                                        <span class="equals-compact">=</span>
                                        <span 
                                            class="dice-total-compact tooltip-trigger"
                                            on:mouseenter={(e) => showTooltip(e, `Roll Total: ${entry.baseSkill ?? 0} (Base ${entry.baseStatType ?? 'SKILL'}) + ${entry.ranks ?? 0} (Ranks) + ${entry.die1} (Die 1) + ${entry.die2} (Die 2) + ${entry.modifier} (Modifier) = ${entry.total}`)}
                                            on:mouseleave={hideTooltip}
                                            on:mousemove={(e) => tooltipPosition = { x: e.clientX, y: e.clientY }}>
                                            {entry.total}
                                        </span>
                                        <span class="vs-compact">vs</span>
                                        <span 
                                            class="target-compact tooltip-trigger"
                                            on:mouseenter={(e) => showTooltip(e, `Target Number: The difficulty of the test set by the Director`)}
                                            on:mouseleave={hideTooltip}
                                            on:mousemove={(e) => tooltipPosition = { x: e.clientX, y: e.clientY }}>
                                            {entry.targetNumber}
                                        </span>
                                    </div>
                                    <div class="entry-outcome-compact">
                                        {#if entry.isSuccess}
                                            <span 
                                                class="success-badge-compact tooltip-trigger"
                                                on:mouseenter={(e) => showTooltip(e, "Success: Total met or exceeded the target number")}
                                                on:mouseleave={hideTooltip}
                                                on:mousemove={(e) => tooltipPosition = { x: e.clientX, y: e.clientY }}>
                                                ✓
                                            </span>
                                        {:else}
                                            <span 
                                                class="failure-badge-compact tooltip-trigger"
                                                on:mouseenter={(e) => showTooltip(e, "Failure: Total was less than the target number")}
                                                on:mouseleave={hideTooltip}
                                                on:mousemove={(e) => tooltipPosition = { x: e.clientX, y: e.clientY }}>
                                                ✗
                                            </span>
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        {:else if isChatMessage(entry)}
                            <div class="log-entry chat-entry">
                                <div class="entry-header">
                                    <div class="entry-player">
                                        <strong>{entry.playerName}</strong>
                                    </div>
                                    <div class="entry-header-right">
                                        <div class="entry-time">
                                            <span class="date">{formatDate(entry.timestamp)}</span>
                                            <span class="time">{formatTimestamp(entry.timestamp)}</span>
                                        </div>
                                        <button 
                                            class="delete-button" 
                                        on:click={(e) => handleDeleteEntry(e, entry.id, 'message')}
                                        title="Delete this message"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                
                                <div 
                                    class="chat-message"
                                    class:characteristic-change={entry.isCharacteristicChange}
                                    class:increase={entry.isCharacteristicChange && entry.changeDirection === 'increase'}
                                    class:decrease={entry.isCharacteristicChange && entry.changeDirection === 'decrease'}
                                >
                                    {entry.message}
                                </div>
                            </div>
                        {/if}
                    {/each}
                </div>
            {/if}
        </div>
    </div>

    <!-- Chat input below the log -->
    <div class="chat-input-container">
        <input 
            type="text"
            bind:this={chatInput}
            bind:value={chatMessage}
            on:keydown={handleChatKeydown}
            placeholder="Type a message and press Enter..."
            class="chat-input"
        />
        <button 
            class="chat-send-button" 
            on:click={handleSendChat}
            disabled={!chatMessage.trim()}
            title="Send message (Enter)"
        >
            Send
        </button>
    </div>
</div>

<!-- Tooltip for roll components -->
{#if tooltipElement}
    <div class="roll-tooltip" style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px">
        {tooltipElement}
    </div>
{/if}

<style lang="scss">
    .dice-log-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        background: rgb(var(--secondary));
        overflow: hidden;
        box-sizing: border-box;
    }

    .dice-log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        border-bottom: 2px solid rgba(var(--accent), 0.3);
        background: rgba(var(--accent), 0.1);
        flex-shrink: 0;

        h2 {
            margin: 0;
            color: rgb(var(--accent));
            font-size: 1.1rem;
            font-weight: 600;
        }

        .header-actions {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .action-button {
            padding: 0.4rem 0.6rem;
            border: 1px solid rgba(var(--accent), 0.5);
            border-radius: 0.25rem;
            background: rgba(var(--accent), 0.1);
            color: rgb(var(--accent));
            font-size: 0.85rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;

            &:hover:not(:disabled) {
                background: rgba(var(--accent), 0.2);
                border-color: rgb(var(--accent));
            }

            &:active:not(:disabled) {
                transform: scale(0.95);
            }

            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
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

    .log-iframe-container {
        height: 500px;
        width: 100%;
        border: 2px solid rgba(var(--accent), 0.3);
        border-radius: 0.25rem;
        background: rgb(var(--secondary));
        overflow: hidden;
        margin: 0.5rem 0;
        flex-shrink: 0;
        box-sizing: border-box;
        position: relative;
    }

    .log-content {
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 0.5rem 0.75rem;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;

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
        min-height: 200px;
        color: rgba(var(--primary), 0.6);
        text-align: center;
        padding: 2rem;

        p {
            margin: 0.5rem 0;
            font-size: 0.9rem;
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
        gap: 0.4rem;
    }

    .log-entry {
        padding: 0.4rem 0.5rem;
        border-radius: 0.3rem;
        border: 1px solid;
        background: rgba(var(--primary), 0.05);
        transition: all 0.2s ease;

        &.dice-roll-entry {
            &.success {
                border-color: rgba(100, 200, 100, 0.4);
                background: rgba(100, 200, 100, 0.08);

                &:hover {
                    border-color: rgba(100, 200, 100, 0.6);
                    background: rgba(100, 200, 100, 0.12);
                }
            }

            &.failure {
                border-color: rgba(200, 100, 100, 0.4);
                background: rgba(200, 100, 100, 0.08);

                &:hover {
                    border-color: rgba(200, 100, 100, 0.6);
                    background: rgba(200, 100, 100, 0.12);
                }
            }
        }

        &.chat-entry {
            border-color: rgba(var(--accent), 0.3);
            background: rgba(var(--accent), 0.05);
            padding: 0.5rem 0.6rem;

            &:hover {
                border-color: rgba(var(--accent), 0.5);
                background: rgba(var(--accent), 0.08);
            }
        }
    }

    .entry-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.3rem;
        padding-bottom: 0.25rem;
        border-bottom: 1px solid rgba(var(--primary), 0.15);
    }

    .entry-player {
        color: rgb(var(--accent));
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        gap: 0.3rem;
        flex: 1;
        
        .entry-skill-inline {
            color: rgba(var(--primary), 0.7);
            font-weight: 400;
            font-size: 0.75rem;
        }
    }

    .entry-header-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .entry-time {
        display: flex;
        align-items: center;
        font-size: 0.7rem;
        color: rgba(var(--primary), 0.5);

        .time-compact {
            opacity: 0.8;
        }

        .date {
            font-weight: 500;
            margin-right: 0.25rem;
        }

        .time {
            font-size: 0.7rem;
            opacity: 0.8;
        }
    }

    .delete-button {
        background: transparent;
        border: 1px solid rgba(200, 100, 100, 0.4);
        border-radius: 0.2rem;
        color: rgba(200, 100, 100, 0.8);
        font-size: 0.75rem;
        padding: 0.2rem 0.35rem;
        cursor: pointer;
        transition: all 0.2s ease;
        opacity: 0.7;
        flex-shrink: 0;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
            background: rgba(200, 100, 100, 0.15);
            border-color: rgba(200, 100, 100, 0.8);
            color: rgb(200, 100, 100);
            opacity: 1;
            transform: scale(1.1);
        }

        &:active {
            transform: scale(0.95);
        }
    }

    .entry-skill {
        margin-bottom: 0.5rem;
        color: rgb(var(--primary));
        font-size: 0.9rem;

        strong {
            color: rgb(var(--accent));
        }
    }

    .entry-roll {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    .entry-roll-compact {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
    }

    .dice-values {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        flex-wrap: wrap;
        font-size: 0.85rem;

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

    .dice-values-compact {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        flex-wrap: wrap;
        font-size: 0.7rem;
        flex: 1;

        .ranks-compact {
            padding: 0.15rem 0.35rem;
            background: rgba(var(--primary), 0.1);
            border-radius: 0.2rem;
            color: rgb(var(--primary));
            font-weight: 600;
            font-size: 0.75rem;
            cursor: help;
            white-space: nowrap;
        }

        .base-skill-compact {
            padding: 0.15rem 0.35rem;
            background: rgba(var(--primary), 0.1);
            border-radius: 0.2rem;
            color: rgb(var(--primary));
            font-weight: 600;
            font-size: 0.75rem;
            cursor: help;
            white-space: nowrap;
        }

        .plus-sign {
            color: rgba(var(--primary), 0.6);
            font-weight: 600;
            font-size: 0.75rem;
            margin: 0 0.1rem;
        }

        .minus-sign {
            color: rgba(180, 50, 50, 0.9);
            font-weight: 600;
            font-size: 0.75rem;
            margin: 0 0.1rem;
        }

        .separator-compact {
            color: rgba(var(--primary), 0.3);
            font-weight: 600;
            font-size: 0.7rem;
            margin: 0 0.1rem;
        }

        .die-compact {
            padding: 0.15rem 0.35rem;
            background: rgba(var(--primary), 0.1);
            border-radius: 0.2rem;
            color: rgb(var(--primary));
            font-weight: 600;
            font-size: 0.75rem;
            cursor: help;
        }

        .equals-compact {
            color: rgba(var(--primary), 0.6);
            font-weight: 600;
            font-size: 0.75rem;
        }

        .dice-total-compact {
            padding: 0.15rem 0.4rem;
            background: rgba(var(--accent), 0.2);
            border-radius: 0.2rem;
            color: rgb(var(--accent));
            font-weight: 700;
            font-size: 0.8rem;
            cursor: help;
        }

        .modifier-compact {
            padding: 0.15rem 0.35rem;
            border-radius: 0.2rem;
            font-weight: 600;
            font-size: 0.7rem;
            cursor: help;
            white-space: nowrap;
        }

        .modifier-zero {
            background: rgba(var(--primary), 0.1);
            color: rgba(var(--primary), 0.7);
        }

        .modifier-positive {
            background: rgba(100, 200, 100, 0.3);
            color: rgb(100, 200, 100);
        }

        .modifier-negative {
            background: rgba(180, 50, 50, 0.2);
            color: rgb(220, 60, 60);
            font-weight: 700;
        }

        .vs-compact {
            color: rgba(var(--primary), 0.5);
            font-style: italic;
            font-size: 0.65rem;
            margin: 0 0.15rem;
        }

        .target-compact {
            padding: 0.15rem 0.4rem;
            background: rgba(var(--accent), 0.15);
            border-radius: 0.2rem;
            color: rgb(var(--accent));
            font-weight: 600;
            font-size: 0.75rem;
            cursor: help;
        }

        .tooltip-trigger {
            transition: all 0.2s ease;

            &:hover {
                background: rgba(var(--accent), 0.2);
                transform: scale(1.05);
            }
        }
    }

    .roll-result {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.85rem;
        color: rgb(var(--primary));

        .total, .target {
            strong {
                color: rgb(var(--accent));
                font-size: 1rem;
            }
        }

        .vs {
            color: rgba(var(--primary), 0.5);
            font-style: italic;
        }
    }

    .entry-outcome {
        margin-top: 0.4rem;
        display: flex;
        justify-content: center;

        .success-badge {
            padding: 0.4rem 0.75rem;
            background: rgba(100, 200, 100, 0.2);
            border: 2px solid rgba(100, 200, 100, 0.8);
            border-radius: 0.4rem;
            color: rgb(100, 200, 100);
            font-weight: 700;
            font-size: 0.9rem;
            text-shadow: 0 0 10px rgba(100, 200, 100, 0.5);
        }

        .failure-badge {
            padding: 0.4rem 0.75rem;
            background: rgba(200, 100, 100, 0.2);
            border: 2px solid rgba(200, 100, 100, 0.8);
            border-radius: 0.4rem;
            color: rgb(200, 100, 100);
            font-weight: 700;
            font-size: 0.9rem;
            text-shadow: 0 0 10px rgba(200, 100, 100, 0.5);
        }
    }

    .entry-outcome-compact {
        display: flex;
        align-items: center;

        .success-badge-compact {
            padding: 0.2rem 0.4rem;
            background: rgba(100, 200, 100, 0.2);
            border: 1px solid rgba(100, 200, 100, 0.6);
            border-radius: 0.2rem;
            color: rgb(100, 200, 100);
            font-weight: 700;
            font-size: 0.75rem;
            line-height: 1;
        }

        .failure-badge-compact {
            padding: 0.2rem 0.4rem;
            background: rgba(200, 100, 100, 0.2);
            border: 1px solid rgba(200, 100, 100, 0.6);
            border-radius: 0.2rem;
            color: rgb(200, 100, 100);
            font-weight: 700;
            font-size: 0.75rem;
            line-height: 1;
        }
    }

    .chat-message {
        color: rgb(var(--primary));
        font-size: 0.9rem;
        line-height: 1.5;
        white-space: pre-wrap;
        word-wrap: break-word;

        &.characteristic-change {
            font-weight: 600;
            
            &.increase {
                color: rgb(100, 200, 100);
            }
            
            &.decrease {
                color: rgb(220, 60, 60);
            }
        }
    }

    .chat-input-container {
        display: flex;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border-top: 2px solid rgba(var(--accent), 0.3);
        background: rgba(var(--accent), 0.05);
        flex-shrink: 0;

        .chat-input {
            flex: 1;
            padding: 0.5rem 0.75rem;
            border: 1px solid rgba(var(--accent), 0.5);
            border-radius: 0.25rem;
            background: rgba(var(--accent), 0.1);
            color: rgb(var(--primary));
            font-size: 0.9rem;
            
            &:focus {
                outline: none;
                border-color: rgb(var(--accent));
                background: rgba(var(--accent), 0.15);
            }

            &::placeholder {
                color: rgba(var(--primary), 0.5);
            }
        }

        .chat-send-button {
            padding: 0.5rem 1rem;
            border: 1px solid rgb(var(--accent));
            border-radius: 0.25rem;
            background: rgb(var(--accent));
            color: rgb(var(--secondary));
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;

            &:hover:not(:disabled) {
                background: rgba(var(--accent), 0.9);
            }

            &:active:not(:disabled) {
                transform: scale(0.95);
            }

            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                background: rgba(var(--accent), 0.3);
                border-color: rgba(var(--accent), 0.5);
            }
        }
    }

    .roll-tooltip {
        position: fixed;
        z-index: 10001;
        padding: 0.4rem 0.6rem;
        background: rgba(20, 20, 30, 0.95);
        border: 1px solid rgb(var(--accent));
        border-radius: 0.25rem;
        color: rgb(var(--primary));
        font-size: 0.75rem;
        font-weight: 500;
        pointer-events: none;
        transform: translate(10px, -50%);
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        max-width: 250px;
        white-space: normal;
        line-height: 1.4;
    }
</style>
