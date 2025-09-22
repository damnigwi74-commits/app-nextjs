FROM registry.ekenya.co.ke/library/node:18.18.0-alpine

# Set environment variable
# ENV NODE_ENV=production

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install 
RUN npm install pm2@latest -g

# Copy the rest of the application
COPY . .
# Set a non-root user for security
# RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# USER appuser

# Expose port 3000 (adjust as necessary)
#EXPOSE 4000

# Start the application
CMD ["npm", "run", "docker"]

