import { admin } from '../../src/firebase';
import { BagData } from '../../src/models/bag';
import { Currency } from '../../src/models/currency';
import * as currencyExport from '../../src/models/currency';
import { FAKE_BAG_DB } from './mockDb';
import { of } from 'rxjs';

export class FirestoreMock {
  private db: typeof FAKE_BAG_DB = { bags: {} };
  private fs = admin.firestore();

  constructor() {
    this.spyOnBatch();
    this.spyOnDoc();
  }

  get(id: string): BagData {
    return this.db.bags[id];
  }

  reset(): void {
    this.db = this.deepCopy(FAKE_BAG_DB);
  }

  spyOnDoc = (): jest.SpyInstance => {
    return jest.spyOn(this.fs, 'doc').mockImplementation((wholePath: string) => {
      return this.getObjectRerferenceForPath(wholePath, this.db);
    });
  }

  spyOnBatch = (): jest.SpyInstance => {
    return jest.spyOn(this.fs, 'batch').mockImplementation(() => {
      const batchInstance: any = {
        __changes: this.deepCopy(this.db),
        commit: () => {
          return new Promise<void>((resolves) => {
            this.db = batchInstance.__changes;
            resolves();
          });
        },
        set: (doc: { id: string; path: string; data: () => any }, value: any) => {
          const ref = this.getObjectRerferenceForPath(doc.path, batchInstance.__changes).__result;

          for (let parentKey in value) {
            const splittedKeys = parentKey.split('.');
            splittedKeys.reduce((obj, _key, index) => {
              if ((splittedKeys.length - 1) <= index) {
                obj[_key] = value[parentKey];
                return;
              }

              if (!obj[_key]) obj[_key] = {};
              return obj[_key];
            }, ref);
          }
        },
      };

      return batchInstance;
    });
  }

  spyOnCurrConverter = (options: { [conversion: string]: number }): jest.SpyInstance => {
    return jest.spyOn(currencyExport, 'priceOfFirstCurrInSecondCurr').mockImplementation((oneOf: Currency, isWorth: Currency) => {
      return of({ price: options[`${oneOf.toLowerCase()}/${isWorth.toLowerCase()}`], date: `${new Date()}`, from: oneOf, to: isWorth });
    });
  }

  // todo: separate this into its own class
  private getObjectRerferenceForPath = (path: string, from: { [property: string]: any }): any => {
    let id = '';
    const splitted = path.split('/');

    const resultingData = splitted.reduce((result, _path) => {
      if (result[_path]) {
        result[_path] = { ...result[_path] };
        id = _path;
      } else {
        throw new Error('User does not exist');
      }
      return result[_path];
    }, from);

    return {
      id,
      path,
      get() {
        return new Promise((resolves) => {
          resolves({ id, path, data: () => resultingData });
        });
      },
      __result: resultingData,
    }
  }

  private deepCopy<T>(db: T): T {
    return Object.keys(db).reduce((built, key) => {
      if (typeof built[key] === 'object') {
        built[key] = this.deepCopy(built[key]);
      }
      return built;
    }, { ...db } as any);
  }
}
