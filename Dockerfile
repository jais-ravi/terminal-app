# Use official Node.js image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app code into the container
COPY . .

# Build the Electron app for Linux
RUN npm run build -- --linux

# Default command to run the app
CMD ["npm", "start"]