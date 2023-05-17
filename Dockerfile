FROM node:lts-alpine AS BUILDER

WORKDIR /app
COPY . .

RUN apk add git
RUN npm run build:dev


FROM nginx:stable-alpine

COPY --from=BUILDER /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
