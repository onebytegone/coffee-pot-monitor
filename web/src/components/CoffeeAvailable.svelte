<script lang="ts">
   import { getStatusAPI } from '../lib/context';

   const { ouncesAvailable } = getStatusAPI();
</script>

<h1>Coffee Available</h1>
{#if $ouncesAvailable}
   <p>{$ouncesAvailable}oz</p>
{:else}
   <p>nope.</p>
{/if}

<style>
   h1,
   p {
      margin: 0;
   }
   h1 {
      color: var(--color-text-subdued);
      font-size: 1em;
      margin-bottom: 0.5em;
   }
   p {
      font-size: 4em;
      margin-bottom: 0.25em;
   }
</style>
