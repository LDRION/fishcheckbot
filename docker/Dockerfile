FROM node:20-alpine

# Создаём non-root пользователя
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Копируем package-файлы
COPY package.json pnpm-lock.yaml* ./

# Устанавливаем ВСЕ зависимости (включая tsx для запуска исходников)
RUN corepack enable && pnpm install --frozen-lockfile --ignore-scripts

# Копируем исходный код
COPY . .

# Переключаемся на non-root пользователя
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "process.exit(0)"

# Запускаем через tsx (транслирует TS на лету)
CMD ["tsx", "src/bot/index.js"]
