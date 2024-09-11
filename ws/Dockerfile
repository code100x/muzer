FROM node:22-alpine

WORKDIR /app

COPY package.json .

RUN npm install pnpm -g --ignore-scripts

RUN pnpm install --ignore-scripts

COPY . .

RUN DATABASE_URL=$DATABASE_URL pnpm run build

EXPOSE 3000

CMD ["pnpm", "run", "start"]
