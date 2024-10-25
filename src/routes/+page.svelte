<script lang="ts">
  import FillLayer from '$lib/FillLayer.svelte';
  import { isTextLayer } from '$lib/filters.js';
  import GeoJson from '$lib/GeoJSON.svelte';
  import Layer from '$lib/Layer.svelte';
  import MapLibre from '$lib/MapLibre.svelte';
  import NavigationControl from '$lib/NavigationControl.svelte';
  import manhattan from '../data/manhattan.json';

  let show = $state(true);
  let map = $state<maplibregl.Map | null>(null);

  let style = $state<string>('https://tiles.openfreemap.org/styles/bright');
  // let style = $state<string>('https://basemaps.cartocdn.com/gl/positron-gl-style/style.json');

  let colors = [
    '#ff000055',
    '#00ff0055',
    '#0000ff55',
    '#ff00ff55',
    '#00ffff55',
    '#ffff0055',
    '#ffffff55',
    '#00000055',
  ];
  let currentColor = $state(0);

  function getPaint() {
    return { 'fill-color': colors[currentColor] };
  }

  let paint = $state(getPaint());

  function changeColor() {
    currentColor = (currentColor + 1) % colors.length;
    paint = getPaint();
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
    <div class="flex flex-col gap-2">
      <MapLibre
        class="aspect-video w-full overflow-clip rounded-lg border-2 drop-shadow-lg"
        {style}
        center={[-73.9598939, 40.7896239]}
        zoom={10.3}
        bind:map
        filterLayers={(l) => !isTextLayer(l, 'openmaptiles')}
      >
        {#if show}
          <NavigationControl />
          <GeoJson data={manhattan as any}>
            <FillLayer {paint} onclick={console.log} />
          </GeoJson>
        {/if}
      </MapLibre>
      <div>
        <span class="font-mono">{colors[currentColor]}</span>
      </div>
    </div>
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
