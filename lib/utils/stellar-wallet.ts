const SECRET_VERSION_BYTE = 18 << 3;
const PUBLIC_VERSION_BYTE = 6 << 3;
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const ZERO = BigInt(0);
const ONE = BigInt(1);
const P = (ONE << BigInt(255)) - BigInt(19);
const D = mod(-BigInt(121665) * invert(BigInt(121666)));
const BASE_POINT: Point = {
  x: BigInt("15112221349535400772501151409588531511454012693041857206046113283949847762202"),
  y: BigInt("46316835694926478169428394003475163141307993866256225615783033603165251855960"),
};

type Point = {
  x: bigint;
  y: bigint;
};

function mod(value: bigint) {
  const result = value % P;
  return result >= ZERO ? result : result + P;
}

function pow(base: bigint, exponent: bigint) {
  let result = ONE;
  let current = mod(base);
  let power = exponent;

  while (power > ZERO) {
    if (power & ONE) result = mod(result * current);
    current = mod(current * current);
    power >>= ONE;
  }

  return result;
}

function invert(value: bigint) {
  return pow(value, P - BigInt(2));
}

function addPoints(a: Point, b: Point): Point {
  const xNumerator = mod(a.x * b.y + b.x * a.y);
  const yNumerator = mod(a.y * b.y + a.x * b.x);
  const factor = mod(D * a.x * b.x * a.y * b.y);

  return {
    x: mod(xNumerator * invert(ONE + factor)),
    y: mod(yNumerator * invert(ONE - factor)),
  };
}

function scalarMultiply(scalar: bigint) {
  let point: Point = { x: ZERO, y: ONE };
  let addend = BASE_POINT;
  let value = scalar;

  while (value > ZERO) {
    if (value & ONE) point = addPoints(point, addend);
    addend = addPoints(addend, addend);
    value >>= ONE;
  }

  return point;
}

function bytesToBigIntLE(bytes: Uint8Array) {
  let value = ZERO;
  for (let index = bytes.length - 1; index >= 0; index -= 1) {
    value = (value << BigInt(8)) + BigInt(bytes[index]);
  }
  return value;
}

function bigIntToBytesLE(value: bigint, length: number) {
  const bytes = new Uint8Array(length);
  let current = value;
  for (let index = 0; index < length; index += 1) {
    bytes[index] = Number(current & BigInt(255));
    current >>= BigInt(8);
  }
  return bytes;
}

function crc16XModem(bytes: Uint8Array) {
  let crc = 0;
  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc;
}

function base32Decode(value: string) {
  let bits = 0;
  let buffer = 0;
  const output: number[] = [];

  for (const char of value.replace(/=+$/, "").toUpperCase()) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) throw new Error("Invalid Stellar secret key");
    buffer = (buffer << 5) | index;
    bits += 5;
    if (bits >= 8) {
      output.push((buffer >> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(output);
}

function base32Encode(bytes: Uint8Array) {
  let bits = 0;
  let buffer = 0;
  let output = "";

  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(buffer >> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) output += BASE32_ALPHABET[(buffer << (5 - bits)) & 31];
  return output;
}

function decodeStrKey(value: string, expectedVersion: number) {
  const decoded = base32Decode(value);
  if (decoded.length !== 35 || decoded[0] !== expectedVersion) {
    throw new Error("Invalid Stellar secret key");
  }

  const payload = decoded.slice(0, 33);
  const checksum = decoded[33] | (decoded[34] << 8);
  if (crc16XModem(payload) !== checksum) {
    throw new Error("Invalid Stellar secret key checksum");
  }

  return decoded.slice(1, 33);
}

function encodeStrKey(payload: Uint8Array, version: number) {
  const data = new Uint8Array(35);
  data[0] = version;
  data.set(payload, 1);
  const checksum = crc16XModem(data.slice(0, 33));
  data[33] = checksum & 255;
  data[34] = checksum >> 8;
  return base32Encode(data);
}

async function sha512(bytes: Uint8Array) {
  const hash = await crypto.subtle.digest("SHA-512", bytes);
  return new Uint8Array(hash);
}

export function isValidStellarSecretKey(value: string) {
  try {
    decodeStrKey(value.trim(), SECRET_VERSION_BYTE);
    return true;
  } catch {
    return false;
  }
}

export async function derivePublicKeyFromSecret(secretKey: string) {
  const seed = decodeStrKey(secretKey.trim(), SECRET_VERSION_BYTE);
  const digest = await sha512(seed);
  const scalarBytes = digest.slice(0, 32);
  scalarBytes[0] &= 248;
  scalarBytes[31] &= 127;
  scalarBytes[31] |= 64;

  const point = scalarMultiply(bytesToBigIntLE(scalarBytes));
  const publicKey = bigIntToBytesLE(point.y, 32);
  if (point.x & ONE) publicKey[31] |= 128;

  return encodeStrKey(publicKey, PUBLIC_VERSION_BYTE);
}

export async function encryptWalletSecret(secretKey: string, password: string) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 210000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(secretKey));

  return btoa(
    JSON.stringify({
      algorithm: "AES-256-GCM",
      kdf: "PBKDF2-SHA256",
      iterations: 210000,
      salt: Array.from(salt),
      iv: Array.from(iv),
      ciphertext: Array.from(new Uint8Array(encrypted)),
    })
  );
}
