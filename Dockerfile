FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN mkdir -p /data
ENV NODE_ENV=production DATA_DIR=/data PORT=3000
EXPOSE 3000
VOLUME ["/data"]
CMD ["npm","start"]