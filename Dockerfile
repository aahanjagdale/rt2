FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Ensure dist/ is created
RUN mkdir -p dist

RUN npm run build

CMD ["node", "dist/index.js"]
