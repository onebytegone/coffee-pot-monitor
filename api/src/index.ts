import { Router } from '../../node_modules/itty-router/Router';

const CORS_HEADERS = Object.freeze({
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Methods': 'GET, OPTIONS',
   'Access-Control-Allow-Headers': 'Content-Type',
});

const router = Router();

router.options('*', (): Response => new Response(null, { headers: CORS_HEADERS }))

router.get('/health', (): Response => {
   const body = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
   };

   return new Response(JSON.stringify(body), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
   });
});

router.all('*', (): Response => { return new Response('Not Found', { status: 404 }); });

export default {
   async fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> {
      return router.handle(request, env, ctx)
   },
} satisfies ExportedHandler;
