<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import GeoJSON from '$lib/GeoJSON.svelte';
  import FillLayer from '$lib/FillLayer.svelte';
  import { defaultStyle } from '../../../config.js';
  import manhattan from '../../../data/manhattan.json';

  const center: [number, number] = [-73.971321, 40.776676];
</script>

<MapLibre class="map" style={defaultStyle} {center} zoom={10}>
  <GeoJSON data={manhattan as any}>
    <FillLayer paint={{ 'fill-color': '#ff000055' }} />
  </GeoJSON>
</MapLibre>
