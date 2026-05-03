import { useState } from 'react';
import heroGymnast from '../assets/space-hero-gymnast.png';

const digitsOnly = (phone) => phone.replace(/\D/g, '');

const getRussianPhoneDigits = (phone) => {
  const digits = digitsOnly(phone);

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

const formatPhoneInput = (phone) => {
  const digits = getRussianPhoneDigits(phone);

  if (!digits) {
    return '';
  }

  const national = digits.slice(1);
  const parts = {
    code: national.slice(0, 3),
    first: national.slice(3, 6),
    second: national.slice(6, 8),
    third: national.slice(8, 10),
  };

  let formatted = '+7';

  if (parts.code) {
    formatted += ` (${parts.code}`;
  }

  if (parts.code.length === 3) {
    formatted += ')';
  }

  if (parts.first) {
    formatted += ` ${parts.first}`;
  }

  if (parts.second) {
    formatted += `-${parts.second}`;
  }

  if (parts.third) {
    formatted += `-${parts.third}`;
  }

  return formatted;
};

const normalizePhone = (phone) => {
  const digits = getRussianPhoneDigits(phone);
  return digits ? `+${digits}` : '';
};

const validatePhone = (phone) => {
  const digits = getRussianPhoneDigits(phone);
  return digits.length === 11;
};

const createSecurityCode = () => String(Math.floor(100000 + Math.random() * 900000));

function AuthPage({ onAuthSuccess }) {
  const [form, setForm] = useState({ name: '', phone: '', code: '' });
  const [sentCode, setSentCode] = useState('');
  const [step, setStep] = useState('details');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const updatePhone = (value) => {
    setForm((current) => ({ ...current, phone: formatPhoneInput(value) }));
    setError('');
  };

  const sendSecurityCode = async () => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return createSecurityCode();
  };

  const handleSendCode = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim()) {
      setError('Введите имя');
      return;
    }

    if (!validatePhone(form.phone)) {
      setError('Введите корректный номер телефона');
      return;
    }

    setIsSubmitting(true);
    const code = await sendSecurityCode();
    setSentCode(code);
    setStep('code');
    setSuccess(`Код отправлен на ${formatPhoneInput(form.phone)}. Для локального теста: ${code}`);
    setIsSubmitting(false);
  };

  const handleVerifyCode = (event) => {
    event.preventDefault();
    setError('');

    if (digitsOnly(form.code) !== sentCode) {
      setError('Неверный код безопасности');
      return;
    }

    setSuccess('Номер успешно подтвержден');

    setTimeout(() => {
      onAuthSuccess({
        name: form.name.trim(),
        phone: normalizePhone(form.phone),
        verifiedAt: new Date().toISOString(),
      });
    }, 650);
  };

  const handleChangePhone = () => {
    setStep('details');
    setSentCode('');
    setForm((current) => ({ ...current, code: '' }));
    setError('');
    setSuccess('');
  };

  return (
    <main className="auth-page">
      <div className="auth-ribbon ribbon-left" />
      <div className="auth-ribbon ribbon-right" />

      <section className="auth-stage">
        <div className="auth-visual" aria-hidden="true">
          <img src={heroGymnast} alt="" />
          <div className="auth-visual-frame" />
        </div>

        <section className="auth-card" aria-labelledby="auth-title">
          <div className="auth-brand">
            <span>SPACE</span>
            <small>Академия гимнастики</small>
          </div>

          <h1 id="auth-title">Регистрация</h1>

          {step === 'details' && (
            <form className="auth-form" onSubmit={handleSendCode} noValidate>
              <label>
                <span>Имя</span>
                <input
                  type="text"
                  placeholder="Ваше имя"
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  autoComplete="name"
                  aria-invalid={error === 'Введите имя'}
                />
              </label>

              <label>
                <span>Номер телефона</span>
                <input
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  value={form.phone}
                  onChange={(event) => updatePhone(event.target.value)}
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength="18"
                  aria-invalid={error === 'Введите корректный номер телефона'}
                />
              </label>

              {error && <p className="form-message error-message">{error}</p>}
              {success && <p className="form-message success-message">{success}</p>}

              <button className="primary-button auth-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Отправляем код...' : 'Получить код'}
              </button>
            </form>
          )}

          {step === 'code' && (
            <form className="auth-form" onSubmit={handleVerifyCode} noValidate>
              <label>
                <span>Код безопасности</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="000000"
                  value={form.code}
                  onChange={(event) => updateField('code', digitsOnly(event.target.value).slice(0, 6))}
                  autoComplete="one-time-code"
                  aria-invalid={Boolean(error)}
                />
              </label>

              {error && <p className="form-message error-message">{error}</p>}
              {success && <p className="form-message success-message">{success}</p>}

              <button className="primary-button auth-submit" type="submit">
                Подтвердить
              </button>

              <button className="auth-secondary-button" type="button" onClick={handleChangePhone}>
                Изменить номер
              </button>
            </form>
          )}
        </section>
      </section>
    </main>
  );
}

export default AuthPage;
