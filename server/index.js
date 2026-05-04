import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT || 3001);
const SMS_CODE_TTL_MS = Number(process.env.SMS_CODE_TTL_MS || 5 * 60 * 1000);
const SMS_RESEND_COOLDOWN_MS = Number(process.env.SMS_RESEND_COOLDOWN_MS || 60 * 1000);
const MAX_VERIFY_ATTEMPTS = 5;

const SMSC_LOGIN = process.env.SMSC_LOGIN?.trim() || '';
const SMSC_PASSWORD = process.env.SMSC_PASSWORD?.trim() || '';
const SMSC_SENDER = process.env.SMSC_SENDER?.trim() || '';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_PATH = path.resolve(__dirname, '../dist');

const verificationStore = new Map();

app.use(express.json());

const digitsOnly = (value = '') => String(value).replace(/\D/g, '');

const normalizePhone = (value = '') => {
  const digits = digitsOnly(value);

  if (!digits) {
    return '';
  }

  let normalizedDigits = '';

  if (digits.startsWith('8')) {
    normalizedDigits = `7${digits.slice(1, 11)}`;
  } else if (digits.startsWith('7')) {
    normalizedDigits = digits.slice(0, 11);
  } else {
    normalizedDigits = `7${digits.slice(0, 10)}`;
  }

  return normalizedDigits.length === 11 ? `+${normalizedDigits}` : '';
};

const createSecurityCode = () => String(Math.floor(100000 + Math.random() * 900000));

const hashCode = (code) => crypto.createHash('sha256').update(code).digest('hex');

const getStoreEntry = (phone) => {
  const entry = verificationStore.get(phone);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    verificationStore.delete(phone);
    return null;
  }

  return entry;
};

const removeExpiredEntries = () => {
  const now = Date.now();
  for (const [phone, entry] of verificationStore.entries()) {
    if (entry.expiresAt <= now) {
      verificationStore.delete(phone);
    }
  }
};

setInterval(removeExpiredEntries, 60 * 1000).unref();

const sendSmsViaSmsc = async ({ phone, code }) => {
  if (!SMSC_LOGIN || !SMSC_PASSWORD) {
    throw new Error('SMSC credentials are not configured');
  }

  const params = new URLSearchParams({
    login: SMSC_LOGIN,
    psw: SMSC_PASSWORD,
    phones: phone,
    mes: `Код подтверждения SPACE: ${code}`,
    fmt: '3',
    charset: 'utf-8',
  });

  if (SMSC_SENDER) {
    params.set('sender', SMSC_SENDER);
  }

  const response = await fetch(`https://smsc.ru/sys/send.php?${params.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`SMSC HTTP error: ${response.status}`);
  }

  const payload = await response.json();

  if (payload.error_code || Number(payload.cnt || 0) < 1) {
    const details = payload.error || 'Unknown SMSC error';
    throw new Error(`SMSC rejected SMS: ${details}`);
  }

  return payload;
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/send-code', async (req, res) => {
  const phone = normalizePhone(req.body?.phone);

  if (!phone) {
    res.status(400).json({ message: 'Введите корректный номер телефона' });
    return;
  }

  const existingEntry = getStoreEntry(phone);
  if (existingEntry) {
    const millisLeft = existingEntry.lastSentAt + SMS_RESEND_COOLDOWN_MS - Date.now();
    if (millisLeft > 0) {
      res.status(429).json({
        message: `Повторная отправка будет доступна через ${Math.ceil(millisLeft / 1000)} сек`,
      });
      return;
    }
  }

  const code = createSecurityCode();

  try {
    await sendSmsViaSmsc({ phone, code });
  } catch (error) {
    console.error('[send-code] SMS send failure:', error);
    res.status(502).json({ message: 'Не удалось отправить SMS. Попробуйте позже.' });
    return;
  }

  const now = Date.now();
  verificationStore.set(phone, {
    codeHash: hashCode(code),
    createdAt: now,
    expiresAt: now + SMS_CODE_TTL_MS,
    lastSentAt: now,
    attempts: 0,
  });

  res.json({
    message: 'Код подтверждения отправлен',
    expiresInSec: Math.ceil(SMS_CODE_TTL_MS / 1000),
  });
});

app.post('/api/auth/verify-code', (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  const code = digitsOnly(req.body?.code).slice(0, 6);

  if (!phone || code.length !== 6) {
    res.status(400).json({ message: 'Укажите номер телефона и корректный код' });
    return;
  }

  const entry = getStoreEntry(phone);
  if (!entry) {
    res.status(400).json({ message: 'Код не найден или срок действия истёк' });
    return;
  }

  if (entry.attempts >= MAX_VERIFY_ATTEMPTS) {
    verificationStore.delete(phone);
    res.status(429).json({ message: 'Превышено количество попыток. Запросите новый код.' });
    return;
  }

  if (entry.codeHash !== hashCode(code)) {
    entry.attempts += 1;
    const attemptsLeft = Math.max(0, MAX_VERIFY_ATTEMPTS - entry.attempts);
    if (attemptsLeft === 0) {
      verificationStore.delete(phone);
      res.status(429).json({ message: 'Превышено количество попыток. Запросите новый код.' });
      return;
    }

    res.status(400).json({ message: `Неверный код. Осталось попыток: ${attemptsLeft}` });
    return;
  }

  verificationStore.delete(phone);
  res.json({ message: 'Номер успешно подтверждён' });
});

if (IS_PRODUCTION && existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
