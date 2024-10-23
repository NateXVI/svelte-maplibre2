<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import NavigationControl from '$lib/NavigationControl.svelte';

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

<div class="grid min-h-screen w-full place-items-center">
  <div class="mx-auto flex w-full max-w-5xl px-4 py-8">
    <MapLibre
      class="aspect-video w-full"
      style="https://tiles.openfreemap.org/styles/bright"
      bind:loaded
      bind:map
    >
      {#if show}
        <NavigationControl />
      {/if}
    </MapLibre>
  </div>
</div>
