FROM node:26-slim

WORKDIR /app
ENV HUSKY=0

COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci --workspace client --include-workspace-root

COPY client client

EXPOSE 5173
CMD ["npm", "run", "dev", "-w", "client", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]
