const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function encodeBase64(input) {
  const bytes = new TextEncoder().encode(input);
  let encoded = '';

  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    encoded += alphabet[first >> 2];
    encoded += alphabet[((first & 3) << 4) | ((second ?? 0) >> 4)];
    encoded += second === undefined ? '=' : alphabet[((second & 15) << 2) | ((third ?? 0) >> 6)];
    encoded += third === undefined ? '=' : alphabet[third & 63];
  }

  return encoded;
}

export function decodeBase64(input) {
  const normalized = input.replace(/\s+/g, '');
  if (normalized.length % 4 !== 0 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(normalized)) {
    throw new Error('Enter valid Base64 text.');
  }

  const bytes = [];
  for (let index = 0; index < normalized.length; index += 4) {
    const chunk = normalized.slice(index, index + 4);
    const values = [...chunk].map((character) => character === '=' ? 0 : alphabet.indexOf(character));
    bytes.push((values[0] << 2) | (values[1] >> 4));
    if (chunk[2] !== '=') bytes.push(((values[1] & 15) << 4) | (values[2] >> 2));
    if (chunk[3] !== '=') bytes.push(((values[2] & 3) << 6) | values[3]);
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
  } catch {
    throw new Error('Base64 input does not contain valid UTF-8 text.');
  }
}
