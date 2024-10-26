<script lang="ts">
  let { children } = $props();
</script>

<div>
  <h2 class="text-2xl font-semibold">
    {@render children?.()}
  </h2>
</div>
