<script lang="ts">
  import type { Snippet } from 'svelte';
  import { createMapContext } from './context.svelte';
  import { onMount } from 'svelte';
  import maplibregl from 'maplibre-gl';
  import flush from './flush.js';
  import 'maplibre-gl/dist/maplibre-gl.css';

  let {
    children,
    map = $bindable(null),
    loaded = $bindable(false),

    style,
    center,
    zoom,
    pitch = 0,
    bearing = 0,
    minZoom = 0,
    maxZoom = 22,
    minPitch = 0,
    maxPitch = 60,
    renderWorldCopies,
    dragPan,
    dragRotate,
    pitchWithRotate,
    antialias,
    zoomOnDoubleClick = true,
    attributionControl,
    cooperativeGestures = false,

    standardControls = false,
    ...rest
  }: {
    children?: Snippet;
    /**
     * Bindable map instance used to get the map from outside the component/context.
     *
     * This prop is not reactive and should not be set directly.
     */
    map?: maplibregl.Map | null;
    loaded?: boolean;

    style?: string;
    center?: maplibregl.LngLatLike;
    zoom?: number;
    pitch?: number;
    bearing?: number;
    bounds?: maplibregl.LngLatBoundsLike;
    minZoom?: number;
    maxZoom?: number;
    minPitch?: number;
    maxPitch?: number;
    renderWorldCopies?: boolean;
    dragPan?: boolean;
    dragRotate?: boolean;
    pitchWithRotate?: boolean;
    antialias?: boolean;
    zoomOnDoubleClick?: boolean;
    attributionControl?: false | maplibregl.AttributionControlOptions;
    /** Set true to require hitting ⌘/Ctrl while scrolling to zoom. Or use two fingers on phones. */
    cooperativeGestures?: boolean;

    standardControls?: boolean | maplibregl.ControlPosition;
    class?: string;
  } = $props();

  const ctx = createMapContext();
  $effect(() => {
    map = ctx.map;
  });
  let container = $state<HTMLElement>();

  function initMap() {
    ctx.map = new maplibregl.Map(
      flush({
        container: container!,
        style: style,
        zoom,
        center,
        pitch,
        bearing,
        minZoom,
        maxZoom,
        minPitch,
        maxPitch,
        renderWorldCopies,
        dragPan,
        dragRotate,
        pitchWithRotate,
        antialias,
        zoomOnDoubleClick,
        attributionControl,
        cooperativeGestures,
      })
    );

    ctx.map.on('load', () => {
      loaded = true;
    });
  }

  onMount(() => {
    initMap();
  });
</script>

<div {...rest} bind:this={container}>
  {@render children?.()}
</div>
