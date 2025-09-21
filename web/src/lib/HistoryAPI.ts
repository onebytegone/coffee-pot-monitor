import { decodeJwt } from 'jose';
import { writable, type Readable } from 'svelte/store';
import { ZCoffeePotHistoryResponsePayload } from '@coffee-pot-monitor/schemas';

interface DataPoint {
   timestamp: number;
   ouncesAvailable: number;
}

export interface HistoryAPI {
   unauthenticated: Readable<boolean>;
   dataPoints: Readable<DataPoint[]>;
   refresh?(): Promise<void>;
}

function getToken(): string | undefined {
   return window.location.hash ? window.location.hash.substring(1) : undefined;
}

export function makeHistoryAPI(): HistoryAPI {
   const unauthenticated = writable<boolean>(!getToken()),
      dataPoints = writable<DataPoint[]>([]);

   async function refresh() {
      // TODO: Securely validate the token. Right now it's just decoded.
      const token = getToken(),
         apiDomain = token ? decodeJwt(token).aud : undefined;

      if (!token || !apiDomain || typeof apiDomain !== 'string') {
         // TODO: report error to user
         return;
      }

      const resp = await fetch(`https://${apiDomain}/device/history`, {
         headers: { Authorization: `Bearer ${token}` },
      });

      if (!resp.ok) {
         // TODO: report error to user
         return;
      }

      const payloadResult = ZCoffeePotHistoryResponsePayload.safeParse(await resp.json());

      if (!payloadResult.success) {
         // TODO: report error to user
         return;
      }

      dataPoints.set(
         payloadResult.data.dataPoints.map(dp => {
            return {
               timestamp: dp.timestamp,
               ouncesAvailable: dp.approxOuncesOfCoffeeAvailable ?? 0,
            };
         })
      );
   }

   refresh();
   setInterval(refresh, 5 * 60 * 1000);

   return {
      unauthenticated,
      dataPoints,
      refresh,
   };
}
