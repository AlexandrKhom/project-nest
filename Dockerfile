# alpine урізана версія os
FROM node:14-alpine
# developer
MAINTAINER Alex

# add packege
RUN apk add bash
# create folder for project
RUN mkdir /app
# set default folder for work
WORKDIR /app

# copy package.json to folder for work (app)
COPY ./package.json /app
COPY ./.env /app
# install node_modules id production mode
RUN npm install
