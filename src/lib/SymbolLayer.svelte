<script lang="ts">
  import Layer from './Layer.svelte';
  import type { ComponentProps } from 'svelte';

  type Props = Omit<ComponentProps<typeof Layer>, 'type'>;

  let props: Props = $props();
</script>

<Layer {...props} type="symbol" />
