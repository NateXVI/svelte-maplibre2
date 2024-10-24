import { type Map, type MapMouseEvent } from 'maplibre-gl';
import { getContext, onDestroy, setContext } from 'svelte';
import type { ClusterOptions } from './types.js';
import { SvelteMap } from 'svelte/reactivity';

// Choose current time instead of 0 to avoid possible reuse during HMR.
let nextId = Date.now();

/** Return an ID to use for a source or layer, in case you don't care about
 * the name. */
export function getId(prefix: string) {
  return `${prefix}-${nextId++}`;
}

export interface LayerInfo {
  interactive: boolean;
}

export class MapContext {
  map = $state<Map | null>(null);
  cluster = $state<ClusterOptions | undefined>();
  minzoom = $state<number>(0);
  maxzoom = $state<number>(24);

  layerTracker = $state<WeakMap<Event, string | undefined>>(new WeakMap());
  layerInfo = $state<SvelteMap<string, LayerInfo>>(new SvelteMap());

  constructor() {
    onDestroy(() => {
      if (this.map) {
        this.map.remove();
      }
    });
  }

  eventTopMost(event: MapMouseEvent): string {
    let id = this.layerTracker.get(event.originalEvent);
    if (id !== undefined) {
      return id;
    }

    let features = event.target.queryRenderedFeatures(event.point);
    let topId = features.find((f) => this.layerInfo.get(f.layer.id)?.interactive)?.layer.id;

    this.layerTracker.set(event.originalEvent, topId);

    return topId ?? '';
  }
}

const MAP_CONTEXT_KEY = Symbol.for('svelte-maplibre2-map');

export function mapContext(): MapContext {
  const context = getContext(MAP_CONTEXT_KEY);
  if (context === undefined) {
    throw new Error('Map context not found');
  }
  return context as MapContext;
}

export function createMapContext(): MapContext {
  let context = new MapContext();
  return setContext(MAP_CONTEXT_KEY, context);
}

const SOURCE_CONTEXT_KEY = Symbol.for('svelte-maplibre2-source');

export class SourceContext {
  id: string = $state('');

  constructor(id: string) {
    this.id = id;
  }
}

export function createSourceContext(id: string): SourceContext {
  return setContext(SOURCE_CONTEXT_KEY, new SourceContext(id));
}

export function sourceContext(): SourceContext | undefined {
  return getContext(SOURCE_CONTEXT_KEY);
}

const LAYER_CONTEXT_KEY = Symbol.for('svelte-maplibre2-layer');

export class LayerContext {
  id: string = $state('');

  constructor(id: string) {
    this.id = id;
  }
}

export function createLayerContext(id: string): LayerContext {
  return setContext(LAYER_CONTEXT_KEY, new LayerContext(id));
}

export function layerContext(): LayerContext | undefined {
  return getContext(LAYER_CONTEXT_KEY);
}
