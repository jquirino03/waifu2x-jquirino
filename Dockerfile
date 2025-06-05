FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

RUN chmod +x ./waifu2x-converter-cpp

EXPOSE 3000

CMD ["npm", "start"]