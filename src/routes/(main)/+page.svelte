<script lang="ts">
  import Title from './Title.svelte';
  import DefaultMarker from '$lib/DefaultMarker.svelte';
  import FillLayer from '$lib/FillLayer.svelte';
  import { isTextLayer } from '$lib/filters.js';
  import GeoJson from '$lib/GeoJSON.svelte';
  import Marker from '$lib/Marker.svelte';
  import NavigationControl from '$lib/NavigationControl.svelte';
  import { defaultStyle } from '../../config.js';
  import manhattan from '../../data/manhattan.json';
  import maplibregl from 'maplibre-gl';
  import GeolocateControl from '$lib/GeolocateControl.svelte';
  import FullScreenControl from '$lib/FullScreenControl.svelte';
  import MapLibre from '$lib/MapLibre.svelte';
  import SymbolLayer from '$lib/SymbolLayer.svelte';

  let show = $state(true);
  let map = $state<maplibregl.Map | null>(null);
  let center = $state<[number, number]>([-73.971321, 40.776676]);

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

<Title>Home</Title>

<svelte:window
  onkeypress={(e) => {
    if (e.key === 't') {
      show = !show;
    } else if (e.key === 'c') {
      changeColor();
    }
  }}
/>

<div class="flex flex-col gap-2">
  <MapLibre
    class="map"
    style={defaultStyle}
    {center}
    zoom={10.3}
    bind:map
    filterLayers={(l) => !isTextLayer(l, 'openmaptiles')}
  >
    {#if show}
      <NavigationControl />
      <GeolocateControl />
      <FullScreenControl />
      <GeoJson data={manhattan as any}>
        <FillLayer {paint} onclick={console.log} />
      </GeoJson>
      <GeoJson
        data={{
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: center,
              },
              properties: {
                name: 'Manhattan',
              },
            },
          ],
        }}
      >
        <SymbolLayer
          paint={{
            'text-color': 'white',
            'text-halo-color': '#111',
            'text-halo-width': 1,
          }}
          layout={{
            'text-field': '{name}',
            'text-size': 30,
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          }}
        />
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
