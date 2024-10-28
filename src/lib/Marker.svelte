<script lang="ts">
  import maplibre, { type LngLatLike, type PointLike } from 'maplibre-gl';
  import type { Feature } from 'geojson';
  import type { MarkerClickCallback, MarkerClickInfo } from './types.js';
  import { createMarkerContext, mapContext } from './context.svelte.js';
  import type { Snippet } from 'svelte';
  import flush from './flush.js';

  let {
    children,
    marker: markerProp = $bindable(),
    lngLat,
    class: className,
    interactive = true,
    asButton = false,
    draggable = false,
    feature = null,
    offset,
    zIndex,
    rotation = 0,
    opacity = 1,
    ondrag,
    ondragstart,
    ondragend,
    onclick,
    ondblclick,
    oncontextmenu,
    onmouseenter,
    onmouseleave,
    onmousemove,
  }: {
    children?: Snippet;
    /** The Marker instance which was added to the map */
    marker?: maplibre.Marker;
    lngLat: LngLatLike;
    class?: string;
    /** Handle mouse events */
    interactive?: boolean;
    /** Make markers tabbable and add the button role. */
    asButton?: boolean;
    draggable?: boolean;
    /** A GeoJSON Feature related to the point. This is only actually used to send an ID and set of properties along with
     * the event, and can be safely omitted. The `lngLat` prop controls the marker's location even if this is provided. */
    feature?: Feature | null;
    /** An offset in pixels to apply to the marker. */
    offset?: PointLike;
    /** The z-index of the marker. This can also be set via CSS classes using the `class` prop */
    zIndex?: number;
    /** The rotation angle of the marker (clockwise, in degrees) */
    rotation?: number;
    /** The opacity of the marker */
    opacity?: number;

    ondrag?: MarkerClickCallback;
    ondragstart?: MarkerClickCallback;
    ondragend?: MarkerClickCallback;
    onclick?: MarkerClickCallback;
    ondblclick?: MarkerClickCallback;
    oncontextmenu?: MarkerClickCallback;
    onmouseenter?: MarkerClickCallback;
    onmouseleave?: MarkerClickCallback;
    onmousemove?: MarkerClickCallback;
  } = $props();

  let ctx = mapContext();
  let markerCtx = createMarkerContext(markerProp);

  $effect(() => {
    markerCtx.self?.setLngLat(lngLat);
  });
  $effect(() => {
    markerCtx.self?.setOffset(offset ?? [0, 0]);
  });
  $effect(() => {
    markerCtx.self?.setRotation(rotation);
  });
  $effect(() => {
    markerCtx.self?.setOpacity(opacity.toString());
  });

  function addMarker(node: HTMLDivElement) {
    console.log({ map: !!ctx.map });
    if (!ctx.map) return;
    console.log('passed');
    markerCtx.self = new maplibre.Marker(
      flush({
        element: node,
        rotation,
        draggable,
        offset,
        opacity: opacity.toString(),
      })
    )
      .setLngLat(lngLat)
      .addTo(ctx.map);
    markerProp = markerCtx.self;

    const dragStartListener = () => sendEvent(ondragstart, 'dragstart');
    const dragListener = () => {
      propagateLngLatChange();
      sendEvent(ondrag, 'drag');
    };
    const dragEndListener = () => {
      propagateLngLatChange();
      sendEvent(ondragend, 'dragend');
    };

    if (draggable) {
      markerCtx.self.on('dragstart', dragStartListener);
      markerCtx.self.on('drag', dragListener);
      markerCtx.self.on('dragend', dragEndListener);
    }

    return {
      destroy() {
        if (draggable) {
          markerCtx.self?.off('dragstart', dragStartListener);
          markerCtx.self?.off('drag', dragListener);
          markerCtx.self?.off('dragend', dragEndListener);
        }
        markerProp = undefined;
        markerCtx.self?.remove();
      },
    };
  }

  function manageClasses(node: HTMLDivElement, initialAddedClasses: string | undefined) {
    // These classes are added by MapLibre and we don't want to mess with them.
    const frozenClasses = node.className;

    function updateClasses(newClassNames: string | undefined) {
      if (newClassNames) {
        node.className = `${frozenClasses} ${newClassNames}`;
      } else {
        node.className = frozenClasses;
      }
    }

    updateClasses(initialAddedClasses);

    return {
      update: updateClasses,
    };
  }

  function propagateLngLatChange() {
    let newPos = markerCtx.self?.getLngLat();
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

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      sendEvent(onclick, 'click', true);
    }
  }

  function sendEvent(
    callback: MarkerClickCallback | undefined,
    type: string,
    isClickEvent = false
  ) {
    if (!interactive || callback === undefined) {
      return;
    }

    let loc = markerCtx.self?.getLngLat();
    if (!loc) {
      return;
    }

    const lngLat: [number, number] = [loc.lng, loc.lat];
    let data: MarkerClickInfo = {
      map: ctx.map!,
      marker: markerCtx.self!,
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

    if (isClickEvent) {
      ctx.markerClickManager.handleClick(data);
    }

    ctx.layerEvent = {
      ...data,
      layerType: 'marker',
      type,
    };

    callback(data);
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  use:addMarker
  use:manageClasses={className}
  style:z-index={zIndex}
  tabindex={asButton ? 0 : undefined}
  role={asButton ? 'button' : undefined}
  onclick={(e) => {
    e.stopPropagation();
    sendEvent(onclick, 'click', true);
  }}
  ondblclick={(e) => {
    e.stopPropagation();
    sendEvent(ondblclick, 'dblclick');
  }}
  oncontextmenu={(e) => {
    e.stopPropagation();
    e.preventDefault();
    sendEvent(oncontextmenu, 'contextmenu', true);
  }}
  onmouseenter={(e) => {
    e.stopPropagation();
    sendEvent(onmouseenter, 'mouseenter');
  }}
  onmouseleave={(e) => {
    e.stopPropagation();
    sendEvent(onmouseleave, 'mouseleave');
  }}
  onmousemove={(e) => {
    sendEvent(onmousemove, 'mousemove');
  }}
  onkeydown={(e) => {
    handleKeyDown(e);
  }}
>
  {@render children?.()}
</div>
