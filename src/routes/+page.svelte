<script lang="ts">
  import GeoJson from '$lib/GeoJSON.svelte';
  import Layer from '$lib/Layer.svelte';
  import MapLibre from '$lib/MapLibre.svelte';
  import NavigationControl from '$lib/NavigationControl.svelte';
  import manhattan from '../data/manhattan.json';

  let show = $state(true);
  let map = $state<maplibregl.Map | null>(null);

  let colors = ['#ff000055', '#00ff0055', '#0000ff55'];
  let currentColor = 0;
  let paint = $state({ 'fill-color': colors[0] });

  function changeColor() {
    currentColor = (currentColor + 1) % colors.length;
    paint = { 'fill-color': colors[currentColor]! };
  }
</script>

<svelte:window
  onkeypress={(e) => {
    if (e.key === 't') {
      show = !show;
    } else if (e.key === 'c') {
      changeColor();
    }
  }}
/>

<div class="grid min-h-screen w-full place-items-center bg-orange-100">
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
    <MapLibre
      class="aspect-video w-full overflow-clip rounded-lg border-2 drop-shadow-lg"
      style="https://tiles.openfreemap.org/styles/bright"
      center={[-73.9598939, 40.7896239]}
      zoom={10}
      bind:map
    >
      {#if show}
        <NavigationControl />
        <GeoJson data={manhattan as any}>
          <Layer type="fill" {paint} />
        </GeoJson>
      {/if}
    </MapLibre>
    <div class="flex justify-evenly">
      <div class="flex flex-1 items-center gap-2">
        <kbd>T</kbd>
        <span class="font-semibold">{show ? 'Hide' : 'Show'}</span>
      </div>
      <div class="flex flex-1 items-center gap-2">
        <kbd>C</kbd>
        <span class="font-semibold">Change color</span>
      </div>
    </div>
  </div>
</div>
