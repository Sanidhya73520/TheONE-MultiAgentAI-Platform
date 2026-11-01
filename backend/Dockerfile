FROM node:20-slim
WORKDIR /app
# Copy root backend package files
COPY package*.json ./
RUN npm install
# Copy sub-services package files
COPY gateway/package*.json ./gateway/
COPY services/auth/package*.json ./services/auth/
COPY services/chat/package*.json ./services/chat/
COPY services/agent/package*.json ./services/agent/
COPY services/billing/package*.json ./services/billing/
# Install sub-service dependencies
RUN cd gateway && npm install
RUN cd services/auth && npm install
RUN cd services/chat && npm install
RUN cd services/agent && npm install
RUN cd services/billing && npm install
# Copy application code
COPY . .
# Set production environment
ENV NODE_ENV=production
# Render passes dynamic port in PORT env var (default 8000)
EXPOSE 8000
CMD ["npm", "start"]