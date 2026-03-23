FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY server/prisma ./server/prisma

# Install dependencies
RUN npm install
RUN cd server && npm install

# Copy source files
COPY . .

# Generate Prisma client
RUN cd server && npx prisma generate

# Build client
RUN cd client && npm run build

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "run", "start:server"]
