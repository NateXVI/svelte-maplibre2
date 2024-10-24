<script lang="ts">
  import {
    type AddLayerObject,
    type ExpressionSpecification,
    type LayerSpecification,
    type SourceSpecification,
    type MapMouseEvent,
    type MapGeoJSONFeature,
  } from 'maplibre-gl';
  import { createLayerContext, getId, mapContext, sourceContext } from './context.svelte.js';
  import type { Feature } from 'geojson';
  import flush from './flush.js';
  import { createEventDispatcher, onDestroy } from 'svelte';
  import type { LayerClickInfo } from './types.js';
  import { combineFilters, isClusterFilter } from './filters.js';
  import { diffApplier } from './compare.js';

  // TODO: add sourceLayer prop

  let {
    id = getId('layer'),
    source: givenSource,
    sourceLayer,
    beforeId,
    beforeLayerType,
    type,
    paint,
    layout,
    filter,
    applyToClusters,
    minzoom,
    maxzoom,
    // manageHoverState = false,
    hovered = $bindable(null),
    interactive = true,
    hoverCursor,
    eventsIfTopMost = false,
  }: {
    id?: string;
    /** Set the source for this layer. This can be omitted when the Layer is created in the slot
     * of a source component. */
    source?: string;
    /** When setting up a layer for a vector tile source, the source layer to which this layer corresponds. */
    sourceLayer?: string;
    /** Draw this layer under another layer. This is only evaluated when the component is created. */
    beforeId?: string;
    /** Calculate beforeId so that this layer appears below all layers of a particular type.
     * If this is a function, this layer will be added before the first layer for which
     * the function returns true.*/
    beforeLayerType?: string | ((layer: LayerSpecification) => boolean);
    type: LayerSpecification['type'];
    paint?: LayerSpecification['paint'];
    layout?: LayerSpecification['layout'];
    filter?: ExpressionSpecification;
    applyToClusters?: boolean;
    minzoom?: number;
    maxzoom?: number;
    /** Enable to use hoverStateFilter or filter on `hover-state`. Features must have an `id` property for this to work. */
    // manageHoverState?: boolean;
    /** The feature currently being hovered. */
    hovered?: Feature | null;
    /** Handle mouse events on this layer. */
    interactive?: boolean;
    hoverCursor?: string;
    eventsIfTopMost?: boolean;
  } = $props();

  const dispatch = createEventDispatcher<{
    click: LayerClickInfo;
    dblclick: LayerClickInfo;
    contextmenu: LayerClickInfo;
    mouseenter: LayerClickInfo;
    mousemove: LayerClickInfo;
    mouseleave: Pick<LayerClickInfo, 'map' | 'layer' | 'source'>;
  }>();

  let clusterFilter = $derived(isClusterFilter(applyToClusters));
  let layerFilter = $derived(combineFilters('all', clusterFilter, filter));

  let ctx = mapContext();
  let source = sourceContext();
  let layer = createLayerContext(id);

  let actualMinZoom = $derived(minzoom ?? ctx.minzoom);
  let actualMaxZoom = $derived(maxzoom ?? ctx.maxzoom);
  let actualSource = $derived(givenSource || source?.id);

  let hoverFeatureId = $state<string | number | undefined>(undefined);

  function handleClick(e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) {
    if (!interactive || !layer || !ctx.map) {
      return;
    }

    if (eventsIfTopMost && ctx.eventTopMost(e) !== layer.id) {
      return;
    }

    let features = e.features ?? [];
    let clusterId = features[0]?.properties?.cluster_id;
    let eventData: LayerClickInfo = {
      event: e,
      map: ctx.map!,
      clusterId,
      layer: layer.id,
      source: actualSource!,
      features,
    };

    dispatch(e.type as 'click' | 'dblclick' | 'contextmenu', eventData);
  }

  function handleMouseEnter(e: MapMouseEvent) {
    if (!interactive || !layer || !ctx.map) {
      return;
    }

    if (eventsIfTopMost && ctx.eventTopMost(e) !== layer.id) {
      return;
    }

    if (hoverCursor) {
      ctx.map.getCanvas().style.cursor = hoverCursor;
    }

    let features: Feature[] = (e as any).features ?? [];
    hovered = features[0] ?? null;
    let clusterId = features[0]?.properties?.cluster_id;

    let data: LayerClickInfo = {
      event: e,
      map: ctx.map!,
      clusterId,
      layer: layer.id!,
      source: actualSource!,
      features,
    };

    dispatch('mouseenter', data);
  }

  function handleMouseMove(e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) {
    if (!interactive || !ctx.map) {
      return;
    }

    if (eventsIfTopMost && ctx.eventTopMost(e) !== layer.id) {
      hovered = null;
      // if (manageHoverState && hoverFeatureId !== undefined) {
      //   ctx.map?.setFeatureState(
      //     { source: actualSource!, sourceLayer, id: hoverFeatureId },
      //     { hover: false }
      //   );
      //   hoverFeatureId = undefined;
      // }

      return;
    }

    // This may get out of sync, if this layer regains focus from a higher layer.
    if (hoverCursor) ctx.map.getCanvas().style.cursor = hoverCursor;

    let features = e.features ?? [];

    let clusterId = features[0]?.properties?.cluster_id;

    let featureId = features[0]?.id;

    if (featureId !== hoverFeatureId) {
      // if (manageHoverState) {
      //   if (hoverFeatureId !== undefined) {
      //     ctx.map?.setFeatureState(
      //       { source: actualSource!, id: hoverFeatureId, sourceLayer },
      //       { hover: false }
      //     );
      //   }
      //   ctx.map?.setFeatureState(
      //     { source: actualSource!, id: featureId, sourceLayer },
      //     { hover: true }
      //   );
      // }

      hoverFeatureId = featureId;
      hovered = features[0] ?? null;
    }

    dispatch('mousemove', {
      event: e,
      map: ctx.map!,
      clusterId,
      layer: layer.id!,
      source: actualSource!,
      features,
    });
  }

  function handleMouseLeave(e: MapMouseEvent) {
    if (!interactive || !layer || !ctx.map) {
      return;
    }

    if (hoverCursor) {
      ctx.map.getCanvas().style.cursor = '';
    }

    hovered = null;
    // if (manageHoverState && hoverFeatureId !== undefined) {
    //   const featureSelector = { source: actualSource!, id: hoverFeatureId, sourceLayer };
    //   ctx.map?.setFeatureState(featureSelector, { hover: false });
    //   hoverFeatureId = undefined;
    // }

    dispatch('mouseleave', {
      map: ctx.map!,
      layer: layer.id,
      source: actualSource!,
    });
  }

  function unsubEvents(layerName: string) {
    if (!ctx.map) return;

    ctx.map.off('click', layerName, handleClick);
    ctx.map.off('dblclick', layerName, handleClick);
    ctx.map.off('contextmenu', layerName, handleClick);
    ctx.map.off('mouseenter', layerName, handleMouseEnter);
    ctx.map.off('mousemove', layerName, handleMouseMove);
    ctx.map.off('mouseleave', layerName, handleMouseLeave);
  }

  const init = () => {
    if (!ctx.map) return;

    let actualBeforeId = beforeId;
    if (!beforeId && beforeLayerType) {
      let layers = ctx.map.getStyle().layers;
      let layerFunc =
        typeof beforeLayerType === 'function'
          ? beforeLayerType
          : (l: maplibregl.LayerSpecification) => l.type === beforeLayerType;
      let beforeLayer = layers?.find(layerFunc);
      if (beforeLayer) {
        actualBeforeId = beforeLayer.id;
      }
    }

    ctx.map.addLayer(
      flush<AddLayerObject>({
        id,
        type,
        source: actualSource as unknown as SourceSpecification, // a string should be a valid type here, I think...
        filter: layerFilter,
        paint,
        layout,
        minzoom: actualMinZoom,
        maxzoom: actualMaxZoom,
      })
    );
    if (beforeId) ctx.map.moveLayer(id, beforeId);
    first = true;

    ctx.map.on('click', layer.id, handleClick);
    ctx.map.on('dblclick', layer.id, handleClick);
    ctx.map.on('contextmenu', layer.id, handleClick);
    ctx.map.on('mouseenter', layer.id, handleMouseEnter);
    ctx.map.on('mousemove', layer.id, handleMouseMove);
    ctx.map.on('mouseleave', layer.id, handleMouseLeave);
  };

  let first = $state(true);
  let initialized = $state(false);
  $effect(() => {
    if (initialized) return;
    if (ctx.map && actualSource) {
      initialized = true;
      if (layer) layer.id = id;
      init();
    }
  });

  onDestroy(() => {
    if (ctx.map && id) {
      ctx.map.removeLayer(layer?.id ?? id);
    }

    if (ctx.map && layer) {
      unsubEvents(layer.id);
    }
  });

  $effect(() => {
    if (!layer || !ctx.map) return;
    for (let key in paint) {
      ctx.map.setPaintProperty(layer.id, key, paint[key as keyof typeof paint]);
    }
  });

  let applyLayout = $derived(
    layer
      ? diffApplier((key, value) => {
          if (ctx.map?.style._loaded) {
            ctx.map.setLayoutProperty(layer.id!, key, value);
          } else {
            ctx.map?.once('styledata', () => ctx.map?.setLayoutProperty(layer.id!, key, value));
          }
        })
      : void 0
  );

  $effect(() => {
    applyLayout?.(layout);
  });

  $effect(() => {
    if (layer) ctx.map?.setLayerZoomRange(layer.id, actualMinZoom, actualMaxZoom);
  });

  // Don't set the filter again after we've just created it.
  $effect(() => {
    if (layer) {
      if (first) {
        first = false;
      } else {
        ctx.map?.setFilter(layer.id, layerFilter);
      }
    }
  });
</script>
