FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --production

COPY . .

RUN npm install

CMD ["npm", "start"]
