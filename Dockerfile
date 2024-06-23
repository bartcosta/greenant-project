FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma/schema.prisma ./prisma/

RUN npm install
RUN npm install prisma --save-dev

COPY . .

EXPOSE 3000

CMD [ "npm", "run", "start" ]
