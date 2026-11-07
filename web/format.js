/** Render Arrow values without losing integer precision or decimal scale. */
export function formatValue(value, field) {
  if (value === null || value === undefined) return 'NULL';
  const type = field.type;
  if (type.typeId === 7) {
    let raw;
    if (ArrayBuffer.isView(value)) {
      // Arrow decimal integers are signed, little-endian 32-bit words.
      const words = new Uint32Array(value.buffer, value.byteOffset, value.byteLength / 4);
      raw = 0n;
      for (let i = words.length - 1; i >= 0; i--) raw = (raw << 32n) | BigInt(words[i]);
      raw = BigInt.asIntN(words.length * 32, raw);
    } else raw = BigInt(value.toString());
    const sign = raw < 0n ? '-' : '';
    if (raw < 0n) raw = -raw;
    const scale = type.scale;
    if (scale < 0) return sign + raw.toString() + '0'.repeat(-scale);
    const digits = raw.toString().padStart(scale + 1, '0');
    return scale ? sign + digits.slice(0, -scale) + '.' + digits.slice(-scale) : sign + digits;
  }
  if ((type.typeId === 8 || type.typeId === 10) && typeof value === 'number') {
    const date = new Date(value);
    return type.typeId === 8 ? date.toISOString().slice(0, 10) : date.toISOString();
  }
  return String(value);
}
