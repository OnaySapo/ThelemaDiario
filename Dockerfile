# Imagem leve oficial do Node.js LTS em Alpine Linux
FROM node:22-alpine AS runner

WORKDIR /app

# Instala dependências nativas para SQLite
RUN apk add --no-cache libc6-compat python3 make g++

# Copia arquivos de configuração e dependências
COPY package*.json ./
RUN npm install

# Copia todo o código-fonte
COPY . .

# Compila o projeto Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Expõe a porta 3000
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Inicia o servidor Next.js
CMD ["npm", "run", "start"]
