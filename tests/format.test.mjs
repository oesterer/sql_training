import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatValue } from '../web/format.js';
const decimal = (scale = 2) => ({ type: { typeId: 7, scale } });
test('exact USD amounts from Arrow decimal word arrays', () => {
  assert.equal(formatValue(new Uint32Array([125000, 0, 0, 0]), decimal()), '1250.00');
  assert.equal(formatValue(new Uint32Array([100001, 0, 0, 0]), decimal()), '1000.01');
  assert.equal(formatValue(new Uint32Array([1, 0, 0, 0]), decimal()), '0.01');
  assert.equal(formatValue(new Uint32Array(4), decimal()), '0.00');
});
test('negative decimals, bigint values and precision above Number.MAX_SAFE_INTEGER', () => {
  assert.equal(formatValue(new Uint32Array([0xffffff9c, 0xffffffff, 0xffffffff, 0xffffffff]), decimal()), '-1.00');
  assert.equal(formatValue(123456789012345678901n, decimal()), '1234567890123456789.01');
  assert.equal(formatValue(-1n, decimal()), '-0.01');
});
test('NULL, strings, dates and timestamps remain readable', () => {
  assert.equal(formatValue(null, decimal()), 'NULL');
  assert.equal(formatValue('Alice', {type: {typeId: 5}}), 'Alice');
  assert.equal(formatValue(Date.UTC(2026, 0, 5), {type: {typeId: 8}}), '2026-01-05');
  assert.equal(formatValue(Date.UTC(2026, 0, 5), {type: {typeId: 10}}), '2026-01-05T00:00:00.000Z');
});
