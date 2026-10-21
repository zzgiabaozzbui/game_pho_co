# Chỉ cài better-sqlite3 (prebuild Linux) — standalone build trên Windows mang binary win32.
FROM node:24-slim AS sqlite
WORKDIR /s
RUN npm init -y >/dev/null && npm install better-sqlite3@12.11.1

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

COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public
RUN mkdir -p /app/seed
COPY dev.db /app/seed/phoco.db

COPY --from=sqlite /s/node_modules ./node_modules
# Turbopack alias external modules (better-sqlite3-<hash>, @prisma/client-<hash>) bằng symlink
# tuyệt đối về đường dẫn máy build → trỏ lại vào /app/node_modules.
RUN cd .next/node_modules && for l in $(find . -type l); do \
      n=$(echo "$l" | sed 's|^\./||; s|-[0-9a-f]\{16\}$||'); ln -sfn "/app/node_modules/$n" "$l"; \
    done

VOLUME /data
EXPOSE 3000
CMD ["sh","-c","[ -f /data/phoco.db ] || { mkdir -p /data && cp /app/seed/phoco.db /data/phoco.db; }; exec node server.js"]
