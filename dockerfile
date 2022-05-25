FROM node:16

WORKDIR /tutorial

COPY package*.json ./

RUN  npm install

COPY index.js ./

CMD [ "node", "index.js" ]