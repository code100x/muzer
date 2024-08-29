FROM node:22.6.0

WORKDIR /app
COPY package.json .

RUN npm install

COPY . .

RUN DATABASE_URL=$DATABASE_URL npx prisma generate
RUN DATABASE_URL=$DATABASE_URL npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]