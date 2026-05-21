export function requireString(field: any, fieldName: string) {
  if (typeof field !== 'string' || field.trim().length === 0) {
    const err: any = new Error(`${fieldName} is required`);
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  return field.trim();
}

export function optionalString(field: any) {
  if (field == null) return null;
  if (typeof field !== 'string') return String(field);
  return field.trim();
}
