FROM node:18-bullseye

# Install Python + pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Set working directory
WORKDIR /app

# Copy all project files
COPY . .

# ✅ Install Python dependencies
RUN pip3 install --no-cache-dir -r server/requirements.txt

# Install Node.js dependencies
RUN npm install

# Expose the port
EXPOSE 5000

# Start the app
CMD ["npx", "tsx", "server/index.ts"]
