FROM node:16.19.0-alpine3.16

WORKDIR /app

RUN addgroup app && adduser -S -G app app
RUN chown -R app:app /app
USER app

COPY package*.json .
RUN npm ci && npm cache clean --force

COPY . .

ENV PORT 3000
EXPOSE 3000
CMD [ "npm", "start" ]