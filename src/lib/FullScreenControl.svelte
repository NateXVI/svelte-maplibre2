<script lang="ts">
  import { mapContext } from './context.svelte.js';
  import maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  let {
    position = 'top-left',
  }: {
    position?: maplibregl.ControlPosition;
  } = $props();

  let ctx = mapContext();
  let control: maplibregl.FullscreenControl | null = $state(null);

  $effect(() => {
    if (!ctx.map || control) return;

    control = new maplibregl.FullscreenControl();
    ctx.map.addControl(control, position);
  });

  onDestroy(() => {
    if (!ctx.map || !control) return;
    ctx.map.removeControl(control);
  });
</script>
