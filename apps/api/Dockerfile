FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci
COPY packages/shared ./packages/shared
RUN npm run build --workspace=packages/shared
COPY apps/api ./apps/api
RUN npm run build --workspace=apps/api

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./node_modules/@procurement/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@procurement/shared/package.json
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
EXPOSE 3000
CMD ["node", "dist/main"]
