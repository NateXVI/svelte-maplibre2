<script lang="ts">
  import { page } from '$app/stores';

  let { children } = $props();
</script>

{#snippet link(name: string, href: string)}
  <a
    {href}
    class="w-full rounded-lg px-4 py-2 text-lg font-semibold transition-colors hover:bg-orange-300"
    class:bg-orange-300={$page.url.pathname === href}>{name}</a
  >
{/snippet}

<div class="flex min-h-screen w-full bg-orange-200">
  <div class="hidden w-[400px] flex-col gap-1 p-5 xl:flex">
    {@render link('Home', '/')}
    {@render link('GeoJSON', '/geojson')}
  </div>
  <main class="w-full flex-1 bg-orange-100 p-5">
    {@render children()}
  </main>
</div>
