# Create the image based on the official latest Node image from Dockerhub
FROM node:alpine

# Set /app as the working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Generated prisma files
COPY prisma ./prisma/

# Copy ENV variable
COPY .env ./

# Copy tsconfig.json file
COPY tsconfig.json ./

# Copy everything
COPY . .

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Run and expose the server on port 3000
EXPOSE 3000

# A command to start the server
CMD ["npm", "run", "dev:start"]