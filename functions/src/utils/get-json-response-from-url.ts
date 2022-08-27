import type { IncomingMessage } from 'node:http';
import { Observable, Subject } from 'rxjs';
import * as http from 'http';

function processJsonData<T>(res: IncomingMessage, callback: (json: T) => void) {
  const allData: Uint8Array[] = [];

  res.on('data', chunk => allData.push(chunk));
  res.on('end', () => {
    const jsonData = JSON.parse(Buffer.concat(allData).toString());
    callback(jsonData);
  });
}

export function getJsonResponseFromUrl<T>(url: string, errorMessage: string, authorization?: string): Observable<T> {
  const response = new Subject<T>();

  http.get(url, { headers: { authorization } }, (res) => {
    if (res.statusCode !== 200) {
      response.error(new Error(errorMessage));
      return response.complete();
    }

    processJsonData<T>(res, (json) => {
      response.next(json);
      response.complete();
    });
  });

  return response.asObservable();
}
