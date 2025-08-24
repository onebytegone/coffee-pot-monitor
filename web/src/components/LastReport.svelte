<script lang="ts">
   import { getStatusAPI } from '../lib/context';

   const { lastReport } = getStatusAPI();

   const showReport = $derived(Date.now() - ($lastReport?.getTime() || 0) > 5 * 60 * 1000);
</script>

{#if $lastReport && showReport}
   <h2>Last Report</h2>
   <p>{ $lastReport.toISOString() }</p>
{/if}

<style>
   h2 {
      color: var(--color-text-subdued);
      font-size: 1em;
      margin: 0 0 0.5em 0;
   }
</style>
