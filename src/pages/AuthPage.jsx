import { useState } from 'react';
import heroGymnast from '../assets/space-hero-gymnast.png';
import { digitsOnly, formatPhoneInput, normalizePhone, validatePhone } from '../lib/phone.js';

const postJson = async (url, body) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || 'Произошла ошибка. Попробуйте снова.');
  }

  return payload;
};

const requestUserLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Ваш браузер не поддерживает геолокацию.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position.coords);
      },
      (positionError) => {
        if (positionError.code === 1) {
          reject(new Error('Доступ к местоположению запрещён.'));
          return;
        }

        if (positionError.code === 2) {
          reject(new Error('Не удалось определить местоположение.'));
          return;
        }

        reject(new Error('Время ожидания геолокации истекло.'));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 },
    );
  });

function AuthPage({ onAuthSuccess }) {
  const [form, setForm] = useState({ name: '', phone: '', code: '' });
  const [step, setStep] = useState('details');
  const [geoConsent, setGeoConsent] = useState({
    approved: false,
    latitude: null,
    longitude: null,
    accuracy: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const updatePhone = (value) => {
    setForm((current) => ({ ...current, phone: formatPhoneInput(value) }));
    setError('');
  };

  const handleConsentClick = async () => {
    setError('');
    setSuccess('');
    setIsRequestingLocation(true);

    try {
      const coords = await requestUserLocation();
      setGeoConsent({
        approved: true,
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      });
      setSuccess('Соглашение подтверждено. Местоположение успешно получено.');
    } catch (locationError) {
      setGeoConsent({
        approved: false,
        latitude: null,
        longitude: null,
        accuracy: null,
      });
      setError(`Без местоположения никак не продолжить регистрацию. ${locationError.message}`);
    } finally {
      setIsRequestingLocation(false);
    }
  };

  const handleSendCode = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!geoConsent.approved) {
      setError('Без местоположения никак не продолжить регистрацию. Нажмите кнопку соглашения.');
      return;
    }

    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setError('Введите имя');
      return;
    }

    if (!validatePhone(form.phone)) {
      setError('Введите корректный номер телефона');
      return;
    }

    const normalizedPhone = normalizePhone(form.phone);
    setIsSendingCode(true);

    try {
      await postJson('/api/auth/send-code', { phone: normalizedPhone });
      setStep('code');
      setSuccess(`Код отправлен на ${formatPhoneInput(normalizedPhone)}`);
    } catch (sendError) {
      setError(sendError.message);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const code = digitsOnly(form.code).slice(0, 6);
    if (code.length !== 6) {
      setError('Введите 6-значный код');
      return;
    }

    const normalizedPhone = normalizePhone(form.phone);
    if (!normalizedPhone) {
      setError('Введите корректный номер телефона');
      setStep('details');
      return;
    }

    setIsVerifyingCode(true);

    try {
      await postJson('/api/auth/verify-code', { phone: normalizedPhone, code });
    } catch (verifyError) {
      setError(verifyError.message);
      setIsVerifyingCode(false);
      return;
    }

    setSuccess('Номер успешно подтвержден');
    setTimeout(() => {
      onAuthSuccess({
        name: form.name.trim(),
        phone: normalizedPhone,
        location: {
          latitude: geoConsent.latitude,
          longitude: geoConsent.longitude,
          accuracy: geoConsent.accuracy,
        },
        verifiedAt: new Date().toISOString(),
      });
    }, 650);
  };

  const handleChangePhone = () => {
    setStep('details');
    setForm((current) => ({ ...current, code: '' }));
    setError('');
    setSuccess('');
  };

  const handleResendCode = async () => {
    const normalizedPhone = normalizePhone(form.phone);
    if (!normalizedPhone) {
      setStep('details');
      setError('Введите корректный номер телефона');
      return;
    }

    setError('');
    setSuccess('');
    setIsSendingCode(true);

    try {
      await postJson('/api/auth/send-code', { phone: normalizedPhone });
      setSuccess(`Новый код отправлен на ${formatPhoneInput(normalizedPhone)}`);
    } catch (resendError) {
      setError(resendError.message);
    } finally {
      setIsSendingCode(false);
    }
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

              <div className="consent-block">
                <button
                  className={`consent-button ${geoConsent.approved ? 'is-approved' : ''}`}
                  type="button"
                  onClick={handleConsentClick}
                  disabled={isRequestingLocation}
                >
                  {isRequestingLocation
                    ? 'Запрашиваем местоположение...'
                    : geoConsent.approved
                      ? 'Соглашение на сбор данных подтверждено'
                      : 'Соглашение на сбор данных'}
                </button>
                <p className="consent-hint">
                  Нажатие кнопки подтверждает согласие на обработку данных и запрашивает ваше местоположение.
                </p>
              </div>

              {error && <p className="form-message error-message">{error}</p>}
              {success && <p className="form-message success-message">{success}</p>}

              <button className="primary-button auth-submit" type="submit" disabled={isSendingCode}>
                {isSendingCode ? 'Отправляем код...' : 'Получить код'}
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

              <button className="primary-button auth-submit" type="submit" disabled={isVerifyingCode}>
                {isVerifyingCode ? 'Проверяем код...' : 'Подтвердить'}
              </button>

              <button className="auth-secondary-button" type="button" onClick={handleResendCode} disabled={isSendingCode}>
                {isSendingCode ? 'Отправка...' : 'Отправить код повторно'}
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
