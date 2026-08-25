FROM node:24-slim AS builder
WORKDIR /app
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 \
    DATABASE_URL=file:/app/seed/phoco.db
RUN npm ci
RUN mkdir -p /app/seed && npx prisma db push && npx tsx prisma/seed.ts
RUN npm run build

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL=file:/data/phoco.db \
    UPLOADS_DIR=/data/uploads \
    ADMIN_PASSWORD=admin123 \
    SESSION_SECRET=demo-secret-doi-lai-it-nhat-32-ky-tu-ngau-nhien \
    NEXT_PUBLIC_BASE_URL=http://localhost:3000
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/seed/phoco.db /app/seed/phoco.db
VOLUME /data
EXPOSE 3000
CMD ["sh","-c","[ -f /data/phoco.db ] || { mkdir -p /data && cp /app/seed/phoco.db /data/phoco.db; }; exec node server.js"]
