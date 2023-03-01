FROM node:16.19.0-alpine3.16

WORKDIR /app

COPY package*.json .
RUN npm ci && npm cache clean --force

COPY . .

EXPOSE 80

CMD [ "npm", "start", "--", "--port", "80", "--host", "0.0.0.0" ]
