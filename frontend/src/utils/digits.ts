export function toDigits(value: string, maxLength = 13): string {
  return value.replace(/\D/g, '').slice(0, maxLength)
}
