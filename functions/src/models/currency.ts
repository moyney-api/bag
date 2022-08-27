import { map, Observable } from 'rxjs';
import { getJsonResponseFromUrl } from '~/utils';

const CURRENCY_ERROR_MESSAGE = 'Seems like that currency does not exist';

export enum Currency {
  Euro = 'EUR',
  USD = 'USD',
  Bitcoin = 'BTC',
  Ethereum = 'ETH',
}

export type CurrencyResponse = { date: string; price: number; from: Currency; to: Currency };
const CURRENCY_CONVERTER_CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies';
export function priceOfFirstCurrInSecondCurr(oneOf: Currency, isWorth: Currency): Observable<CurrencyResponse> {
  const url = `${CURRENCY_CONVERTER_CDN}/${oneOf.toLowerCase()}/${isWorth.toLowerCase()}.json`;

  return getJsonResponseFromUrl<{ date: string } & { [curr in Currency]: number }>(url, CURRENCY_ERROR_MESSAGE).pipe(
    map(conversionValue => {
      const price = +Object.values(conversionValue)[1];
      return { price, date: conversionValue.date, from: oneOf, to: isWorth };
    }),
  );
}
