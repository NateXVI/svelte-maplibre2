<script lang="ts">
  import { mapContext } from './context.svelte.js';
  import maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  let {
    position = 'top-left',
    positionOptions,
    fitBoundsOptions,
    trackUserLocation = false,
    showAccuracyCircle = true,
    showUserLocation = true,
    control = $bindable(null),
  }: {
    position?: maplibregl.ControlPosition;
    positionOptions?: PositionOptions;
    fitBoundsOptions?: maplibregl.FitBoundsOptions;
    trackUserLocation?: boolean;
    showAccuracyCircle?: boolean;
    showUserLocation?: boolean;
    control?: maplibregl.GeolocateControl | null;
  } = $props();

  const ctx = mapContext();

  $effect(() => {
    if (!ctx.map || control) return;

    control = new maplibregl.GeolocateControl({
      positionOptions,
      fitBoundsOptions,
      trackUserLocation,
      showAccuracyCircle,
      showUserLocation,
    });
    ctx.map.addControl(control, position);
  });

  onDestroy(() => {
    if (!ctx.map || !control) return;
    ctx.map.removeControl(control);
  });
</script>
