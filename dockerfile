# Use official Node.js LTS base image
FROM node:18.20.3

# Set working directory inside container
WORKDIR /src/server

# Copy only package files first for layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Install ts-node globally (only if required at runtime)
RUN npm install -g ts-node

# Copy the rest of the app source code
COPY . .

# Expose port
EXPOSE 7001

# Default command
CMD ["npm", "run", "start"]
