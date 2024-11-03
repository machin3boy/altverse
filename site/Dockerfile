# Use Node.js Alpine as base image
FROM node:20-alpine

# Install dependencies required for node-gyp
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]