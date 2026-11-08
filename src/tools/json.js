export function formatJson(input, indentation = 2) {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed, null, indentation);
}

export function minifyJson(input) {
  return JSON.stringify(JSON.parse(input));
}

export function validateJson(input) {
  try {
    JSON.parse(input);
    return { valid: true, message: 'Valid JSON' };
  } catch (error) {
    return { valid: false, message: error.message };
  }
}
