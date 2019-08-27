FROM node

WORKDIR /starter

COPY package.json /starter/package.json

RUN npm install

COPY .env /starter/.env
COPY . /starter

CMD ["npm","start"]

EXPOSE 3000
