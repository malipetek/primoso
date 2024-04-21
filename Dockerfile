FROM node:18-alpine as build

WORKDIR /app
RUN apk --no-cache add --virtual .builds-deps build-base python3
COPY ./package*.json ./
RUN npm install -g vite
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine AS production

ARG PUBLIC_SUPABASE_URL=${PUBLIC_SUPABASE_URL}
ENV PUBLIC_SUPABASE_URL=${PUBLIC_SUPABASE_URL}
ARG PUBLIC_SUPABASE_PUBLIC_KEY=${PUBLIC_SUPABASE_PUBLIC_KEY}
ENV PUBLIC_SUPABASE_PUBLIC_KEY=${PUBLIC_SUPABASE_PUBLIC_KEY}
ARG PRIVATE_SUPABASE_PRIVATE_KEY=${PRIVATE_SUPABASE_PRIVATE_KEY}
ENV PRIVATE_SUPABASE_PRIVATE_KEY=${PRIVATE_SUPABASE_PRIVATE_KEY}

RUN apk --no-cache add --virtual .builds-deps build-base python3
COPY --from=build /app/build .
COPY --from=build /app/package.json .
COPY --from=build /app/package-lock.json .
RUN npm ci --omit dev
EXPOSE 3000
CMD ["node", "."]