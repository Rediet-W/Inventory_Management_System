# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the React app
RUN npm run build

# Expose the frontend port
EXPOSE 3000

# Serve the build folder using a simple HTTP server
# CMD ["npx", "serve", "-s", "build", "-l", "3000"]
# CMD ["npx", "serve", "-s", "/app/dist", "-l", "3000"]

# CMD ["npx", "serve", "-s", "/app/dist", "--listen", "0.0.0.0:3000"]
CMD ["npx", "serve", "-s", "/app/dist", "-l", "3000"]

