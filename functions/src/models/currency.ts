import type { IncomingMessage } from 'node:http';
import { map, Observable, Subject } from 'rxjs';
import * as https from 'https';

export enum Currency {
  Euro = 'EUR',
  USD = 'USD',
  Bitcoin = 'BTC',
  Ethereum = 'ETH',
}

function processJsonData<T>(res: IncomingMessage, callback: (json: T) => void) {
  const allData: Uint8Array[] = [];

  res.on('data', chunk => allData.push(chunk));
  res.on('end', () => {
    const jsonData = JSON.parse(Buffer.concat(allData).toString());
    callback(jsonData);
  });
}

function getJsonResponseFromUrl<T>(url: string): Observable<T> {
  const response = new Subject<T>();

  https.get(url, (res) => {
    if (res.statusCode !== 200) {
      response.error(new Error('Seems like that currency does not exist'));
      return response.complete();
    }

    processJsonData<T>(res, (json) => {
      response.next(json);
      response.complete();
    });
  });

  return response.asObservable();
}

export type CurrencyResponse = { date: string; price: number; from: Currency; to: Currency };
const CURRENCY_CONVERTER_CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies';
export function priceOfFirstCurrInSecondCurr(oneOf: Currency, isWorth: Currency): Observable<CurrencyResponse> {
  const url = `${CURRENCY_CONVERTER_CDN}/${oneOf.toLowerCase()}/${isWorth.toLowerCase()}.json`;

  return getJsonResponseFromUrl<{ date: string } & { [curr in Currency]: number }>(url).pipe(
    map(conversionValue => {
      const price = +Object.values(conversionValue)[1];
      return { price, date: conversionValue.date, from: oneOf, to: isWorth };
    }),
  );
}
