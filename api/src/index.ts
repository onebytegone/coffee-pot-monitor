import { Router, IRequest, json, error } from 'itty-router';
import { DeviceReportResponsePayload, ZDeviceReportRequestPayload } from '../../packages/schemas/src/index';
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
