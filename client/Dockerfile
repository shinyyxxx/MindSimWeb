FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build for subpath deployment (example: /mindillustrate/frontend/)
ARG VITE_BASE_PATH=/mindillustrate/frontend/
ARG VITE_GOOGLE_TTS_KEY=
ENV VITE_BASE_PATH=${VITE_BASE_PATH}
ENV VITE_GOOGLE_TTS_KEY=${VITE_GOOGLE_TTS_KEY}
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html/mindillustrate/frontend

EXPOSE 3004
CMD ["nginx", "-g", "daemon off;"]
