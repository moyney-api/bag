import { of } from 'rxjs';
import { Currency } from '../../src/models/currency';
import * as currencyExport from '../../src/models/currency';

export const spyOnCurrConverter = (options: { [conversion: string]: number }): jest.SpyInstance => {
  return jest.spyOn(currencyExport, 'priceOfFirstCurrInSecondCurr').mockImplementation((oneOf: Currency, isWorth: Currency) => {
    return of({ price: options[`${oneOf.toLowerCase()}/${isWorth.toLowerCase()}`], date: `${new Date()}`, from: oneOf, to: isWorth });
  });
}
