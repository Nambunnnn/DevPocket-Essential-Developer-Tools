import test from 'node:test';
import assert from 'node:assert/strict';
import { formatJson, minifyJson, validateJson } from '../src/tools/json.js';
import { generateUuid, generateUuids } from '../src/tools/uuid.js';
import { decodeBase64, encodeBase64 } from '../src/tools/base64.js';
import { analyzeText } from '../src/tools/text.js';
import { convertColor, hexToRgb, parseRgb, rgbToHex, rgbToHsl } from '../src/tools/color.js';

test('formats valid JSON with configurable indentation', () => {
  assert.equal(formatJson('{"name":"DevPocket"}', 4), '{\n    "name": "DevPocket"\n}');
  assert.equal(formatJson('{"ok":true}', '\t'), '{\n\t"ok": true\n}');
});

test('rejects invalid JSON and reports validation errors', () => {
  assert.throws(() => formatJson('{"broken":}'), SyntaxError);
  assert.deepEqual(validateJson('{"broken":}').valid, false);
  assert.match(validateJson('{"broken":}').message, /JSON|property|position/i);
});

test('minifies valid JSON', () => {
  assert.equal(minifyJson('{\n  "items": [1, 2]\n}'), '{"items":[1,2]}');
});

test('generates UUID v4 identifiers and validates requested count', () => {
  const uuid = generateUuid();
  assert.match(uuid, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  const generated = generateUuids(5);
  assert.equal(generated.length, 5);
  assert.equal(new Set(generated).size, 5);
  assert.throws(() => generateUuids(0), RangeError);
  assert.throws(() => generateUuids(101), RangeError);
});

test('encodes and decodes Base64', () => {
  assert.equal(encodeBase64('DevPocket'), 'RGV2UG9ja2V0');
  assert.equal(decodeBase64('RGV2UG9ja2V0'), 'DevPocket');
  assert.throws(() => decodeBase64('not base64!'), /valid Base64/);
});

test('encodes and decodes Unicode as UTF-8', () => {
  const text = 'こんにちは 🌙 café';
  assert.equal(decodeBase64(encodeBase64(text)), text);
  assert.throws(() => decodeBase64('/w=='), /UTF-8/);
});

test('analyzes words, Unicode characters, lines, and reading time', () => {
  assert.deepEqual(analyzeText('Hello   world\n🌙'), {
    words: 3,
    characters: 15,
    charactersWithoutSpaces: 11,
    lines: 2,
    readingTimeMinutes: 1
  });
  assert.deepEqual(analyzeText(''), {
    words: 0,
    characters: 0,
    charactersWithoutSpaces: 0,
    lines: 0,
    readingTimeMinutes: 0
  });
  assert.equal(analyzeText(Array(201).fill('word').join(' ')).readingTimeMinutes, 2);
});

test('counts joined emoji and combining marks as visible characters', () => {
  const stats = analyzeText('👨‍👩‍👧‍👦 e\u0301');
  assert.equal(stats.words, 2);
  assert.equal(stats.characters, 3);
  assert.equal(stats.charactersWithoutSpaces, 2);
});

test('converts HEX, RGB, and HSL values', () => {
  assert.deepEqual(hexToRgb('#f00'), { r: 255, g: 0, b: 0 });
  assert.deepEqual(parseRgb('rgb(255, 0, 0)'), { r: 255, g: 0, b: 0 });
  assert.equal(rgbToHex({ r: 18, g: 52, b: 86 }), '#123456');
  assert.deepEqual(rgbToHsl({ r: 255, g: 0, b: 0 }), { h: 0, s: 100, l: 50 });
  assert.equal(convertColor('#00ff00', 'hex-hsl').output, 'hsl(120, 100%, 50%)');
  assert.equal(convertColor('0, 0, 255', 'rgb-hex').output, '#0000FF');
});

test('rejects invalid color values', () => {
  assert.throws(() => hexToRgb('#12'), /3- or 6-digit HEX/);
  assert.throws(() => parseRgb('rgb(256, 0, 0)'), /0 to 255/);
  assert.throws(() => rgbToHex({ r: -1, g: 0, b: 0 }), /0 to 255/);
  assert.throws(() => convertColor('red', 'hex-rgb'), /3- or 6-digit HEX/);
});
