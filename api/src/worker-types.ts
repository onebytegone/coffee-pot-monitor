import type { SensorData } from './model/SensorData';

export type CloudFlareEnvironmentVars = {
   PUBLIC_KEY: string;
   SENSOR_DATA_DO: DurableObjectNamespace<SensorData>;
};
export type CloudFlareArgs = [CloudFlareEnvironmentVars, ExecutionContext];
