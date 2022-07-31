import { combineLatest, concatMap, defaultIfEmpty, defer, expand, from, Observable, of, skipWhile, take, tap } from 'rxjs';
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
  private readDeps: { [byProp: string]: string[] } = {};
  private beforeCommitQueue: Observable<any>[] = [];
  private dependenciesMap: { [documentId: string]: any } = {};

  constructor(private collection: string) {}

  ref= (id: string): admin.firestore.DocumentReference => {
    return this.fs.doc(`${this.collection}/${id}`);
  }

  readToQueue = (prop: string, values: string[]): void => {
    this.readDeps[prop] = [...new Set([...(this.readDeps[prop] || []), ...values])];
  }

  readDependency = (uid: string): any => {
    return this.dependenciesMap[uid];
  }

  commitChanges(): Observable<admin.firestore.WriteResult[]> {
    const obsIterator = obsIteratorFromDynamicArray({ dynamicArray: this.beforeCommitQueue });

    return this.readsBeforeTriggeringCommit().pipe(
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
    this.dependenciesMap = {};
    this.readDeps = {};
  }

  private readsBeforeTriggeringCommit(): Observable<any> {
    const populateDependencies = Object.keys(this.readDeps).map((property: string) => {
      return from(this.fs.collection(this.collection).where(property, 'in', this.readDeps[property]).get())
        .pipe(
          tap(query => {
            query.docs.forEach(
              d => this.dependenciesMap[d.id] = { ...d.data(), uid: d.id }
            );
          }),
        )
    });

    return combineLatest(populateDependencies).pipe(defaultIfEmpty(of(true)));
  }
}
