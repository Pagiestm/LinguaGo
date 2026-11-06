FROM node:26-slim

WORKDIR /app
ENV HUSKY=0

RUN apt-get update \
  && apt-get install -y --no-install-recommends procps openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci --workspace server --include-workspace-root

COPY server server

EXPOSE 3000
CMD ["sh", "-c", "cd server && npx prisma migrate deploy && npm run seed && npm run start:dev"]
