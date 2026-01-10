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

    onMount(() => {
        diceRolls.initialize();
        
        // Auto-scroll to bottom when new entries are added
        diceRolls.subscribe((log) => {
            if (autoScroll && logContainer) {
                setTimeout(() => {
                    logContainer.scrollTop = logContainer.scrollHeight;
                }, 100);
            }
        });
    });

    function handleClearLog() {
        if (confirm("Are you sure you want to clear all dice roll logs and chat messages? This action cannot be undone.")) {
            diceRolls.clearLog();
        }
    }

    function exportLog() {
        const logData = get(diceRolls);
        const json = JSON.stringify(logData, null, 2);
        const filename = `Star-Trek-Dice-Log-${new Date().toISOString().split('T')[0]}.json`;
        const blob = new Blob([json], { type: "application/json" });
        saveAs(blob, filename);
    }

    function importLog() {
        const input = document.getElementById('importLogFile') as HTMLInputElement;
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
                    if (confirm("This will replace the current dice log. Do you want to continue?")) {
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
        <h2>Dice Roll Log & Chat</h2>
        <div class="header-actions">
            <button 
                class="action-button" 
                on:click={exportLog}
                title="Save dice log to JSON file"
            >
                💾 Save
            </button>
            <button 
                class="action-button" 
                on:click={importLog}
                title="Load dice log from JSON file"
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
                on:click={scrollToBottom}
                title="Scroll to bottom"
            >
                ⬇️
            </button>
            <button 
                class="action-button clear-button" 
                on:click={handleClearLog}
                title="Clear all logs and chat"
            >
                🗑️ Clear
            </button>
        </div>
    </div>

    <div class="dice-log-content" bind:this={logContainer}>
        {#if $diceRolls.length === 0}
            <div class="empty-log">
                <p>No dice rolls or chat messages yet.</p>
                <p class="hint">Roll dice from any special skill or send a chat message below.</p>
            </div>
        {:else}
            <div class="log-entries">
                {#each $diceRolls as entry (entry.id)}
                    {#if isDiceRoll(entry)}
                        <div class="log-entry dice-roll-entry" class:success={entry.isSuccess} class:failure={!entry.isSuccess}>
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
                    {:else if isChatMessage(entry)}
                        <div class="log-entry chat-entry">
                            <div class="entry-header">
                                <div class="entry-player">
                                    <strong>{entry.playerName}</strong>
                                </div>
                                <div class="entry-time">
                                    <span class="date">{formatDate(entry.timestamp)}</span>
                                    <span class="time">{formatTimestamp(entry.timestamp)}</span>
                                </div>
                            </div>
                            
                            <div class="chat-message">
                                {entry.message}
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>
        {/if}
    </div>

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

<input id="importLogFile" type="file" accept="application/json" on:change={handleLogImport} style="display: none;" />

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

    .dice-log-content {
        flex: 1;
        overflow-y: auto;
        padding: 0.75rem 1rem;
        display: flex;
        flex-direction: column;
        min-height: 0;

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
        gap: 0.75rem;
    }

    .log-entry {
        padding: 0.75rem;
        border-radius: 0.5rem;
        border: 2px solid;
        background: rgba(var(--primary), 0.05);
        transition: all 0.2s ease;

        &.dice-roll-entry {
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

        &.chat-entry {
            border-color: rgba(var(--accent), 0.3);
            background: rgba(var(--accent), 0.05);

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

    .chat-message {
        color: rgb(var(--primary));
        font-size: 0.9rem;
        line-height: 1.5;
        white-space: pre-wrap;
        word-wrap: break-word;
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
</style>
