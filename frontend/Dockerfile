# build
FROM node:lts-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# nginx
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8008

CMD ["nginx", "-g", "daemon off;"]