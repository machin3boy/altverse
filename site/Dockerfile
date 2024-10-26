FROM node:18-alpine

WORKDIR /app

# Install Python and build tools
RUN apk add --no-cache python3 make g++ gcc

# Install dependencies only when needed
COPY package*.json ./

# Copy the rest of the application
COPY . .

# Expose the port Next.js runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "dev"]
