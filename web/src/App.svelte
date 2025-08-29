<script lang="ts">
   import { makeStatusAPI, makeMockStatusAPI } from './lib/StatusAPI';
   import { setStatusAPI } from './lib/context';
   import LastReport from './components/LastReport.svelte';
   import LastBrewed from './components/LastBrewed.svelte';
   import CoffeeAvailable from './components/CoffeeAvailable.svelte';
   import DevControls from './components/DevControls.svelte';

   const statusAPI = import.meta.env.DEV ? makeMockStatusAPI() : makeStatusAPI(),
      unauthenticated = statusAPI.unauthenticated;

   setStatusAPI(statusAPI);

   function setAuthToken(event: Event | undefined) {
      const form = event?.target as HTMLFormElement | undefined;

      if (!form) {
         return;
      }

      const formData = new FormData(form),
         token = formData.get('token') as string;

      if (!token) {
         return;
      }

      window.location.hash = `#${token}`;
      window.location.reload();
   }
</script>

<main>
   <div class="panel">
      {#if $unauthenticated}
         <form on:submit|preventDefault={setAuthToken}>
            <input type="text" name="token" placeholder="API Token" />
            <button type="submit">Coffee please!</button>
         </form>
      {:else}
         <CoffeeAvailable />
         <LastBrewed />
         <LastReport />
      {/if}

      {#if import.meta.env.DEV}
         <DevControls />
      {/if}
   </div>
</main>

<style>
   main {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
   }
   form {
      display: flex;
      flex-direction: column;
      gap: 8px;
   }
   input {
      font: inherit;
      padding: 8px;
   }
   button {
      font: inherit;
      padding: 8px;
   }
   .panel {
      padding: 16px;
   }
</style>
