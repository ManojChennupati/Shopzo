FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Expose the port the app runs on (assuming 5000 or similar, adjust if necessary)
EXPOSE 5000
CMD ["npm", "start"]
