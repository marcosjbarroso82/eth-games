FROM node:9.3

MAINTAINER Marcos J. Barroso<marcosjbarroso82@gmail.com>

EXPOSE 8080
COPY . /code
WORKDIR /code

RUN npm install -g truffle

RUN npm install
