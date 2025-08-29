import { decodeJwt, jwtDecrypt } from 'jose';
import { writable, type Readable } from 'svelte/store';
import { ZCoffeePotStatusResponsePayload } from '@coffee-pot-monitor/schemas';
import { MOCK_STATE_UPDATE_EVENT } from './constants';

export interface StatusAPI {
   unauthenticated: Readable<boolean>;
   lastBrewed: Readable<Date | undefined>;
   lastReport: Readable<Date | undefined>;
   ouncesAvailable: Readable<number | undefined>;
   refresh?(): Promise<void>;
}

function getToken(): string | undefined {
   return window.location.hash ? window.location.hash.substring(1) : undefined;
}

export function makeStatusAPI(): StatusAPI {
   const unauthenticated = writable<boolean>(!getToken()),
      lastBrewed = writable<Date | undefined>(undefined),
      lastReport = writable<Date | undefined>(undefined),
      ouncesAvailable = writable<number | undefined>(undefined);

   async function refresh() {
      // TODO: Securely validate the token. Right now it's just decoded.
      const token = getToken(),
         apiDomain = token ? decodeJwt(token).aud : undefined;

      if (!token || !apiDomain || typeof apiDomain !== 'string') {
         // TODO: report error to user
         return;
      }

      const resp = await fetch(`https://${apiDomain}/device/status`, {
         headers: { Authorization: `Bearer ${token}` },
      });

      if (!resp.ok) {
         // TODO: report error to user
         return;
      }

      const payloadResult = ZCoffeePotStatusResponsePayload.safeParse(await resp.json());

      if (!payloadResult.success) {
         // TODO: report error to user
         return;
      }

      lastBrewed.set(
         payloadResult.data.lastBrewTimestamp
            ? new Date(payloadResult.data.lastBrewTimestamp * 1000)
            : undefined
      );
      lastReport.set(
         payloadResult.data.lastReportTimestamp
            ? new Date(payloadResult.data.lastReportTimestamp * 1000)
            : undefined
      );
      ouncesAvailable.set(payloadResult.data.approxOuncesOfCoffeeAvailable);
   }

   refresh();
   setInterval(refresh, 60 * 1000);

   return {
      unauthenticated,
      lastBrewed,
      lastReport,
      ouncesAvailable,
      refresh,
   };
}

export function makeMockStatusAPI(): StatusAPI {
   const unauthenticated = writable<boolean>(false),
      lastBrewed = writable<Date | undefined>(undefined),
      lastReport = writable<Date | undefined>(new Date()),
      ouncesAvailable = writable<number | undefined>(14);

   // Mock states matching production API response format
   const mockStates = {
      empty: {
         isCarafePresent: false,
         isCoffeeBrewing: false,
         approxOuncesOfCoffeeAvailable: undefined,
         lastBrewTimestamp: undefined,
         lastReportTimestamp: undefined,
      },
      'no-carafe': {
         isCarafePresent: false,
         isCoffeeBrewing: false,
         approxOuncesOfCoffeeAvailable: undefined,
         lastBrewTimestamp: undefined,
         lastReportTimestamp: Math.floor(Date.now() / 1000),
      },
      'carafe-empty': {
         isCarafePresent: true,
         isCoffeeBrewing: false,
         approxOuncesOfCoffeeAvailable: 0,
         lastBrewTimestamp: undefined,
         lastReportTimestamp: Math.floor(Date.now() / 1000),
      },
      'carafe-half': {
         isCarafePresent: true,
         isCoffeeBrewing: false,
         approxOuncesOfCoffeeAvailable: 7,
         lastBrewTimestamp: Math.floor((Date.now() - 30 * 60 * 1000) / 1000),
         lastReportTimestamp: Math.floor(Date.now() / 1000),
      },
      'carafe-full': {
         isCarafePresent: true,
         isCoffeeBrewing: false,
         approxOuncesOfCoffeeAvailable: 14,
         lastBrewTimestamp: Math.floor((Date.now() - 15 * 60 * 1000) / 1000),
         lastReportTimestamp: Math.floor(Date.now() / 1000),
      },
      'stale-data': {
         isCarafePresent: true,
         isCoffeeBrewing: false,
         approxOuncesOfCoffeeAvailable: 10,
         lastBrewTimestamp: Math.floor((Date.now() - 90 * 60 * 1000) / 1000),
         lastReportTimestamp: Math.floor((Date.now() - 60 * 60 * 1000) / 1000),
      },
      brewing: {
         isCarafePresent: true,
         isCoffeeBrewing: true,
         approxOuncesOfCoffeeAvailable: 3,
         lastBrewTimestamp: Math.floor((Date.now() - 5 * 60 * 1000) / 1000),
         lastReportTimestamp: Math.floor(Date.now() / 1000),
      },
   };

   // Listen for mock state update events
   const handleStateUpdate = (event: CustomEvent<string>) => {
      const state = mockStates[event.detail as keyof typeof mockStates];
      if (!state) return;

      // Process mock data same way as production API response
      ouncesAvailable.set(state.approxOuncesOfCoffeeAvailable);
      lastReport.set(
         state.lastReportTimestamp ? new Date(state.lastReportTimestamp * 1000) : undefined
      );
      lastBrewed.set(
         state.lastBrewTimestamp ? new Date(state.lastBrewTimestamp * 1000) : undefined
      );
   };

   // Add event listener for state updates
   window.addEventListener(MOCK_STATE_UPDATE_EVENT, handleStateUpdate as EventListener);

   // Clean up function to remove event listener
   const cleanup = () => {
      window.removeEventListener(MOCK_STATE_UPDATE_EVENT, handleStateUpdate as EventListener);
   };

   // Store cleanup function for potential future use
   (window as any).__mockStatusAPICleanup = cleanup;

   return {
      unauthenticated,
      lastBrewed,
      lastReport,
      ouncesAvailable,
   };
}
