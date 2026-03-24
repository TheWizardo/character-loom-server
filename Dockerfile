# Dockerfile
FROM node:18-alpine3.21

# Create directory for our app in the container
WORKDIR /usr/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci -omit=dev

# Copy the source code into the container
COPY ./dist .

# Expose port 4272 inside the container
EXPOSE ${PORT}

# Command: Start the server
CMD ["node", "index.js"]