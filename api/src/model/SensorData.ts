import { DurableObject } from 'cloudflare:workers';

interface SensorReport {
   sensorID: string;
   timestamp: string;
   value: string;
}

export class SensorData extends DurableObject {
   private _sql: SqlStorage;
   private _lastReport?: SensorReport;

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

      this._lastReport = {
         sensorID,
         timestamp: new Date().toISOString(),
         value,
      };

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
      if (!this._lastReport) {
         const result = await this._sql.exec(`
            SELECT sensorID, datetime, value FROM SensorData
            ORDER BY datetime DESC
            LIMIT 1;
         `);

         const row = result.one();

         this._lastReport = {
            sensorID: String(row.sensorID.valueOf()),
            timestamp: row.datetime.valueOf() as string,
            value: String(row.value),
         };
      }

      return {
         sensorID: this._lastReport.sensorID,
         timestamp: new Date(this._lastReport.timestamp).getTime() / 1000,
         value: this._lastReport.value,
      };
   }
}
