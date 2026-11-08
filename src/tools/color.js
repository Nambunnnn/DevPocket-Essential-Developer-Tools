function assertChannel(value) {
  if (!Number.isInteger(value) || value < 0 || value > 255) {
    throw new RangeError('RGB channels must be whole numbers from 0 to 255.');
  }
}

export function hexToRgb(input) {
  const match = input.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) throw new Error('Enter a 3- or 6-digit HEX color.');

  let hex = match[1];
  if (hex.length === 3) hex = [...hex].map((digit) => digit + digit).join('');
  const value = Number.parseInt(hex, 16);
  return { r: value >> 16, g: (value >> 8) & 255, b: value & 255 };
}

export function parseRgb(input) {
  const match = input.trim().match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$|^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/i);
  if (!match) throw new Error('Enter RGB as rgb(12, 34, 56) or 12, 34, 56.');
  const channels = match[1] ? match.slice(1, 4) : match.slice(4, 7);
  const rgb = { r: Number(channels[0]), g: Number(channels[1]), b: Number(channels[2]) };
  Object.values(rgb).forEach(assertChannel);
  return rgb;
}

export function rgbToHex({ r, g, b }) {
  [r, g, b].forEach(assertChannel);
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

export function rgbToHsl({ r, g, b }) {
  [r, g, b].forEach(assertChannel);
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (max === red) hue = ((green - blue) / delta) % 6;
    else if (max === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }

  return {
    h: Math.round(hue),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100)
  };
}

export function convertColor(input, conversion) {
  let rgb;
  if (conversion.startsWith('hex-')) rgb = hexToRgb(input);
  else if (conversion.startsWith('rgb-')) rgb = parseRgb(input);
  else throw new Error('Choose a supported color conversion.');

  const hex = rgbToHex(rgb);
  const hsl = rgbToHsl(rgb);
  const output = conversion.endsWith('-rgb')
    ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    : conversion.endsWith('-hex')
      ? hex
      : conversion.endsWith('-hsl')
        ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
        : null;

  if (!output) throw new Error('Choose a supported color conversion.');
  return { output, hex, rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` };
}
