export function toDigits(value: string, maxLength = 13): string {
  return value.replace(/\D/g, '').slice(0, maxLength)
}

export function isValidThaiId(value: string): boolean {
  const digits = toDigits(value, 13)
  if (!/^\d{13}$/.test(digits)) {
    return false
  }

  const sum = digits
    .slice(0, 12)
    .split('')
    .reduce((total, digit, index) => total + Number(digit) * (13 - index), 0)
  const checkDigit = (11 - (sum % 11)) % 10

  return checkDigit === Number(digits[12])
}
