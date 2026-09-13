import fs from 'fs';
import dayjs from 'dayjs';
import path from 'path';

import { LastUpdateInfo } from './LastUpdateInfo';

export class LastUpdateStorage {
  constructor(
    public readonly path: string) { }

  private lastUpdates?: Map<string, LastUpdateInfo>;

  get(name: string): LastUpdateInfo | undefined {
    const lastUpdates = this.getLastUpdates();
    return lastUpdates.get(name);
  }

  set(name: string): void {
    const lastUpdates = this.getLastUpdates();

    lastUpdates.set(name, {
      timestamp: dayjs(),
    });

    this.saveLastUpdates();
  }

  private getLastUpdates() {
    if (!this.lastUpdates) {
      this.lastUpdates = new Map();

      if (fs.existsSync(this.path)) {
        const data = fs.readFileSync(this.path).toString();
        const json = JSON.parse(data) as Readonly<Record<string, {
          readonly timestamp: string;
          readonly idle?: true;
        }>>;

        const entries = Object.entries(json);
        for (const [name, entry] of entries) {
          const lastUpdate: LastUpdateInfo = {
            timestamp: dayjs(entry.timestamp),
          };

          this.lastUpdates.set(name, lastUpdate);
        }
      }
    }

    return this.lastUpdates;
  }

  private saveLastUpdates(): void {
    if (this.lastUpdates) {
      if (this.lastUpdates.size) {
        const dir = path.dirname(this.path);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, {
            recursive: true,
          });
        }

        const entries = Array.from(this.lastUpdates)
          .map(([name, item]) => [name, {
            timestamp: item.timestamp.toISOString(),
          }])
          .sort();

        const json = Object.fromEntries(entries) as unknown;
        const data = JSON.stringify(json, null, 2);
        fs.writeFileSync(this.path, data + '\n');
      }
      else {
        fs.rmSync(this.path, {
          force: true,
        });
      }
    }
  }
}
