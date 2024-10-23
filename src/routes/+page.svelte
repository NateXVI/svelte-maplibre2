<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';

  let show = $state(true);
  let loaded = $state(false);
  let map = $state<maplibregl.Map | null>(null);

  $inspect(loaded, map);
</script>

<svelte:window
  onkeypress={(e) => {
    if (e.key === 's') {
      show = !show;
    }
  }}
/>

{#if show}
  <MapLibre
    class="h-screen w-full"
    style="https://tiles.openfreemap.org/styles/bright"
    bind:loaded
    bind:map
    cooperativeGestures
  />
  <MapLibre
    class="h-screen w-full"
    style="https://tiles.openfreemap.org/styles/bright"
    cooperativeGestures
  />
{/if}
