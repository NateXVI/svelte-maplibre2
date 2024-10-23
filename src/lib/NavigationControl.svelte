<script lang="ts">
  import { mapContext } from './context.svelte';
  import maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  let {
    position = 'top-left',
    showCompass = true,
    showZoom = true,
    visualizePitch = false,
  }: {
    position?: maplibregl.ControlPosition;
    showCompass?: boolean;
    showZoom?: boolean;
    visualizePitch?: boolean;
  } = $props();

  const ctx = mapContext();

  let control: maplibregl.NavigationControl | null = $state(null);

  $effect(() => {
    if (ctx.map && !control) {
      control = new maplibregl.NavigationControl({
        showCompass,
        showZoom,
        visualizePitch,
      });
      ctx.map.addControl(control, position);
    }
  });

  onDestroy(() => {
    if (ctx.map?.loaded() && control) {
      ctx.map.removeControl(control);
    }
  });
</script>
