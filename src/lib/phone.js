export const digitsOnly = (value = '') => String(value).replace(/\D/g, '');

export const getRussianPhoneDigits = (value = '') => {
  const digits = digitsOnly(value);

  if (!digits) {
    return '';
  }

  if (digits.startsWith('8')) {
    return `7${digits.slice(1, 11)}`;
  }

  if (digits.startsWith('7')) {
    return digits.slice(0, 11);
  }

  return `7${digits.slice(0, 10)}`;
};

export const formatPhoneInput = (value = '') => {
  const digits = getRussianPhoneDigits(value);

  if (!digits) {
    return '';
  }

  const national = digits.slice(1);
  const code = national.slice(0, 3);
  const first = national.slice(3, 6);
  const second = national.slice(6, 8);
  const third = national.slice(8, 10);

  let formatted = '+7';

  if (code) {
    formatted += ` (${code}`;
  }

  if (code.length === 3) {
    formatted += ')';
  }

  if (first) {
    formatted += ` ${first}`;
  }

  if (second) {
    formatted += `-${second}`;
  }

  if (third) {
    formatted += `-${third}`;
  }

  return formatted;
};

export const normalizePhone = (value = '') => {
  const digits = getRussianPhoneDigits(value);
  return digits.length === 11 ? `+${digits}` : '';
};

export const validatePhone = (value = '') => normalizePhone(value).length === 12;
