import { decodeJwt, jwtDecrypt } from 'jose';
import { writable, type Readable } from 'svelte/store';
import { ZCoffeePotStatusResponsePayload } from '@coffee-pot-monitor/schemas';

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
            ? new Date(payloadResult.data.lastBrewTimestamp)
            : undefined
      );
      lastReport.set(
         payloadResult.data.lastReportTimestamp
            ? new Date(payloadResult.data.lastReportTimestamp)
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
