<script lang="ts">
   import humanizeDuration from 'humanize-duration';
   import { getStatusAPI } from '../lib/context';
   import { onMount } from 'svelte';

   let currentTime = $state(new Date());

   const { lastBrewed, ouncesAvailable } = getStatusAPI();

   const lastBrewedLabel = $derived(
      humanizeDuration(currentTime.getTime() - ($lastBrewed?.getTime() || 0), {
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

{#if $ouncesAvailable && $lastBrewed}
   <h2>Last Brewed</h2>
   <p>{lastBrewedLabel} ago</p>
{/if}

<style>
   h2 {
      color: var(--color-text-subdued);
      font-size: 1em;
      margin: 0 0 0.5em 0;
   }
</style>
