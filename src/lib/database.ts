import knex from 'knex';
import pg from 'pg';
import { Settings } from '../models';
import { config } from './config';

pg.types.setTypeParser(pg.types.builtins.INT8, (value: string) => {
  return parseInt(value);
});

enum Table {
  Settings = 'settings',
}

export class Database {
  private db;

  constructor() {
    this.db = knex({
      client: 'pg',
      connection: {
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
        database: config.database.database,
        application_name: config.meta.appName,
        ssl: config.database.ssl
          ? {
              rejectUnauthorized: false,
            }
          : false,
      },
    });
  }

  async upsertSettings(userId: string, appId: string, data: unknown): Promise<Settings> {
    return this.db<Settings>(Table.Settings)
      .insert({
        user_id: userId,
        app_id: appId,
        data,
      })
      .onConflict(['user_id', 'app_id'])
      .merge({ data })
      .returning('*')
      .then((res) => res[0]);
  }

  async getSettings(userId: string, appId: string): Promise<Settings | undefined> {
    return this.db<Settings>(Table.Settings).where({ user_id: userId, app_id: appId }).first();
  }

  async deleteSettings(userId: string, appId: string): Promise<void> {
    return this.db<Settings>(Table.Settings).where({ user_id: userId, app_id: appId }).delete();
  }

  // Health

  async testLatency() {
    const before = Date.now();
    await this.db.raw('SELECT 1');
    return Date.now() - before;
  }
}
