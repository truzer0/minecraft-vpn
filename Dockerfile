FROM node:20-alpine

WORKDIR /app

# Устанавливаем зависимости локально
RUN npm init -y && npm install pg tsx

# Копируем код
COPY src/worker/index.ts ./

EXPOSE 8787

CMD ["npx", "tsx", "index.ts"]
