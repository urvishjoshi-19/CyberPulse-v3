FROM node:18-bullseye

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

COPY . .

# Install Python requirements
RUN pip3 install -r server/requirements.txt

# Install Node.js dependencies
RUN npm install

# Start the server
CMD ["npx", "tsx", "server/index.ts"]

EXPOSE 5000
