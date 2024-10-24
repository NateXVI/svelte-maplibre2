<script lang="ts">
  import GeoJson from '$lib/GeoJSON.svelte';
  import MapLibre from '$lib/MapLibre.svelte';
  import NavigationControl from '$lib/NavigationControl.svelte';
  import manhattan from '../data/manhattan.json';

  let show = $state(true);
  let map = $state<maplibregl.Map | null>(null);
</script>

<svelte:window
  onkeypress={(e) => {
    if (e.key === 's') {
      show = !show;
    }
  }}
/>

<div class="grid min-h-screen w-full place-items-center bg-orange-100">
  <div class="mx-auto flex w-full max-w-5xl px-4 py-8">
    <MapLibre
      class="aspect-video w-full overflow-clip rounded-lg border-2 drop-shadow-lg"
      style="https://tiles.openfreemap.org/styles/bright"
      center={[-73.9598939, 40.7896239]}
      zoom={10}
      bind:map
    >
      {#if show}
        <NavigationControl />
        <GeoJson data={manhattan as any}></GeoJson>
      {/if}
    </MapLibre>
  </div>
</div>
