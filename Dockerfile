FROM node:14-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

RUN npm install sip.js

# Copy the rest of the application code to the working directory
COPY . .

# Build the React application
RUN npm run build

# Install a lightweight HTTP server to serve the React application
RUN npm install -g serve

# Set the command to serve the application
CMD ["serve", "-s", "build", "-l", "3000"]

# Expose port 3000 to the host
EXPOSE 3000