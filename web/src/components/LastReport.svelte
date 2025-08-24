<script lang="ts">
   import humanizeDuration from 'humanize-duration';
   import { getStatusAPI } from '../lib/context';
   import { onMount } from 'svelte';

   let currentTime = $state(new Date());

   const { lastReport } = getStatusAPI();

   const showReport = $derived(Date.now() - ($lastReport?.getTime() || 0) > 5 * 60 * 1000);

   const lastReportLabel = $derived(
      humanizeDuration(currentTime.getTime() - ($lastReport?.getTime() || 0), {
         units: ['d', 'h', 'm', 's'],
         round: true,
         largest: 2,
      })
   );

   onMount(() => {
      const interval = setInterval(() => {
         currentTime = new Date();
      }, 1000);

      return () => {
         clearInterval(interval);
      };
   });
</script>

{#if showReport}
   <h2>Last Report</h2>
   <p>{ lastReportLabel } ago</p>
{/if}

<style>
   h2 {
      color: var(--color-text-subdued);
      font-size: 1em;
      margin: 0 0 0.5em 0;
   }
</style>
