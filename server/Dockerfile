FROM node:20-alpine

WORKDIR /app

# Necessário para o Prisma funcionar no Alpine Linux
RUN apk add --no-cache openssl libc6-compat

# Copia manifestos e schema do Prisma ANTES do npm install
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma7.config.ts ./

# Instala todas as dependências e roda prisma generate automaticamente via postinstall
RUN npm install

# Copia o restante do código da aplicação
COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && npm run start:dev"]
