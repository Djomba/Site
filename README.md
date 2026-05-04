# SPACE Academy Site

Сайт академии художественной гимнастики SPACE с подтверждением номера телефона через SMS (интеграция с `smsc.ru`).

## Структура проекта

```text
.
├── server/
│   └── index.js                # Express API (send-code / verify-code)
├── src/
│   ├── assets/                 # изображения
│   ├── components/             # общие UI-компоненты
│   ├── data/                   # данные тренеров
│   ├── lib/                    # утилиты (телефон)
│   ├── pages/                  # страницы
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

## Переменные окружения

Скопируйте `.env.example` в `.env` и заполните:

```env
PORT=3001
SMS_CODE_TTL_MS=300000
SMS_RESEND_COOLDOWN_MS=60000
SMSC_LOGIN=your_smsc_login
SMSC_PASSWORD=your_smsc_password
SMSC_SENDER=SPACE
```

## Запуск

```bash
npm install
npm run dev
```

Команда `npm run dev` запускает:

- frontend (Vite) на `http://localhost:5173`
- backend (Express) на `http://localhost:3001`

Для production-сборки:

```bash
npm run build
npm start
```

## API

### `POST /api/auth/send-code`

Пример тела запроса:

```json
{
  "phone": "+79991234567"
}
```

### `POST /api/auth/verify-code`

Пример тела запроса:

```json
{
  "phone": "+79991234567",
  "code": "123456"
}
```
