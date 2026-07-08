FROM node:lts-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

ENV VITE_BACKEND_SERVER=PLACEHOLDER_BACKEND_SERVER
ENV VITE_BACKEND_PORT=PLACEHOLDER_BACKEND_PORT
ENV VITE_KEYCLOAK_SERVER=PLACEHOLDER_KEYCLOAK_SERVER
ENV VITE_KEYCLOAK_PORT=PLACEHOLDER_KEYCLOAK_PORT
ENV VITE_KEYCLOAK_REALM=PLACEHOLDER_KEYCLOAK_REALM
ENV VITE_KEYCLOAK_CLIENT_ID=PLACEHOLDER_KEYCLOAK_CLIENT_ID

RUN npm run build

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["/bin/sh", "-c", "sed -i \"s|PLACEHOLDER_BACKEND_SERVER|$VITE_BACKEND_SERVER|g\" /usr/share/nginx/html/assets/*.js && sed -i \"s|PLACEHOLDER_BACKEND_PORT|$VITE_BACKEND_PORT|g\" /usr/share/nginx/html/assets/*.js && sed -i \"s|PLACEHOLDER_KEYCLOAK_SERVER|$VITE_KEYCLOAK_SERVER|g\" /usr/share/nginx/html/assets/*.js && sed -i \"s|PLACEHOLDER_KEYCLOAK_PORT|$VITE_KEYCLOAK_PORT|g\" /usr/share/nginx/html/assets/*.js && sed -i \"s|PLACEHOLDER_KEYCLOAK_REALM|$VITE_KEYCLOAK_REALM|g\" /usr/share/nginx/html/assets/*.js && sed -i \"s|PLACEHOLDER_KEYCLOAK_CLIENT_ID|$VITE_KEYCLOAK_CLIENT_ID|g\" /usr/share/nginx/html/assets/*.js && exec nginx -g 'daemon off;'"]