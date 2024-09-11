FROM node:22-alpine

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

COPY prisma ./prisma

RUN npm install pnpm -g

RUN pnpm install --frozen-lockfile

COPY . .

CMD ["pnpm", "dev:docker"]