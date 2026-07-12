# SatsTogether Coolify image — prototype web (testnet draw + status)
# Port 3000. Health: GET /health

FROM node:22-alpine

RUN apk add --no-cache wget

WORKDIR /app

# Pure TS via --experimental-strip-types; no npm install required
COPY package.json ./
COPY web ./web
COPY testnet ./testnet
COPY sim ./sim

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV PUBLIC_URL=https://satstogether.greerso.com

EXPOSE 3000

# Coolify UI healthchecks need wget/curl; Alpine wget uses 127.0.0.1 (IPv4)
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

USER node

CMD ["node", "--experimental-strip-types", "web/server.ts"]
