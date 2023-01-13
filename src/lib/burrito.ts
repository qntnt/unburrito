import {
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  first,
  map,
  mergeMap,
  Observable,
  from as observableFrom,
  Observer,
  OperatorFunction,
  SubscriptionLike,
  switchMap,
  throttleTime,
} from 'rxjs';

import { BurritoSource } from './burritoLike';

type BurritoObserver<Value> =
  | Partial<Observer<Value>>
  | ((value: Value) => void);

export type BurritoLike<T> = BurritoSource<T> | Burrito<T>;

type TimeFillingSequence<T> = Observable<T>;
type FillingSequence<T> = TimeFillingSequence<T>;

function unwrapIfBurrito<T>(burritoLike: BurritoLike<T>): BurritoSource<T> {
  if (Burrito.isBurrito(burritoLike)) {
    return burritoLike.unwrap();
  }
  return burritoLike;
}

export class Burrito<
  Filling,
  FS extends FillingSequence<Filling> = FillingSequence<Filling>
> {
  private readonly fillingSequence: FS;

  private constructor(fillingSequence: FS) {
    this.fillingSequence = fillingSequence;
  }

  static isBurrito<T>(burritoLike: BurritoLike<T>): burritoLike is Burrito<T> {
    return (burritoLike as Burrito<T>).fillingSequence !== undefined;
  }

  private static from<T>(burritoLike: BurritoLike<T>): Burrito<T> {
    if (Burrito.isBurrito(burritoLike)) {
      return burritoLike;
    }
    return new Burrito(observableFrom(burritoLike));
  }

  pipe<MappedFilling>(operator: OperatorFunction<Filling, MappedFilling>) {
    return Burrito.wrap(this.unwrap().pipe(operator));
  }

  map<MappedValue>(
    transform: (filling: Filling) => MappedValue
  ): Burrito<MappedValue> {
    return this.pipe(map(transform));
  }

  filter(
    predicate: (filling: Filling, index: number) => boolean
  ): Burrito<Filling> {
    return this.pipe(filter(predicate));
  }

  switchMap<MappedValue>(
    transform: (filling: Filling) => BurritoLike<MappedValue>
  ): Burrito<MappedValue> {
    return this.pipe(
      switchMap((v) => {
        return unwrapIfBurrito(transform(v));
      })
    );
  }

  flatMap<MappedValue>(
    transform: (filling: Filling) => BurritoLike<MappedValue>
  ): Burrito<MappedValue> {
    return this.pipe(
      mergeMap((v) => {
        return unwrapIfBurrito(transform(v));
      })
    );
  }

  debounceTime(dueTime: number): Burrito<Filling> {
    return this.pipe(debounceTime(dueTime));
  }

  throttleTime(duration: number): Burrito<Filling> {
    return this.pipe(throttleTime(duration));
  }

  distinctUntilChanged(
    comparator?: (previous: Filling, next: Filling) => boolean
  ): Burrito<Filling> {
    return this.pipe(distinctUntilChanged(comparator));
  }

  first(
    predicate?: (filling: Filling, index: number) => boolean,
    defaultFilling?: Filling
  ): Burrito<Filling> {
    return this.pipe(first(predicate, defaultFilling));
  }

  delay(due: number | Date): Burrito<Filling> {
    return this.pipe(delay(due));
  }

  async collect(): Promise<Filling[]> {
    const collection = [];
    await this.fillingSequence.forEach((v) => {
      collection.push(v);
    });
    return collection;
  }

  unwrap(): FS {
    return this.fillingSequence;
  }

  subscribe(observer: BurritoObserver<Filling>): SubscriptionLike {
    return this.fillingSequence.subscribe(observer);
  }

  static wrap<T>(fillingSource: BurritoLike<T>): Burrito<T> {
    return Burrito.from(fillingSource);
  }

  static wrapAll<T>(...fillingSource: T[]) {
    return Burrito.wrap(fillingSource);
  }

  static flatten<T>(burrito: Burrito<BurritoLike<T>>): Burrito<T> {
    return Burrito.wrap(
      burrito.unwrap().pipe(
        mergeMap((v) => {
          if (Burrito.isBurrito(v)) {
            return v.unwrap();
          } else {
            return v;
          }
        })
      )
    );
  }

  static tortilla(): Burrito<never> {
    return Burrito.wrapAll();
  }
}
