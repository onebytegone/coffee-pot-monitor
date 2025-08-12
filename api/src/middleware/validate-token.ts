import { IRequestStrict, RequestHandler, error } from 'itty-router';
import { importSPKI, JWTPayload, jwtVerify } from 'jose';
import { CloudFlareArgs } from '../worker-types';

export const validateToken: RequestHandler<IRequestStrict & { token: JWTPayload }, CloudFlareArgs> = async (request, env) => {
   const rawToken = request.headers.get('Authorization')?.replace('Bearer ', '');

   if (!rawToken) {
      return error(403);
   }

   try {
      const publicKey = await importSPKI(env.PUBLIC_KEY, 'RS256'),
            result = await jwtVerify(rawToken, publicKey, { algorithms: [ 'RS256' ] });

      request.token = result.payload;
   } catch (err) {
      return error(403);
   }
}
