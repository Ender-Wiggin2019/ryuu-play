const emailPattern = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/;

export function isValidLoginName(value: string): boolean {
  const v = value.trim();
  return v.length >= 3 && v.length <= 32;
}

export function isValidPlayerName(value: string): boolean {
  return /^[a-zA-Z0-9]{3,32}$/.test(value);
}

export function isValidEmail(value: string): boolean {
  return value.length <= 128 && emailPattern.test(value.toLowerCase());
}

export function isValidPassword(value: string, minLength = 5): boolean {
  if (value.length < minLength || value.length > 32) {
    return false;
  }
  return !/\s/.test(value);
}
