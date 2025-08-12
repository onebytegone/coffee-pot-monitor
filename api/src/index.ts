import { Router, IRequest, json, error } from 'itty-router';
import { CoffeePotStatusResponsePayload, DeviceReportResponsePayload, ZDeviceReportRequestPayload } from '../../packages/schemas/src/index';
import { CloudFlareArgs } from './worker-types';
import { validateToken } from './middleware/validate-token';

const CORS_HEADERS = Object.freeze({
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Methods': 'GET, OPTIONS',
   'Access-Control-Allow-Headers': 'Content-Type',
});

const router = Router<IRequest, CloudFlareArgs>();

router.options('*', (): Response => new Response(null, { headers: CORS_HEADERS }))

router.get('/health', (): Response => {
   const body = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
   };

   return json(body, { headers: CORS_HEADERS });
});

router.get('/device/status', validateToken, async (request): Promise<Response> => {
   if (!Array.isArray(request.token.authorization_details) || !request.token.authorization_details.length) {
      return error(400, 'Invalid JWT');
   }

   // TODO: real implementation
   return json({
      isCarafePresent: true,
      isCoffeeBrewing: false,
      approxOuncesOfCoffeeAvailable: 42,
      lastBrewTimestamp: Math.floor(Date.now() / 1000) - (60 * 60), // 1 hour ago
      lastReportTimestamp: Math.floor(Date.now() / 1000) - (60 * 5), // 5 minutes ago
   } satisfies CoffeePotStatusResponsePayload);
});

router.post('/device/report', validateToken, async (request): Promise<Response> => {
   if (!request.token.sub) {
      return error(400, 'Invalid JWT');
   }

   const reqBody = await request.json(),
         reqPayloadResults = ZDeviceReportRequestPayload.safeParse(reqBody);

   if (!reqPayloadResults.success) {
      return json({ success: false } satisfies DeviceReportResponsePayload, { status: 400 });
   }

   // TODO: parse and validate body

   return json({
      success: true,
   } satisfies DeviceReportResponsePayload);
});

router.all('*', (): Response => { return new Response('Not Found', { status: 404 }); });

export default {
   async fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> {
      return router.fetch(request, env, ctx)
   },
} satisfies ExportedHandler;
