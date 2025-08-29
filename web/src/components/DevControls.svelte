<script lang="ts">
   import { MOCK_STATE_UPDATE_EVENT } from '../lib/constants';

   const mockStates = [
      { id: 'empty', label: '❌ No sensor data', description: '404 state' },
      { id: 'no-carafe', label: '🚫 No carafe', description: 'No carafe present' },
      { id: 'carafe-empty', label: '☕ Empty carafe', description: '0 oz coffee' },
      { id: 'carafe-half', label: '🟡 Half full', description: '~7 oz coffee' },
      { id: 'carafe-full', label: '🟢 Full carafe', description: '~14 oz coffee' },
      { id: 'stale-data', label: '⏰ Stale data', description: '1 hour old data' },
      { id: 'brewing', label: '🔥 Brewing', description: 'Coffee brewing simulation' },
   ];

   function updateMockState(stateId: string) {
      // Dispatch custom event that MockStatusAPI will listen to
      const event = new CustomEvent(MOCK_STATE_UPDATE_EVENT, {
         detail: stateId,
      });
      window.dispatchEvent(event);
   }
</script>

<div class="dev-controls">
   <h3>🛠️ Dev Controls</h3>
   <div class="buttons">
      {#each mockStates as state}
         <button
            class="mock-button"
            on:click={() => updateMockState(state.id)}
            title={state.description}
         >
            {state.label}
         </button>
      {/each}
   </div>
</div>

<style>
   .dev-controls {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      max-width: 200px;
      z-index: 1000;
   }

   .dev-controls h3 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
   }

   .buttons {
      display: flex;
      flex-direction: column;
      gap: 6px;
   }

   .mock-button {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      text-align: left;
      transition: background-color 0.2s;
   }

   .mock-button:hover {
      background: rgba(255, 255, 255, 0.2);
   }

   .mock-button:active {
      background: rgba(255, 255, 255, 0.3);
   }
</style>
