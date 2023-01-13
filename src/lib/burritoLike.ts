import { isObservable, Observable } from 'rxjs';

export type BurritoSource<T> = SpaceBurritoSource<T> | TimeBurritoSource<T>;

export type SpaceBurritoSource<T> = T[];

export type TimeBurritoSource<T> = Promise<T> | Observable<T>;

export function isArrayBurritoSource<T>(
  burritoLike: BurritoSource<T>
): burritoLike is T[] {
  return Array.isArray(burritoLike);
}

export function isPromiseBurritoSource<T>(
  burritoLike: BurritoSource<T>
): burritoLike is Promise<T> {
  return typeof (burritoLike as Promise<T>).then === 'function';
}

export function isObservableBurritoSource<T>(
  burritoLike: BurritoSource<T>
): burritoLike is Observable<T> {
  return isObservable(burritoLike);
}

export function isSpaceBurritoSource<T>(
  burritoLike: BurritoSource<T>
): burritoLike is SpaceBurritoSource<T> {
  return isArrayBurritoSource(burritoLike);
}

export function isTimeBurritoSource<T>(
  burritoLike: BurritoSource<T>
): burritoLike is TimeBurritoSource<T> {
  return (
    isPromiseBurritoSource(burritoLike) ||
    isObservableBurritoSource(burritoLike)
  );
}
