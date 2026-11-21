FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --ignore-scripts && npm install-scripts approve @prisma/client @prisma/engines prisma bcrypt 2>/dev/null; npm install --omit=dev
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]