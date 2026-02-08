FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/website/package.json ./apps/website/
RUN npm ci --workspace=apps/website --include-workspace-root
COPY apps/website ./apps/website
RUN npm run build --workspace=apps/website

FROM nginx:alpine
COPY --from=builder /app/apps/website/dist /usr/share/nginx/html
COPY apps/website/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
