FROM node:18-alpine as build
WORKDIR /app
RUN apk --no-cache add --virtual .builds-deps build-base python3
COPY ./package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine AS production
COPY --from=build /app/build .
COPY --from=build /app/package.json .
COPY --from=build /app/package-lock.json .
RUN npm ci --omit dev
EXPOSE 3000
CMD ["node", "."]