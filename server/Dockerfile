FROM node:20-alpine

WORKDIR /app

# Necessário para o Prisma funcionar no Alpine Linux
RUN apk add --no-cache openssl libc6-compat

# Copia os arquivos de manifesto de pacotes
COPY package*.json ./

# Instala dependências dentro do container
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta padrão do NestJS
EXPOSE 3000

# Executa em modo watch (recarregamento automático em tempo real)
CMD ["npm", "run", "start:dev"]
