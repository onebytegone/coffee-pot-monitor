import { z } from 'zod';

// IoT sensor request/response schemas

export const ZDeviceReportWeightSensorData = z.object({
   type: z.literal('weight'),
   id: z.string().min(1),
   value: z.string(),
});

export type DeviceReportWeightSensorDataSchema = z.infer<typeof ZDeviceReportWeightSensorData>;

export const ZDeviceReportRequestPayload = z.object({
   reports: z.array(
      z.object({
         sensors: z.array(ZDeviceReportWeightSensorData),

         /**
          * The seconds since the epoch (Unix timestamp).  If not provided, the server will use
          * the current timestamp.
          */
         timestamp: z.number().int().positive().optional(),
      })
   ),
});

export type DeviceReportRequestPayload = z.infer<typeof ZDeviceReportRequestPayload>;

export const ZDeviceReportResponsePayload = z.object({
   success: z.boolean(),
});

export type DeviceReportResponsePayload = z.infer<typeof ZDeviceReportResponsePayload>;

// Web UI request/response schemas

export const ZCoffeePotStatusResponsePayload = z.object({
   isCarafePresent: z.boolean(),
   isCoffeeBrewing: z.boolean(),
   approxOuncesOfCoffeeAvailable: z.number().int().nonnegative().optional(),
   lastBrewTimestamp: z.number().int().positive().optional(),
   lastReportTimestamp: z.number().int().positive().optional(),
});

export type CoffeePotStatusResponsePayload = z.infer<typeof ZCoffeePotStatusResponsePayload>;

export const ZCoffeePotHistoryResponsePayload = z.object({
   dataPoints: z.array(
      z.object({
         timestamp: z.number().int().positive(),
         approxOuncesOfCoffeeAvailable: z.number().int().nonnegative().optional(),
         rawDataValue: z.string(),
      })
   ),
});

export type CoffeePotHistoryResponsePayload = z.infer<typeof ZCoffeePotHistoryResponsePayload>;
