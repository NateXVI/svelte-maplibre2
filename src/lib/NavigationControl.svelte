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
  let initialized = $state(false);

  const init = () => {
    if (!ctx.map) return;
    control = new maplibregl.NavigationControl({
      showCompass,
      showZoom,
      visualizePitch,
    });
    ctx.map.addControl(control, position);
  };

  const cleanup = () => {
    if (ctx.map && control) {
      ctx.map.removeControl(control);
    }
    // cancel the init callback so multiple calls don't stack up
    ctx.map?.off('load', init);
  };

  $effect(() => {
    if (ctx.map && !control && !initialized) {
      initialized = true;
      init();
    }
  });

  onDestroy(cleanup);
</script>
