FROM node:24 AS runner
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

COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public
RUN mkdir -p /app/seed
COPY dev.db /app/seed/phoco.db

RUN npm install better-sqlite3@12.11.1

VOLUME /data
EXPOSE 3000
CMD ["sh","-c","[ -f /data/phoco.db ] || { mkdir -p /data && cp /app/seed/phoco.db /data/phoco.db; }; exec node server.js"]
