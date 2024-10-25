<script lang="ts">
  import maplibre, { type LngLatLike, type PointLike } from 'maplibre-gl';
  import { onDestroy, type Snippet } from 'svelte';
  import { createMarkerContext, mapContext } from './context.svelte.js';
  import type { MarkerClickCallback, MarkerClickInfo } from './types.js';
  import type { Feature } from 'geojson';
  import flush from './flush.js';

  let {
    children,
    marker: markerProp = $bindable(),
    lngLat,
    class: className,
    draggable = false,
    feature = null,
    offset,
    rotation = 0,
    opacity = 1,
    ondrag,
    ondragstart,
    ondragend,
  }: {
    children?: Snippet;
    /** The Marker instance which was added to the map */
    marker?: maplibre.Marker;
    lngLat: LngLatLike;
    class?: string;
    /** Handle mouse events */
    draggable?: boolean;
    /** A GeoJSON Feature related to the point. This is only actually used to send an ID and set of properties along with
     * the event, and can be safely omitted. The `lngLat` prop controls the marker's location even if this is provided. */
    feature?: Feature | null;
    /** An offset in pixels to apply to the marker. */
    offset?: PointLike;
    rotation?: number;
    opacity?: number;

    ondrag?: MarkerClickCallback;
    ondragstart?: MarkerClickCallback;
    ondragend?: MarkerClickCallback;
  } = $props();

  let ctx = mapContext();
  let markerCtx = createMarkerContext();
  let initialized = $state(false);

  $effect(() => {
    if (initialized || !ctx.map) return;
    initialized = true;
    markerCtx.self = new maplibre.Marker(
      flush({
        draggable,
        rotation,
        className,
        offset,
        opacity: opacity.toString(),
      })
    )
      .setLngLat(lngLat)
      .addTo(ctx.map);
    markerProp = markerCtx.self;
    if (draggable) {
      markerCtx.self.on('dragstart', dragStartListener);
      markerCtx.self.on('drag', dragListener);
      markerCtx.self.on('dragend', dragEndListener);
    }
  });

  $effect(() => {
    if (lngLat) markerCtx?.self?.setLngLat(lngLat);
  });
  $effect(() => {
    markerCtx?.self?.setOffset(offset ?? [0, 0]);
  });
  $effect(() => {
    markerCtx?.self?.setRotation(rotation);
  });
  $effect(() => {
    markerCtx?.self?.setOpacity(opacity.toString());
  });

  onDestroy(() => {
    markerProp = undefined;
    markerCtx.self?.remove();
    markerCtx.self = undefined;
  });

  const dragStartListener = () => sendEvent(ondragstart, 'dragstart');
  const dragListener = () => {
    propagateLngLatChange();
    sendEvent(ondrag, 'drag');
  };
  const dragEndListener = () => {
    propagateLngLatChange();
    sendEvent(ondragend, 'dragend');
  };

  function propagateLngLatChange() {
    let newPos = markerCtx?.self?.getLngLat();
    if (!newPos) {
      return;
    }

    // Update the props using the same format they are already in.
    if (Array.isArray(lngLat)) {
      lngLat = [newPos.lng, newPos.lat];
    } else if (lngLat && 'lon' in lngLat) {
      lngLat = { lon: newPos.lng, lat: newPos.lat };
    } else {
      lngLat = newPos;
    }
  }

  function sendEvent(callback: MarkerClickCallback | undefined, type: string) {
    if (!ctx.map || !markerCtx?.self) return;

    let loc = markerCtx.self.getLngLat();

    const lngLat: [number, number] = [loc.lng, loc.lat];
    let data: MarkerClickInfo = {
      map: ctx.map,
      marker: markerCtx.self,
      lngLat,
      features: [
        {
          type: 'Feature',

          properties: feature?.properties ?? {},
          geometry: {
            type: 'Point',
            coordinates: lngLat,
          },
        },
      ],
    };

    ctx.layerEvent = {
      ...data,
      layerType: 'marker',
      type: type,
    };

    callback?.(data);
  }
</script>

{@render children?.()}
