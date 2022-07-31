import { concatMap, defer, expand, from, Observable, of, skipWhile, take, tap } from 'rxjs';
import { admin } from './admin';

function *obsIteratorFromDynamicArray({ dynamicArray }: { dynamicArray: Observable<any>[] }) {
  let index = 0;
  let dynamicArrayHasValues = true;
  let nextObs = dynamicArray[index++];

  while(dynamicArrayHasValues) {
    if (nextObs) yield nextObs;
    else dynamicArrayHasValues = false;
    nextObs = dynamicArray[index++];
  }
}

export class MoyFirestoreManager {
  private fs = admin.firestore();
  private batch = this.fs.batch();
  private batchCount = 0;
  private beforeCommitQueue: Observable<any>[] = [];

  constructor(private collection: string) {}

  ref(id: string): admin.firestore.DocumentReference {
    return this.fs.doc(`${this.collection}/${id}`);
  }

  listRef(prop: string, values: string[]) {
    // gotta add to test mocks
    return this.fs.collection(this.collection).where(prop, 'in', values);
  }

  commitChanges(): Observable<admin.firestore.WriteResult[]> {
    const obsIterator = obsIteratorFromDynamicArray({ dynamicArray: this.beforeCommitQueue });

    return of(true).pipe(
      expand(() => obsIterator.next().value || of('__END__')),
      skipWhile(v => v !== '__END__'),
      take(1),
      concatMap(() => from(this.batch.commit())),
      tap(() => this.reset()),
    );
  }

  expressionToQueue = (expression: Observable<any> | (() => any), sideEffect?: (any?: any) => void): void => {
    if (expression instanceof Observable) {
      this.beforeCommitQueue.push(sideEffect ? expression.pipe(tap({ next: sideEffect })) : expression);
    } else {
      const exprToObs = defer(() => of(expression()));
      this.beforeCommitQueue.push(sideEffect ? exprToObs.pipe(tap({ next: sideEffect })) : exprToObs);
    }
  }

  batchToQueue = (ref: admin.firestore.DocumentReference, body: { [key: string]: any }, sideEffect?: () => void): void => {
    this.batchCount += 1;
    if (this.batchCount >= 15) {
      console.warn('Warning: Only ', 20 - this.batchCount, ' more batch operations allowed');
    }

    const baseExpression = () => this.batch.set(ref, body, { merge: true });
    this.expressionToQueue(baseExpression, sideEffect);
  }

  private reset(): void {
    this.batch = this.fs.batch();
    this.batchCount = 0;
    this.beforeCommitQueue = [];
  }
}
