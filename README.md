# 🎣 Fishcheckbot

> **Production-ready Telegram bot for automated fish processing tracking**
> _Used by restaurant chains to digitize waste reporting and enforce production norms_

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248.svg)](https://mongodb.com/)
[![Telegraf](https://img.shields.io/badge/Telegraf-4.x-2CA5E0.svg)](https://telegraf.js.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](docker/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 О проекте

**Fishcheckbot** — это Telegram-бот для автоматизации учёта переработки рыбы в ресторанной сети. Он заменяет бумажные акты на цифровой поток данных с валидацией бизнес-правил в реальном времени и синхронизацией с корпоративными отчётами.

### ✨ Ключевые особенности

- **Многошаговая форма заполнения акта** с валидацией нормативов (слайсы, обрезь, отходы)
- **Ролевая модель доступа** (Админ / Сотрудник / Кандидат) с динамическим интерфейсом
- **Интеграция с Google Sheets** для автоматической выгрузки данных в корпоративные дашборды
- **Поддержка мульти-города** с уведомлениями в тематические чаты/топики Telegram
- **Расчёт производственных метрик** с детекцией отклонений от нормативов
- **Структурированное логирование** (Winston) и graceful shutdown

> ⚠️ **Архитектурное примечание**: Интеграция с Google Sheets реализована через сервисный аккаунт. В продакшене рекомендуется добавить retry-логику и кэширование для устойчивости к временным сбоям API.

---

## 🛠 Технологический стек

### Backend

| Технология             | Назначение                                        |
| ---------------------- | ------------------------------------------------- |
| **Node.js 20+**        | Runtime среда с нативной поддержкой ESM           |
| **TypeScript 5**       | Строгая типизация, self-documenting код           |
| **Telegraf**           | Telegram Bot API wrapper с поддержкой TypeScript  |
| **MongoDB + Mongoose** | Хранение пользователей, актов, индексы для поиска |
| **Zod**                | Runtime-валидация конфигурации и входных данных   |
| **Winston**            | Структурированное логирование с ротацией файлов   |

### Инфраструктура

| Инструмент         | Назначение                                            |
| ------------------ | ----------------------------------------------------- |
| **pnpm**           | Менеджер пакетов (быстрее npm, экономит место)        |
| **tsx**            | TypeScript execution с HMR для разработки             |
| **Vitest**         | Быстрое тестирование с покрытием кода                 |
| **Docker**         | Контейнеризация для продакшен-деплоя                  |
| **GitHub Actions** | CI/CD: типчеки, линтинг, тесты на каждый пулл-реквест |

---

## 📦 Структура проекта

```text
fishcheckbot/
├── src/
│   ├── bot/
│   │   ├── index.ts              # Точка входа, инициализация бота
│   │   ├── middleware/
│   │   │   ├── auth.ts           # Проверка isApproved/isAdmin
│   │   │   └── logger.ts         # Логирование входящих сообщений
│   │   ├── handlers/
│   │   │   ├── start.ts          # Обработчик /start
│   │   │   ├── act/
│   │   │   │   ├── flow.ts       # State machine заполнения акта
│   │   │   │   ├── validator.ts  # Валидация числового ввода
│   │   │   │   ├── calculator.ts # Бизнес-логика расчётов
│   │   │   │   └── formatter.ts  # Форматирование сообщений
│   │   │   ├── admin/
│   │   │   │   └── users.ts      # Управление пользователями
│   │   │   └── registration/
│   │   │       └── flow.ts       # State machine регистрации
│   │   └── keyboards/
│   │       └── main.ts           # Динамические клавиатуры
│   ├── services/
│   │   ├── act/
│   │   │   ├── calculator.ts     # Pure functions для метрик
│   │   │   └── validator.ts      # Валидация ввода
│   │   ├── mongodb/
│   │   │   ├── connection.ts     # Подключение + graceful shutdown
│   │   │   └── repositories/
│   │   │       ├── user.repo.ts  # Repository pattern для User
│   │   │       └── act.repo.ts   # Repository pattern для Act
│   │   └── googleSheets.ts       # Интеграция с Sheets API
│   ├── models/
│   │   ├── User.ts               # Mongoose схема + TypeScript интерфейс
│   │   ├── Act.ts                # Mongoose схема + TypeScript интерфейс
│   │   └── types/
│   │       └── index.ts          # Общие TypeScript типы
│   ├── config/
│   │   ├── index.ts              # Экспорт конфига
│   │   ├── constants.ts          # Нормативы, константы
│   │   └── environment.ts        # Zod-валидация env-переменных
│   └── utils/
│       ├── logger.ts             # Winston-логгер
│       ├── errors.ts             # Кастомные ошибки (AppError)
│       └── helpers.ts            # Утилитарные функции
│
├── tests/
│   ├── unit/
│   │   ├── calculator.test.ts    # Тесты бизнес-логики
│   │   └── validator.test.ts     # Тесты валидации
│   └── setup.ts                  # Глобальная настройка тестов
│
├── docker/
│   ├── Dockerfile                # Multi-stage build для продакшена
│   └── docker-compose.yml        # Локальная среда с MongoDB
│
├── .github/
│   └── workflows/
│       └── test.yml              # CI: тесты и линтинг
│
├── .env.example                  # Шаблон переменных окружения
├── .gitignore
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

## 🚀 Быстрый старт

### Предварительные требования

- **Node.js** >= 20.x
- **pnpm** >= 9.x (`npm install -g pnpm`)
- **Docker & Docker Compose** (для локального запуска с БД)
- **Telegram Bot Token** (получить у [@BotFather](https://t.me/BotFather))
- **Google Service Account** (для интеграции с Sheets, опционально)

### Установка

```bash
# Клонируйте репозиторий
git clone https://github.com/LDRION/fishcheckbot-showcase.git
cd fishcheckbot-showcase

# Установите зависимости
pnpm install

# Создайте файл окружения на основе шаблона
cp .env.example .env
# Отредактируйте .env с вашими реальными значениями
```

### Настройка .env

```bash
# Telegram Bot
BOT_TOKEN=your_bot_token_here
ADMIN_TELEGRAM_ID=123456789
TARGET_CHAT_ID=-1001234567890

# MongoDB
MONGO_URI=mongodb://localhost:27017/fishcheckbot

# Google Sheets (опционально)
GOOGLE_SHEETS_CREDS_JSON={"type":"service_account",...}
GOOGLE_SHEETS_ID=your_spreadsheet_id_here

# App Config
NODE_ENV=development
LOG_LEVEL=debug
```

> 🔐 **Важно**: Никогда не коммитьте `.env` в репозиторий. Используйте `.env.example` как шаблон для команды.

### Запуск

#### Локально (режим разработки с hot-reload):

```bash
pnpm dev
```

#### Через Docker (продакшен-подобная среда):

```bash
# Сборка и запуск
docker compose -f docker/docker-compose.yml up --build -d

# Просмотр логов
docker compose -f docker/docker-compose.yml logs -f bot

# Остановка
docker compose -f docker/docker-compose.yml down
```

**Ожидаемый вывод:**

```
[00:00:00] [INFO] ✅ MongoDB Connected Successfully
[00:00:00] [INFO] 🚀 Bot launched successfully | username: "Fishcheckbot"
```

---

## 🤖 Использование бота

### Для сотрудников

| Команда / Кнопка           | Описание                                     |
| -------------------------- | -------------------------------------------- |
| `/start`                   | Начать работу или показать главное меню      |
| `📝 Начать регистрацию`    | Пройти регистрацию (выбор города/ресторана)  |
| `📝 Заполнить акт разбора` | Запустить многошаговую форму заполнения акта |
| `🔄 Изменить ресторан`     | Сменить привязанный ресторан                 |

### Для администраторов

| Команда / Кнопка                   | Описание                                       |
| ---------------------------------- | ---------------------------------------------- |
| `➕ Администрирование сотрудников` | Управление заявками и правами пользователей    |
| `⚙️ Настройка параметров рыбы`     | CRUD-операции для типов рыбы                   |
| `/approve <telegram_id>`           | Одобрить заявку пользователя (быстрая команда) |

### Пример заполнения акта

1.  Нажмите `📝 Заполнить акт разбора`
2.  Выберите тип рыбы из inline-клавиатуры
3.  Введите 4 значения по очереди:
    - Вес филе по этикетке (кг)
    - Слайсы + суши (кг)
    - Красная обрезь (кг)
    - Чёрная обрезь (кг)
4.  Бот автоматически рассчитает вес отходов и проверит нормативы
5.  Нажмите `✅ Отправить акт` для сохранения в БД и выгрузки в Google Sheets

---

## 🧪 Тестирование

```bash
# Запуск unit-тестов
pnpm test

# Режим watch для разработки
pnpm test:watch

# Отчёт о покрытии кода
pnpm test:coverage
# Откройте coverage/index.html в браузере
```

**Что покрыто тестами:**

- ✅ Расчёт метрик акта (проценты, отклонения, нормативы)
- ✅ Валидация пользовательского ввода (формат, границы, контекст)
- ✅ Форматирование сообщений для Telegram

---

## 🔐 Безопасность

- **Секреты через .env**: Все чувствительные данные (токены, ключи) вынесены в переменные окружения
- **Валидация ввода**: Zod для конфига, рантайм-проверки для пользовательских данных
- **RBAC**: Ролевая модель (admin/employee/candidate) с проверками на уровне middleware
- **Non-root пользователь в Docker**: Контейнер запускается от имени `nodejs:nodejs` (UID 1001)
- **Graceful shutdown**: Корректная остановка при SIGTERM/SIGINT с закрытием соединений

> ⚠️ **Важно**: Перед деплоем в продакшен замените заглушки в `.env` на реальные значения и настройте мониторинг логов.

---

## 🏗 Архитектурные решения

### Почему Repository Pattern?

- Изоляция работы с БД от бизнес-логики
- Легко мокать репозитории в тестах
- Возможность заменить MongoDB на другую БД без переписывания хендлеров

### Почему чистые функции для бизнес-логики?

- `calculator.ts` и `validator.ts` не имеют сайд-эффектов
- Легко тестировать без моков БД или Telegram API
- Можно переиспользовать в других интерфейсах (веб-панель, мобильное приложение)

### Почему Telegraf вместо node-telegram-bot-api?

- Лучшая поддержка TypeScript "из коробки"
- Более современный API с поддержкой middleware
- Активное развитие и сообщество

### Почему tsx для запуска в Docker?

- Избегаем сложностей с компиляцией TypeScript в Alpine-среде
- `tsx` компилирует на лету с кэшированием — достаточно быстро для большинства сценариев
- Для высоконагруженных продакшен-сред можно вернуться к pre-compiled `dist/`

---

## 📊 Мониторинг и логи

### Формат логов (Winston)

```json
{
  "level": "info",
  "message": "Act saved",
  "timestamp": "2026-04-05 12:34:56",
  "actNumber": 42,
  "userId": 123456789,
  "city": "Москва"
}
```

### Ротация логов

- `logs/error.log` — только ошибки, макс. 10 МБ, 3 файла
- `logs/combined.log` — все уровни, макс. 10 МБ, 5 файла

### Интеграция с внешними системами (план)

- [ ] Prometheus-метрики: `/metrics` endpoint
- [ ] Отправка критических ошибок в Sentry
- [ ] Лог-агрегация через Loki/Promtail

---

## 🤝 Контрибьютинг

1.  Форкните репозиторий
2.  Создайте фича-ветку: `git checkout -b feat/amazing-feature`
3.  Напишите тесты для новой функциональности
4.  Убедитесь, что все проверки проходят: `pnpm typecheck && pnpm lint && pnpm test`
5.  Закоммитьте изменения: `git commit -m 'feat: add amazing feature'`
6.  Запушьте и откройте Pull Request

### Стандарты кода

- ✅ TypeScript strict mode включён
- ✅ ESLint с конфигурацией для TypeScript
- ✅ JSDoc для публичных функций
- ✅ 80%+ покрытие тестами для новой бизнес-логики

---

## 📄 Лицензия

MIT License — см. файл [LICENSE](LICENSE) в корне репозитория.

---

## 👤 Автор

**LDRION**
Fullstack JavaScript Developer

- GitHub: [@LDRION](https://github.com/LDRION)
- 📍 Локация: Удалённо / Релокация
- 💬 Связь: [ldrionldrion@gmail.com](mailto:ldrionldrion@gmail.com) / [@ldrion](https://t.me/ldrion)
