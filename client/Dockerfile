FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build for subpath deployment (example: /mindillustrate/frontend/)
ARG VITE_BASE_PATH=/mindillustrate/frontend/
ENV VITE_BASE_PATH=${VITE_BASE_PATH}
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html/mindillustrate/frontend

EXPOSE 3004
CMD ["nginx", "-g", "daemon off;"]
