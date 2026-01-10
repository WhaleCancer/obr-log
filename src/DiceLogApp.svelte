<script lang="ts">
  import Themer from './components/Themer.svelte';
  import DiceLog from './components/DiceLog.svelte';
  import { onMount } from "svelte";
  import OBR from "@owlbear-rodeo/sdk";
  import * as OBRHelper from './services/OBRHelper';
</script>

<Themer>
  <main>
    <DiceLog/>
  </main>
</Themer>

<style lang="scss">
  main {
    background: rgb(var(--secondary));
    height: 100%;
    overflow: hidden;
  }
</style>
