FROM node:13

WORKDIR /app

COPY package*.json ./
RUN npm install

# Bundle app source
COPY app .
EXPOSE 8080
CMD ["node", "cyberq_mon.js" ]