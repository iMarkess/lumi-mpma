FROM node:20-alpine

WORKDIR /app

# openssl é exigido pelo Prisma no Alpine
RUN apk add --no-cache openssl

COPY package.json ./
COPY prisma ./prisma
RUN npm install --omit=dev

COPY src ./src

ENV NODE_ENV=production
EXPOSE 3333

# Ao subir: sincroniza o schema no banco e inicia a API
CMD ["npm", "start"]
