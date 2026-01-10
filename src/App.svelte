<script lang="ts">
  // Import components
  import  Themer  from './components/Themer.svelte';
  import { onMount } from "svelte";
  import GmBinderTabs from './components/GMBinderTabs.svelte';
  import  Sheet  from './components/Sheet.svelte'
  import DiceLog from './components/DiceLog.svelte'
  import OBR from "@owlbear-rodeo/sdk";

  import { sheet } from './stores';
  import { ViewingSheet, currentPlayerId, viewingPlayerId } from './services/OBRHelper';
  import * as OBRHelper from './services/OBRHelper';
  import { diceRolls } from './stores/diceRolls';

  const { isGM } = OBRHelper;
  
  // Check URL parameters to determine which panel to show
  let isDiceLogPanel = false;
  
  onMount(() => {
    // Check URL parameters or hash for panel type
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    isDiceLogPanel = urlParams.get('panel') === 'dice-log' || hash === '#dice-log';
    
    // Always initialize dice rolls store (needed for both panels)
    diceRolls.initialize();
    
    // Only initialize main sheet if not showing dice log panel
    if (!isDiceLogPanel) {
      // Clear corrupted localStorage if needed
      try {
        const stored = localStorage.getItem('star-trek-character-sheet');
        if (stored && (stored === 'undefined' || stored === '' || (!stored.trim().startsWith('{') && !stored.trim().startsWith('[')))) {
          console.warn('Clearing corrupted localStorage data');
          localStorage.removeItem('star-trek-character-sheet');
          // Reload the page to reinitialize with default values
          window.location.reload();
        }
      } catch (e) {
        console.warn('Error checking localStorage:', e);
      }
      
      if (OBR.isAvailable) {
        OBRHelper.init();
      }
    }
  });

  $: mainSheetVisible = $currentPlayerId === $viewingPlayerId ? "display:block;" : "display:none;";
  $: viewingSheetVisible = $currentPlayerId === $viewingPlayerId ? "display:none;" : "display:block";

</script>

<Themer>
  {#if isDiceLogPanel}
    <main>
      <DiceLog/>
    </main>
  {:else}
    <main>
      {#if $isGM}
      <GmBinderTabs/>
      {/if}
      <div style="{mainSheetVisible}">
        {#if $sheet}
          <Sheet bind:sheet={$sheet}/>
        {/if}
      </div>
      <div style="{viewingSheetVisible}">
        {#if $ViewingSheet}
          <Sheet bind:sheet={$ViewingSheet}/>
        {/if}
      </div>

    </main>
    <footer>
      <a target="_blank" href="https://github.com/WhaleCancer/star-trek-character-sheet">Star Trek Character Sheet</a>
    </footer>
  {/if}
</Themer>

<style lang="scss">
  main {
    background: rgb(var(--secondary));
    height:100%;
  }
  footer {
    background: rgb(var(--secondary));
    clear: both;
    position: relative;
    min-height: 2rem;
    margin-top: 0;
    padding: 2rem;
    a {
      text-decoration: none;
      float: right;
      color: rgb(var(--accent));
    }
  }
</style>