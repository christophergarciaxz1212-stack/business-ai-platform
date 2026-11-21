const crypto = require('crypto');
const { config } = require('./config');

const ALGO = 'aes-256-gcm';
const KEY = Buffer.from(config.ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0').slice(0, 32), 'utf8');
// Normalize: if hex, decode; else use utf8 padded
function getKey() {
  const raw = config.ENCRYPTION_KEY;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, 'hex');
  return Buffer.from(raw, 'utf8').subarray(0, 32).length === 32
    ? Buffer.from(raw, 'utf8').subarray(0, 32)
    : Buffer.from(raw.padEnd(32, '0').slice(0, 32), 'utf8');
}

function encrypt(plaintext) {
  if (plaintext == null) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
}

function decrypt(ciphertext) {
  if (ciphertext == null) return null;
  const [ivB64, tagB64, dataB64] = String(ciphertext).split(':');
  if (!ivB64 || !tagB64 || !dataB64) throw new Error('invalid ciphertext format');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');
  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString('utf8');
}

module.exports = { encrypt, decrypt, getKey };