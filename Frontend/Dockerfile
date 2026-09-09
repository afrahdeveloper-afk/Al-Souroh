# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps first so this layer is cached across builds that only change source.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# vite.config.ts's buildTimeImageOptimizer runs scripts/optimize-images.mjs
# (needs the `sharp` devDependency, installed above) and emits public/media/*
# before the SPA bundle is built — see CLAUDE.md Protocol 7.
RUN npm run build

# ---- Serve stage ----
FROM nginx:alpine
# The base image doesn't reliably ship wget/curl on every tag — installed
# explicitly rather than assumed, since the HEALTHCHECK below depends on it.
RUN apk add --no-cache curl
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD curl -fsS http://localhost/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
