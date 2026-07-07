import { DatabaseSync } from 'node:sqlite';

type SQLValue = null | number | bigint | string | NodeJS.ArrayBufferView;

export class NodeSqliteCompat {
  lastID = 0;
  changes = 0;
  private db: DatabaseSync;

  constructor(private path: string) {
    this.db = new DatabaseSync(path);
    this.db.exec('PRAGMA journal_mode=WAL');
    this.db.exec('PRAGMA foreign_keys=ON');
  }

  run(sql: string, ...args: unknown[]): this {
    let params: SQLValue[] = [];
    let callback: ((this: NodeSqliteCompat, err: Error | null) => void) | null = null;

    if (args.length === 1 && typeof args[0] === 'function') {
      callback = args[0] as (this: NodeSqliteCompat, err: Error | null) => void;
    } else if (args.length >= 2) {
      if (Array.isArray(args[0])) {
        params = args[0] as SQLValue[];
      }
      const last = args[args.length - 1];
      if (typeof last === 'function') {
        callback = last as (this: NodeSqliteCompat, err: Error | null) => void;
      }
    }

    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.run(...params);
      this.lastID = Number(result.lastInsertRowid);
      this.changes = Number(result.changes);
      if (callback) callback.call(this, null);
    } catch (err) {
      if (callback) callback.call(this, err as Error);
    }
    return this;
  }

  get(sql: string, params: SQLValue[] | undefined, callback: (this: NodeSqliteCompat, err: Error | null, row?: Record<string, unknown>) => void): this {
    try {
      const stmt = this.db.prepare(sql);
      const row = stmt.get(...(params ?? []));
      callback.call(this, null, row as Record<string, unknown> | undefined);
    } catch (err) {
      callback.call(this, err as Error, undefined);
    }
    return this;
  }

  all(sql: string, params: SQLValue[] | undefined, callback: (this: NodeSqliteCompat, err: Error | null, rows?: Record<string, unknown>[]) => void): this {
    try {
      const stmt = this.db.prepare(sql);
      const rows = stmt.all(...(params ?? []));
      callback.call(this, null, rows as Record<string, unknown>[]);
    } catch (err) {
      callback.call(this, err as Error, []);
    }
    return this;
  }

  exec(sql: string, callback?: (err: Error | null) => void): this {
    try {
      this.db.exec(sql);
      if (callback) callback(null);
    } catch (err) {
      if (callback) callback(err as Error);
    }
    return this;
  }

  close(callback?: (err: Error | null) => void): void {
    try {
      this.db.close();
      if (callback) callback(null);
    } catch (err) {
      if (callback) callback(err as Error);
    }
  }

  on(): this {
    return this;
  }
}
