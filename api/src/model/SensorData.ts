import { DurableObject } from 'cloudflare:workers';

interface SensorReport {
   sensorID: string;
   datetime: string;
   value: string;
}

export class SensorData extends DurableObject {
   private _sql: SqlStorage;
   private _recentReports: SensorReport[] = [];

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

      const result = this._sql.exec(`
         SELECT sensorID
              , datetime
              , value
           FROM SensorData
          WHERE datetime >= datetime('now', '-5 minutes')
          ORDER BY datetime DESC
          LIMIT 100;
      `);

      this._recentReports = result.toArray().map(mapRowToReport);
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

      this._recentReports.push({ sensorID, datetime: new Date().toISOString(), value });
      this._recentReports.sort(compareDatetimeDescending);
      this._recentReports = this._recentReports.slice(0, 100);

      await this._sql.exec(
         `
         INSERT INTO SensorData (sensorID, value)
         VALUES (?, ?);
      `,
         sensorID,
         value
      );
   }

   async getLatestReport(): Promise<{
      sensorID: string;
      timestamp: number;
      value: string;
   } | null> {
      if (this._recentReports.length === 0) {
         return null;
      }

      this._recentReports.sort(compareDatetimeDescending);

      const latest = this._recentReports[0];

      return {
         sensorID: latest.sensorID,
         timestamp: mapDateTimeToTimestamp(latest.datetime),
         value: latest.value,
      };
   }

   async listHistoricalReports(): Promise<
      { sensorID: string; timestamp: number; value: string }[]
   > {
      this._recentReports.sort(compareDatetimeDescending);

      if (shouldLoadHistoricalData(this._recentReports)) {
         const result = this._sql.exec(`
            SELECT sensorID
                 , datetime
                 , value
            FROM SensorData
            WHERE datetime >= datetime('now', '-12 hours')
            ORDER BY datetime DESC
            LIMIT 5000;
         `);

         this._recentReports = dedupeByTimestamp(result.toArray().map(mapRowToReport));
      }

      return this._recentReports.map(report => ({
         sensorID: report.sensorID,
         timestamp: mapDateTimeToTimestamp(report.datetime),
         value: report.value,
      }));
   }
}

function mapRowToReport(row: Record<string, SqlStorageValue>): SensorReport {
   return {
      sensorID: String(row.sensorID.valueOf()),
      datetime: row.datetime.valueOf() as string,
      value: String(row.value),
   };
}

function mapDateTimeToTimestamp(datetime: string): number {
   return Math.floor(new Date(datetime).getTime() / 1000);
}

function compareDatetimeDescending(a: SensorReport, b: SensorReport): number {
   return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
}

function dedupeByTimestamp(reports: SensorReport[]): SensorReport[] {
   const deduped = reports.reduce(
      (memo, report) => {
         memo[report.datetime] = report;
         return memo;
      },
      {} as Record<string, SensorReport>
   );

   return Object.values(deduped).sort(compareDatetimeDescending);
}

function shouldLoadHistoricalData(reports: SensorReport[]): boolean {
   if (reports.length === 0) {
      return true;
   }

   const earliest = new Date(reports[reports.length - 1].datetime).getTime();

   return Date.now() - earliest < 12 * 60 * 60 * 1000; // 12 hours
}
