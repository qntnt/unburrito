import test from 'ava';
import { delay, from } from 'rxjs';

import { Burrito } from './burrito';

test('fromPromise', async (t) => {
  const promise = new Promise((resolve) => {
    setTimeout(() => resolve(1), 200);
  });
  const burrito = Burrito.wrap(promise);
  const result = await burrito.collect();
  t.deepEqual(result, [1]);
});

test('fromPromiseError', async (t) => {
  const promise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('error')), 200);
  });
  const burrito = Burrito.wrap(promise);
  await t.throwsAsync(burrito.collect());
});

test('fromObservable', async (t) => {
  const observable = from([1, 2, 3]);
  const burrito = Burrito.wrap(observable);
  const result = await burrito.collect();
  t.deepEqual(result, [1, 2, 3]);
});

test('map', async (t) => {
  const burrito = Burrito.wrapAll(1, 2, 3);
  const result = await burrito.map((v) => v + 1).collect();
  t.deepEqual(result, [2, 3, 4]);
});

test('mapArray', async (t) => {
  const burrito = Burrito.wrapAll(1, 2, 4);
  const result = await burrito.map(() => [1, 2, 3]).collect();
  t.deepEqual(result, [
    [1, 2, 3],
    [1, 2, 3],
    [1, 2, 3],
  ]);
});

test('filter', async (t) => {
  const burrito = Burrito.wrapAll(1, 2, 3, 4);
  const result = await burrito.filter((v) => v % 2 === 0).collect();
  t.deepEqual(result, [2, 4]);
});

test('flatten', async (t) => {
  const burrito = Burrito.wrapAll(1, 2, 3);
  const result = burrito.map(() => Burrito.wrapAll(1, 2, 3));
  const flattened = await Burrito.flatten(result).collect();
  t.deepEqual(flattened, [1, 2, 3, 1, 2, 3, 1, 2, 3]);
});

test('tortilla', async (t) => {
  const tortilla = Burrito.tortilla();
  const nev = await tortilla.collect();
  t.deepEqual(nev, []);
});

test('switchMap', async (t) => {
  const burrito = Burrito.wrapAll(1, 2, 3);
  const delayed = Burrito.wrapAll(1).pipe(delay(100));
  const result = await burrito.switchMap(() => delayed).collect();
  t.deepEqual(result, [1]);
});

test('flatMap', async (t) => {
  const burrito = Burrito.wrapAll(1, 2, 3);
  const result = await burrito
    .flatMap(() => Burrito.wrapAll(1, 2, 3))
    .collect();
  t.deepEqual(result, [1, 2, 3, 1, 2, 3, 1, 2, 3]);
});

test('first', async (t) => {
  const burrito = Burrito.wrapAll(1, 2, 3);
  const result = await burrito.first().collect();
  t.deepEqual(result, [1]);
});

test('firstMatch', async (t) => {
  const burrito = Burrito.wrapAll(1, 2, 3);
  const result = await burrito.first((f) => f === 2).collect();
  t.deepEqual(result, [2]);
});

test('distinctUntilChanged', async (t) => {
  const burrito = Burrito.wrapAll(1, 1, 2, 2, 3, 3, 1, 1);
  const result = await burrito.distinctUntilChanged().collect();
  t.deepEqual(result, [1, 2, 3, 1]);
});

test('debounceTime', async (t) => {
  const burrito = Burrito.wrapAll(1, 1, 2, 2, 3, 3);
  const result = await burrito.debounceTime(100).collect();
  t.deepEqual(result, [3]);
});

test('throttleTime', async (t) => {
  const burrito = Burrito.wrapAll(1, 1, 2, 2, 3, 3);
  const result = await burrito.throttleTime(100).collect();
  t.deepEqual(result, [1]);
});

test('unwrap', async (t) => {
  const burrito = Burrito.wrapAll(1, 2, 3);
  const result = burrito.unwrap();
  const values = [];
  await result.forEach((v) => values.push(v));
  t.deepEqual(values, [1, 2, 3]);
});
