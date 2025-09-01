import { DurableObject } from 'cloudflare:workers';
import { time } from 'zod/v4/core/regexes.cjs';

export class SensorData extends DurableObject {
   private _sql: SqlStorage;

   constructor(ctx: DurableObjectState, env: unknown) {
      super(ctx, env);
      this._sql = ctx.storage.sql;

      this._sql.exec(`
         CREATE TABLE IF NOT EXISTS SensorData (
            sensorID TEXT NOT NULL,
            datetime TEXT DEFAULT CURRENT_TIMESTAMP,
            value TEXT,
            PRIMARY KEY (sensorID, datetime)
         ) WITHOUT ROWID;
         CREATE INDEX IF NOT EXISTS idxSensorDataDatetime ON SensorData (datetime);
      `);
   }

   async saveData(sensorID: string, value: string, timestamp?: number): Promise<void> {
      if (timestamp) {
         await this._sql.exec(
            `
            INSERT INTO SensorData (sensorID, datetime, value)
            VALUES (?, ?, ?);
         `,
            sensorID,
            new Date(timestamp * 1000).toISOString(),
            value
         );
         return;
      }

      await this._sql.exec(
         `
         INSERT INTO SensorData (sensorID, value)
         VALUES (?, ?);
      `,
         sensorID,
         value
      );
   }

   async getLatestReport(): Promise<{ sensorID: string; timestamp: number; value: string } | null> {
      const result = await this._sql.exec(`
         SELECT sensorID, datetime, value FROM SensorData
          ORDER BY datetime DESC
          LIMIT 1;
      `);

      const row = result.one();

      return {
         sensorID: String(row.sensorID.valueOf()),
         timestamp: new Date(row.datetime.valueOf() as string).getTime() / 1000,
         value: String(row.value),
      };
   }
}
