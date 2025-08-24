import { Router, IRequest, json, error } from 'itty-router';
import {
   CoffeePotStatusResponsePayload,
   DeviceReportResponsePayload,
   ZDeviceReportRequestPayload,
   ZDeviceReportWeightSensorData,
} from '../../packages/schemas/src/index';
import { CloudFlareArgs } from './worker-types';
import { validateToken } from './middleware/validate-token';

const CORS_HEADERS = Object.freeze({
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Methods': 'GET, OPTIONS',
   'Access-Control-Allow-Headers': 'Content-Type',
});

const WATER_WEIGHT_GRAMS_PER_OZ = 28.35,
   EMPTY_CARAFE_WEIGHT_GRAMS = 1000, // 1kg
   router = Router<IRequest, CloudFlareArgs>();

router.options('*', (): Response => new Response(null, { headers: CORS_HEADERS }));

router.get('/health', (): Response => {
   const body = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
   };

   return json(body, { headers: CORS_HEADERS });
});

router.get('/device/status', validateToken, async (request, env): Promise<Response> => {
   if (
      !Array.isArray(request.token.authorization_details) ||
      !request.token.authorization_details.length
   ) {
      return error(400, 'Invalid JWT');
   }

   const deviceID = request.token.authorization_details[0].deviceID,
      durableObjectID = env.SENSOR_DATA_DO.idFromName(deviceID),
      sensorDataDO = env.SENSOR_DATA_DO.get(durableObjectID);

   const latestReport = await sensorDataDO.getLatestReport();

   if (!latestReport) {
      return error(404, 'No sensor data found for this device');
   }

   const weight = Number(latestReport.value);

   // TODO: real implementation
   return json({
      isCarafePresent: weight > EMPTY_CARAFE_WEIGHT_GRAMS * 0.95, // 95% of carafe weight
      isCoffeeBrewing: false,
      approxOuncesOfCoffeeAvailable: Math.round(
         (weight - EMPTY_CARAFE_WEIGHT_GRAMS) / WATER_WEIGHT_GRAMS_PER_OZ
      ),
      // TODO: lastBrewTimestamp
      lastReportTimestamp: latestReport.timestamp,
   } satisfies CoffeePotStatusResponsePayload);
});

router.post('/device/report', validateToken, async (request, env): Promise<Response> => {
   if (!request.token.sub) {
      return error(400, 'Invalid JWT');
   }

   const reqBody = await request.json(),
      reqPayloadResults = ZDeviceReportRequestPayload.safeParse(reqBody);

   if (!reqPayloadResults.success) {
      return json({ success: false } satisfies DeviceReportResponsePayload, { status: 400 });
   }

   const durableObjectID = env.SENSOR_DATA_DO.idFromName(request.token.sub),
      sensorDataDO = env.SENSOR_DATA_DO.get(durableObjectID);

   // TODO: Right now, there's only usually one report and one sensor per report. If we
   // ever have multiple reports or sensors, this will need to be updated to make fewer
   // queries.
   await Promise.all(
      reqPayloadResults.data.reports.flatMap(report => {
         return report.sensors.map(sensor => {
            return sensorDataDO.saveData(
               sensor.id,
               sensor.value,
               Math.min(report.timestamp, Date.now() / 1000)
            );
         });
      })
   );

   return json({
      success: true,
   } satisfies DeviceReportResponsePayload);
});

router.all('*', (): Response => {
   return new Response('Not Found', { status: 404 });
});

export default {
   async fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> {
      return router.fetch(request, env, ctx);
   },
} satisfies ExportedHandler;

// export the Durable Object class so it can be bound to the Worker
export { SensorData } from './model/SensorData';
