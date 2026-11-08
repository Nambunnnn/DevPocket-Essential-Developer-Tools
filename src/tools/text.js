const characterSegmenter = typeof Intl.Segmenter === 'function'
  ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  : null;

function countCharacters(input) {
  return characterSegmenter
    ? [...characterSegmenter.segment(input)].length
    : [...input].length;
}

export function analyzeText(input) {
  const trimmed = input.trim();
  const words = trimmed ? trimmed.split(/\s+/u).length : 0;
  const characters = countCharacters(input);
  const charactersWithoutSpaces = countCharacters(input.replace(/\s/gu, ''));
  const lines = input.length === 0 ? 0 : input.split(/\r\n|\r|\n/).length;

  return {
    words,
    characters,
    charactersWithoutSpaces,
    lines,
    readingTimeMinutes: words === 0 ? 0 : Math.max(1, Math.ceil(words / 200))
  };
}
