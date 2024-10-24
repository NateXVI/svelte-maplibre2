<script lang="ts">
  import type { SourceSpecification, GeoJSONSource, ExpressionSpecification } from 'maplibre-gl';
  import type { ClusterOptions } from './types.js';
  import { createSourceContext, getId, mapContext } from './context.svelte.js';
  import type { GeoJSON } from 'geojson';
  import { addSource, removeSource } from './source.js';
  import flush from './flush.js';
  import { onDestroy, type Snippet } from 'svelte';

  let {
    children,
    id = getId('geojson'),
    data,
    generateId = false,
    promoteId,
    filter,
    lineMetrics,
    cluster,
    maxzoom,
    attribution,
    buffer,
    tolerance,
  }: {
    children?: Snippet;
    id?: string;
    data: GeoJSON | string;
    /** Generate a unique id for each feature. This will overwrite existing IDs. */
    generateId?: boolean;
    /** Use this property on the feature as the ID. This will overwrite existing IDs. */
    promoteId?: string;
    filter?: ExpressionSpecification;
    lineMetrics?: boolean;
    cluster?: ClusterOptions;
    maxzoom?: number;
    attribution?: string;
    buffer?: number;
    tolerance?: number;
  } = $props();

  let ctx = mapContext();
  let source = createSourceContext(id);
  let sourceObj = $state<GeoJSONSource>();
  let first = $state(true);

  $effect(() => {
    ctx.cluster = cluster;
  });

  function init() {
    if (ctx.map) {
      addSource(
        ctx.map,
        id,
        flush<SourceSpecification>({
          type: 'geojson',
          data,
          generateId,
          promoteId,
          filter,
          lineMetrics,
          cluster: !!cluster,
          clusterMinPoints: cluster?.minPoints,
          clusterMaxZoom: cluster?.maxZoom,
          clusterRadius: cluster?.radius,
          maxzoom,
          attribution,
          buffer,
          tolerance,
        }),
        (sourceId: string) => !!ctx.map && sourceId === source.id,
        () => {
          if (!source) {
            return;
          }
          sourceObj = ctx.map?.getSource(source.id) as GeoJSONSource;
          first = true;
        }
      );
    }
  }

  $effect(() => {
    if (ctx.map && ctx.map.isStyleLoaded()) {
      init();
    } else if (ctx.map) {
      ctx.map.once('load', init);
    }
  });

  // Don't set the data again after we've just created it.
  $effect(() => {
    if (!sourceObj) return;
    if (first) {
      first = false;
    } else {
      sourceObj.setData(data);
    }
  });

  onDestroy(() => {
    if (source && sourceObj && ctx.map) {
      removeSource(ctx.map, source.id, sourceObj);
    }
  });
</script>

{#if source}
  {#key source.id}
    {@render children?.()}
  {/key}
{/if}
