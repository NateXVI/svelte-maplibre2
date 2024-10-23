import maplibregl from 'maplibre-gl';
import { getContext, onDestroy, setContext } from 'svelte';

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
  map = $state<maplibregl.Map | null>(null);

  constructor() {
    onDestroy(() => {
      if (this.map) {
        this.map.remove();
      }
    });
  }
}

const MAP_CONTEXT_KEY = Symbol.for('svelte-maplibre');

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
