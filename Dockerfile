FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
# Full install for build (devDependencies needed for nest build)
RUN npm ci

FROM base AS gateway
COPY --from=base /app/node_modules ./node_modules
COPY . .
RUN npm run build:gateway
CMD ["node", "dist/apps/gateway/main.js"]

FROM base AS auth
COPY --from=base /app/node_modules ./node_modules
COPY . .
RUN npm run build:auth
CMD ["node", "dist/apps/auth/main.js"]

FROM base AS cars
COPY --from=base /app/node_modules ./node_modules
COPY . .
RUN npm run build:cars
CMD ["node", "dist/apps/cars/main.js"]

FROM base AS news
COPY --from=base /app/node_modules ./node_modules
COPY . .
RUN npm run build:news
CMD ["node", "dist/apps/news/main.js"]

FROM base AS test-drives
COPY --from=base /app/node_modules ./node_modules
COPY . .
RUN npm run build:test-drives
CMD ["node", "dist/apps/test-drives/main.js"]

FROM base AS contacts
COPY --from=base /app/node_modules ./node_modules
COPY . .
RUN npm run build:contacts
CMD ["node", "dist/apps/contacts/main.js"]

FROM base AS admin
COPY --from=base /app/node_modules ./node_modules
COPY . .
RUN npm run build:admin
CMD ["node", "dist/apps/admin/main.js"]

FROM base AS notifications
COPY --from=base /app/node_modules ./node_modules
COPY . .
RUN npm run build:notifications
CMD ["node", "dist/apps/notifications/main.js"]
